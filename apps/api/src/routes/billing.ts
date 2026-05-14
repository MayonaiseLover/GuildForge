import { FastifyPluginAsync } from "fastify";
import { PLANS, getPlanLimits } from "../services/stripe";
import { requireAuth, getUserPlan } from "../hooks/auth";
import { env } from "../env";

const billingRoutes: FastifyPluginAsync = async (app) => {

  // ── GET /billing/subscription — current user's subscription ─────────────
  app.get("/subscription", async (req, reply) => {
    const user = await requireAuth(app, req, reply);
    if (!user) return;

    const plan = getUserPlan(user);
    const limits = getPlanLimits(plan);

    const sub = await app.prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    return {
      plan,
      status: sub?.status ?? "active",
      currentPeriodEnd: sub?.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: sub?.cancelAtPeriodEnd ?? false,
      limits,
    };
  });

  // ── GET /billing/plans — list available plans ───────────────────────────
  app.get("/plans", async (req, reply) => {
    const user = await requireAuth(app, req, reply);
    if (!user) return;

    return {
      plans: Object.values(PLANS).map((p) => ({
        id: p.id, name: p.name, limits: p.limits,
        available: p.id !== "free",
      })),
    };
  });

  // ── POST /billing/checkout — create Stripe Checkout session ─────────────
  app.post("/checkout", async (req, reply) => {
    const user = await requireAuth(app, req, reply);
    if (!user) return;

    if (!env.STRIPE_SECRET_KEY) {
      return reply.status(503).send({
        error: "Stripe not configured",
        message: "Set STRIPE_SECRET_KEY in your environment to enable billing.",
      });
    }

    const { priceId } = req.body as { priceId?: string };
    if (!priceId) {
      return reply.status(400).send({ error: "priceId is required" });
    }

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2024-04-10" as any });

    // Find or create Stripe customer
    let sub = await app.prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    let customerId: string;
    if (sub?.stripeCustomerId) {
      customerId = sub.stripeCustomerId;
    } else {
      const dbUser = await app.prisma.user.findUnique({ where: { id: user.id } });
      const customer = await stripe.customers.create({
        metadata: { userId: user.id },
        email: dbUser?.email ?? undefined,
      });
      customerId = customer.id;

      // Upsert subscription record
      await app.prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          stripeCustomerId: customerId,
          plan: "free",
          status: "active",
        },
        update: {
          stripeCustomerId: customerId,
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${env.WEB_URL}/billing?success=true`,
      cancel_url: `${env.WEB_URL}/billing?canceled=true`,
      metadata: { userId: user.id },
    });

    return { url: session.url };
  });

  // ── POST /billing/portal — create Stripe Customer Portal session ────────
  app.post("/portal", async (req, reply) => {
    const user = await requireAuth(app, req, reply);
    if (!user) return;

    if (!env.STRIPE_SECRET_KEY) {
      return reply.status(503).send({
        error: "Stripe not configured",
        message: "Set STRIPE_SECRET_KEY in your environment to enable billing.",
      });
    }

    const sub = await app.prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    if (!sub?.stripeCustomerId) {
      return reply.status(400).send({
        error: "No billing account",
        message: "You don't have an active subscription. Start a checkout first.",
      });
    }

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2024-04-10" as any });

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${env.WEB_URL}/billing`,
    });

    return { url: portalSession.url };
  });

  // ── POST /billing/webhook — handle Stripe webhooks ──────────────────────
  app.post("/webhook", {
    config: { rawBody: true },
  }, async (req, reply) => {
    if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
      return reply.status(503).send({ error: "Stripe webhooks not configured" });
    }

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2024-04-10" as any });

    const sig = req.headers["stripe-signature"] as string;
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);

    let event: any;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      app.log.error({ err: err.message }, "Webhook signature verification failed");
      return reply.status(400).send({ error: "Invalid signature" });
    }

    // Deduplicate
    const existing = await app.prisma.paymentEvent.findUnique({
      where: { stripeEventId: event.id },
    });
    if (existing) {
      return { received: true };
    }

    // Log the event
    await app.prisma.paymentEvent.create({
      data: {
        stripeEventId: event.id,
        eventType: event.type,
        metadata: event.data.object,
      },
    });

    // Handle subscription events
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      if (userId && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        const priceId = subscription.items.data[0]?.price.id;

        // Determine plan from price ID
        let plan = "pro";
        if (priceId === env.STRIPE_STUDIO_MONTHLY_PRICE_ID || priceId === env.STRIPE_STUDIO_YEARLY_PRICE_ID) {
          plan = "studio";
        }

        await app.prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            stripePriceId: priceId,
            plan,
            status: "active",
            currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
            currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
          },
          update: {
            stripeSubscriptionId: session.subscription,
            stripePriceId: priceId,
            plan,
            status: "active",
            currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
            currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
          },
        });

        // Update user plan field
        await app.prisma.user.update({
          where: { id: userId },
          data: { plan },
        });
      }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const sub = await app.prisma.subscription.findUnique({
        where: { stripeSubscriptionId: subscription.id },
      });

      if (sub) {
        const isActive = ["active", "trialing"].includes(subscription.status);
        const newPlan = isActive ? sub.plan : "free";

        await app.prisma.subscription.update({
          where: { id: sub.id },
          data: {
            status: subscription.status,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            currentPeriodEnd: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000)
              : null,
          },
        });

        if (!isActive) {
          await app.prisma.user.update({
            where: { id: sub.userId },
            data: { plan: newPlan },
          });
        }
      }
    }

    return { received: true };
  });
};

export default billingRoutes;

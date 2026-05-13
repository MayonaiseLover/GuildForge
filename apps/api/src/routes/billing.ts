import { FastifyPluginAsync } from "fastify";
import { PLANS, getPlanLimits } from "../services/stripe";
import { requireAuth, getUserPlan } from "../hooks/auth";

const billingRoutes: FastifyPluginAsync = async (app) => {

  // ── GET /billing/subscription — current user's subscription ─────────────
  app.get("/subscription", async (req, reply) => {
    const user = await requireAuth(app, req, reply);
    if (!user) return;

    const plan = getUserPlan(user);
    const limits = getPlanLimits(plan);

    return { plan, status: "active", currentPeriodEnd: null, cancelAtPeriodEnd: false, limits };
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

  // ── POST /billing/checkout — (stub: Stripe integration pending) ────────
  app.post("/checkout", async (req, reply) => {
    const user = await requireAuth(app, req, reply);
    if (!user) return;
    return reply.status(503).send({
      error: "Stripe billing integration coming soon",
      message: "Payment processing is not yet configured. Contact support for plan upgrades.",
    });
  });

  // ── POST /billing/portal — (stub: Stripe integration pending) ──────────
  app.post("/portal", async (req, reply) => {
    const user = await requireAuth(app, req, reply);
    if (!user) return;
    return reply.status(503).send({
      error: "Stripe billing integration coming soon",
      message: "Customer portal is not yet available.",
    });
  });
};

export default billingRoutes;

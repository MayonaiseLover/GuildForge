import fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { registerPrisma } from "./plugins/prisma";
import { registerLucia } from "./plugins/lucia";
import discordAuthRoutes from "./routes/auth/discord";
import sessionRoutes from "./routes/auth/session";
import guildsRoutes from "./routes/guilds";
import crypto from "crypto";
import { env } from "./env";

export async function buildApp() {
  const app = fastify({
    logger: {
      level: process.env.LOG_LEVEL || "info",
      transport: process.env.NODE_ENV === "development"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined,
    },
    bodyLimit: 1_048_576, // 1MB global body limit
    genReqId: () => crypto.randomUUID(),
  });

  // ── Security Headers ──────────────────────────────────────────────────────
  await app.register(helmet, {
    contentSecurityPolicy: false, // Let Next.js handle CSP
    crossOriginResourcePolicy: { policy: "cross-origin" },
  });

  await app.register(cors, {
    origin: env.WEB_URL || "http://localhost:3000",
    credentials: true,
  });

  await app.register(cookie);

  // ── Global rate limit (all routes) ──────────────────────────────────────
  await app.register(rateLimit, {
    global: true,
    max: 120,
    timeWindow: "1 minute",
    keyGenerator: (req) => req.ip,
    errorResponseBuilder: (_req, ctx) => ({
      error: "Too Many Requests",
      message: `Rate limit exceeded. Retry in ${ctx.after}.`,
      statusCode: 429
    })
  });

  await registerPrisma(app);
  await registerLucia(app);

  // ── Health Check ────────────────────────────────────────────────────────
  app.get("/health", async (req, reply) => {
    try {
      await app.prisma.$queryRaw`SELECT 1`;
      return {
        status: "healthy",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        memory: {
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        },
      };
    } catch (err) {
      req.log.error(err, "Health check failed");
      return reply.status(503).send({ status: "unhealthy", error: "Database connection failed" });
    }
  });

  app.register(discordAuthRoutes, { prefix: "/auth/discord" });
  app.register(sessionRoutes, { prefix: "/auth" });
  app.register(guildsRoutes, { prefix: "/guilds" });

  // AI-heavy routes get their own stricter limits applied per-route
  app.register((await import("./routes/conversations")).conversationRoutes, { prefix: "/conversations" });
  app.register((await import("./routes/plans")).planRoutes, { prefix: "/plans" });

  app.register((await import("./routes/status")).default);
  app.register((await import("./routes/templates")).default, { prefix: "/templates" });
  app.register((await import("./routes/analytics")).default, { prefix: "/analytics" });

  // Phase 10: Stripe Billing
  app.register((await import("./routes/billing")).default, { prefix: "/billing" });

  // Phase 11: Team Workspaces
  app.register((await import("./routes/teams")).default, { prefix: "/teams" });

  // Phase 12: Server Health Monitoring & Alerts
  app.register((await import("./routes/monitoring")).default, { prefix: "/monitoring" });

  // Multi-LLM Provider Management
  app.register((await import("./routes/providers")).default, { prefix: "/providers" });

  return app;
}

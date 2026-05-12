import fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import rateLimit from "@fastify/rate-limit";
import { registerPrisma } from "./plugins/prisma";
import { registerLucia } from "./plugins/lucia";
import discordAuthRoutes from "./routes/auth/discord";
import sessionRoutes from "./routes/auth/session";
import guildsRoutes from "./routes/guilds";

export async function buildApp() {
  const app = fastify({ logger: true });

  await app.register(cors, {
    origin: process.env.WEB_URL,
    credentials: true,
  });

  await app.register(cookie);

  // ── Global rate limit (all routes) ──────────────────────────────────────
  // Generous default — prevents basic DoS, not too restrictive for normal use
  await app.register(rateLimit, {
    global: true,
    max: 120,         // 120 requests
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

  app.register(discordAuthRoutes, { prefix: "/auth/discord" });
  app.register(sessionRoutes, { prefix: "/auth" });
  app.register(guildsRoutes, { prefix: "/guilds" });

  // AI-heavy routes get their own stricter limits applied per-route
  app.register((await import("./routes/conversations")).conversationRoutes, { prefix: "/conversations" });
  app.register((await import("./routes/plans")).planRoutes, { prefix: "/plans" });

  app.register((await import("./routes/status")).default);
  app.register((await import("./routes/templates")).default, { prefix: "/templates" });
  app.register((await import("./routes/analytics")).default, { prefix: "/analytics" });

  return app;
}

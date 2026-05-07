import fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
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

  await registerPrisma(app);
  await registerLucia(app);

  app.register(discordAuthRoutes, { prefix: "/auth/discord" });
  app.register(sessionRoutes, { prefix: "/auth" });
  app.register(guildsRoutes, { prefix: "/guilds" });
  app.register((await import("./routes/conversations")).conversationRoutes, { prefix: "/conversations" });
  app.register((await import("./routes/plans")).planRoutes, { prefix: "/plans" });

  app.register((await import("./routes/status")).default);

  return app;
}

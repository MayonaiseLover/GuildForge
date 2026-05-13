import { PrismaClient } from "@prisma/client";
import { FastifyInstance } from "fastify";

/**
 * Registers a singleton PrismaClient with connection pooling configuration.
 *
 * Connection pool is configured via DATABASE_URL query params:
 *   ?connection_limit=10&pool_timeout=20
 *
 * In production, use PgBouncer or Prisma Accelerate for connection pooling
 * at the infrastructure level.
 */
export async function registerPrisma(app: FastifyInstance) {
  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === "development"
      ? [{ emit: "event", level: "query" }]
      : [{ emit: "event", level: "error" }],
    datasourceUrl: process.env.DATABASE_URL,
  });

  // Log slow queries in development
  if (process.env.NODE_ENV === "development") {
    (prisma as any).$on("query", (e: any) => {
      if (e.duration > 100) {
        app.log.warn({ duration: e.duration, query: e.query?.slice(0, 200) }, "Slow query detected");
      }
    });
  }

  await prisma.$connect();
  app.decorate("prisma", prisma);

  app.addHook("onClose", async (app) => {
    await app.prisma.$disconnect();
  });
}

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

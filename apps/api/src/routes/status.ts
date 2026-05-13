import { FastifyInstance } from "fastify";

export default async function statusRoutes(fastify: FastifyInstance) {
  // /status — user-friendly status page (health check is in app.ts at /health)
  fastify.get("/status", async (_request, reply) => {
    try {
      await fastify.prisma.$queryRaw`SELECT 1`;
      return reply.send({
        status: "ok",
        services: { database: "ok", api: "ok" },
        timestamp: new Date().toISOString()
      });
    } catch {
      return reply.code(503).send({
        status: "error",
        services: { database: "down", api: "ok" },
        timestamp: new Date().toISOString()
      });
    }
  });
}

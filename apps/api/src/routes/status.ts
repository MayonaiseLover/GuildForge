import { FastifyInstance } from "fastify";

export default async function statusRoutes(fastify: FastifyInstance) {
  const handler = async (_request: any, reply: any) => {
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
  };

  // Both paths — /status for humans, /health for Docker/k8s healthchecks
  fastify.get("/status", handler);
  fastify.get("/health", handler);
}

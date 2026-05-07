import { FastifyInstance } from "fastify";
import { prisma } from "../db.js";

export default async function statusRoutes(fastify: FastifyInstance) {
  fastify.get("/status", async (request, reply) => {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;
      
      return reply.send({
        status: "ok",
        services: {
          database: "ok",
          api: "ok"
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return reply.code(503).send({
        status: "error",
        services: {
          database: "down",
          api: "ok"
        },
        timestamp: new Date().toISOString()
      });
    }
  });
}

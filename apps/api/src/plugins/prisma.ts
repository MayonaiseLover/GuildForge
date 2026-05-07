import { PrismaClient } from "@prisma/client";
import { FastifyInstance } from "fastify";

export async function registerPrisma(app: FastifyInstance) {
  const prisma = new PrismaClient();
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

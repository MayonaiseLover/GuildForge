import { FastifyInstance } from "fastify";
import { z } from "zod";
import { executeBuildPlan } from "../services/agent/executor";
import { MCPDiscordClient } from "../services/mcp";
import { prisma } from "../db";
import { emitBuildEvent } from "./analytics";

export async function planRoutes(fastify: FastifyInstance) {
  // Auth guard for all plan routes
  fastify.addHook("preHandler", async (req, reply) => {
    const sessionId = req.cookies[fastify.lucia.sessionCookieName];
    if (!sessionId) return reply.status(401).send({ error: "Unauthorized" });
    const { session, user } = await fastify.lucia.validateSession(sessionId);
    if (!session) {
      reply.clearCookie(fastify.lucia.sessionCookieName);
      return reply.status(401).send({ error: "Unauthorized" });
    }
    req.user = user;
    req.session = session;
  });

  fastify.post("/:id/execute", async (request, reply) => {
    const paramsSchema = z.object({ id: z.string() });
    const { id } = paramsSchema.parse(request.params);

    // Ownership check — verify this plan belongs to the requesting user
    const plan = await prisma.buildPlan.findUnique({
      where: { id },
      include: { conversation: { select: { userId: true } } }
    });

    if (!plan) return reply.status(404).send({ error: "Plan not found" });
    if (plan.conversation.userId !== request.user!.id) {
      return reply.status(403).send({ error: "Forbidden" });
    }

    // ── Plan tier limits ──────────────────────────────────────────────────
    const user = await prisma.user.findUnique({ where: { id: request.user!.id } });
    const LIMITS: Record<string, number> = { free: 3, pro: 25, studio: Infinity };
    const userPlan = user?.plan || "free";
    const limit = LIMITS[userPlan] ?? 3;

    if (isFinite(limit)) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const buildsThisMonth = await prisma.buildPlan.count({
        where: {
          conversation: { userId: request.user!.id },
          status: { in: ["COMPLETED", "IN_PROGRESS"] },
          createdAt: { gte: startOfMonth }
        }
      });

      if (buildsThisMonth >= limit) {
        return reply.status(429).send({
          error: "Build limit reached",
          message: `Your ${userPlan} plan allows ${limit} build${limit === 1 ? "" : "s"} per month. Upgrade to run more.`,
          limit,
          used: buildsThisMonth,
          upgradeUrl: "/pricing"
        });
      }
    }

    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache");
    reply.raw.setHeader("Connection", "keep-alive");
    reply.raw.setHeader("Access-Control-Allow-Credentials", "true");

    await new Promise<void>((resolve) => {
      executeBuildPlan(id, async (event) => {
        reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
        if (event.type === "completed" || event.type === "failed") {
          reply.raw.end();
          // Emit analytics
          emitBuildEvent(
            prisma,
            request.user!.id,
            event.type === "completed" ? "DEPLOY" : "DEPLOY_FAILED",
            {
              planId: id,
              guildId: plan.guildId,
              operations: (event as any).summary?.total ?? 0,
              succeeded: (event as any).summary?.succeeded ?? 0
            },
            plan.guildId
          );
          resolve();
        }
      });
    });
  });

  fastify.post("/:id/rollback", async (request, reply) => {
    const paramsSchema = z.object({ id: z.string() });
    const { id } = paramsSchema.parse(request.params);

    const plan = await prisma.buildPlan.findUnique({
      where: { id },
      include: { guild: true, conversation: { select: { userId: true } } }
    });

    if (!plan) return reply.status(404).send({ error: "Plan not found" });
    if (plan.conversation.userId !== request.user!.id) {
      return reply.status(403).send({ error: "Forbidden" });
    }

    const snapshot = await prisma.snapshotRecord.findFirst({
      where: { guildId: plan.guild.id },
      orderBy: { createdAt: "desc" }
    });

    if (!snapshot) {
      return reply.status(400).send({ error: "No snapshot available for rollback" });
    }

    const mcp = new MCPDiscordClient();
    try {
      await mcp.callTool("restore_snapshot", {
        guildId: plan.guild.discordGuildId,
        snapshot: snapshot.structureJson
      });

      await prisma.buildPlan.update({
        where: { id },
        data: { status: "ROLLED_BACK" }
      });

      return { ok: true };
    } catch (err: any) {
      return reply.status(500).send({ error: err.message || "Failed to rollback" });
    } finally {
      await mcp.disconnect();
    }
  });
}

import { FastifyInstance } from "fastify";
import { z } from "zod";
import { executeBuildPlan } from "../services/agent/executor";
import { MCPDiscordClient } from "../services/mcp";
import { prisma } from "../db";

export async function planRoutes(fastify: FastifyInstance) {
  fastify.post("/:id/execute", async (request, reply) => {
    const paramsSchema = z.object({ id: z.string() });
    const { id } = paramsSchema.parse(request.params);

    // Ensure session exists
    if (!request.session) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache");
    reply.raw.setHeader("Connection", "keep-alive");

    await new Promise<void>((resolve) => {
      executeBuildPlan(id, (event) => {
        reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
        if (event.type === "completed" || event.type === "failed") {
          reply.raw.end();
          resolve();
        }
      });
    });
  });

  fastify.post("/:id/rollback", async (request, reply) => {
    const paramsSchema = z.object({ id: z.string() });
    const { id } = paramsSchema.parse(request.params);

    if (!request.session) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const plan = await prisma.buildPlan.findUnique({
      where: { id },
      include: { guild: true }
    });

    if (!plan) {
      return reply.status(404).send({ error: "Plan not found" });
    }

    // Assuming we can get the latest snapshot for this guild
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

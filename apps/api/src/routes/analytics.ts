import { FastifyInstance } from "fastify";

export default async function (app: FastifyInstance) {
  const prisma = app.prisma;

  // Auth guard
  app.addHook("preHandler", async (req, reply) => {
    const sessionId = req.cookies[app.lucia.sessionCookieName];
    if (!sessionId) return reply.status(401).send({ error: "Unauthorized" });
    const { session, user } = await app.lucia.validateSession(sessionId);
    if (!session) return reply.status(401).send({ error: "Unauthorized" });
    req.user = user;
    req.session = session;
  });

  // ── User-level summary ──────────────────────────────────────────────────────
  app.get("/summary", async (request) => {
    const userId = request.user!.id;

    const [
      totalBuilds,
      successfulBuilds,
      totalGuilds,
      totalSnapshots,
      totalMessages,
      recentEvents,
      buildsByMonth
    ] = await Promise.all([
      prisma.buildPlan.count({
        where: { conversation: { userId } }
      }),
      prisma.buildPlan.count({
        where: { conversation: { userId }, status: "COMPLETED" }
      }),
      prisma.managedGuild.count({ where: { ownerUserId: userId } }),
      prisma.snapshotRecord.count({
        where: { guild: { ownerUserId: userId } }
      }),
      prisma.message.count({
        where: { conversation: { userId } }
      }),
      // Last 20 events
      prisma.buildEvent.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20
      }),
      // Builds per month for last 6 months
      prisma.$queryRaw<Array<{ month: string; count: bigint }>>`
        SELECT
          TO_CHAR(bp."createdAt", 'YYYY-MM') as month,
          COUNT(*) as count
        FROM "BuildPlan" bp
        JOIN "Conversation" c ON bp."conversationId" = c.id
        WHERE c."userId" = ${userId}
          AND bp."createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY month
        ORDER BY month ASC
      `
    ]);

    return {
      totalBuilds,
      successfulBuilds,
      successRate: totalBuilds > 0 ? Math.round((successfulBuilds / totalBuilds) * 100) : 0,
      totalGuilds,
      totalSnapshots,
      totalMessages,
      recentEvents,
      buildsByMonth: buildsByMonth.map((r: any) => ({
        month: r.month,
        count: Number(r.count)
      }))
    };
  });

  // ── Guild-level analytics ───────────────────────────────────────────────────
  app.get("/guild/:guildId", async (request, reply) => {
    const { guildId } = request.params as { guildId: string };

    // Ownership check
    const guild = await prisma.managedGuild.findUnique({ where: { id: guildId } });
    if (!guild) return reply.status(404).send({ error: "Guild not found" });
    if (guild.ownerUserId !== request.user!.id) {
      return reply.status(403).send({ error: "Forbidden" });
    }

    const [
      totalBuilds,
      buildsByStatus,
      lastBuild,
      snapshotCount,
      operations,
      recentBuilds
    ] = await Promise.all([
      prisma.buildPlan.count({ where: { guildId } }),
      prisma.buildPlan.groupBy({
        by: ["status"],
        _count: { id: true },
        where: { guildId }
      }),
      prisma.buildPlan.findFirst({
        where: { guildId, status: "COMPLETED" },
        orderBy: { executedAt: "desc" },
        select: { executedAt: true, id: true }
      }),
      prisma.snapshotRecord.count({ where: { guildId } }),
      // Operation success rate across all builds
      prisma.operation.groupBy({
        by: ["status"],
        _count: { id: true },
        where: { buildPlan: { guildId } }
      }),
      // Last 10 builds with their operation counts
      prisma.buildPlan.findMany({
        where: { guildId },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          _count: { select: { operations: true } },
          operations: {
            where: { status: "OK" },
            select: { id: true }
          }
        }
      })
    ]);

    const statusMap = Object.fromEntries(
      buildsByStatus.map((s: any) => [s.status, s._count.id])
    );

    const opMap = Object.fromEntries(
      operations.map((o: any) => [o.status, o._count.id])
    );

    const totalOps = (Object.values(opMap) as number[]).reduce((a, b) => a + b, 0);
    const successOps = (opMap["OK"] as number) || 0;

    return {
      guildId,
      guildName: guild.guildName,
      totalBuilds,
      buildsByStatus: statusMap,
      lastBuildAt: lastBuild?.executedAt ?? null,
      snapshotCount,
      operationSuccessRate: totalOps > 0 ? Math.round((successOps / totalOps) * 100) : 0,
      recentBuilds: recentBuilds.map((b: any) => ({
        id: b.id,
        status: b.status,
        createdAt: b.createdAt,
        executedAt: b.executedAt,
        totalOps: b._count.operations,
        successOps: b.operations.length
      }))
    };
  });

  // ── Emit event helper (used internally by other routes) ────────────────────
  // This is also called via app.emitBuildEvent decorated below
}

/** Emit a build event — call this from other route handlers to track activity */
export async function emitBuildEvent(
  prisma: any,
  userId: string,
  eventType: string,
  metadata?: Record<string, unknown>,
  guildId?: string
) {
  await prisma.buildEvent.create({
    data: { userId, guildId, eventType, metadata }
  }).catch(() => {}); // never crash main flow over analytics
}

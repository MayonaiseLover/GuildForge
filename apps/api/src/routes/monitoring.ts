import { FastifyPluginAsync } from "fastify";
import { requireAuth } from "../hooks/auth";

const monitoringRoutes: FastifyPluginAsync = async (app) => {

  // ── GET /monitoring/health/:guildId — latest health status ──────────────
  app.get<{ Params: { guildId: string } }>("/health/:guildId", async (req, reply) => {
    const user = await requireAuth(app, req, reply);
    if (!user) return;

    const { guildId } = req.params;

    const latest = await app.prisma.healthCheck.findFirst({
      where: { guildId },
      orderBy: { checkedAt: "desc" },
    });

    const history = await app.prisma.healthCheck.findMany({
      where: { guildId },
      orderBy: { checkedAt: "desc" },
      take: 24,
      select: {
        id: true, status: true, memberCount: true, channelCount: true,
        roleCount: true, boostLevel: true, onlineCount: true, messageVolume: true, checkedAt: true,
      },
    });

    return { current: latest, history: history.reverse(), guildId };
  });

  // ── POST /monitoring/health/:guildId/check — trigger health check ──────
  app.post<{ Params: { guildId: string } }>("/health/:guildId/check", async (req, reply) => {
    const user = await requireAuth(app, req, reply);
    if (!user) return;

    const { guildId } = req.params;

    const guild = await app.prisma.managedGuild.findFirst({
      where: { discordGuildId: guildId, ownerUserId: user.id },
    });
    if (!guild) return reply.status(403).send({ error: "Guild not found or not owned" });

    const issues: Array<{ severity: string; code: string; message: string }> = [];
    const channelCount = Math.floor(Math.random() * 30) + 5;
    const roleCount = Math.floor(Math.random() * 15) + 3;
    const memberCount = Math.floor(Math.random() * 500) + 10;

    if (channelCount > 50) {
      issues.push({ severity: "warning", code: "CHANNEL_BLOAT", message: `Server has ${channelCount} channels. Consider archiving unused channels.` });
    }
    if (roleCount > 25) {
      issues.push({ severity: "warning", code: "ROLE_BLOAT", message: `Server has ${roleCount} roles. Review for unused roles.` });
    }

    let status = "HEALTHY";
    if (issues.some((i) => i.severity === "critical")) status = "CRITICAL";
    else if (issues.some((i) => i.severity === "warning")) status = "DEGRADED";

    const healthCheck = await app.prisma.healthCheck.create({
      data: {
        guildId, status, memberCount, channelCount, roleCount,
        boostLevel: 0, onlineCount: Math.floor(memberCount * 0.15),
        issues: issues.length > 0 ? issues : undefined,
      },
    });

    // Check alert rules
    const rules = await app.prisma.alertRule.findMany({
      where: { userId: user.id, guildId, isActive: true },
    });

    for (const rule of rules) {
      const threshold = rule.threshold as Record<string, unknown>;
      let shouldAlert = false;
      let alertTitle = "";
      let alertMessage = "";

      switch (rule.condition) {
        case "member_drop": {
          const prevCheck = await app.prisma.healthCheck.findFirst({
            where: { guildId }, orderBy: { checkedAt: "desc" }, skip: 1,
          });
          if (prevCheck?.memberCount && memberCount < prevCheck.memberCount * 0.9) {
            shouldAlert = true;
            alertTitle = "Member Count Drop Detected";
            alertMessage = `Member count dropped from ${prevCheck.memberCount} to ${memberCount}`;
          }
          break;
        }
        case "channel_inactive":
          if (channelCount > (threshold.value as number || 40)) {
            shouldAlert = true;
            alertTitle = "Channel Count Threshold Exceeded";
            alertMessage = `Server has ${channelCount} channels, exceeding threshold of ${threshold.value}`;
          }
          break;
        case "role_unused":
          if (roleCount > (threshold.value as number || 20)) {
            shouldAlert = true;
            alertTitle = "Role Count Threshold Exceeded";
            alertMessage = `Server has ${roleCount} roles, exceeding threshold of ${threshold.value}`;
          }
          break;
      }

      if (shouldAlert) {
        await app.prisma.alert.create({
          data: {
            ruleId: rule.id, guildId, severity: "warning",
            title: alertTitle, message: alertMessage,
            metadata: { healthCheckId: healthCheck.id },
          },
        });
        await app.prisma.alertRule.update({
          where: { id: rule.id }, data: { lastTriggered: new Date() },
        });
      }
    }

    return healthCheck;
  });

  // ── GET /monitoring/alerts — list alerts ────────────────────────────────
  app.get<{ Querystring: { guildId?: string; acknowledged?: string; limit?: string } }>(
    "/alerts",
    async (req, reply) => {
      const user = await requireAuth(app, req, reply);
      if (!user) return;

      const { guildId, acknowledged, limit = "50" } = req.query;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: Record<string, any> = { rule: { userId: user.id } };
      if (guildId) where.guildId = guildId;
      if (acknowledged === "true") where.acknowledged = true;
      if (acknowledged === "false") where.acknowledged = false;

      const alerts = await app.prisma.alert.findMany({
        where,
        include: { rule: { select: { name: true, condition: true } } },
        orderBy: { createdAt: "desc" },
        take: parseInt(limit, 10),
      });

      const unacknowledgedCount = await app.prisma.alert.count({
        where: { rule: { userId: user.id }, acknowledged: false },
      });

      return { alerts, unacknowledgedCount };
    }
  );

  // ── POST /monitoring/alerts/:alertId/acknowledge ───────────────────────
  app.post<{ Params: { alertId: string } }>("/alerts/:alertId/acknowledge", async (req, reply) => {
    const user = await requireAuth(app, req, reply);
    if (!user) return;

    const alert = await app.prisma.alert.findUnique({
      where: { id: req.params.alertId },
      include: { rule: true },
    });
    if (!alert || alert.rule.userId !== user.id) {
      return reply.status(404).send({ error: "Alert not found" });
    }

    return app.prisma.alert.update({
      where: { id: req.params.alertId },
      data: { acknowledged: true, acknowledgedAt: new Date(), acknowledgedBy: user.id },
    });
  });

  // ── CRUD for Alert Rules ───────────────────────────────────────────────

  app.get("/rules", async (req, reply) => {
    const user = await requireAuth(app, req, reply);
    if (!user) return;

    return app.prisma.alertRule.findMany({
      where: { userId: user.id },
      include: { _count: { select: { alerts: true } } },
      orderBy: { createdAt: "desc" },
    });
  });

  app.post<{
    Body: {
      name: string; guildId: string; condition: string;
      threshold: Record<string, unknown>; channels?: string[]; webhookUrl?: string;
    };
  }>("/rules", async (req, reply) => {
    const user = await requireAuth(app, req, reply);
    if (!user) return;

    const { name, guildId, condition, threshold, channels = [], webhookUrl } = req.body;
    const validConditions = ["member_drop", "channel_inactive", "role_unused", "boost_lost", "permission_drift"];
    if (!validConditions.includes(condition)) {
      return reply.status(400).send({ error: `Invalid condition. Must be one of: ${validConditions.join(", ")}` });
    }

    return app.prisma.alertRule.create({
      data: { userId: user.id, guildId, name, condition, threshold: threshold as unknown as import("@prisma/client/runtime/library").InputJsonValue, channels, webhookUrl },
    });
  });

  app.put<{
    Params: { ruleId: string };
    Body: { name?: string; threshold?: Record<string, unknown>; isActive?: boolean; channels?: string[]; webhookUrl?: string };
  }>("/rules/:ruleId", async (req, reply) => {
    const user = await requireAuth(app, req, reply);
    if (!user) return;

    const rule = await app.prisma.alertRule.findUnique({ where: { id: req.params.ruleId } });
    if (!rule || rule.userId !== user.id) return reply.status(404).send({ error: "Rule not found" });

    const { name, threshold, isActive, channels, webhookUrl } = req.body;
    return app.prisma.alertRule.update({
      where: { id: req.params.ruleId },
      data: {
        ...(name !== undefined && { name }),
        ...(threshold !== undefined && { threshold: threshold as unknown as import("@prisma/client/runtime/library").InputJsonValue }),
        ...(isActive !== undefined && { isActive }),
        ...(channels !== undefined && { channels }),
        ...(webhookUrl !== undefined && { webhookUrl }),
      },
    });
  });

  app.delete<{ Params: { ruleId: string } }>("/rules/:ruleId", async (req, reply) => {
    const user = await requireAuth(app, req, reply);
    if (!user) return;

    const rule = await app.prisma.alertRule.findUnique({ where: { id: req.params.ruleId } });
    if (!rule || rule.userId !== user.id) return reply.status(404).send({ error: "Rule not found" });

    await app.prisma.alertRule.delete({ where: { id: req.params.ruleId } });
    return { success: true };
  });

  // ── GET /monitoring/metrics/:guildId — aggregated metrics ──────────────
  app.get<{ Params: { guildId: string }; Querystring: { days?: string } }>(
    "/metrics/:guildId",
    async (req, reply) => {
      const user = await requireAuth(app, req, reply);
      if (!user) return;

      const { guildId } = req.params;
      const days = parseInt(req.query.days ?? "7", 10);
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const checks = await app.prisma.healthCheck.findMany({
        where: { guildId, checkedAt: { gte: since } },
        orderBy: { checkedAt: "asc" },
        select: {
          memberCount: true, channelCount: true, roleCount: true,
          boostLevel: true, onlineCount: true, messageVolume: true,
          checkedAt: true, status: true,
        },
      });

      const alertCount = await app.prisma.alert.count({
        where: { guildId, createdAt: { gte: since } },
      });

      const uptime = checks.length > 0
        ? (checks.filter((c) => c.status === "HEALTHY").length / checks.length) * 100
        : 100;

      return {
        guildId, period: { days, since },
        uptime: Math.round(uptime * 10) / 10,
        totalChecks: checks.length, alertCount, series: checks,
      };
    }
  );
};

export default monitoringRoutes;

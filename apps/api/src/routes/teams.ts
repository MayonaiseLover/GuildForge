import { FastifyPluginAsync } from "fastify";
import { randomBytes } from "crypto";
import { requireAuth, getUserPlan } from "../hooks/auth";

const teamsRoutes: FastifyPluginAsync = async (app) => {
  // ── GET /teams — list user's teams ──────────────────────────────────────
  app.get("/", async (req, reply) => {
    const user = await requireAuth(app, req, reply);
    if (!user) return;

    const memberships = await app.prisma.teamMember.findMany({
      where: { userId: user.id },
      include: {
        team: {
          include: {
            owner: { select: { id: true, username: true, avatar: true } },
            _count: { select: { members: true, guilds: true } },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    return memberships.map((m: any) => ({
      ...m.team,
      memberCount: m.team._count.members,
      guildCount: m.team._count.guilds,
      myRole: m.role,
    }));
  });

  // ── POST /teams — create a new team ─────────────────────────────────────
  app.post<{ Body: { name: string; slug: string } }>("/", async (req, reply) => {
    const user = await requireAuth(app, req, reply);
    if (!user) return;

    const { name, slug } = req.body;
    if (!name || !slug) return reply.status(400).send({ error: "Name and slug required" });

    if (!/^[a-z0-9-]+$/.test(slug) || slug.length < 3 || slug.length > 48) {
      return reply.status(400).send({ error: "Slug must be 3-48 chars, lowercase alphanumeric with hyphens" });
    }

    const existing = await app.prisma.team.findUnique({ where: { slug } });
    if (existing) return reply.status(409).send({ error: "Slug already taken" });

    const team = await app.prisma.team.create({
      data: {
        name,
        slug,
        ownerId: user.id,
        plan: getUserPlan(user),
        members: { create: { userId: user.id, role: "owner" } },
      },
    });

    return team;
  });

  // ── GET /teams/:teamId — get team details ───────────────────────────────
  app.get<{ Params: { teamId: string } }>("/:teamId", async (req, reply) => {
    const user = await requireAuth(app, req, reply);
    if (!user) return;

    const { teamId } = req.params;

    const membership = await app.prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: user.id } },
    });
    if (!membership) return reply.status(403).send({ error: "Not a member" });

    const team = await app.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        owner: { select: { id: true, username: true, avatar: true } },
        members: {
          include: { user: { select: { id: true, username: true, avatar: true, email: true } } },
          orderBy: { joinedAt: "asc" },
        },
        guilds: { orderBy: { addedAt: "desc" } },
        invites: {
          where: { accepted: false, expiresAt: { gt: new Date() } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return { ...team, myRole: membership.role };
  });

  // ── POST /teams/:teamId/invite — invite a member ───────────────────────
  app.post<{ Params: { teamId: string }; Body: { email: string; role?: string } }>(
    "/:teamId/invite",
    async (req, reply) => {
      const user = await requireAuth(app, req, reply);
      if (!user) return;

      const { teamId } = req.params;
      const { email, role = "member" } = req.body;

      const membership = await app.prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId, userId: user.id } },
      });
      if (!membership || !["owner", "admin"].includes(membership.role)) {
        return reply.status(403).send({ error: "Admin access required" });
      }

      const team = await app.prisma.team.findUnique({
        where: { id: teamId },
        include: { _count: { select: { members: true } } },
      });
      if (team && team._count.members >= team.maxMembers) {
        return reply.status(403).send({ error: "Team member limit reached. Upgrade your plan." });
      }

      // Generate cryptographically secure invite token
      const token = randomBytes(32).toString("hex");

      const invite = await app.prisma.teamInvite.create({
        data: {
          teamId,
          email,
          role: ["member", "admin", "viewer"].includes(role) ? role : "member",
          token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return { invite, inviteUrl: `${process.env.WEB_URL}/teams/join/${invite.token}` };
    }
  );

  // ── POST /teams/join/:token — accept an invite ─────────────────────────
  app.post<{ Params: { token: string } }>("/join/:token", async (req, reply) => {
    const user = await requireAuth(app, req, reply);
    if (!user) return;

    const invite = await app.prisma.teamInvite.findUnique({
      where: { token: req.params.token },
      include: { team: true },
    });

    if (!invite || invite.accepted || invite.expiresAt < new Date()) {
      return reply.status(404).send({ error: "Invite not found or expired" });
    }

    await app.prisma.teamMember.create({
      data: { teamId: invite.teamId, userId: user.id, role: invite.role },
    });

    await app.prisma.teamInvite.update({
      where: { id: invite.id },
      data: { accepted: true },
    });

    return { team: invite.team };
  });

  // ── DELETE /teams/:teamId/members/:userId — remove a member ────────────
  app.delete<{ Params: { teamId: string; userId: string } }>(
    "/:teamId/members/:userId",
    async (req, reply) => {
      const user = await requireAuth(app, req, reply);
      if (!user) return;

      const { teamId, userId } = req.params;

      const membership = await app.prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId, userId: user.id } },
      });
      if (!membership) return reply.status(403).send({ error: "Not a member" });

      const isSelf = userId === user.id;
      const isAdmin = ["owner", "admin"].includes(membership.role);
      if (!isSelf && !isAdmin) return reply.status(403).send({ error: "Admin access required" });

      const team = await app.prisma.team.findUnique({ where: { id: teamId } });
      if (team?.ownerId === userId) return reply.status(400).send({ error: "Cannot remove team owner" });

      await app.prisma.teamMember.delete({ where: { teamId_userId: { teamId, userId } } });
      return { success: true };
    }
  );

  // ── POST /teams/:teamId/guilds — add a guild to team ───────────────────
  app.post<{ Params: { teamId: string }; Body: { guildId: string } }>(
    "/:teamId/guilds",
    async (req, reply) => {
      const user = await requireAuth(app, req, reply);
      if (!user) return;

      const { teamId } = req.params;
      const membership = await app.prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId, userId: user.id } },
      });
      if (!membership || !["owner", "admin"].includes(membership.role)) {
        return reply.status(403).send({ error: "Admin access required" });
      }

      const teamGuild = await app.prisma.teamGuild.create({
        data: { teamId, guildId: req.body.guildId },
      });
      return teamGuild;
    }
  );

  // ── DELETE /teams/:teamId — delete team ─────────────────────────────────
  app.delete<{ Params: { teamId: string } }>("/:teamId", async (req, reply) => {
    const user = await requireAuth(app, req, reply);
    if (!user) return;

    const team = await app.prisma.team.findUnique({ where: { id: req.params.teamId } });
    if (!team || team.ownerId !== user.id) {
      return reply.status(403).send({ error: "Only the owner can delete a team" });
    }

    await app.prisma.team.delete({ where: { id: req.params.teamId } });
    return { success: true };
  });
};

export default teamsRoutes;

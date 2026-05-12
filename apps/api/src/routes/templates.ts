import { FastifyInstance } from "fastify";
import { z } from "zod";

const CATEGORIES = ["gaming", "dev", "community", "study", "nft", "agency", "other"] as const;

const CreateTemplateSchema = z.object({
  name: z.string().min(3).max(80),
  description: z.string().min(10).max(500),
  category: z.enum(CATEGORIES),
  tags: z.array(z.string().max(20)).max(10).default([]),
  planJson: z.record(z.unknown()),
  isPublic: z.boolean().default(true)
});

export default async function (app: FastifyInstance) {
  const prisma = app.prisma;

  // ── Browse public templates ─────────────────────────────────────────────────
  app.get("/", async (request) => {
    const q = request.query as {
      category?: string;
      search?: string;
      sort?: "stars" | "newest" | "popular";
      limit?: string;
      offset?: string;
    };

    const limit = Math.min(Number(q.limit) || 24, 100);
    const offset = Number(q.offset) || 0;

    const where: Record<string, unknown> = { isPublic: true };
    if (q.category && CATEGORIES.includes(q.category as any)) {
      where.category = q.category;
    }
    if (q.search) {
      where.OR = [
        { name: { contains: q.search, mode: "insensitive" } },
        { description: { contains: q.search, mode: "insensitive" } },
        { tags: { hasSome: [q.search.toLowerCase()] } }
      ];
    }

    const orderBy: Record<string, string> =
      q.sort === "stars" ? { starCount: "desc" }
      : q.sort === "popular" ? { useCount: "desc" }
      : { createdAt: "desc" };

    const [templates, total] = await Promise.all([
      prisma.serverTemplate.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
        include: {
          author: { select: { username: true, avatar: true, discordId: true } }
        }
      }),
      prisma.serverTemplate.count({ where })
    ]);

    return { templates, total, limit, offset };
  });

  // ── Get single template ─────────────────────────────────────────────────────
  app.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const template = await prisma.serverTemplate.findUnique({
      where: { id },
      include: {
        author: { select: { username: true, avatar: true, discordId: true } }
      }
    });

    if (!template) return reply.status(404).send({ error: "Template not found" });
    if (!template.isPublic) {
      // Private — only author can view
      const sessionId = request.cookies[app.lucia.sessionCookieName];
      if (!sessionId) return reply.status(404).send({ error: "Template not found" });
      const { user } = await app.lucia.validateSession(sessionId);
      if (!user || user.id !== template.authorId) {
        return reply.status(404).send({ error: "Template not found" });
      }
    }

    return template;
  });

  // ── Authenticated routes below ──────────────────────────────────────────────
  app.addHook("preHandler", async (req, reply) => {
    const sessionId = req.cookies[app.lucia.sessionCookieName];
    if (!sessionId) return reply.status(401).send({ error: "Unauthorized" });
    const { session, user } = await app.lucia.validateSession(sessionId);
    if (!session) return reply.status(401).send({ error: "Unauthorized" });
    req.user = user;
    req.session = session;
  });

  // ── My templates (MUST be before /:id to avoid route conflict) ──────────────
  app.get("/my", async (request) => {
    const templates = await prisma.serverTemplate.findMany({
      where: { authorId: request.user!.id },
      orderBy: { updatedAt: "desc" }
    });
    return templates;
  });

  // ── Create template (save a plan as template) ───────────────────────────────
  app.post("/", {
    config: {
      rateLimit: {
        max: 20,
        timeWindow: "1 hour",
        keyGenerator: (req: any) => req.user?.id || req.ip
      }
    }
  }, async (request, reply) => {
    const body = CreateTemplateSchema.parse(request.body);

    // Pro/Studio only can create templates
    const user = await prisma.user.findUnique({ where: { id: request.user!.id } });
    if (user?.plan === "free") {
      return reply.status(403).send({
        error: "Template publishing is a Pro feature",
        upgradeUrl: "/pricing"
      });
    }

    const template = await prisma.serverTemplate.create({
      data: {
        name: body.name,
        description: body.description,
        category: body.category,
        tags: body.tags,
        planJson: body.planJson as any,
        isPublic: body.isPublic,
        authorId: request.user!.id
      }
    });

    return template;
  });

  // ── Update template ─────────────────────────────────────────────────────────
  app.patch("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = CreateTemplateSchema.partial().parse(request.body);

    const template = await prisma.serverTemplate.findUnique({ where: { id } });
    if (!template) return reply.status(404).send({ error: "Not found" });
    if (template.authorId !== request.user!.id) {
      return reply.status(403).send({ error: "Forbidden" });
    }

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.planJson !== undefined) updateData.planJson = body.planJson;
    if (body.isPublic !== undefined) updateData.isPublic = body.isPublic;

    return prisma.serverTemplate.update({ where: { id }, data: updateData as any });
  });

  // ── Delete template ─────────────────────────────────────────────────────────
  app.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const template = await prisma.serverTemplate.findUnique({ where: { id } });
    if (!template) return reply.status(404).send({ error: "Not found" });
    if (template.authorId !== request.user!.id) {
      return reply.status(403).send({ error: "Forbidden" });
    }

    await prisma.serverTemplate.delete({ where: { id } });
    return { success: true };
  });

  // ── Star / unstar ───────────────────────────────────────────────────────────
  app.post("/:id/star", async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.user!.id;

    const existing = await prisma.templatestar.findUnique({
      where: { userId_templateId: { userId, templateId: id } }
    });

    if (existing) {
      // Unstar
      await prisma.$transaction([
        prisma.templatestar.delete({
          where: { userId_templateId: { userId, templateId: id } }
        }),
        prisma.serverTemplate.update({
          where: { id },
          data: { starCount: { decrement: 1 } }
        })
      ]);
      return { starred: false };
    }

    // Star
    await prisma.$transaction([
      prisma.templatestar.create({ data: { userId, templateId: id } }),
      prisma.serverTemplate.update({
        where: { id },
        data: { starCount: { increment: 1 } }
      })
    ]);
    return { starred: true };
  });

  // ── Check star status ───────────────────────────────────────────────────────
  app.get("/:id/star", async (request) => {
    const { id } = request.params as { id: string };
    const star = await prisma.templatestar.findUnique({
      where: { userId_templateId: { userId: request.user!.id, templateId: id } }
    });
    return { starred: !!star };
  });

  // ── Use template (bump use count + return planJson) ─────────────────────────
  app.post("/:id/use", async (request, reply) => {
    const { id } = request.params as { id: string };

    const template = await prisma.serverTemplate.findUnique({ where: { id } });
    if (!template || (!template.isPublic && template.authorId !== request.user!.id)) {
      return reply.status(404).send({ error: "Template not found" });
    }

    await prisma.serverTemplate.update({
      where: { id },
      data: { useCount: { increment: 1 } }
    });

    // Emit analytics event
    await prisma.buildEvent.create({
      data: {
        userId: request.user!.id,
        eventType: "TEMPLATE_USED",
        metadata: { templateId: id, templateName: template.name }
      }
    });

    return { planJson: template.planJson, name: template.name };
  });
}

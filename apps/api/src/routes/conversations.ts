import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getProvider } from "../services/llm";
import { PLAN_GENERATOR_SYSTEM_PROMPT } from "../services/agent/prompts";
import { validatePlan } from "../services/agent/validate";
import { BuildPlanSchema } from "@guildforge/plan-schema";

export async function conversationRoutes(app: FastifyInstance) {
  // Auth guard for all conversation routes
  app.addHook("preHandler", async (req, reply) => {
    const sessionId = req.cookies[app.lucia.sessionCookieName];
    if (!sessionId) return reply.status(401).send({ error: "Unauthorized" });
    const { session, user } = await app.lucia.validateSession(sessionId);
    if (!session) {
      reply.clearCookie(app.lucia.sessionCookieName);
      return reply.status(401).send({ error: "Unauthorized" });
    }
    req.user = user;
    req.session = session;
  });

  app.post("/", async (req, reply) => {
    const { guildId } = req.body as any;
    const userId = req.user!.id;

    const conversation = await app.prisma.conversation.create({
      data: { userId, guildId }
    });

    // Insert initial AI greeting so the chat doesn't start blank
    await app.prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: "👋 Hey! I'm **GuildForge**, your AI Discord architect. Tell me about the community you're building — the niche, vibe, and how big you expect it to get — and I'll design the perfect server structure for you."
      }
    });

    return { conversation };
  });

  // ── Plan generation — expensive AI call, 10 per hour per user ─────────
  app.post("/:id/plan", {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: "1 hour",
        keyGenerator: (req: any) => req.user?.id || req.ip
      }
    }
  }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const { brief, freeformDescription } = req.body as any;

    const conversation = await app.prisma.conversation.findUnique({
      where: { id }
    });

    if (!conversation) {
      return reply.status(404).send({ error: "Conversation not found" });
    }

    const provider = getProvider();
    const userPrompt = `Brief: ${JSON.stringify(brief || {})}\nDescription: ${freeformDescription || ""}`;

    try {
      const { zodToJsonSchema } = await import("zod-to-json-schema");
      const { BOT_CATALOG } = await import("../services/agent/bot-catalog");

      const buildPlanJsonSchema = zodToJsonSchema(BuildPlanSchema, "BuildPlanSchema");
      const buildPlanInputSchema = (buildPlanJsonSchema as any).definitions?.BuildPlanSchema || buildPlanJsonSchema;

      let messages: { role: "user" | "assistant", content: any }[] = [{ role: "user", content: userPrompt }];

      const systemPrompt = PLAN_GENERATOR_SYSTEM_PROMPT + "\n\nYou MUST use the 'recommend_bots' tool to get a catalog of bots and shortlist them before producing the final plan. Once you have called 'recommend_bots' and received the catalog, use 'output_result' to output the final BuildPlan.";

      let planObj: any = null;

      for (let i = 0; i < 3; i++) {
        const response = await provider.chat({
          systemPrompt,
          messages: messages as any,
          tools: [
            {
              name: "recommend_bots",
              description: "Get the catalog of available bots to shortlist 3-5 for the server plan.",
              input_schema: {
                type: "object",
                properties: {
                  brief: { type: "string", description: "Summary of server needs" }
                },
                required: ["brief"]
              }
            },
            {
              name: "output_result",
              description: "Output the final generated BuildPlan.",
              input_schema: buildPlanInputSchema
            }
          ]
        });

        messages.push({
          role: "assistant",
          content: response.rawContent
        });

        if (response.toolCalls && response.toolCalls.length > 0) {
          const toolCall = response.toolCalls[0];
          
          if (toolCall.name === "recommend_bots") {
            // Provide catalog to the model
            messages.push({
              role: "user",
              content: [
                {
                  type: "tool_result",
                  tool_use_id: toolCall.id,
                  content: JSON.stringify(BOT_CATALOG)
                }
              ]
            });
          } else if (toolCall.name === "output_result") {
            planObj = toolCall.input;
            break;
          }
        } else {
          // If no tool is called, break out
          break;
        }
      }

      if (!planObj) {
        throw new Error("Failed to generate plan");
      }

      const plan = BuildPlanSchema.parse(planObj);
      const issues = validatePlan(plan);
      if (issues.length > 0) {
        app.log.warn({ issues }, "Generated plan has issues");
      }

      const buildPlan = await app.prisma.buildPlan.create({
        data: {
          conversationId: id,
          guildId: conversation.guildId,
          planJson: plan as any,
          status: "DRAFT"
        }
      });

      return { plan: buildPlan };
    } catch (e: any) {
      app.log.error(e);
      return reply.status(500).send({ error: "Failed to generate plan" });
    }
  });

  // ── Chat messages — 30 per 10 min per user (prevents AI cost blowout) ──
  app.post("/:id/messages", {
    config: {
      rateLimit: {
        max: 30,
        timeWindow: "10 minutes",
        keyGenerator: (req: any) => req.user?.id || req.ip
      }
    }
  }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const { content } = req.body as { content: string };

    const conversation = await app.prisma.conversation.findUnique({
      where: { id }
    });

    if (!conversation) return reply.status(404).send({ error: "Conversation not found" });

    // Save user message
    await app.prisma.message.create({
      data: {
        conversationId: id,
        role: "user",
        content
      }
    });

    const buildPlans = await app.prisma.buildPlan.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "desc" },
      take: 1
    });

    if (buildPlans.length === 0) {
      return reply.status(404).send({ error: "No existing plan to refine" });
    }

    const currentPlan = buildPlans[0];

    // Fetch history
    const history = await app.prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" },
      take: 20
    });

    const provider = getProvider();
    
    // We import PlanChangeSchema JSON schema representation
    const { zodToJsonSchema } = await import("zod-to-json-schema");
    const { PlanChangeSchema } = await import("@guildforge/plan-schema");
    const { applyPlanChanges } = await import("../services/agent/patch");
    const { validatePlan } = await import("../services/agent/validate");

    const jsonSchema = zodToJsonSchema(z.object({ changes: z.array(PlanChangeSchema) }), "OutputSchema");
    const inputSchema = (jsonSchema as any).definitions?.OutputSchema || jsonSchema;

    const systemPrompt = `You are GuildForge, an AI Discord Server Architect.
The user is chatting with you to refine their server plan.
You have access to the current plan and can propose changes using the 'propose_plan_change' tool.
If the user asks for a change, ALWAYS use the tool to apply it.
Current Plan:
${JSON.stringify(currentPlan.planJson, null, 2)}`;

    try {
      const chatResponse = await provider.chat({
        systemPrompt,
        messages: history.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
        tools: [{
          name: "propose_plan_change",
          description: "Propose an array of structural changes to the current BuildPlan.",
          input_schema: inputSchema
        }]
      });

      // Save assistant message
      await app.prisma.message.create({
        data: {
          conversationId: id,
          role: "assistant",
          content: chatResponse.content,
          toolCalls: chatResponse.toolCalls ? (chatResponse.toolCalls as any) : undefined
        }
      });

      let newPlanObj = currentPlan.planJson as any;
      let diffInfo = null;

      if (chatResponse.toolCalls && chatResponse.toolCalls.length > 0) {
        const changesCall = chatResponse.toolCalls.find(t => t.name === "propose_plan_change");
        if (changesCall) {
          const proposedChanges = changesCall.input.changes || [];
          newPlanObj = applyPlanChanges(newPlanObj, proposedChanges);
          
          const issues = validatePlan(newPlanObj);
          if (issues.length > 0) {
            app.log.warn({ issues }, "Refined plan has issues");
          }

          const buildPlan = await app.prisma.buildPlan.create({
            data: {
              conversationId: id,
              guildId: conversation.guildId,
              planJson: newPlanObj,
              status: "DRAFT"
            }
          });

          diffInfo = { planId: buildPlan.id, changes: proposedChanges };
        }
      }

      return { 
        message: { role: "assistant", content: chatResponse.content },
        diff: diffInfo,
        plan: newPlanObj
      };
    } catch (e: any) {
      app.log.error(e);
      return reply.status(500).send({ error: "Failed to process message" });
    }
  });

  app.get("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const conversation = await app.prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" }
        },
        buildPlans: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    if (!conversation) {
      return reply.status(404).send({ error: "Conversation not found" });
    }

    return conversation;
  });
}

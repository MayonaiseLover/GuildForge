import { FastifyPluginAsync } from "fastify";
import { listProviders, getProvider } from "../services/llm";

const providersRoutes: FastifyPluginAsync = async (app) => {
  // Auth helper
  async function requireAuth(req: import("fastify").FastifyRequest, reply: import("fastify").FastifyReply) {
    const sessionId = req.cookies[app.lucia.sessionCookieName];
    if (!sessionId) { reply.status(401).send({ error: "Unauthorized" }); return null; }
    const { session, user } = await app.lucia.validateSession(sessionId);
    if (!session) { reply.clearCookie(app.lucia.sessionCookieName); reply.status(401).send({ error: "Unauthorized" }); return null; }
    return user;
  }

  // ── GET /providers — list all LLM providers ─────────────────────────────
  app.get("/", async (req, reply) => {
    const user = await requireAuth(req, reply);
    if (!user) return;
    return { providers: listProviders() };
  });

  // ── GET /providers/:id/models — list models for a provider ──────────────
  app.get<{ Params: { id: string } }>("/:id/models", async (req, reply) => {
    const user = await requireAuth(req, reply);
    if (!user) return;

    try {
      const provider = getProvider(req.params.id);
      return { provider: provider.id, name: provider.name, models: provider.models };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Provider not available";
      return reply.status(400).send({ error: message });
    }
  });

  // ── POST /providers/:id/test — test a provider connection ───────────────
  app.post<{ Params: { id: string } }>("/:id/test", async (req, reply) => {
    const user = await requireAuth(req, reply);
    if (!user) return;

    try {
      const provider = getProvider(req.params.id);
      const start = Date.now();
      const result = await provider.chat({
        systemPrompt: "You are a helpful assistant. Respond in exactly one sentence.",
        messages: [{ role: "user", content: "Say hello and confirm you are working." }],
        maxTokens: 100,
        temperature: 0.1,
      });
      const latency = Date.now() - start;

      return { provider: provider.id, name: provider.name, status: "ok", latency, response: result.content.slice(0, 200) };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Connection failed";
      return reply.status(502).send({ provider: req.params.id, status: "error", error: message });
    }
  });
};

export default providersRoutes;

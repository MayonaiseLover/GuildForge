import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";

/**
 * Shared authentication hook.
 * Validates the session cookie via Lucia and returns the authenticated user.
 * Sends 401 if unauthenticated. Returns null so callers can bail with `if (!user) return;`
 */
export async function requireAuth(
  app: FastifyInstance,
  req: FastifyRequest,
  reply: FastifyReply
) {
  const sessionId = req.cookies[app.lucia.sessionCookieName];
  if (!sessionId) {
    reply.status(401).send({ error: "Unauthorized" });
    return null;
  }

  const { session, user } = await app.lucia.validateSession(sessionId);
  if (!session) {
    reply.clearCookie(app.lucia.sessionCookieName);
    reply.status(401).send({ error: "Unauthorized" });
    return null;
  }

  return user;
}

/** Type-safe plan access — avoids scattered `as unknown as { plan: string }` casts */
export function getUserPlan(user: { id: string }): string {
  return (user as unknown as { plan: string }).plan ?? "free";
}

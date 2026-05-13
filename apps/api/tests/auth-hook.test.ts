import { describe, it, expect, vi } from "vitest";

// Mock Lucia and Fastify to test auth hook in isolation
function createMockApp(validSession = true) {
  const mockUser = { id: "user-1", discordId: "123", username: "test", avatar: null, plan: "pro" };

  return {
    lucia: {
      sessionCookieName: "gf_session",
      validateSession: vi.fn().mockResolvedValue(
        validSession
          ? { session: { id: "sess-1", expiresAt: new Date() }, user: mockUser }
          : { session: null, user: null }
      ),
    },
  };
}

function createMockReq(cookies: Record<string, string> = {}) {
  return { cookies } as any;
}

function createMockReply() {
  const reply: any = {
    statusCode: 200,
    body: null,
    status(code: number) { reply.statusCode = code; return reply; },
    send(body: any) { reply.body = body; return reply; },
    clearCookie: vi.fn(),
  };
  return reply;
}

describe("requireAuth hook", () => {
  it("returns user when session is valid", async () => {
    const { requireAuth } = await import("../src/hooks/auth");
    const app = createMockApp(true);
    const req = createMockReq({ gf_session: "valid-session-id" });
    const reply = createMockReply();

    const user = await requireAuth(app as any, req, reply);

    expect(user).not.toBeNull();
    expect(user!.id).toBe("user-1");
    expect(app.lucia.validateSession).toHaveBeenCalledWith("valid-session-id");
  });

  it("returns null and sends 401 when no cookie", async () => {
    const { requireAuth } = await import("../src/hooks/auth");
    const app = createMockApp(true);
    const req = createMockReq({}); // no session cookie
    const reply = createMockReply();

    const user = await requireAuth(app as any, req, reply);

    expect(user).toBeNull();
    expect(reply.statusCode).toBe(401);
    expect(reply.body).toEqual({ error: "Unauthorized" });
  });

  it("returns null and clears cookie when session is invalid", async () => {
    const { requireAuth } = await import("../src/hooks/auth");
    const app = createMockApp(false); // invalid session
    const req = createMockReq({ gf_session: "expired-session" });
    const reply = createMockReply();

    const user = await requireAuth(app as any, req, reply);

    expect(user).toBeNull();
    expect(reply.statusCode).toBe(401);
    expect(reply.clearCookie).toHaveBeenCalledWith("gf_session");
  });
});

describe("getUserPlan", () => {
  it("returns plan from user object", async () => {
    const { getUserPlan } = await import("../src/hooks/auth");
    const user = { id: "u1", plan: "studio" } as any;
    expect(getUserPlan(user)).toBe("studio");
  });

  it("defaults to free when plan is missing", async () => {
    const { getUserPlan } = await import("../src/hooks/auth");
    const user = { id: "u1" } as any;
    expect(getUserPlan(user)).toBe("free");
  });
});

import { describe, it, expect, vi, beforeAll } from "vitest";

// Mock @prisma/client
vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $queryRaw: vi.fn().mockResolvedValue([{ "?column?": 1 }]),
  })),
}));

// Mock arctic
vi.mock("arctic", () => ({
  Discord: vi.fn().mockImplementation(() => ({
    createAuthorizationURL: vi.fn(),
    validateAuthorizationCode: vi.fn(),
    refreshAccessToken: vi.fn(),
  })),
}));

// Mock Prisma plugin with monitoring models
vi.mock("../src/plugins/prisma", () => ({
  registerPrisma: vi.fn(async (app: any) => {
    app.decorate("prisma", {
      $queryRaw: vi.fn().mockResolvedValue([{ "?column?": 1 }]),
      user: { findUnique: vi.fn(), findFirst: vi.fn() },
      session: { findUnique: vi.fn(), create: vi.fn(), delete: vi.fn() },
      oAuthAccount: { findFirst: vi.fn() },
      managedGuild: {
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn(),
        upsert: vi.fn(),
        update: vi.fn(),
      },
      conversation: { findUnique: vi.fn(), create: vi.fn() },
      message: { findMany: vi.fn(), create: vi.fn() },
      buildPlan: { findMany: vi.fn(), create: vi.fn(), count: vi.fn() },
      buildEvent: { findMany: vi.fn(), create: vi.fn() },
      snapshotRecord: { count: vi.fn().mockResolvedValue(0) },
      operation: { groupBy: vi.fn().mockResolvedValue([]) },
      serverTemplate: { findMany: vi.fn().mockResolvedValue([]), count: vi.fn().mockResolvedValue(0) },
      teamMember: { findMany: vi.fn().mockResolvedValue([]), findUnique: vi.fn(), create: vi.fn(), delete: vi.fn() },
      team: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: "team-1", name: "Test", slug: "test" }),
        delete: vi.fn(),
      },
      teamInvite: { findUnique: vi.fn(), create: vi.fn() },
      teamGuild: { create: vi.fn() },
      healthCheck: {
        findFirst: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({
          id: "hc-1",
          guildId: "guild-1",
          status: "healthy",
          botOnline: true,
          memberCount: 42,
          issuesFound: [],
          checkedAt: new Date(),
        }),
      },
      alertRule: {
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({
          id: "rule-1",
          userId: "user-1",
          guildId: "guild-1",
          name: "Member Drop Alert",
          condition: "member_drop",
          threshold: { value: 10 },
          isActive: true,
        }),
        findUnique: vi.fn().mockResolvedValue({ id: "rule-1", userId: "user-1" }),
        update: vi.fn(),
        delete: vi.fn(),
      },
      alert: {
        findMany: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(0),
        findUnique: vi.fn().mockResolvedValue({
          id: "alert-1",
          ruleId: "rule-1",
          guildId: "guild-1",
          title: "Test Alert",
          message: "Something happened",
          severity: "warning",
          acknowledged: false,
          rule: { userId: "user-1", name: "Test Rule", condition: "member_drop" },
        }),
        update: vi.fn().mockResolvedValue({
          id: "alert-1",
          acknowledged: true,
          acknowledgedAt: new Date(),
          acknowledgedBy: "user-1",
        }),
      },
      subscription: { findUnique: vi.fn() },
    });
  }),
}));

// Mock Lucia
vi.mock("../src/plugins/lucia", () => ({
  registerLucia: vi.fn(async (app: any) => {
    app.decorate("lucia", {
      sessionCookieName: "gf_session",
      validateSession: vi.fn().mockResolvedValue({ session: null, user: null }),
    });
  }),
}));

// Mock env
vi.mock("../src/env", () => ({
  env: {
    DATABASE_URL: "postgresql://test:test@localhost:5432/test",
    DISCORD_CLIENT_ID: "test-client-id",
    DISCORD_CLIENT_SECRET: "test-secret",
    DISCORD_BOT_TOKEN: "test-bot-token",
    WEB_URL: "http://localhost:3000",
    API_URL: "http://localhost:3001",
    API_PORT: 3001,
    SESSION_SECRET: "test-session-secret-minimum-32chars",
    LLM_PROVIDER: "anthropic",
    ANTHROPIC_API_KEY: "sk-test",
  },
}));

import { buildApp } from "../src/app";

const mockAuth = (app: any) => {
  app.lucia.validateSession.mockResolvedValueOnce({
    session: { id: "test-session", expiresAt: new Date(Date.now() + 86400000) },
    user: { id: "user-1", discordId: "123", username: "test", avatar: null, plan: "free" },
  });
};

describe("Monitoring route integration tests", () => {
  let app: any;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  // ── Unauthenticated Access ───────────────────────────────────────────────

  it("GET /monitoring/health/:guildId returns 401 without auth", async () => {
    const res = await app.inject({ method: "GET", url: "/monitoring/health/guild-1" });
    expect(res.statusCode).toBe(401);
  });

  it("POST /monitoring/health/:guildId/check returns 401 without auth", async () => {
    const res = await app.inject({ method: "POST", url: "/monitoring/health/guild-1/check" });
    expect(res.statusCode).toBe(401);
  });

  it("GET /monitoring/alerts returns 401 without auth", async () => {
    const res = await app.inject({ method: "GET", url: "/monitoring/alerts" });
    expect(res.statusCode).toBe(401);
  });

  it("POST /monitoring/alerts/:alertId/acknowledge returns 401 without auth", async () => {
    const res = await app.inject({ method: "POST", url: "/monitoring/alerts/alert-1/acknowledge" });
    expect(res.statusCode).toBe(401);
  });

  it("GET /monitoring/rules returns 401 without auth", async () => {
    const res = await app.inject({ method: "GET", url: "/monitoring/rules" });
    expect(res.statusCode).toBe(401);
  });

  it("POST /monitoring/rules returns 401 without auth", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/monitoring/rules",
      headers: { "content-type": "application/json" },
      payload: { guildId: "g1", name: "r1", condition: "member_drop", threshold: { value: 10 } },
    });
    expect(res.statusCode).toBe(401);
  });

  it("DELETE /monitoring/rules/:ruleId returns 401 without auth", async () => {
    const res = await app.inject({ method: "DELETE", url: "/monitoring/rules/rule-1" });
    expect(res.statusCode).toBe(401);
  });

  // ── Authenticated Access ────────────────────────────────────────────────

  it("GET /monitoring/health/:guildId returns health data when authenticated", async () => {
    mockAuth(app);
    const res = await app.inject({
      method: "GET",
      url: "/monitoring/health/guild-1",
      cookies: { gf_session: "test-session" },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    // Route returns { current, history, guildId }
    expect(body).toHaveProperty("current");
    expect(body).toHaveProperty("history");
    expect(body).toHaveProperty("guildId");
  });

  it("GET /monitoring/alerts returns alert list when authenticated", async () => {
    mockAuth(app);
    const res = await app.inject({
      method: "GET",
      url: "/monitoring/alerts",
      cookies: { gf_session: "test-session" },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body).toHaveProperty("alerts");
    expect(body).toHaveProperty("unacknowledgedCount");
    expect(Array.isArray(body.alerts)).toBe(true);
  });

  it("GET /monitoring/rules returns rules list when authenticated", async () => {
    mockAuth(app);
    const res = await app.inject({
      method: "GET",
      url: "/monitoring/rules",
      cookies: { gf_session: "test-session" },
    });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(JSON.parse(res.body))).toBe(true);
  });

  it("POST /monitoring/alerts/:alertId/acknowledge acknowledges alert", async () => {
    mockAuth(app);
    const res = await app.inject({
      method: "POST",
      url: "/monitoring/alerts/alert-1/acknowledge",
      cookies: { gf_session: "test-session" },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.acknowledged).toBe(true);
  });

  it("POST /monitoring/rules creates a new rule when authenticated", async () => {
    mockAuth(app);
    const res = await app.inject({
      method: "POST",
      url: "/monitoring/rules",
      cookies: { gf_session: "test-session" },
      headers: { "content-type": "application/json" },
      payload: {
        guildId: "guild-1",
        name: "Member Drop Alert",
        condition: "member_drop",
        threshold: { value: 10 },
      },
    });
    // Route validates condition then calls prisma.alertRule.create
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.name).toBe("Member Drop Alert");
    expect(body.condition).toBe("member_drop");
  });

  it("POST /monitoring/rules rejects invalid condition", async () => {
    mockAuth(app);
    const res = await app.inject({
      method: "POST",
      url: "/monitoring/rules",
      cookies: { gf_session: "test-session" },
      headers: { "content-type": "application/json" },
      payload: {
        guildId: "guild-1",
        name: "Bad Rule",
        condition: "invalid_condition",
        threshold: { value: 5 },
      },
    });
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.error).toContain("Invalid condition");
  });

  it("DELETE /monitoring/rules/:ruleId deletes rule when authenticated", async () => {
    mockAuth(app);
    const res = await app.inject({
      method: "DELETE",
      url: "/monitoring/rules/rule-1",
      cookies: { gf_session: "test-session" },
    });
    // Route returns { success: true } with status 200
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
  });
});

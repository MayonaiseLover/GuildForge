import { describe, it, expect, vi, beforeAll } from "vitest";

// Mock @prisma/client before anything else
vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $queryRaw: vi.fn().mockResolvedValue([{ "?column?": 1 }]),
  })),
}));

// Mock arctic (Discord OAuth)
vi.mock("arctic", () => ({
  Discord: vi.fn().mockImplementation(() => ({
    createAuthorizationURL: vi.fn(),
    validateAuthorizationCode: vi.fn(),
    refreshAccessToken: vi.fn(),
  })),
}));

// Mock Prisma plugin
vi.mock("../src/plugins/prisma", () => ({
  registerPrisma: vi.fn(async (app: any) => {
    app.decorate("prisma", {
      $queryRaw: vi.fn().mockResolvedValue([{ "?column?": 1 }]),
      user: { findUnique: vi.fn(), findFirst: vi.fn() },
      session: { findUnique: vi.fn(), create: vi.fn(), delete: vi.fn() },
      oAuthAccount: { findFirst: vi.fn() },
      managedGuild: { findMany: vi.fn().mockResolvedValue([]), findUnique: vi.fn(), upsert: vi.fn(), update: vi.fn() },
      conversation: { findUnique: vi.fn(), create: vi.fn() },
      message: { findMany: vi.fn(), create: vi.fn() },
      buildPlan: { findMany: vi.fn(), create: vi.fn(), count: vi.fn() },
      buildEvent: { findMany: vi.fn(), create: vi.fn() },
      snapshotRecord: { count: vi.fn().mockResolvedValue(0) },
      operation: { groupBy: vi.fn().mockResolvedValue([]) },
      serverTemplate: { findMany: vi.fn().mockResolvedValue([]), count: vi.fn().mockResolvedValue(0) },
      teamMember: { findMany: vi.fn().mockResolvedValue([]), findUnique: vi.fn(), create: vi.fn(), delete: vi.fn() },
      team: { findUnique: vi.fn().mockResolvedValue(null), create: vi.fn().mockResolvedValue({ id: "team-1", name: "Test", slug: "test" }), delete: vi.fn() },
      teamInvite: { findUnique: vi.fn(), create: vi.fn() },
      teamGuild: { create: vi.fn() },
      healthCheck: { findFirst: vi.fn(), findMany: vi.fn().mockResolvedValue([]), create: vi.fn() },
      alertRule: { findMany: vi.fn().mockResolvedValue([]) },
      alert: { findMany: vi.fn().mockResolvedValue([]), findUnique: vi.fn() },
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

describe("Route integration tests", () => {
  let app: any;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  // ── Health Endpoints ─────────────────────────────────────────────────────

  it("GET /health returns healthy status", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.status).toBe("healthy");
    expect(body.uptime).toBeGreaterThan(0);
    expect(body.memory).toBeDefined();
    expect(body.memory.rss).toBeGreaterThan(0);
  });

  it("GET /status returns ok", async () => {
    const res = await app.inject({ method: "GET", url: "/status" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.status).toBe("ok");
    expect(body.services.database).toBe("ok");
  });

  // ── Unauthenticated Access ───────────────────────────────────────────────

  it("GET /teams returns 401 without auth", async () => {
    const res = await app.inject({ method: "GET", url: "/teams" });
    expect(res.statusCode).toBe(401);
  });

  it("GET /billing/subscription returns 401 without auth", async () => {
    const res = await app.inject({ method: "GET", url: "/billing/subscription" });
    expect(res.statusCode).toBe(401);
  });

  it("GET /monitoring/health/test-guild returns 401 without auth", async () => {
    const res = await app.inject({ method: "GET", url: "/monitoring/health/test-guild" });
    expect(res.statusCode).toBe(401);
  });

  it("GET /providers returns 401 without auth", async () => {
    const res = await app.inject({ method: "GET", url: "/providers" });
    expect(res.statusCode).toBe(401);
  });

  it("POST /billing/checkout returns 401 without auth", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/billing/checkout",
      headers: { "content-type": "application/json" },
      payload: {},
    });
    expect(res.statusCode).toBe(401);
  });

  // ── Authenticated Access ─────────────────────────────────────────────────

  it("GET /teams returns empty list when authenticated", async () => {
    app.lucia.validateSession.mockResolvedValueOnce({
      session: { id: "test-session", expiresAt: new Date(Date.now() + 86400000) },
      user: { id: "user-1", discordId: "123", username: "test", avatar: null, plan: "free" },
    });

    const res = await app.inject({
      method: "GET",
      url: "/teams",
      cookies: { gf_session: "test-session" },
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual([]);
  });

  it("GET /providers returns provider list when authenticated", async () => {
    app.lucia.validateSession.mockResolvedValueOnce({
      session: { id: "test-session", expiresAt: new Date(Date.now() + 86400000) },
      user: { id: "user-1", discordId: "123", username: "test", avatar: null, plan: "free" },
    });

    const res = await app.inject({
      method: "GET",
      url: "/providers",
      cookies: { gf_session: "test-session" },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.providers).toBeDefined();
    expect(body.providers.length).toBe(6);
  });

  it("POST /billing/checkout returns 503 stub when authenticated", async () => {
    app.lucia.validateSession.mockResolvedValueOnce({
      session: { id: "test-session", expiresAt: new Date(Date.now() + 86400000) },
      user: { id: "user-1", discordId: "123", username: "test", avatar: null, plan: "free" },
    });

    const res = await app.inject({
      method: "POST",
      url: "/billing/checkout",
      cookies: { gf_session: "test-session" },
      headers: { "content-type": "application/json" },
      payload: {},
    });
    expect(res.statusCode).toBe(503);
    const body = JSON.parse(res.body);
    expect(body.error).toContain("Stripe");
  });

  it("POST /teams validates slug format", async () => {
    app.lucia.validateSession.mockResolvedValueOnce({
      session: { id: "test-session", expiresAt: new Date(Date.now() + 86400000) },
      user: { id: "user-1", discordId: "123", username: "test", avatar: null, plan: "free" },
    });

    const res = await app.inject({
      method: "POST",
      url: "/teams",
      cookies: { gf_session: "test-session" },
      headers: { "content-type": "application/json" },
      payload: { name: "Test Team", slug: "AB" },
    });
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.error).toContain("Slug");
  });
});

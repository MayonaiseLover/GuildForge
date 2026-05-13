/**
 * Typed API client for GuildForge backend.
 * All API calls go through here — handles auth cookies, errors, and type safety.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error || res.statusText, body);
  }

  return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  discordId: string;
  username: string;
  avatar: string | null;
  plan: string;
}

export const auth = {
  me: () => request<{ user: User }>("/auth/me"),
  logout: () => request<{ success: boolean }>("/auth/logout", { method: "POST" }),
};

// ── Guilds ────────────────────────────────────────────────────────────────────

export interface Guild {
  id: string;
  name: string;
  icon: string | null;
  botPresent: boolean;
  inviteUrlIfMissing: string | null;
}

export const guilds = {
  list: () => request<Guild[]>("/guilds"),
  connect: (guildId: string) =>
    request<{ connected: boolean; guild?: unknown; inviteUrl?: string }>(`/guilds/${guildId}/connect`, {
      method: "POST",
    }),
  audit: (guildId: string) =>
    request<{ recommendations: { description: string; rationale: string }[] }>(`/guilds/${guildId}/audit`, {
      method: "POST",
    }),
};

// ── Teams ─────────────────────────────────────────────────────────────────────

export interface Team {
  id: string;
  name: string;
  slug: string;
  avatarUrl: string | null;
  plan: string;
  memberCount: number;
  guildCount: number;
  myRole: string;
}

export const teams = {
  list: () => request<Team[]>("/teams"),
  get: (teamId: string) => request<Team>(`/teams/${teamId}`),
  create: (data: { name: string; slug: string }) =>
    request<Team>("/teams", { method: "POST", body: JSON.stringify(data) }),
  delete: (teamId: string) =>
    request<{ success: boolean }>(`/teams/${teamId}`, { method: "DELETE" }),
  invite: (teamId: string, data: { email: string; role?: string }) =>
    request<{ invite: unknown; inviteUrl: string }>(`/teams/${teamId}/invite`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  joinByToken: (token: string) =>
    request<{ team: unknown }>(`/teams/join/${token}`, { method: "POST" }),
  removeMember: (teamId: string, userId: string) =>
    request<{ success: boolean }>(`/teams/${teamId}/members/${userId}`, { method: "DELETE" }),
};

// ── Billing ───────────────────────────────────────────────────────────────────

export interface Subscription {
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  limits: Record<string, number>;
}

export const billing = {
  subscription: () => request<Subscription>("/billing/subscription"),
  plans: () => request<{ plans: { id: string; name: string; limits: Record<string, number>; available: boolean }[] }>("/billing/plans"),
};

// ── Analytics ─────────────────────────────────────────────────────────────────

export interface AnalyticsSummary {
  totalBuilds: number;
  successfulBuilds: number;
  successRate: number;
  totalGuilds: number;
  totalSnapshots: number;
  totalMessages: number;
  recentEvents: unknown[];
  buildsByMonth: { month: string; count: number }[];
}

export const analytics = {
  summary: () => request<AnalyticsSummary>("/analytics/summary"),
  guild: (guildId: string) => request<unknown>(`/analytics/guild/${guildId}`),
};

// ── Monitoring ────────────────────────────────────────────────────────────────

export const monitoring = {
  health: (guildId: string) => request<{ current: unknown; history: unknown[]; guildId: string }>(`/monitoring/health/${guildId}`),
  triggerCheck: (guildId: string) =>
    request<unknown>(`/monitoring/health/${guildId}/check`, { method: "POST" }),
  alerts: (params?: { guildId?: string; acknowledged?: string; limit?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<unknown[]>(`/monitoring/alerts${qs ? `?${qs}` : ""}`);
  },
  acknowledgeAlert: (alertId: string) =>
    request<unknown>(`/monitoring/alerts/${alertId}/acknowledge`, { method: "POST" }),
};

// ── Providers ─────────────────────────────────────────────────────────────────

export interface LLMProvider {
  id: string;
  name: string;
  models: string[];
  configured: boolean;
  isDefault: boolean;
}

export const providers = {
  list: () => request<{ providers: LLMProvider[] }>("/providers"),
  models: (providerId: string) =>
    request<{ provider: string; name: string; models: string[] }>(`/providers/${providerId}/models`),
  test: (providerId: string) =>
    request<{ provider: string; status: string; latency: number; response: string }>(`/providers/${providerId}/test`, {
      method: "POST",
    }),
};

// ── Health ─────────────────────────────────────────────────────────────────────

export const system = {
  health: () =>
    request<{ status: string; uptime: number; timestamp: string; memory: { rss: number; heapUsed: number } }>("/health"),
  status: () =>
    request<{ status: string; services: Record<string, string>; timestamp: string }>("/status"),
};

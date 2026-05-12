// ── Plan Definitions ──────────────────────────────────────────────────────────

export interface PlanConfig {
  id: string;
  name: string;
  limits: {
    serversPerMonth: number;
    templatesPerMonth: number;
    teamMembers: number;
    healthChecksPerDay: number;
    alertRules: number;
  };
}

export const PLANS: Record<string, PlanConfig> = {
  free: {
    id: "free",
    name: "Free",
    limits: {
      serversPerMonth: 3,
      templatesPerMonth: 5,
      teamMembers: 0,
      healthChecksPerDay: 1,
      alertRules: 2,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    limits: {
      serversPerMonth: 25,
      templatesPerMonth: 50,
      teamMembers: 10,
      healthChecksPerDay: 24,
      alertRules: 20,
    },
  },
  studio: {
    id: "studio",
    name: "Studio",
    limits: {
      serversPerMonth: -1, // unlimited
      templatesPerMonth: -1,
      teamMembers: 50,
      healthChecksPerDay: -1,
      alertRules: -1,
    },
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getPlanLimits(planId: string) {
  return PLANS[planId]?.limits ?? PLANS.free.limits;
}

export function isPlanActive(status: string): boolean {
  return ["active", "trialing"].includes(status);
}

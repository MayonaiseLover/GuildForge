import { describe, it, expect } from "vitest";
import { PLAN_GENERATOR_SYSTEM_PROMPT } from "../../src/services/agent/prompts.js";

describe("Prompts", () => {
  it("contains required architectural instructions", () => {
    // Core identity
    expect(PLAN_GENERATOR_SYSTEM_PROMPT).toContain("CONSULTATIVE ARCHITECT MODEL");
    expect(PLAN_GENERATOR_SYSTEM_PROMPT).toContain("ARCHITECT ONLY");
    // Enterprise features
    expect(PLAN_GENERATOR_SYSTEM_PROMPT).toContain("ENTERPRISE FEATURE");
    // Architectural rules
    expect(PLAN_GENERATOR_SYSTEM_PROMPT).toContain("Architectural Rules");
    expect(PLAN_GENERATOR_SYSTEM_PROMPT).toContain("Role Hierarchy");
  });
});

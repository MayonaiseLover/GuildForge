import { describe, it, expect } from "vitest";
import { PLAN_GENERATOR_SYSTEM_PROMPT } from "../../src/services/agent/prompts.js";
describe("Prompts", () => {
    it("contains required template instructions", () => {
        expect(PLAN_GENERATOR_SYSTEM_PROMPT).toContain("[GAMING_TEMPLATE]");
        expect(PLAN_GENERATOR_SYSTEM_PROMPT).toContain("[CREATOR_TEMPLATE]");
        expect(PLAN_GENERATOR_SYSTEM_PROMPT).toContain("Verification before access:");
    });
});

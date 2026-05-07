import { describe, it, expect } from "vitest";
import { validatePlan } from "../../src/services/agent/validate.js";
describe("Plan Validation", () => {
    it("rejects missing role keys in overwrites", () => {
        const plan = {
            roles: [],
            categories: [{
                    key: "c1", name: "Cat", permissionOverwrites: [], channels: [{
                            key: "ch1", name: "general", type: "text", purpose: "gen",
                            permissionOverwrites: [{ roleKey: "missing", allow: [], deny: [] }]
                        }]
                }]
        };
        const issues = validatePlan(plan);
        expect(issues.some(i => i.includes("missing"))).toBe(true);
    });
    it("rejects >50 channels per category", () => {
        const plan = {
            roles: [],
            categories: [{
                    key: "c1", name: "Cat", permissionOverwrites: [], channels: Array.from({ length: 51 }).map((_, i) => ({
                        key: `ch${i}`, name: `gen${i}`, type: "text", purpose: "gen"
                    }))
                }]
        };
        const issues = validatePlan(plan);
        expect(issues.some(i => i.includes("more than 50"))).toBe(true);
    });
});

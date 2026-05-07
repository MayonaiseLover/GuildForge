import { describe, it, expect } from "vitest";
import { BuildPlanSchema } from "@guildforge/plan-schema";
describe("Plan Schema Validation", () => {
    it("validates a correct plan", () => {
        const validPlan = {
            version: 1,
            serverName: "Test Server",
            description: "A test server",
            brand: { primaryColor: "#ff0000", tone: "friendly" },
            serverSettings: { verificationLevel: "low", defaultNotifications: "mentions", contentFilter: "disabled" },
            roles: [{ key: "r1", name: "Admin", color: "#00ff00", hoist: true, mentionable: true, permissions: ["ADMINISTRATOR"], purpose: "Admin" }],
            categories: [],
            bots: [],
            postBuildActions: []
        };
        expect(BuildPlanSchema.safeParse(validPlan).success).toBe(true);
    });
    it("rejects an invalid plan", () => {
        const invalidPlan = { version: 2 };
        expect(BuildPlanSchema.safeParse(invalidPlan).success).toBe(false);
    });
});

import { describe, it, expect, vi } from "vitest";
import { AnthropicProvider } from "../../src/services/llm.ts";
import { BuildPlanSchema } from "@guildforge/plan-schema";
vi.mock("@anthropic-ai/sdk", () => {
    return {
        default: vi.fn().mockImplementation(() => ({
            messages: {
                create: vi.fn().mockResolvedValue({
                    content: [
                        {
                            type: "tool_use",
                            input: {
                                version: 1,
                                serverName: "Test",
                                description: "desc",
                                brand: { primaryColor: "#000000", tone: "hype" },
                                serverSettings: { verificationLevel: "low", defaultNotifications: "all", contentFilter: "disabled" },
                                roles: [],
                                categories: [],
                                bots: [],
                                postBuildActions: []
                            }
                        }
                    ]
                })
            }
        }))
    };
});
describe("LLM Provider", () => {
    it("generates a plan via tool output", async () => {
        const provider = new AnthropicProvider();
        const result = await provider.generate({
            systemPrompt: "test",
            userPrompt: "test",
            schema: BuildPlanSchema
        });
        expect(result.serverName).toBe("Test");
    });
});

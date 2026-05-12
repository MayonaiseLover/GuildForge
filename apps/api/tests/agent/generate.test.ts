import { describe, it, expect, vi } from "vitest";
import { BuildPlanSchema } from "@guildforge/plan-schema";

vi.mock("../../src/env.ts", () => ({
  env: {
    ANTHROPIC_API_KEY: "test-key-for-unit-tests",
    DATABASE_URL: "postgresql://test",
    DISCORD_CLIENT_ID: "test",
    DISCORD_CLIENT_SECRET: "test",
    DISCORD_BOT_TOKEN: "test",
    SESSION_SECRET: "test",
    WEB_URL: "http://localhost:3000",
    API_URL: "http://localhost:3001",
    API_PORT: 3001,
  }
}));

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
    const { AnthropicProvider } = await import("../../src/services/llm.ts");
    const provider = new AnthropicProvider();
    const result = await provider.generate({
      systemPrompt: "test",
      userPrompt: "test",
      schema: BuildPlanSchema
    });

    expect(result.serverName).toBe("Test");
  });
});

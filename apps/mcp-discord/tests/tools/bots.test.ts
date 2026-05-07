import { describe, it, expect } from "vitest";
import { ToolRegistry } from "../../src/tools/index.js";
import { registerBotTools } from "../../src/tools/bots.js";

describe("Bots Tools", () => {
  it("should recommend moderation bot if not provided", async () => {
    const registry = new ToolRegistry();
    registerBotTools(registry);
    
    const handler = registry.handlers["recommend_bots"];
    const result = await handler({ guildContext: { type: "community", features: [] } }, {} as any, {} as any);
    
    expect(result.bots).toBeDefined();
    expect(result.bots.some((b: any) => b.id === "carl-bot")).toBe(true);
  });
});

import { describe, it, expect, vi } from "vitest";
import { ToolRegistry } from "../../src/tools/index.js";
import { registerChannelTools } from "../../src/tools/channels.js";

describe("Channel Tools", () => {
  it("should create a category", async () => {
    const registry = new ToolRegistry();
    registerChannelTools(registry);
    
    const mockGuild = {
      channels: {
        create: vi.fn().mockResolvedValue({ id: "123", name: "test-category" }),
        fetch: vi.fn().mockResolvedValue({ id: "123", name: "test-category", position: 1 })
      }
    };

    const mockDiscordClient = {
      getGuild: vi.fn().mockResolvedValue(mockGuild)
    };

    const mockLimiter = {
      run: vi.fn(async (opts, fn) => fn())
    };

    const handler = registry.handlers["create_category"];
    const result = await handler({ guildId: "1", name: "test-category" }, mockDiscordClient as any, mockLimiter as any);
    
    expect(result.id).toBe("123");
    expect(result.name).toBe("test-category");
  });
});

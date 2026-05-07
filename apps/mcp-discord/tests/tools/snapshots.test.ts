import { describe, it, expect, vi } from "vitest";
import { ToolRegistry } from "../../src/tools/index.js";
import { registerSnapshotTools } from "../../src/tools/snapshots.js";

describe("Snapshot Tools", () => {
  it("should snapshot guild", async () => {
    const registry = new ToolRegistry();
    registerSnapshotTools(registry);
    
    const mockGuild = {
      id: "guild123",
      name: "Test Guild",
      channels: { cache: [] },
      roles: { cache: [] }
    };

    const mockDiscordClient = {
      getGuild: vi.fn().mockResolvedValue(mockGuild)
    };

    const handler = registry.handlers["snapshot_guild"];
    const result = await handler({ guildId: "guild123", label: "test" }, mockDiscordClient as any, {} as any);
    
    expect(result.snapshotId).toBeDefined();
    expect(result.label).toBe("test");
  });
});

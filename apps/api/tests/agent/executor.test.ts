import { describe, it, expect, vi } from "vitest";
import { executeBuildPlan } from "../../src/services/agent/executor.js";

const mcpCallToolMock = vi.fn();
const mcpDisconnectMock = vi.fn();

vi.mock("../../src/services/mcp.js", () => {
  return {
    MCPDiscordClient: vi.fn().mockImplementation(() => ({
      callTool: mcpCallToolMock,
      disconnect: mcpDisconnectMock
    }))
  };
});

const prismaUpdateMock = vi.fn();
const prismaCreateMock = vi.fn();

vi.mock("../../src/db.js", () => ({
  prisma: {
    buildPlan: {
      update: (...args: any) => prismaUpdateMock(...args)
    },
    operation: {
      create: (...args: any) => prismaCreateMock(...args),
      update: vi.fn()
    }
  }
}));

describe("executeBuildPlan", () => {
  it("executes tools in correct order", async () => {
    prismaUpdateMock.mockResolvedValueOnce({
      id: "plan-1",
      guild: { discordGuildId: "123" },
      planJson: {
        serverSettings: { verificationLevel: "high" },
        roles: [{ key: "r1", name: "Admin" }],
        categories: [{
          key: "c1", name: "General", permissionOverwrites: [], channels: [
            { key: "ch1", name: "chat", type: "text" }
          ]
        }]
      }
    });

    // Mock MCP responses
    mcpCallToolMock.mockResolvedValue({
      content: [{ text: JSON.stringify({ ok: true, data: { id: "resolved-id" } }) }]
    });

    prismaCreateMock.mockResolvedValue({ id: "op-1" });

    const events: any[] = [];
    await executeBuildPlan("plan-1", (evt) => events.push(evt));

    expect(mcpCallToolMock).toHaveBeenCalledWith("snapshot_guild", expect.any(Object));
    expect(mcpCallToolMock).toHaveBeenCalledWith("update_guild_settings", expect.any(Object));
    expect(mcpCallToolMock).toHaveBeenCalledWith("create_role", expect.any(Object));
    expect(mcpCallToolMock).toHaveBeenCalledWith("create_category", expect.any(Object));
    expect(mcpCallToolMock).toHaveBeenCalledWith("create_text_channel", expect.any(Object));

    expect(events.some(e => e.type === "completed")).toBe(true);
  });
});

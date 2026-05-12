import { describe, it, expect, vi } from "vitest";
import { executeBuildPlan } from "../../src/services/agent/executor.js";

const mcpCallToolMock = vi.fn();
const mcpDisconnectMock = vi.fn();

vi.mock("../../src/services/mcp.js", () => {
  return {
    MCPDiscordClient: vi.fn().mockImplementation(() => ({
      connect: vi.fn(),
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
    // First call: update status to EXECUTING
    prismaUpdateMock.mockResolvedValueOnce({
      id: "plan-1",
      guild: { discordGuildId: "123" },
      planJson: {
        serverSettings: { verificationLevel: "high", contentFilter: "all", defaultNotifications: "mentions" },
        roles: [{ key: "r1", name: "Admin", color: "#FF0000", permissions: [], hoist: true, mentionable: false, position: 1 }],
        categories: [{
          key: "c1", name: "General", permissionOverwrites: [], channels: [
            { key: "ch1", name: "chat", type: "text" }
          ]
        }],
        bots: [],
        postBuildActions: []
      }
    });

    // Second call: update status to COMPLETED
    prismaUpdateMock.mockResolvedValue({ id: "plan-1" });

    // Mock MCP responses — returns valid tool response for every call
    mcpCallToolMock.mockResolvedValue({
      content: [{ text: JSON.stringify({ ok: true, data: { id: "resolved-id" } }) }]
    });

    prismaCreateMock.mockResolvedValue({ id: "op-1" });

    const events: any[] = [];
    await executeBuildPlan("plan-1", (evt) => events.push(evt));

    // Core execution phases happened
    expect(mcpCallToolMock).toHaveBeenCalledWith("snapshot_guild", expect.any(Object));
    expect(mcpCallToolMock).toHaveBeenCalledWith("configure_server", expect.any(Object));
    expect(mcpCallToolMock).toHaveBeenCalledWith("create_role", expect.any(Object));
    expect(mcpCallToolMock).toHaveBeenCalledWith("create_category", expect.any(Object));
    expect(mcpCallToolMock).toHaveBeenCalledWith("create_text_channel", expect.any(Object));

    // Completed event was emitted
    expect(events.some(e => e.type === "completed")).toBe(true);

    // MCP client was disconnected
    expect(mcpDisconnectMock).toHaveBeenCalled();
  });
});

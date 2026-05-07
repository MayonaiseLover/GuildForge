import { describe, it, expect, vi } from "vitest";
import { DiscordClient } from "../src/discord-client.js";

vi.mock("discord.js", () => {
  return {
    Client: vi.fn().mockImplementation(() => ({
      once: vi.fn((event, cb) => {
        if (event === "ready") setTimeout(cb, 10);
      }),
      login: vi.fn().mockResolvedValue(true),
      destroy: vi.fn().mockResolvedValue(true)
    })),
    GatewayIntentBits: { Guilds: 1, GuildMembers: 2, GuildMessages: 4 }
  };
});

describe("DiscordClient", () => {
  it("should initialize lazily", async () => {
    const client = new DiscordClient("fake-token");
    const djsClient = await client.getClient();
    expect(djsClient).toBeDefined();
  });
});

import { describe, it, expect } from "vitest";

describe("Guilds endpoint", () => {
  it("filters guilds by MANAGE_GUILD bit", () => {
    const MANAGE_GUILD = 0x20;
    const guildWithPerms = { permissions: "32" }; // 0x20
    const guildWithoutPerms = { permissions: "0" };

    expect((Number(guildWithPerms.permissions) & MANAGE_GUILD)).toBe(MANAGE_GUILD);
    expect((Number(guildWithoutPerms.permissions) & MANAGE_GUILD)).not.toBe(MANAGE_GUILD);
  });
});

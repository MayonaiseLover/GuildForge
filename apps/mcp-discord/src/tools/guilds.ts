import { ToolRegistry } from "./index.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { GetGuildInput, UpdateGuildSettingsInput } from "../schemas/guild.js";

export function registerGuildTools(registry: ToolRegistry) {
  registry.register({
    name: "list_user_guilds",
    description: "List guilds the bot is in",
    inputSchema: { type: "object", properties: {} }
  }, async (args, discordClient, limiter) => {
    const client = await discordClient.getClient();
    return client.guilds.cache.map(g => ({
      id: g.id,
      name: g.name,
      memberCount: g.memberCount,
      ownerId: g.ownerId,
    }));
  });

  registry.register({
    name: "get_guild",
    description: "Get full guild structure",
    inputSchema: zodToJsonSchema(GetGuildInput) as any
  }, async (args, discordClient, limiter) => {
    const { guildId } = args as any;
    const guild = await discordClient.getGuild(guildId);
    return {
      id: guild.id,
      name: guild.name,
      verificationLevel: guild.verificationLevel,
      defaultNotifications: guild.defaultMessageNotifications,
      contentFilter: guild.explicitContentFilter,
      categories: guild.channels.cache.filter(c => c.type === 4).map(c => ({ id: c.id, name: c.name, position: c.position })),
      channels: guild.channels.cache.filter(c => c.type !== 4).map(c => ({ id: c.id, name: c.name, type: c.type, parentId: c.parentId, position: 'position' in c ? c.position : 0 })),
      roles: guild.roles.cache.map(r => ({ id: r.id, name: r.name, position: r.position })),
      memberCount: guild.memberCount
    };
  });

  registry.register({
    name: "update_guild_settings",
    description: "Update guild settings",
    inputSchema: zodToJsonSchema(UpdateGuildSettingsInput) as any
  }, async (args, discordClient, limiter) => {
    const { guildId, settings } = args as any;
    const guild = await discordClient.getGuild(guildId);
    const updated = await limiter.run({ scope: "guild", guildId }, () => guild.edit(settings));
    return { id: updated.id, name: updated.name };
  });
}

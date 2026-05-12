import { ToolRegistry } from "./index.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { GetGuildInput, UpdateGuildSettingsInput, ExportGuildInput } from "../schemas/guild.js";

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
    description: "Get full guild structure including all role and channel permission overwrites for reverse-engineering.",
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
      categories: guild.channels.cache.filter(c => c.type === 4).map(c => ({
        id: c.id, 
        name: c.name, 
        position: c.position,
        permissionOverwrites: Array.from(c.permissionOverwrites?.cache.values() || []).map(p => ({
          id: p.id,
          type: p.type,
          allow: p.allow.toArray(),
          deny: p.deny.toArray()
        }))
      })),
      channels: guild.channels.cache.filter(c => c.type !== 4).map(c => ({
        id: c.id, 
        name: c.name, 
        type: c.type, 
        parentId: c.parentId, 
        position: 'position' in c ? c.position : 0,
        topic: 'topic' in c ? c.topic : null,
        nsfw: 'nsfw' in c ? c.nsfw : false,
        slowmode: 'rateLimitPerUser' in c ? c.rateLimitPerUser : 0,
        permissionOverwrites: Array.from('permissionOverwrites' in c && c.permissionOverwrites ? c.permissionOverwrites.cache.values() : []).map(p => ({
          id: p.id,
          type: p.type,
          allow: p.allow.toArray(),
          deny: p.deny.toArray()
        }))
      })),
      roles: guild.roles.cache.map(r => ({
        id: r.id, 
        name: r.name, 
        position: r.position,
        color: r.hexColor,
        hoist: r.hoist,
        mentionable: r.mentionable,
        permissions: r.permissions.toArray()
      })),
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

  registry.register({
    name: "export_guild_to_plan",
    description: "Reverse engineers a server and exports its exact structure into a BuildPlan JSON for cloning.",
    inputSchema: zodToJsonSchema(ExportGuildInput) as any
  }, async (args, discordClient, limiter) => {
    const { guildId } = args as any;
    const guild = await discordClient.getGuild(guildId);
    
    const verificationLevelMap: Record<number, string> = { 0: "none", 1: "low", 2: "medium", 3: "high", 4: "very_high" };
    const defaultNotificationsMap: Record<number, string> = { 0: "all", 1: "mentions" };
    const contentFilterMap: Record<number, string> = { 0: "disabled", 1: "no_role", 2: "all" };

    const roles = guild.roles.cache
      .filter(r => r.id !== guild.id) // exclude @everyone for explicit creation
      .sort((a, b) => b.position - a.position)
      .map(r => ({
        key: r.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        name: r.name,
        color: r.hexColor || "#000000",
        hoist: r.hoist,
        mentionable: r.mentionable,
        permissions: r.permissions.toArray(),
        purpose: `Role cloned from ${guild.name}`
      }));

    const roleMap = new Map(guild.roles.cache.map(r => [r.id, r.name.toLowerCase().replace(/[^a-z0-9]/g, '_')]));

    const mapOverwrites = (overwrites: any[]) => {
      return overwrites.map(o => {
        const roleKey = roleMap.get(o.id);
        if (!roleKey) return null;
        return {
          roleKey,
          allow: o.allow.toArray(),
          deny: o.deny.toArray()
        };
      }).filter(Boolean);
    };

    const categories = guild.channels.cache
      .filter(c => c.type === 4)
      .sort((a, b) => a.position - b.position)
      .map(c => {
        const children = guild.channels.cache
          .filter(child => child.parentId === c.id)
          .sort((a, b) => ('position' in a ? a.position : 0) - ('position' in b ? b.position : 0))
          .map(child => ({
            key: child.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
            name: child.name,
            type: child.type === 0 ? "text" : child.type === 2 ? "voice" : child.type === 5 ? "announcement" : child.type === 15 ? "forum" : child.type === 13 ? "stage" : "text",
            topic: 'topic' in child ? child.topic || undefined : undefined,
            nsfw: 'nsfw' in child ? child.nsfw || undefined : undefined,
            slowmodeSeconds: 'rateLimitPerUser' in child ? child.rateLimitPerUser || undefined : undefined,
            userLimit: 'userLimit' in child ? child.userLimit || undefined : undefined,
            bitrate: 'bitrate' in child ? child.bitrate || undefined : undefined,
            permissionOverwrites: 'permissionOverwrites' in child && child.permissionOverwrites ? mapOverwrites(Array.from(child.permissionOverwrites.cache.values())) : [],
            purpose: `Channel cloned from ${guild.name}`
          }));

        return {
          key: c.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          name: c.name,
          permissionOverwrites: mapOverwrites(Array.from(c.permissionOverwrites?.cache.values() || [])),
          channels: children
        };
      });

    const plan = {
      version: 1,
      serverName: `${guild.name} (Clone)`,
      description: `A clone of ${guild.name} generated via Template Reverse Engineering.`,
      brand: {
        primaryColor: "#5865F2",
        tone: "friendly",
        iconUrl: guild.iconURL() || undefined,
        bannerUrl: guild.bannerURL() || undefined
      },
      serverSettings: {
        verificationLevel: verificationLevelMap[guild.verificationLevel] || "none",
        defaultNotifications: defaultNotificationsMap[guild.defaultMessageNotifications] || "all",
        contentFilter: contentFilterMap[guild.explicitContentFilter] || "disabled"
      },
      roles,
      categories,
      bots: [],
      postBuildActions: []
    };

    return plan;
  });
}

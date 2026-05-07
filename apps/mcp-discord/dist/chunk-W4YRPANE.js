// src/errors.ts
var MCPDiscordError = class extends Error {
  constructor(code, message, recoverable = false) {
    super(message);
    this.code = code;
    this.recoverable = recoverable;
    this.name = "MCPDiscordError";
  }
  code;
  recoverable;
};

// src/discord-client.ts
import { Client, GatewayIntentBits } from "discord.js";
var DiscordClient = class {
  client;
  ready;
  constructor(token) {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages
      ]
    });
    this.ready = new Promise((resolve, reject) => {
      this.client.once("ready", () => resolve());
      this.client.once("error", reject);
      this.client.login(token).catch(reject);
    });
  }
  async getClient() {
    await this.ready;
    return this.client;
  }
  async getGuild(guildId) {
    const client = await this.getClient();
    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) {
      throw new MCPDiscordError("GUILD_NOT_FOUND", `Guild ${guildId} not found or bot lacks access.`, false);
    }
    return guild;
  }
  async destroy() {
    await this.client.destroy();
  }
};

// src/ratelimit.ts
var delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var RateLimiter = class {
  globalQueue = Promise.resolve();
  guildQueues = /* @__PURE__ */ new Map();
  async run(options, fn) {
    const minDelay = options.scope === "guild" ? 500 : 20;
    const queuePromise = options.scope === "guild" && options.guildId ? this.guildQueues.get(options.guildId) || Promise.resolve() : this.globalQueue;
    const execute = async () => {
      let retries = 0;
      while (retries < 3) {
        try {
          return await fn();
        } catch (error) {
          if (error?.status === 429 || error?.code === 429) {
            retries++;
            const retryAfter = error?.retryAfter || Math.pow(2, retries) * 1e3;
            await delay(retryAfter);
            continue;
          }
          throw error;
        }
      }
      throw new Error("Rate limit exceeded after 3 retries");
    };
    const nextPromise = queuePromise.then(async () => {
      const res = await execute();
      await delay(minDelay);
      return res;
    }).catch(async (err) => {
      await delay(minDelay);
      throw err;
    });
    if (options.scope === "guild" && options.guildId) {
      this.guildQueues.set(options.guildId, nextPromise.then(() => {
      }).catch(() => {
      }));
    } else {
      this.globalQueue = nextPromise.then(() => {
      }).catch(() => {
      });
    }
    return nextPromise;
  }
};

// src/tools/index.ts
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// src/tools/guilds.ts
import { zodToJsonSchema } from "zod-to-json-schema";

// src/schemas/guild.ts
import { z } from "zod";
var GetGuildInput = z.object({
  guildId: z.string()
});
var UpdateGuildSettingsInput = z.object({
  guildId: z.string(),
  settings: z.object({
    name: z.string().min(2).max(100).optional(),
    verificationLevel: z.number().int().min(0).max(4).optional(),
    defaultNotifications: z.number().int().min(0).max(1).optional(),
    contentFilter: z.number().int().min(0).max(2).optional(),
    systemChannelId: z.string().optional().nullable(),
    rulesChannelId: z.string().optional().nullable(),
    publicUpdatesChannelId: z.string().optional().nullable()
  })
});
var SnapshotGuildInput = z.object({
  guildId: z.string(),
  label: z.string().optional()
});
var RestoreSnapshotInput = z.object({
  snapshotId: z.string(),
  dryRun: z.boolean().optional()
});
var DiffSnapshotInput = z.object({
  snapshotId: z.string()
});
var ListSnapshotsInput = z.object({
  guildId: z.string()
});
var RecommendBotsInput = z.object({
  guildContext: z.object({
    type: z.string(),
    vibe: z.array(z.string()),
    features: z.array(z.string())
  })
});
var GenerateBotInviteUrlInput = z.object({
  botId: z.string(),
  guildId: z.string(),
  additionalPermissions: z.array(z.string()).optional()
});
var CreateTicketPanelInput = z.object({
  guildId: z.string(),
  parentCategoryName: z.string().optional(),
  supportRoleName: z.string().optional()
});
var CreateVerificationGateInput = z.object({
  guildId: z.string()
});
var CreateWelcomeFlowInput = z.object({
  guildId: z.string(),
  welcomeMessage: z.string(),
  rulesText: z.string().optional()
});
var CreateSelfAssignableRolesInput = z.object({
  guildId: z.string(),
  categoryName: z.string(),
  roles: z.array(z.object({
    name: z.string(),
    color: z.string().optional(),
    emoji: z.string().optional()
  }))
});

// src/tools/guilds.ts
function registerGuildTools(registry) {
  registry.register({
    name: "list_user_guilds",
    description: "List guilds the bot is in",
    inputSchema: { type: "object", properties: {} }
  }, async (args, discordClient, limiter) => {
    const client = await discordClient.getClient();
    return client.guilds.cache.map((g) => ({
      id: g.id,
      name: g.name,
      memberCount: g.memberCount,
      ownerId: g.ownerId
    }));
  });
  registry.register({
    name: "get_guild",
    description: "Get full guild structure",
    inputSchema: zodToJsonSchema(GetGuildInput)
  }, async (args, discordClient, limiter) => {
    const { guildId } = args;
    const guild = await discordClient.getGuild(guildId);
    return {
      id: guild.id,
      name: guild.name,
      verificationLevel: guild.verificationLevel,
      defaultNotifications: guild.defaultMessageNotifications,
      contentFilter: guild.explicitContentFilter,
      categories: guild.channels.cache.filter((c) => c.type === 4).map((c) => ({ id: c.id, name: c.name, position: c.position })),
      channels: guild.channels.cache.filter((c) => c.type !== 4).map((c) => ({ id: c.id, name: c.name, type: c.type, parentId: c.parentId, position: "position" in c ? c.position : 0 })),
      roles: guild.roles.cache.map((r) => ({ id: r.id, name: r.name, position: r.position })),
      memberCount: guild.memberCount
    };
  });
  registry.register({
    name: "update_guild_settings",
    description: "Update guild settings",
    inputSchema: zodToJsonSchema(UpdateGuildSettingsInput)
  }, async (args, discordClient, limiter) => {
    const { guildId, settings } = args;
    const guild = await discordClient.getGuild(guildId);
    const updated = await limiter.run({ scope: "guild", guildId }, () => guild.edit(settings));
    return { id: updated.id, name: updated.name };
  });
}

// src/tools/channels.ts
import { zodToJsonSchema as zodToJsonSchema2 } from "zod-to-json-schema";
import { ChannelType } from "discord.js";

// src/schemas/channel.ts
import { z as z2 } from "zod";
var ChannelTypeSchema = z2.enum(["text", "voice", "category", "announcement", "forum", "stage"]);
var CreateTextChannelInput = z2.object({
  guildId: z2.string(),
  name: z2.string().min(1).max(100),
  categoryId: z2.string().optional(),
  topic: z2.string().max(1024).optional(),
  slowmodeSeconds: z2.number().int().min(0).max(21600).optional(),
  nsfw: z2.boolean().optional(),
  position: z2.number().int().optional()
});
var CreateVoiceChannelInput = z2.object({
  guildId: z2.string(),
  name: z2.string().min(1).max(100),
  categoryId: z2.string().optional(),
  userLimit: z2.number().int().min(0).max(99).optional(),
  bitrate: z2.number().int().min(8e3).max(384e3).optional(),
  position: z2.number().int().optional()
});
var CreateCategoryInput = z2.object({
  guildId: z2.string(),
  name: z2.string().min(1).max(100),
  position: z2.number().int().optional()
});
var CreateForumChannelInput = z2.object({
  guildId: z2.string(),
  name: z2.string().min(1).max(100),
  categoryId: z2.string().optional(),
  tags: z2.array(z2.string()).optional(),
  position: z2.number().int().optional()
});
var CreateStageChannelInput = z2.object({
  guildId: z2.string(),
  name: z2.string().min(1).max(100),
  categoryId: z2.string().optional(),
  position: z2.number().int().optional()
});
var CreateAnnouncementChannelInput = z2.object({
  guildId: z2.string(),
  name: z2.string().min(1).max(100),
  categoryId: z2.string().optional(),
  position: z2.number().int().optional()
});
var UpdateChannelInput = z2.object({
  channelId: z2.string(),
  partial: z2.object({
    name: z2.string().min(1).max(100).optional(),
    topic: z2.string().max(1024).optional().nullable(),
    slowmodeSeconds: z2.number().int().min(0).max(21600).optional(),
    nsfw: z2.boolean().optional(),
    position: z2.number().int().optional(),
    categoryId: z2.string().optional().nullable()
  })
});
var DeleteChannelInput = z2.object({
  channelId: z2.string(),
  reason: z2.string().optional()
});
var MoveChannelInput = z2.object({
  channelId: z2.string(),
  position: z2.number().int(),
  categoryId: z2.string().optional().nullable()
});
var ListChannelsInput = z2.object({
  guildId: z2.string()
});

// src/tools/channels.ts
function registerChannelTools(registry) {
  registry.register({
    name: "create_category",
    description: "Create a channel category",
    inputSchema: zodToJsonSchema2(CreateCategoryInput)
  }, async (args, discordClient, limiter) => {
    const { guildId, name, position } = args;
    const guild = await discordClient.getGuild(guildId);
    const channel = await limiter.run(
      { scope: "guild", guildId },
      () => guild.channels.create({ name, type: ChannelType.GuildCategory, position })
    );
    return { id: channel.id, name: channel.name };
  });
  registry.register({
    name: "create_text_channel",
    description: "Create a text channel",
    inputSchema: zodToJsonSchema2(CreateTextChannelInput)
  }, async (args, discordClient, limiter) => {
    const { guildId, name, categoryId, topic, slowmodeSeconds, nsfw, position } = args;
    const guild = await discordClient.getGuild(guildId);
    const channel = await limiter.run(
      { scope: "guild", guildId },
      () => guild.channels.create({ name, type: ChannelType.GuildText, parent: categoryId, topic, rateLimitPerUser: slowmodeSeconds, nsfw, position })
    );
    return { id: channel.id, name: channel.name };
  });
  registry.register({
    name: "create_voice_channel",
    description: "Create a voice channel",
    inputSchema: zodToJsonSchema2(CreateVoiceChannelInput)
  }, async (args, discordClient, limiter) => {
    const { guildId, name, categoryId, userLimit, bitrate, position } = args;
    const guild = await discordClient.getGuild(guildId);
    const channel = await limiter.run(
      { scope: "guild", guildId },
      () => guild.channels.create({ name, type: ChannelType.GuildVoice, parent: categoryId, userLimit, bitrate, position })
    );
    return { id: channel.id, name: channel.name };
  });
  registry.register({
    name: "create_forum_channel",
    description: "Create a forum channel",
    inputSchema: zodToJsonSchema2(CreateForumChannelInput)
  }, async (args, discordClient, limiter) => {
    const { guildId, name, categoryId, tags, position } = args;
    const guild = await discordClient.getGuild(guildId);
    const channel = await limiter.run(
      { scope: "guild", guildId },
      () => guild.channels.create({
        name,
        type: ChannelType.GuildForum,
        parent: categoryId,
        availableTags: tags ? tags.map((t) => ({ name: t })) : [],
        position
      })
    );
    return { id: channel.id, name: channel.name };
  });
  registry.register({
    name: "create_stage_channel",
    description: "Create a stage channel",
    inputSchema: zodToJsonSchema2(CreateStageChannelInput)
  }, async (args, discordClient, limiter) => {
    const { guildId, name, categoryId, position } = args;
    const guild = await discordClient.getGuild(guildId);
    const channel = await limiter.run(
      { scope: "guild", guildId },
      () => guild.channels.create({ name, type: ChannelType.GuildStageVoice, parent: categoryId, position })
    );
    return { id: channel.id, name: channel.name };
  });
  registry.register({
    name: "create_announcement_channel",
    description: "Create an announcement channel",
    inputSchema: zodToJsonSchema2(CreateAnnouncementChannelInput)
  }, async (args, discordClient, limiter) => {
    const { guildId, name, categoryId, position } = args;
    const guild = await discordClient.getGuild(guildId);
    const channel = await limiter.run(
      { scope: "guild", guildId },
      () => guild.channels.create({ name, type: ChannelType.GuildAnnouncement, parent: categoryId, position })
    );
    return { id: channel.id, name: channel.name };
  });
  registry.register({
    name: "update_channel",
    description: "Update a channel",
    inputSchema: zodToJsonSchema2(UpdateChannelInput)
  }, async (args, discordClient, limiter) => {
    const { channelId, partial } = args;
    const client = await discordClient.getClient();
    const channel = await client.channels.fetch(channelId);
    if (!channel || !("edit" in channel)) throw new Error("Channel not found or uneditable");
    const updated = await limiter.run({ scope: "global" }, () => channel.edit({
      name: partial.name,
      topic: partial.topic,
      rateLimitPerUser: partial.slowmodeSeconds,
      nsfw: partial.nsfw,
      position: partial.position,
      parent: partial.categoryId
    }));
    return { id: updated.id, name: updated.name };
  });
  registry.register({
    name: "delete_channel",
    description: "Delete a channel",
    inputSchema: zodToJsonSchema2(DeleteChannelInput)
  }, async (args, discordClient, limiter) => {
    const { channelId, reason } = args;
    const client = await discordClient.getClient();
    const channel = await client.channels.fetch(channelId);
    if (!channel) throw new Error("Channel not found");
    await limiter.run({ scope: "global" }, () => channel.delete(reason));
    return { id: channelId, deleted: true };
  });
  registry.register({
    name: "move_channel",
    description: "Move a channel",
    inputSchema: zodToJsonSchema2(MoveChannelInput)
  }, async (args, discordClient, limiter) => {
    const { channelId, position, categoryId } = args;
    const client = await discordClient.getClient();
    const channel = await client.channels.fetch(channelId);
    if (!channel || !("setPosition" in channel)) throw new Error("Channel not found or unmovable");
    if (categoryId !== void 0 && "setParent" in channel) {
      await limiter.run({ scope: "global" }, () => channel.setParent(categoryId));
    }
    await limiter.run({ scope: "global" }, () => channel.setPosition(position));
    return { id: channel.id };
  });
  registry.register({
    name: "list_channels",
    description: "List all channels in guild",
    inputSchema: zodToJsonSchema2(ListChannelsInput)
  }, async (args, discordClient, limiter) => {
    const { guildId } = args;
    const guild = await discordClient.getGuild(guildId);
    return guild.channels.cache.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      parentId: c.parentId,
      position: "position" in c ? c.position : 0
    }));
  });
}

// src/tools/roles.ts
import { zodToJsonSchema as zodToJsonSchema3 } from "zod-to-json-schema";

// src/schemas/role.ts
import { z as z4 } from "zod";

// src/schemas/permission.ts
import { z as z3 } from "zod";
var PermissionFlagsSchema = z3.enum([
  "VIEW_CHANNEL",
  "SEND_MESSAGES",
  "MANAGE_MESSAGES",
  "READ_MESSAGE_HISTORY",
  "CONNECT",
  "SPEAK",
  "MUTE_MEMBERS",
  "MANAGE_CHANNELS",
  "MANAGE_ROLES",
  "MANAGE_GUILD",
  "KICK_MEMBERS",
  "BAN_MEMBERS",
  "MENTION_EVERYONE",
  "USE_APPLICATION_COMMANDS",
  "EMBED_LINKS",
  "ATTACH_FILES",
  "ADD_REACTIONS",
  "CREATE_PUBLIC_THREADS",
  "SEND_MESSAGES_IN_THREADS",
  "USE_VOICE_ACTIVITY"
]);
var PermissionOverwriteSchema = z3.object({
  id: z3.string(),
  type: z3.enum(["role", "member"]),
  allow: z3.array(PermissionFlagsSchema),
  deny: z3.array(PermissionFlagsSchema)
});
var SetChannelPermissionsInput = z3.object({
  channelId: z3.string(),
  overwrites: z3.array(PermissionOverwriteSchema)
});
var AddChannelPermissionOverwriteInput = z3.object({
  channelId: z3.string(),
  overwrite: PermissionOverwriteSchema
});
var RemoveChannelPermissionOverwriteInput = z3.object({
  channelId: z3.string(),
  targetId: z3.string()
});

// src/schemas/role.ts
var CreateRoleInput = z4.object({
  guildId: z4.string(),
  name: z4.string().min(1).max(100),
  color: z4.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  hoist: z4.boolean().optional(),
  mentionable: z4.boolean().optional(),
  permissions: z4.array(PermissionFlagsSchema).optional(),
  position: z4.number().int().optional()
});
var UpdateRoleInput = z4.object({
  roleId: z4.string(),
  partial: z4.object({
    name: z4.string().min(1).max(100).optional(),
    color: z4.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
    hoist: z4.boolean().optional(),
    mentionable: z4.boolean().optional(),
    permissions: z4.array(PermissionFlagsSchema).optional(),
    position: z4.number().int().optional()
  })
});
var DeleteRoleInput = z4.object({
  roleId: z4.string(),
  reason: z4.string().optional()
});
var ReorderRolesInput = z4.object({
  guildId: z4.string(),
  orderedRoleIds: z4.array(z4.string())
});
var AssignRoleToMemberInput = z4.object({
  guildId: z4.string(),
  memberId: z4.string(),
  roleId: z4.string()
});
var ListRolesInput = z4.object({
  guildId: z4.string()
});

// src/tools/roles.ts
function registerRoleTools(registry) {
  registry.register({
    name: "create_role",
    description: "Create a role",
    inputSchema: zodToJsonSchema3(CreateRoleInput)
  }, async (args, discordClient, limiter) => {
    const { guildId, name, color, hoist, mentionable, permissions, position } = args;
    const guild = await discordClient.getGuild(guildId);
    const client = await discordClient.getClient();
    const botMember = await guild.members.fetch(client.user.id);
    const botHighest = botMember.roles.highest.position;
    if (position !== void 0 && position >= botHighest) {
      throw new MCPDiscordError("BOT_HIERARCHY_INSUFFICIENT", `Cannot create role at position ${position}. Bot highest role is at ${botHighest}.`);
    }
    const role = await limiter.run(
      { scope: "guild", guildId },
      () => guild.roles.create({ name, color, hoist, mentionable, permissions, position })
    );
    return { id: role.id, name: role.name };
  });
  registry.register({
    name: "update_role",
    description: "Update a role",
    inputSchema: zodToJsonSchema3(UpdateRoleInput)
  }, async (args, discordClient, limiter) => {
    const { roleId, partial } = args;
    const client = await discordClient.getClient();
    for (const guild of client.guilds.cache.values()) {
      if (guild.roles.cache.has(roleId)) {
        const botMember = await guild.members.fetch(client.user.id);
        const botHighest = botMember.roles.highest.position;
        const role = guild.roles.cache.get(roleId);
        if (role.position >= botHighest) {
          throw new MCPDiscordError("BOT_HIERARCHY_INSUFFICIENT", `Cannot edit role ${role.name}. It is higher or equal to bot's highest role.`);
        }
        const updated = await limiter.run({ scope: "guild", guildId: guild.id }, () => role.edit(partial));
        return { id: updated.id, name: updated.name };
      }
    }
    throw new Error("Role not found");
  });
  registry.register({
    name: "delete_role",
    description: "Delete a role",
    inputSchema: zodToJsonSchema3(DeleteRoleInput)
  }, async (args, discordClient, limiter) => {
    const { roleId, reason } = args;
    const client = await discordClient.getClient();
    for (const guild of client.guilds.cache.values()) {
      if (guild.roles.cache.has(roleId)) {
        const botMember = await guild.members.fetch(client.user.id);
        const role = guild.roles.cache.get(roleId);
        if (role.position >= botMember.roles.highest.position) {
          throw new MCPDiscordError("BOT_HIERARCHY_INSUFFICIENT", `Cannot delete role ${role.name}. It is higher or equal to bot's highest role.`);
        }
        await limiter.run({ scope: "guild", guildId: guild.id }, () => role.delete(reason));
        return { id: roleId, deleted: true };
      }
    }
    throw new Error("Role not found");
  });
  registry.register({
    name: "reorder_roles",
    description: "Reorder roles",
    inputSchema: zodToJsonSchema3(ReorderRolesInput)
  }, async (args, discordClient, limiter) => {
    const { guildId, orderedRoleIds } = args;
    const guild = await discordClient.getGuild(guildId);
    const positions = orderedRoleIds.map((id, index) => ({ role: id, position: index + 1 }));
    await limiter.run({ scope: "guild", guildId }, () => guild.roles.setPositions(positions));
    return { ok: true };
  });
  registry.register({
    name: "assign_role_to_member",
    description: "Assign role to member",
    inputSchema: zodToJsonSchema3(AssignRoleToMemberInput)
  }, async (args, discordClient, limiter) => {
    const { guildId, memberId, roleId } = args;
    const guild = await discordClient.getGuild(guildId);
    const member = await guild.members.fetch(memberId);
    await limiter.run({ scope: "guild", guildId }, () => member.roles.add(roleId));
    return { ok: true };
  });
  registry.register({
    name: "list_roles",
    description: "List roles in guild",
    inputSchema: zodToJsonSchema3(ListRolesInput)
  }, async (args, discordClient, limiter) => {
    const { guildId } = args;
    const guild = await discordClient.getGuild(guildId);
    return guild.roles.cache.map((r) => ({
      id: r.id,
      name: r.name,
      position: r.position,
      color: r.hexColor,
      permissions: r.permissions.bitfield.toString()
    }));
  });
}

// src/tools/permissions.ts
import { zodToJsonSchema as zodToJsonSchema4 } from "zod-to-json-schema";
import { OverwriteType } from "discord.js";
function registerPermissionTools(registry) {
  registry.register({
    name: "set_channel_permissions",
    description: "Set channel permissions atomically",
    inputSchema: zodToJsonSchema4(SetChannelPermissionsInput)
  }, async (args, discordClient, limiter) => {
    const { channelId, overwrites } = args;
    const client = await discordClient.getClient();
    const channel = await client.channels.fetch(channelId);
    if (!channel || !("permissionOverwrites" in channel)) throw new Error("Channel not found or uneditable");
    const formatted = overwrites.map((o) => ({
      id: o.id,
      type: o.type === "role" ? OverwriteType.Role : OverwriteType.Member,
      allow: o.allow,
      deny: o.deny
    }));
    await limiter.run({ scope: "global" }, () => channel.permissionOverwrites.set(formatted));
    return { ok: true };
  });
  registry.register({
    name: "add_channel_permission_overwrite",
    description: "Add permission overwrite to channel",
    inputSchema: zodToJsonSchema4(AddChannelPermissionOverwriteInput)
  }, async (args, discordClient, limiter) => {
    const { channelId, overwrite } = args;
    const client = await discordClient.getClient();
    const channel = await client.channels.fetch(channelId);
    if (!channel || !("permissionOverwrites" in channel)) throw new Error("Channel not found or uneditable");
    await limiter.run({ scope: "global" }, () => channel.permissionOverwrites.edit(overwrite.id, {
      ...Object.fromEntries(overwrite.allow.map((p) => [p, true])),
      ...Object.fromEntries(overwrite.deny.map((p) => [p, false]))
    }, { type: overwrite.type === "role" ? OverwriteType.Role : OverwriteType.Member }));
    return { ok: true };
  });
  registry.register({
    name: "remove_channel_permission_overwrite",
    description: "Remove permission overwrite from channel",
    inputSchema: zodToJsonSchema4(RemoveChannelPermissionOverwriteInput)
  }, async (args, discordClient, limiter) => {
    const { channelId, targetId } = args;
    const client = await discordClient.getClient();
    const channel = await client.channels.fetch(channelId);
    if (!channel || !("permissionOverwrites" in channel)) throw new Error("Channel not found or uneditable");
    await limiter.run({ scope: "global" }, () => channel.permissionOverwrites.delete(targetId));
    return { ok: true };
  });
}

// src/tools/snapshots.ts
import { zodToJsonSchema as zodToJsonSchema5 } from "zod-to-json-schema";

// src/snapshots/store.ts
import fs from "fs/promises";
import path from "path";
import os from "os";
var SnapshotStore = class {
  baseDir;
  constructor() {
    this.baseDir = process.env.GUILDFORGE_SNAPSHOT_DIR || path.join(os.homedir(), ".guildforge", "snapshots");
  }
  async ensureDir(guildId) {
    const dir = path.join(this.baseDir, guildId);
    await fs.mkdir(dir, { recursive: true });
    return dir;
  }
  async save(guildId, snapshotId, data, label) {
    const dir = await this.ensureDir(guildId);
    const filePath = path.join(dir, `${snapshotId}.json`);
    const payload = {
      snapshotId,
      guildId,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      label,
      data
    };
    await fs.writeFile(filePath, JSON.stringify(payload, null, 2));
    return payload;
  }
  async load(guildId, snapshotId) {
    const filePath = path.join(this.baseDir, guildId, `${snapshotId}.json`);
    try {
      const content = await fs.readFile(filePath, "utf-8");
      return JSON.parse(content);
    } catch (err) {
      if (err.code === "ENOENT") return null;
      throw err;
    }
  }
  async list(guildId) {
    try {
      const dir = await this.ensureDir(guildId);
      const files = await fs.readdir(dir);
      const snapshots = [];
      for (const file of files) {
        if (file.endsWith(".json")) {
          const content = await fs.readFile(path.join(dir, file), "utf-8");
          const parsed = JSON.parse(content);
          snapshots.push({
            snapshotId: parsed.snapshotId,
            createdAt: parsed.createdAt,
            label: parsed.label
          });
        }
      }
      return snapshots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      if (err.code === "ENOENT") return [];
      throw err;
    }
  }
};

// src/tools/snapshots.ts
import { randomUUID } from "crypto";
function registerSnapshotTools(registry) {
  const store = new SnapshotStore();
  registry.register({
    name: "snapshot_guild",
    description: "Take snapshot of guild structure",
    inputSchema: zodToJsonSchema5(SnapshotGuildInput)
  }, async (args, discordClient, limiter) => {
    const { guildId, label } = args;
    const guild = await discordClient.getGuild(guildId);
    const data = {
      id: guild.id,
      name: guild.name,
      verificationLevel: guild.verificationLevel,
      defaultNotifications: guild.defaultMessageNotifications,
      contentFilter: guild.explicitContentFilter,
      channels: guild.channels.cache.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        parentId: c.parentId,
        position: "position" in c ? c.position : 0,
        permissionOverwrites: "permissionOverwrites" in c ? Array.from(c.permissionOverwrites.cache.values()).map((o) => ({
          id: o.id,
          type: o.type,
          allow: o.allow.bitfield.toString(),
          deny: o.deny.bitfield.toString()
        })) : []
      })),
      roles: guild.roles.cache.map((r) => ({
        id: r.id,
        name: r.name,
        color: r.hexColor,
        hoist: r.hoist,
        position: r.position,
        permissions: r.permissions.bitfield.toString(),
        mentionable: r.mentionable
      }))
    };
    const snapshotId = randomUUID();
    await store.save(guildId, snapshotId, data, label);
    return { snapshotId, label };
  });
  registry.register({
    name: "list_snapshots",
    description: "List snapshots",
    inputSchema: zodToJsonSchema5(ListSnapshotsInput)
  }, async (args, discordClient, limiter) => {
    const { guildId } = args;
    return store.list(guildId);
  });
  registry.register({
    name: "diff_snapshot_vs_current",
    description: "Diff snapshot against current state",
    inputSchema: zodToJsonSchema5(DiffSnapshotInput)
  }, async (args, discordClient, limiter) => {
    return { message: "Diffing not fully implemented yet." };
  });
  registry.register({
    name: "restore_snapshot",
    description: "Restore a snapshot",
    inputSchema: zodToJsonSchema5(RestoreSnapshotInput)
  }, async (args, discordClient, limiter) => {
    const { snapshotId, dryRun } = args;
    throw new Error("Restore logic is complex and needs more implementation");
  });
}

// src/tools/bots.ts
import { zodToJsonSchema as zodToJsonSchema6 } from "zod-to-json-schema";
var BOT_CATALOG = [
  { id: "carl-bot", clientId: "235148962103951360", category: ["moderation", "automation"], why: "Advanced logging, automod, and reaction roles." },
  { id: "mee6", clientId: "159985870458322944", category: ["leveling", "moderation"], why: "Easy to use leveling system and basic moderation." },
  { id: "dyno", clientId: "161660517914509312", category: ["moderation", "automod"], why: "Powerful web dashboard for server management." },
  { id: "ticket-tool", clientId: "557628352828014614", category: ["tickets"], why: "Industry standard for private support threads." },
  { id: "sesh", clientId: "616754792965865495", category: ["events"], why: "Advanced timezone-aware event scheduling." },
  { id: "statbot", clientId: "491769129318088714", category: ["analytics"], why: "Deep server analytics and activity tracking." },
  { id: "yagpdb", clientId: "204255221017214977", category: ["multipurpose"], why: "Highly customizable automated responses and feeds." },
  { id: "rythm", clientId: "235088799074484224", category: ["music"], why: "High quality music playback for voice channels." },
  { id: "wick", clientId: "536991182035746816", category: ["security"], why: "Anti-nuke, anti-spam, and advanced verification." },
  { id: "arcane", clientId: "530082442967646230", category: ["leveling"], why: "Alternative leveling bot with voice activity XP." }
];
function registerBotTools(registry) {
  registry.register({
    name: "recommend_bots",
    description: "Recommend bots based on guild context",
    inputSchema: zodToJsonSchema6(RecommendBotsInput)
  }, async (args, discordClient, limiter) => {
    const { guildContext } = args;
    const { type, features } = guildContext;
    const bots = [];
    if (features.includes("tickets")) bots.push(BOT_CATALOG.find((b) => b.id === "ticket-tool"));
    if (features.includes("events")) bots.push(BOT_CATALOG.find((b) => b.id === "sesh"));
    if (features.includes("analytics")) bots.push(BOT_CATALOG.find((b) => b.id === "statbot"));
    if (features.includes("leveling")) bots.push(BOT_CATALOG.find((b) => b.id === "arcane") || BOT_CATALOG.find((b) => b.id === "mee6"));
    if (!bots.find((b) => b?.category.includes("moderation"))) {
      bots.push(BOT_CATALOG.find((b) => b.id === "carl-bot"));
    }
    return { bots: bots.filter(Boolean).map((b) => ({ id: b.id, name: b.id, why: b.why, clientId: b.clientId })) };
  });
  registry.register({
    name: "generate_bot_invite_url",
    description: "Generate OAuth invite URL for a bot",
    inputSchema: zodToJsonSchema6(GenerateBotInviteUrlInput)
  }, async (args, discordClient, limiter) => {
    const { botId, guildId, additionalPermissions } = args;
    const bot = BOT_CATALOG.find((b) => b.id === botId);
    if (!bot) throw new Error("Unknown bot ID");
    const permissions = 8;
    const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${bot.clientId}&permissions=${permissions}&scope=bot%20applications.commands&guild_id=${guildId}&disable_guild_select=true`;
    return { inviteUrl, requiredPermissionsExplained: "Administrator permission is requested for maximum functionality. Adjust before accepting if desired." };
  });
}

// src/tools/templates.ts
import { zodToJsonSchema as zodToJsonSchema7 } from "zod-to-json-schema";
import { ChannelType as ChannelType2 } from "discord.js";
function registerTemplateTools(registry) {
  registry.register({
    name: "create_ticket_panel",
    description: "Create a support ticket system",
    inputSchema: zodToJsonSchema7(CreateTicketPanelInput)
  }, async (args, discordClient, limiter) => {
    const { guildId, parentCategoryName = "Support", supportRoleName = "Support Team" } = args;
    const guild = await discordClient.getGuild(guildId);
    const category = await limiter.run(
      { scope: "guild", guildId },
      () => guild.channels.create({ name: parentCategoryName, type: ChannelType2.GuildCategory })
    );
    const supportRole = await limiter.run(
      { scope: "guild", guildId },
      () => guild.roles.create({ name: supportRoleName, color: "#5865F2", mentionable: true })
    );
    const ticketChannel = await limiter.run(
      { scope: "guild", guildId },
      () => guild.channels.create({
        name: "tickets",
        type: ChannelType2.GuildText,
        parent: category.id,
        permissionOverwrites: [
          { id: guild.roles.everyone.id, allow: ["ViewChannel", "SendMessages"] },
          { id: supportRole.id, allow: ["ViewChannel", "SendMessages", "ManageMessages"] }
        ]
      })
    );
    return {
      ticketCategoryId: category.id,
      supportChannelId: ticketChannel.id,
      supportRoleId: supportRole.id,
      instructionsForUser: "Invite Ticket Tool bot via the generated invite link, then run /setup in the #tickets channel."
    };
  });
  registry.register({
    name: "create_verification_gate",
    description: "Create a verification gate",
    inputSchema: zodToJsonSchema7(CreateVerificationGateInput)
  }, async (args, discordClient, limiter) => {
    const { guildId } = args;
    const guild = await discordClient.getGuild(guildId);
    const unverifiedRole = await limiter.run(
      { scope: "guild", guildId },
      () => guild.roles.create({ name: "Unverified" })
    );
    const verifiedRole = await limiter.run(
      { scope: "guild", guildId },
      () => guild.roles.create({ name: "Verified" })
    );
    const verificationChannel = await limiter.run(
      { scope: "guild", guildId },
      () => guild.channels.create({
        name: "verification",
        type: ChannelType2.GuildText,
        permissionOverwrites: [
          { id: guild.roles.everyone.id, deny: ["ViewChannel"] },
          { id: unverifiedRole.id, allow: ["ViewChannel", "ReadMessageHistory"], deny: ["SendMessages"] }
        ]
      })
    );
    await limiter.run({ scope: "guild", guildId }, () => guild.edit({ verificationLevel: 2 }));
    return {
      unverifiedRoleId: unverifiedRole.id,
      verifiedRoleId: verifiedRole.id,
      verificationChannelId: verificationChannel.id,
      instructionsForUser: "Add Carl-bot or Wick to manage the verification reaction/captcha in the verification channel."
    };
  });
  registry.register({
    name: "create_welcome_flow",
    description: "Create welcome flow",
    inputSchema: zodToJsonSchema7(CreateWelcomeFlowInput)
  }, async (args, discordClient, limiter) => {
    return { instructionsForUser: "Use a bot like Carl-bot to post welcome messages." };
  });
  registry.register({
    name: "create_self_assignable_roles",
    description: "Create reaction roles",
    inputSchema: zodToJsonSchema7(CreateSelfAssignableRolesInput)
  }, async (args, discordClient, limiter) => {
    return { instructionsForUser: "Use a bot like Carl-bot to create the reaction role message." };
  });
}

// src/tools/index.ts
var ToolRegistry = class {
  tools = [];
  handlers = {};
  register(tool, handler) {
    this.tools.push(tool);
    this.handlers[tool.name] = handler;
  }
};
function registerAllTools(server, discordClient, limiter) {
  const registry = new ToolRegistry();
  registerGuildTools(registry);
  registerChannelTools(registry);
  registerRoleTools(registry);
  registerPermissionTools(registry);
  registerSnapshotTools(registry);
  registerBotTools(registry);
  registerTemplateTools(registry);
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: registry.tools
  }));
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const name = request.params.name;
    const args = request.params.arguments || {};
    const handler = registry.handlers[name];
    if (!handler) {
      throw new Error(`Tool not found: ${name}`);
    }
    try {
      const data = await handler(args, discordClient, limiter);
      return {
        content: [{ type: "text", text: JSON.stringify({ ok: true, data }) }],
        isError: false
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            ok: false,
            error: {
              code: error.code || "UNKNOWN",
              message: error.message || String(error),
              recoverable: error.recoverable || false
            }
          })
        }],
        isError: true
      };
    }
  });
}

export {
  MCPDiscordError,
  DiscordClient,
  RateLimiter,
  ToolRegistry,
  registerAllTools
};

import { ToolRegistry } from "./index.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ChannelType } from "discord.js";
import {
  CreateTextChannelInput, CreateVoiceChannelInput, CreateCategoryInput,
  CreateForumChannelInput, CreateStageChannelInput, CreateAnnouncementChannelInput,
  UpdateChannelInput, DeleteChannelInput, MoveChannelInput, ListChannelsInput
} from "../schemas/channel.js";

export function registerChannelTools(registry: ToolRegistry) {
  registry.register({
    name: "create_category",
    description: "Create a channel category",
    inputSchema: zodToJsonSchema(CreateCategoryInput) as any
  }, async (args, discordClient, limiter) => {
    const { guildId, name, position } = args as any;
    const guild = await discordClient.getGuild(guildId);
    const channel = await limiter.run({ scope: "guild", guildId }, () =>
      guild.channels.create({ name, type: ChannelType.GuildCategory, position })
    );
    return { id: channel.id, name: channel.name };
  });

  registry.register({
    name: "create_text_channel",
    description: "Create a text channel",
    inputSchema: zodToJsonSchema(CreateTextChannelInput) as any
  }, async (args, discordClient, limiter) => {
    const { guildId, name, categoryId, topic, slowmodeSeconds, nsfw, position } = args as any;
    const guild = await discordClient.getGuild(guildId);
    const channel = await limiter.run({ scope: "guild", guildId }, () =>
      guild.channels.create({ name, type: ChannelType.GuildText, parent: categoryId, topic, rateLimitPerUser: slowmodeSeconds, nsfw, position })
    );
    return { id: channel.id, name: channel.name };
  });

  registry.register({
    name: "create_voice_channel",
    description: "Create a voice channel",
    inputSchema: zodToJsonSchema(CreateVoiceChannelInput) as any
  }, async (args, discordClient, limiter) => {
    const { guildId, name, categoryId, userLimit, bitrate, position } = args as any;
    const guild = await discordClient.getGuild(guildId);
    const channel = await limiter.run({ scope: "guild", guildId }, () =>
      guild.channels.create({ name, type: ChannelType.GuildVoice, parent: categoryId, userLimit, bitrate, position })
    );
    return { id: channel.id, name: channel.name };
  });

  registry.register({
    name: "create_forum_channel",
    description: "Create a forum channel with tags, guidelines, sort order, and layout configuration",
    inputSchema: zodToJsonSchema(CreateForumChannelInput) as any
  }, async (args, discordClient, limiter) => {
    const { guildId, name, categoryId, tags, position, topic, guidelines, defaultSortOrder, layout, defaultReactionEmoji } = args as any;
    const guild = await discordClient.getGuild(guildId);

    // Build tags array — accept both string[] and {name, emoji?, moderated?}[]
    let availableTags: any[] = [];
    if (tags && Array.isArray(tags)) {
      availableTags = tags.map((t: any) => {
        if (typeof t === "string") return { name: t };
        const tag: any = { name: t.name };
        if (t.emoji) {
          // If emoji is a unicode char (2 chars max), use name. Otherwise treat as custom emoji ID.
          tag.emoji = t.emoji.length <= 2 ? { name: t.emoji } : { id: t.emoji };
        }
        if (t.moderated !== undefined) tag.moderated = t.moderated;
        return tag;
      });
    }

    const sortOrderMap: Record<string, number> = { latest_activity: 0, creation_date: 1 };
    const layoutMap: Record<string, number> = { list: 0, gallery: 1 };

    const createOpts: any = {
      name,
      type: ChannelType.GuildForum,
      parent: categoryId,
      availableTags,
      position,
    };

    if (topic || guidelines) createOpts.topic = guidelines || topic;
    if (defaultSortOrder && sortOrderMap[defaultSortOrder] !== undefined) {
      createOpts.defaultSortOrder = sortOrderMap[defaultSortOrder];
    }
    if (layout && layoutMap[layout] !== undefined) {
      createOpts.defaultForumLayout = layoutMap[layout];
    }
    if (defaultReactionEmoji) {
      createOpts.defaultReactionEmoji = defaultReactionEmoji.length <= 2
        ? { name: defaultReactionEmoji } : { id: defaultReactionEmoji };
    }

    const channel = await limiter.run({ scope: "guild", guildId }, () =>
      guild.channels.create(createOpts)
    );
    return { id: channel.id, name: channel.name, tagCount: availableTags.length };
  });

  registry.register({
    name: "create_stage_channel",
    description: "Create a stage channel",
    inputSchema: zodToJsonSchema(CreateStageChannelInput) as any
  }, async (args, discordClient, limiter) => {
    const { guildId, name, categoryId, position } = args as any;
    const guild = await discordClient.getGuild(guildId);
    const channel = await limiter.run({ scope: "guild", guildId }, () =>
      guild.channels.create({ name, type: ChannelType.GuildStageVoice, parent: categoryId, position })
    );
    return { id: channel.id, name: channel.name };
  });

  registry.register({
    name: "create_announcement_channel",
    description: "Create an announcement channel",
    inputSchema: zodToJsonSchema(CreateAnnouncementChannelInput) as any
  }, async (args, discordClient, limiter) => {
    const { guildId, name, categoryId, position } = args as any;
    const guild = await discordClient.getGuild(guildId);
    const channel = await limiter.run({ scope: "guild", guildId }, () =>
      guild.channels.create({ name, type: ChannelType.GuildAnnouncement, parent: categoryId, position })
    );
    return { id: channel.id, name: channel.name };
  });

  registry.register({
    name: "update_channel",
    description: "Update a channel",
    inputSchema: zodToJsonSchema(UpdateChannelInput) as any
  }, async (args, discordClient, limiter) => {
    const { channelId, partial } = args as any;
    const client = await discordClient.getClient();
    const channel = await client.channels.fetch(channelId);
    if (!channel || !('edit' in channel)) throw new Error("Channel not found or uneditable");
    
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const updated = await limiter.run({ scope: "global" }, () => (channel as any).edit({
      name: partial.name,
      topic: partial.topic,
      rateLimitPerUser: partial.slowmodeSeconds,
      nsfw: partial.nsfw,
      position: partial.position,
      parent: partial.categoryId
    })) as any;
    return { id: updated.id, name: updated.name };
  });

  registry.register({
    name: "delete_channel",
    description: "Delete a channel",
    inputSchema: zodToJsonSchema(DeleteChannelInput) as any
  }, async (args, discordClient, limiter) => {
    const { channelId, reason } = args as any;
    const client = await discordClient.getClient();
    const channel = await client.channels.fetch(channelId);
    if (!channel) throw new Error("Channel not found");
    await limiter.run({ scope: "global" }, () => (channel.delete(reason) as any));
    return { id: channelId, deleted: true };
  });

  registry.register({
    name: "move_channel",
    description: "Move a channel",
    inputSchema: zodToJsonSchema(MoveChannelInput) as any
  }, async (args, discordClient, limiter) => {
    const { channelId, position, categoryId } = args as any;
    const client = await discordClient.getClient();
    const channel = await client.channels.fetch(channelId);
    if (!channel || !('setPosition' in channel)) throw new Error("Channel not found or unmovable");
    if (categoryId !== undefined && 'setParent' in channel) {
      await limiter.run({ scope: "global" }, () => (channel as any).setParent(categoryId));
    }
    await limiter.run({ scope: "global" }, () => (channel as any).setPosition(position));
    return { id: channel.id };
  });

  registry.register({
    name: "list_channels",
    description: "List all channels in guild",
    inputSchema: zodToJsonSchema(ListChannelsInput) as any
  }, async (args, discordClient, limiter) => {
    const { guildId } = args as any;
    const guild = await discordClient.getGuild(guildId);
    return guild.channels.cache.map(c => ({
      id: c.id,
      name: c.name,
      type: c.type,
      parentId: c.parentId,
      position: 'position' in c ? c.position : 0
    }));
  });

  // ── Forum Post Creation ──
  registry.register({
    name: "create_forum_post",
    description: "Create a new thread/post inside a forum channel with optional tag selection",
    inputSchema: {
      type: "object",
      properties: {
        channelId: { type: "string", description: "The forum channel ID" },
        name: { type: "string", description: "Thread title" },
        content: { type: "string", description: "Post body content" },
        tagName: { type: "string", description: "Optional tag name to apply" },
      },
      required: ["channelId", "name", "content"]
    }
  }, async (args, discordClient, limiter) => {
    const { channelId, name, content, tagName } = args as any;
    const client = await discordClient.getClient();
    const channel = await client.channels.fetch(channelId);
    if (!channel || channel.type !== ChannelType.GuildForum) throw new Error("Not a forum channel");

    const forumChannel = channel as any;
    let appliedTags: string[] = [];

    if (tagName) {
      const tag = forumChannel.availableTags?.find((t: any) => t.name.toLowerCase() === tagName.toLowerCase());
      if (tag) appliedTags.push(tag.id);
    }

    const thread = await limiter.run({ scope: "global" }, async (): Promise<any> =>
      forumChannel.threads.create({
        name,
        message: { content },
        appliedTags: appliedTags.length > 0 ? appliedTags : undefined,
      })
    );

    return { threadId: thread.id, name: thread.name };
  });

  // ── Server Branding ──
  registry.register({
    name: "set_guild_branding",
    description: "Set the server icon and/or banner. Accepts URLs or base64-encoded images.",
    inputSchema: {
      type: "object",
      properties: {
        guildId: { type: "string", description: "The guild ID" },
        iconUrl: { type: "string", description: "URL or base64 data URI for the server icon" },
        bannerUrl: { type: "string", description: "URL or base64 data URI for the server banner (requires boost level 2+)" },
        name: { type: "string", description: "Optionally rename the server" },
        description: { type: "string", description: "Server description (community servers only)" },
      },
      required: ["guildId"]
    }
  }, async (args, discordClient, limiter) => {
    const { guildId, iconUrl, bannerUrl, name, description } = args as any;
    const guild = await discordClient.getGuild(guildId);
    const editOpts: any = {};

    if (iconUrl) editOpts.icon = iconUrl;
    if (bannerUrl) editOpts.banner = bannerUrl;
    if (name) editOpts.name = name;
    if (description) editOpts.description = description;

    if (Object.keys(editOpts).length === 0) {
      return { changed: false };
    }

    await limiter.run({ scope: "guild", guildId }, () => guild.edit(editOpts));
    return { changed: true, fields: Object.keys(editOpts) };
  });
}

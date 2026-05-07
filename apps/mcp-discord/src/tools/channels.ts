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
    description: "Create a forum channel",
    inputSchema: zodToJsonSchema(CreateForumChannelInput) as any
  }, async (args, discordClient, limiter) => {
    const { guildId, name, categoryId, tags, position } = args as any;
    const guild = await discordClient.getGuild(guildId);
    const channel = await limiter.run({ scope: "guild", guildId }, () =>
      guild.channels.create({ 
        name, 
        type: ChannelType.GuildForum, 
        parent: categoryId, 
        availableTags: tags ? tags.map((t: string) => ({ name: t })) : [],
        position 
      })
    );
    return { id: channel.id, name: channel.name };
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
}

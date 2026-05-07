import { ToolRegistry } from "./index.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { OverwriteType } from "discord.js";
import {
  SetChannelPermissionsInput, AddChannelPermissionOverwriteInput, RemoveChannelPermissionOverwriteInput
} from "../schemas/permission.js";

export function registerPermissionTools(registry: ToolRegistry) {
  registry.register({
    name: "set_channel_permissions",
    description: "Set channel permissions atomically",
    inputSchema: zodToJsonSchema(SetChannelPermissionsInput) as any
  }, async (args, discordClient, limiter) => {
    const { channelId, overwrites } = args as any;
    const client = await discordClient.getClient();
    const channel = await client.channels.fetch(channelId);
    if (!channel || !('permissionOverwrites' in channel)) throw new Error("Channel not found or uneditable");
    
    const formatted = overwrites.map((o: any) => ({
      id: o.id,
      type: o.type === "role" ? OverwriteType.Role : OverwriteType.Member,
      allow: o.allow,
      deny: o.deny
    }));

    await limiter.run({ scope: "global" }, () => (channel as any).permissionOverwrites.set(formatted));
    return { ok: true };
  });

  registry.register({
    name: "add_channel_permission_overwrite",
    description: "Add permission overwrite to channel",
    inputSchema: zodToJsonSchema(AddChannelPermissionOverwriteInput) as any
  }, async (args, discordClient, limiter) => {
    const { channelId, overwrite } = args as any;
    const client = await discordClient.getClient();
    const channel = await client.channels.fetch(channelId);
    if (!channel || !('permissionOverwrites' in channel)) throw new Error("Channel not found or uneditable");

    await limiter.run({ scope: "global" }, () => (channel as any).permissionOverwrites.edit(overwrite.id, {
      ...Object.fromEntries(overwrite.allow.map((p: string) => [p, true])),
      ...Object.fromEntries(overwrite.deny.map((p: string) => [p, false]))
    }, { type: overwrite.type === "role" ? OverwriteType.Role : OverwriteType.Member }));
    return { ok: true };
  });

  registry.register({
    name: "remove_channel_permission_overwrite",
    description: "Remove permission overwrite from channel",
    inputSchema: zodToJsonSchema(RemoveChannelPermissionOverwriteInput) as any
  }, async (args, discordClient, limiter) => {
    const { channelId, targetId } = args as any;
    const client = await discordClient.getClient();
    const channel = await client.channels.fetch(channelId);
    if (!channel || !('permissionOverwrites' in channel)) throw new Error("Channel not found or uneditable");

    await limiter.run({ scope: "global" }, () => (channel as any).permissionOverwrites.delete(targetId));
    return { ok: true };
  });
}

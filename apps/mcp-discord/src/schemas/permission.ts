import { z } from "zod";

export const PermissionFlagsSchema = z.enum([
  "VIEW_CHANNEL", "SEND_MESSAGES", "MANAGE_MESSAGES", "READ_MESSAGE_HISTORY",
  "CONNECT", "SPEAK", "MUTE_MEMBERS", "MANAGE_CHANNELS", "MANAGE_ROLES",
  "MANAGE_GUILD", "KICK_MEMBERS", "BAN_MEMBERS", "MENTION_EVERYONE",
  "USE_APPLICATION_COMMANDS", "EMBED_LINKS", "ATTACH_FILES", "ADD_REACTIONS",
  "CREATE_PUBLIC_THREADS", "SEND_MESSAGES_IN_THREADS", "USE_VOICE_ACTIVITY"
]);

export const PermissionOverwriteSchema = z.object({
  id: z.string(),
  type: z.enum(["role", "member"]),
  allow: z.array(PermissionFlagsSchema),
  deny: z.array(PermissionFlagsSchema),
});

export const SetChannelPermissionsInput = z.object({
  channelId: z.string(),
  overwrites: z.array(PermissionOverwriteSchema)
});

export const AddChannelPermissionOverwriteInput = z.object({
  channelId: z.string(),
  overwrite: PermissionOverwriteSchema
});

export const RemoveChannelPermissionOverwriteInput = z.object({
  channelId: z.string(),
  targetId: z.string()
});

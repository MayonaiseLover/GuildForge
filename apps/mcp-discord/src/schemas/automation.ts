import { z } from "zod";

export const ConfigureAutoModInput = z.object({
  guildId: z.string(),
  rules: z.array(z.object({
    name: z.string(),
    type: z.enum(["keyword", "spam", "mention_spam", "keyword_preset"]),
    keywords: z.array(z.string()).optional(),
    regexPatterns: z.array(z.string()).optional(),
    presets: z.array(z.enum(["profanity", "sexual_content", "slurs"])).optional(),
    allowList: z.array(z.string()).optional(),
    mentionLimit: z.number().optional(),
    actions: z.array(z.enum(["block", "alert", "timeout"])),
    alertChannelId: z.string().optional(),
    timeoutDurationSeconds: z.number().optional(),
    enabled: z.boolean().optional()
  }))
});

export const SetupWelcomeScreenInput = z.object({
  guildId: z.string(),
  description: z.string(),
  channels: z.array(z.object({
    channelId: z.string(),
    description: z.string(),
    emoji: z.string().optional()
  }))
});

export const ConfigureServerInput = z.object({
  guildId: z.string(),
  verificationLevel: z.number().int().min(0).max(4).optional(),
  explicitContentFilter: z.number().int().min(0).max(2).optional(),
  defaultMessageNotifications: z.number().int().min(0).max(1).optional(),
  systemChannelId: z.string().optional(),
  systemChannelFlags: z.number().optional()
});

export const CreateWebhookInput = z.object({
  channelId: z.string(),
  name: z.string(),
  reason: z.string().optional()
});

export const SendEmbedInput = z.object({
  channelId: z.string(),
  embeds: z.array(z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    color: z.number().optional(),
    fields: z.array(z.object({
      name: z.string(),
      value: z.string(),
      inline: z.boolean().optional()
    })).optional(),
    footer: z.object({ text: z.string() }).optional(),
    thumbnail: z.object({ url: z.string() }).optional(),
    image: z.object({ url: z.string() }).optional()
  })),
  content: z.string().optional()
});

export const PostBotInvitePanelInput = z.object({
  channelId: z.string(),
  guildId: z.string(),
  botIds: z.array(z.string()),
  title: z.string().optional()
});

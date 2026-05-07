import { z } from "zod";

export const ChannelTypeSchema = z.enum(["text", "voice", "category", "announcement", "forum", "stage"]);

export const CreateTextChannelInput = z.object({
  guildId: z.string(),
  name: z.string().min(1).max(100),
  categoryId: z.string().optional(),
  topic: z.string().max(1024).optional(),
  slowmodeSeconds: z.number().int().min(0).max(21600).optional(),
  nsfw: z.boolean().optional(),
  position: z.number().int().optional(),
});

export const CreateVoiceChannelInput = z.object({
  guildId: z.string(),
  name: z.string().min(1).max(100),
  categoryId: z.string().optional(),
  userLimit: z.number().int().min(0).max(99).optional(),
  bitrate: z.number().int().min(8000).max(384000).optional(),
  position: z.number().int().optional(),
});

export const CreateCategoryInput = z.object({
  guildId: z.string(),
  name: z.string().min(1).max(100),
  position: z.number().int().optional(),
});

export const CreateForumChannelInput = z.object({
  guildId: z.string(),
  name: z.string().min(1).max(100),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  position: z.number().int().optional(),
});

export const CreateStageChannelInput = z.object({
  guildId: z.string(),
  name: z.string().min(1).max(100),
  categoryId: z.string().optional(),
  position: z.number().int().optional(),
});

export const CreateAnnouncementChannelInput = z.object({
  guildId: z.string(),
  name: z.string().min(1).max(100),
  categoryId: z.string().optional(),
  position: z.number().int().optional(),
});

export const UpdateChannelInput = z.object({
  channelId: z.string(),
  partial: z.object({
    name: z.string().min(1).max(100).optional(),
    topic: z.string().max(1024).optional().nullable(),
    slowmodeSeconds: z.number().int().min(0).max(21600).optional(),
    nsfw: z.boolean().optional(),
    position: z.number().int().optional(),
    categoryId: z.string().optional().nullable(),
  })
});

export const DeleteChannelInput = z.object({
  channelId: z.string(),
  reason: z.string().optional()
});

export const MoveChannelInput = z.object({
  channelId: z.string(),
  position: z.number().int(),
  categoryId: z.string().optional().nullable()
});

export const ListChannelsInput = z.object({
  guildId: z.string()
});

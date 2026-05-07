import { z } from "zod";

export const GetGuildInput = z.object({
  guildId: z.string()
});

export const UpdateGuildSettingsInput = z.object({
  guildId: z.string(),
  settings: z.object({
    name: z.string().min(2).max(100).optional(),
    verificationLevel: z.number().int().min(0).max(4).optional(),
    defaultNotifications: z.number().int().min(0).max(1).optional(),
    contentFilter: z.number().int().min(0).max(2).optional(),
    systemChannelId: z.string().optional().nullable(),
    rulesChannelId: z.string().optional().nullable(),
    publicUpdatesChannelId: z.string().optional().nullable(),
  })
});

export const SnapshotGuildInput = z.object({
  guildId: z.string(),
  label: z.string().optional()
});

export const RestoreSnapshotInput = z.object({
  snapshotId: z.string(),
  dryRun: z.boolean().optional()
});

export const DiffSnapshotInput = z.object({
  snapshotId: z.string()
});

export const ListSnapshotsInput = z.object({
  guildId: z.string()
});

export const RecommendBotsInput = z.object({
  guildContext: z.object({
    type: z.string(),
    vibe: z.array(z.string()),
    features: z.array(z.string())
  })
});

export const GenerateBotInviteUrlInput = z.object({
  botId: z.string(),
  guildId: z.string(),
  additionalPermissions: z.array(z.string()).optional()
});

export const CreateTicketPanelInput = z.object({
  guildId: z.string(),
  parentCategoryName: z.string().optional(),
  supportRoleName: z.string().optional()
});

export const CreateVerificationGateInput = z.object({
  guildId: z.string()
});

export const CreateWelcomeFlowInput = z.object({
  guildId: z.string(),
  welcomeMessage: z.string(),
  rulesText: z.string().optional()
});

export const CreateSelfAssignableRolesInput = z.object({
  guildId: z.string(),
  categoryName: z.string(),
  roles: z.array(z.object({
    name: z.string(),
    color: z.string().optional(),
    emoji: z.string().optional()
  }))
});

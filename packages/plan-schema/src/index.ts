import { z } from "zod";

export const BuildBriefSchema = z.object({
  purpose: z.string().optional(),
  size: z.string().optional(),
  growth: z.string().optional(),
  audienceAge: z.string().optional(),
  audienceRegion: z.string().optional(),
  audienceLanguage: z.string().optional(),
  vibeChips: z.array(z.string()).optional(),
  coreNeeds: z.array(z.string()).optional(),
  topics: z.string().optional(),
  roles: z.string().optional(),
  brandColor: z.string().optional(),
  brandTone: z.string().optional(),
  serverName: z.string().optional(),
});
export type BuildBrief = z.infer<typeof BuildBriefSchema>;

export function briefToPrompt(brief: BuildBrief): string {
  const parts: string[] = [];
  if (brief.purpose) parts.push(`Build a Discord server for: ${brief.purpose}.`);
  const sizeStr = [brief.size, brief.growth].filter(Boolean).join(", ");
  if (sizeStr) parts.push(`Expected size: ${sizeStr}.`);
  const audienceStr = [brief.audienceAge, brief.audienceLanguage, brief.audienceRegion].filter(Boolean).join(", ");
  if (audienceStr) parts.push(`Audience: ${audienceStr}.`);
  if (brief.vibeChips && brief.vibeChips.length > 0) parts.push(`Vibe: ${brief.vibeChips.join(", ")}.`);
  if (brief.coreNeeds && brief.coreNeeds.length > 0) parts.push(`Core needs: ${brief.coreNeeds.join(", ")}.`);
  if (brief.topics) parts.push(`Specific topics requested: ${brief.topics}.`);
  if (brief.roles) parts.push(`Specific roles requested: ${brief.roles}.`);
  const brandStr = [
    brief.brandColor ? `primary color ${brief.brandColor}` : null,
    brief.brandTone ? `${brief.brandTone} tone` : null
  ].filter(Boolean).join(", ");
  if (brandStr) parts.push(`Branding: ${brandStr}.`);
  if (brief.serverName) parts.push(`Server name: '${brief.serverName}'.`);
  return parts.join(" ");
}

export const BuildPlanSchema = z.object({
  version: z.literal(1),
  serverName: z.string(),
  description: z.string(),
  brand: z.object({
    primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    tone: z.enum(["formal", "friendly", "playful", "edgy", "hype"]),
  }),
  serverSettings: z.object({
    verificationLevel: z.enum(["none", "low", "medium", "high", "very_high"]),
    defaultNotifications: z.enum(["all", "mentions"]),
    contentFilter: z.enum(["disabled", "no_role", "all"]),
  }),
  roles: z.array(z.object({
    key: z.string(),               // stable identifier inside the plan, NOT a discord id
    name: z.string(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    hoist: z.boolean(),
    mentionable: z.boolean(),
    permissions: z.array(z.string()),
    purpose: z.string(),           // human-readable rationale
  })),
  categories: z.array(z.object({
    key: z.string(),
    name: z.string(),
    permissionOverwrites: z.array(z.object({
      roleKey: z.string(),
      allow: z.array(z.string()),
      deny: z.array(z.string()),
    })),
    channels: z.array(z.object({
      key: z.string(),
      name: z.string(),
      type: z.enum(["text", "voice", "announcement", "forum", "stage"]),
      topic: z.string().optional(),
      slowmodeSeconds: z.number().int().optional(),
      nsfw: z.boolean().optional(),
      userLimit: z.number().int().optional(),
      bitrate: z.number().int().optional(),
      permissionOverwrites: z.array(z.object({
        roleKey: z.string(),
        allow: z.array(z.string()),
        deny: z.array(z.string()),
      })).optional(),
      purpose: z.string(),
    })),
  })),
  bots: z.array(z.object({
    botId: z.string(),
    why: z.string(),
    setupSteps: z.array(z.string()),
  })),
  postBuildActions: z.array(z.object({
    type: z.enum(["welcome_message", "rules_post", "ticket_panel", "verification_gate", "self_role_message"]),
    params: z.record(z.unknown()),
  })),
});

export type BuildPlan = z.infer<typeof BuildPlanSchema>;

export const PlanChangeSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("delete_channel"), channelKey: z.string() }),
  z.object({ kind: z.literal("add_channel"), category: z.string(), channel: BuildPlanSchema.shape.categories.element.shape.channels.element }),
  z.object({ kind: z.literal("modify_channel"), channelKey: z.string(), changes: z.record(z.unknown()) }),
  z.object({ kind: z.literal("delete_role"), roleKey: z.string() }),
  z.object({ kind: z.literal("add_role"), role: BuildPlanSchema.shape.roles.element }),
  z.object({ kind: z.literal("modify_role"), roleKey: z.string(), changes: z.record(z.unknown()) }),
  z.object({ kind: z.literal("delete_category"), categoryKey: z.string() }),
  z.object({ kind: z.literal("add_category"), category: BuildPlanSchema.shape.categories.element }),
  z.object({ kind: z.literal("modify_server_settings"), changes: z.record(z.unknown()) }),
  z.object({ kind: z.literal("add_post_build_action"), action: BuildPlanSchema.shape.postBuildActions.element }),
  z.object({ kind: z.literal("full_rebuild"), plan: BuildPlanSchema })
]);

export type PlanChange = z.infer<typeof PlanChangeSchema>;


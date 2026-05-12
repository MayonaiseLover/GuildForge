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
export function briefToPrompt(brief) {
    const parts = [];
    if (brief.purpose)
        parts.push(`Build a Discord server for: ${brief.purpose}.`);
    const sizeStr = [brief.size, brief.growth].filter(Boolean).join(", ");
    if (sizeStr)
        parts.push(`Expected size: ${sizeStr}.`);
    const audienceStr = [brief.audienceAge, brief.audienceLanguage, brief.audienceRegion].filter(Boolean).join(", ");
    if (audienceStr)
        parts.push(`Audience: ${audienceStr}.`);
    if (brief.vibeChips && brief.vibeChips.length > 0)
        parts.push(`Vibe: ${brief.vibeChips.join(", ")}.`);
    if (brief.coreNeeds && brief.coreNeeds.length > 0)
        parts.push(`Core needs: ${brief.coreNeeds.join(", ")}.`);
    if (brief.topics)
        parts.push(`Specific topics requested: ${brief.topics}.`);
    if (brief.roles)
        parts.push(`Specific roles requested: ${brief.roles}.`);
    const brandStr = [
        brief.brandColor ? `primary color ${brief.brandColor}` : null,
        brief.brandTone ? `${brief.brandTone} tone` : null
    ].filter(Boolean).join(", ");
    if (brandStr)
        parts.push(`Branding: ${brandStr}.`);
    if (brief.serverName)
        parts.push(`Server name: '${brief.serverName}'.`);
    return parts.join(" ");
}
// ── Forum Tag Schema ──
export const ForumTagSchema = z.object({
    name: z.string(),
    emoji: z.string().optional(),
    moderated: z.boolean().optional(),
});
// ── Forum Configuration ──
export const ForumConfigSchema = z.object({
    tags: z.array(ForumTagSchema).optional(),
    guidelines: z.string().optional(),
    defaultSortOrder: z.enum(["latest_activity", "creation_date"]).optional(),
    layout: z.enum(["list", "gallery"]).optional(),
    defaultReactionEmoji: z.string().optional(),
    autoArchiveDuration: z.number().int().optional(),
});
// ── Embed Schema ──
export const EmbedContentSchema = z.object({
    targetChannelKey: z.string(),
    title: z.string(),
    description: z.string(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    footer: z.string().optional(),
    reactions: z.array(z.string()).optional(),
});
// ── AutoMod Rule Schema ──
export const AutoModRuleSchema = z.object({
    name: z.string(),
    type: z.enum(["keyword", "spam", "mention_spam", "keyword_preset"]),
    keywords: z.array(z.string()).optional(),
    regexPatterns: z.array(z.string()).optional(),
    presets: z.array(z.enum(["profanity", "sexual_content", "slurs"])).optional(),
    mentionLimit: z.number().int().optional(),
    actions: z.array(z.enum(["block", "alert", "timeout"])),
    alertChannelKey: z.string().optional(),
    timeoutDurationSeconds: z.number().int().optional(),
    enabled: z.boolean().optional(),
});
// ── Webhook Schema ──
export const WebhookSchema = z.object({
    name: z.string(),
    targetChannelKey: z.string(),
    purpose: z.string(),
});
// ── Forum Seed Post Schema ──
export const ForumSeedPostSchema = z.object({
    forumChannelKey: z.string(),
    title: z.string(),
    content: z.string(),
    tagName: z.string().optional(),
});
// ── Branding Schema ──
export const BrandingSchema = z.object({
    primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    tone: z.enum(["formal", "friendly", "playful", "edgy", "hype"]),
    iconUrl: z.string().url().optional(),
    bannerUrl: z.string().url().optional(),
});
// ── Channel Schema (expanded with forum support) ──
export const ChannelSchema = z.object({
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
    forumConfig: ForumConfigSchema.optional(),
});
// ── Category Schema ──
export const CategorySchema = z.object({
    key: z.string(),
    name: z.string(),
    permissionOverwrites: z.array(z.object({
        roleKey: z.string(),
        allow: z.array(z.string()),
        deny: z.array(z.string()),
    })),
    channels: z.array(ChannelSchema),
});
// ── Role Schema ──
export const RoleSchema = z.object({
    key: z.string(),
    name: z.string(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    hoist: z.boolean(),
    mentionable: z.boolean(),
    permissions: z.array(z.string()),
    purpose: z.string(),
});
// ── Post Build Action Schema ──
export const PostBuildActionSchema = z.object({
    type: z.enum([
        "welcome_message", "welcome_banner", "rules_post", "ticket_panel",
        "verification_gate", "self_role_message", "bot_invite_panel",
        "announcement_post",
    ]),
    params: z.record(z.unknown()),
});
// ── Main BuildPlan Schema ──
export const BuildPlanSchema = z.object({
    version: z.literal(1),
    serverName: z.string(),
    description: z.string(),
    brand: BrandingSchema,
    serverSettings: z.object({
        verificationLevel: z.enum(["none", "low", "medium", "high", "very_high"]),
        defaultNotifications: z.enum(["all", "mentions"]),
        contentFilter: z.enum(["disabled", "no_role", "all"]),
    }),
    roles: z.array(RoleSchema),
    categories: z.array(CategorySchema),
    bots: z.array(z.object({
        botId: z.string(),
        why: z.string(),
        setupSteps: z.array(z.string()),
    })),
    postBuildActions: z.array(PostBuildActionSchema),
    // ── New enterprise features ──
    autoModRules: z.array(AutoModRuleSchema).optional(),
    webhooks: z.array(WebhookSchema).optional(),
    embeds: z.array(EmbedContentSchema).optional(),
    forumSeedPosts: z.array(ForumSeedPostSchema).optional(),
});
export const PlanChangeSchema = z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("delete_channel"), channelKey: z.string() }),
    z.object({ kind: z.literal("add_channel"), category: z.string(), channel: ChannelSchema }),
    z.object({ kind: z.literal("modify_channel"), channelKey: z.string(), changes: z.record(z.unknown()) }),
    z.object({ kind: z.literal("delete_role"), roleKey: z.string() }),
    z.object({ kind: z.literal("add_role"), role: RoleSchema }),
    z.object({ kind: z.literal("modify_role"), roleKey: z.string(), changes: z.record(z.unknown()) }),
    z.object({ kind: z.literal("delete_category"), categoryKey: z.string() }),
    z.object({ kind: z.literal("add_category"), category: CategorySchema }),
    z.object({ kind: z.literal("modify_server_settings"), changes: z.record(z.unknown()) }),
    z.object({ kind: z.literal("add_post_build_action"), action: PostBuildActionSchema }),
    z.object({ kind: z.literal("add_automod_rule"), rule: AutoModRuleSchema }),
    z.object({ kind: z.literal("add_webhook"), webhook: WebhookSchema }),
    z.object({ kind: z.literal("add_embed"), embed: EmbedContentSchema }),
    z.object({ kind: z.literal("add_forum_seed"), seed: ForumSeedPostSchema }),
    z.object({ kind: z.literal("full_rebuild"), plan: z.lazy(() => BuildPlanSchema) }),
]);

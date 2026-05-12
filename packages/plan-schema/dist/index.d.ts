import { z } from "zod";
export declare const BuildBriefSchema: z.ZodObject<{
    purpose: z.ZodOptional<z.ZodString>;
    size: z.ZodOptional<z.ZodString>;
    growth: z.ZodOptional<z.ZodString>;
    audienceAge: z.ZodOptional<z.ZodString>;
    audienceRegion: z.ZodOptional<z.ZodString>;
    audienceLanguage: z.ZodOptional<z.ZodString>;
    vibeChips: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    coreNeeds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    topics: z.ZodOptional<z.ZodString>;
    roles: z.ZodOptional<z.ZodString>;
    brandColor: z.ZodOptional<z.ZodString>;
    brandTone: z.ZodOptional<z.ZodString>;
    serverName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    purpose?: string | undefined;
    size?: string | undefined;
    growth?: string | undefined;
    audienceAge?: string | undefined;
    audienceRegion?: string | undefined;
    audienceLanguage?: string | undefined;
    vibeChips?: string[] | undefined;
    coreNeeds?: string[] | undefined;
    topics?: string | undefined;
    roles?: string | undefined;
    brandColor?: string | undefined;
    brandTone?: string | undefined;
    serverName?: string | undefined;
}, {
    purpose?: string | undefined;
    size?: string | undefined;
    growth?: string | undefined;
    audienceAge?: string | undefined;
    audienceRegion?: string | undefined;
    audienceLanguage?: string | undefined;
    vibeChips?: string[] | undefined;
    coreNeeds?: string[] | undefined;
    topics?: string | undefined;
    roles?: string | undefined;
    brandColor?: string | undefined;
    brandTone?: string | undefined;
    serverName?: string | undefined;
}>;
export type BuildBrief = z.infer<typeof BuildBriefSchema>;
export declare function briefToPrompt(brief: BuildBrief): string;
export declare const ForumTagSchema: z.ZodObject<{
    name: z.ZodString;
    emoji: z.ZodOptional<z.ZodString>;
    moderated: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    emoji?: string | undefined;
    moderated?: boolean | undefined;
}, {
    name: string;
    emoji?: string | undefined;
    moderated?: boolean | undefined;
}>;
export declare const ForumConfigSchema: z.ZodObject<{
    tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        emoji: z.ZodOptional<z.ZodString>;
        moderated: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        emoji?: string | undefined;
        moderated?: boolean | undefined;
    }, {
        name: string;
        emoji?: string | undefined;
        moderated?: boolean | undefined;
    }>, "many">>;
    guidelines: z.ZodOptional<z.ZodString>;
    defaultSortOrder: z.ZodOptional<z.ZodEnum<["latest_activity", "creation_date"]>>;
    layout: z.ZodOptional<z.ZodEnum<["list", "gallery"]>>;
    defaultReactionEmoji: z.ZodOptional<z.ZodString>;
    autoArchiveDuration: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    tags?: {
        name: string;
        emoji?: string | undefined;
        moderated?: boolean | undefined;
    }[] | undefined;
    guidelines?: string | undefined;
    defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
    layout?: "list" | "gallery" | undefined;
    defaultReactionEmoji?: string | undefined;
    autoArchiveDuration?: number | undefined;
}, {
    tags?: {
        name: string;
        emoji?: string | undefined;
        moderated?: boolean | undefined;
    }[] | undefined;
    guidelines?: string | undefined;
    defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
    layout?: "list" | "gallery" | undefined;
    defaultReactionEmoji?: string | undefined;
    autoArchiveDuration?: number | undefined;
}>;
export declare const EmbedContentSchema: z.ZodObject<{
    targetChannelKey: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    color: z.ZodOptional<z.ZodString>;
    footer: z.ZodOptional<z.ZodString>;
    reactions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    targetChannelKey: string;
    title: string;
    description: string;
    color?: string | undefined;
    footer?: string | undefined;
    reactions?: string[] | undefined;
}, {
    targetChannelKey: string;
    title: string;
    description: string;
    color?: string | undefined;
    footer?: string | undefined;
    reactions?: string[] | undefined;
}>;
export declare const AutoModRuleSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<["keyword", "spam", "mention_spam", "keyword_preset"]>;
    keywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    regexPatterns: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    presets: z.ZodOptional<z.ZodArray<z.ZodEnum<["profanity", "sexual_content", "slurs"]>, "many">>;
    mentionLimit: z.ZodOptional<z.ZodNumber>;
    actions: z.ZodArray<z.ZodEnum<["block", "alert", "timeout"]>, "many">;
    alertChannelKey: z.ZodOptional<z.ZodString>;
    timeoutDurationSeconds: z.ZodOptional<z.ZodNumber>;
    enabled: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "keyword" | "spam" | "mention_spam" | "keyword_preset";
    name: string;
    actions: ("block" | "alert" | "timeout")[];
    keywords?: string[] | undefined;
    regexPatterns?: string[] | undefined;
    presets?: ("profanity" | "sexual_content" | "slurs")[] | undefined;
    mentionLimit?: number | undefined;
    alertChannelKey?: string | undefined;
    timeoutDurationSeconds?: number | undefined;
    enabled?: boolean | undefined;
}, {
    type: "keyword" | "spam" | "mention_spam" | "keyword_preset";
    name: string;
    actions: ("block" | "alert" | "timeout")[];
    keywords?: string[] | undefined;
    regexPatterns?: string[] | undefined;
    presets?: ("profanity" | "sexual_content" | "slurs")[] | undefined;
    mentionLimit?: number | undefined;
    alertChannelKey?: string | undefined;
    timeoutDurationSeconds?: number | undefined;
    enabled?: boolean | undefined;
}>;
export declare const WebhookSchema: z.ZodObject<{
    name: z.ZodString;
    targetChannelKey: z.ZodString;
    purpose: z.ZodString;
}, "strip", z.ZodTypeAny, {
    purpose: string;
    name: string;
    targetChannelKey: string;
}, {
    purpose: string;
    name: string;
    targetChannelKey: string;
}>;
export declare const ForumSeedPostSchema: z.ZodObject<{
    forumChannelKey: z.ZodString;
    title: z.ZodString;
    content: z.ZodString;
    tagName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    forumChannelKey: string;
    content: string;
    tagName?: string | undefined;
}, {
    title: string;
    forumChannelKey: string;
    content: string;
    tagName?: string | undefined;
}>;
export declare const BrandingSchema: z.ZodObject<{
    primaryColor: z.ZodString;
    tone: z.ZodEnum<["formal", "friendly", "playful", "edgy", "hype"]>;
    iconUrl: z.ZodOptional<z.ZodString>;
    bannerUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    primaryColor: string;
    tone: "formal" | "friendly" | "playful" | "edgy" | "hype";
    iconUrl?: string | undefined;
    bannerUrl?: string | undefined;
}, {
    primaryColor: string;
    tone: "formal" | "friendly" | "playful" | "edgy" | "hype";
    iconUrl?: string | undefined;
    bannerUrl?: string | undefined;
}>;
export declare const ChannelSchema: z.ZodObject<{
    key: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<["text", "voice", "announcement", "forum", "stage"]>;
    topic: z.ZodOptional<z.ZodString>;
    slowmodeSeconds: z.ZodOptional<z.ZodNumber>;
    nsfw: z.ZodOptional<z.ZodBoolean>;
    userLimit: z.ZodOptional<z.ZodNumber>;
    bitrate: z.ZodOptional<z.ZodNumber>;
    permissionOverwrites: z.ZodOptional<z.ZodArray<z.ZodObject<{
        roleKey: z.ZodString;
        allow: z.ZodArray<z.ZodString, "many">;
        deny: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        roleKey: string;
        allow: string[];
        deny: string[];
    }, {
        roleKey: string;
        allow: string[];
        deny: string[];
    }>, "many">>;
    purpose: z.ZodString;
    forumConfig: z.ZodOptional<z.ZodObject<{
        tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            emoji: z.ZodOptional<z.ZodString>;
            moderated: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            emoji?: string | undefined;
            moderated?: boolean | undefined;
        }, {
            name: string;
            emoji?: string | undefined;
            moderated?: boolean | undefined;
        }>, "many">>;
        guidelines: z.ZodOptional<z.ZodString>;
        defaultSortOrder: z.ZodOptional<z.ZodEnum<["latest_activity", "creation_date"]>>;
        layout: z.ZodOptional<z.ZodEnum<["list", "gallery"]>>;
        defaultReactionEmoji: z.ZodOptional<z.ZodString>;
        autoArchiveDuration: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        tags?: {
            name: string;
            emoji?: string | undefined;
            moderated?: boolean | undefined;
        }[] | undefined;
        guidelines?: string | undefined;
        defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
        layout?: "list" | "gallery" | undefined;
        defaultReactionEmoji?: string | undefined;
        autoArchiveDuration?: number | undefined;
    }, {
        tags?: {
            name: string;
            emoji?: string | undefined;
            moderated?: boolean | undefined;
        }[] | undefined;
        guidelines?: string | undefined;
        defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
        layout?: "list" | "gallery" | undefined;
        defaultReactionEmoji?: string | undefined;
        autoArchiveDuration?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    purpose: string;
    type: "text" | "voice" | "announcement" | "forum" | "stage";
    name: string;
    key: string;
    topic?: string | undefined;
    slowmodeSeconds?: number | undefined;
    nsfw?: boolean | undefined;
    userLimit?: number | undefined;
    bitrate?: number | undefined;
    permissionOverwrites?: {
        roleKey: string;
        allow: string[];
        deny: string[];
    }[] | undefined;
    forumConfig?: {
        tags?: {
            name: string;
            emoji?: string | undefined;
            moderated?: boolean | undefined;
        }[] | undefined;
        guidelines?: string | undefined;
        defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
        layout?: "list" | "gallery" | undefined;
        defaultReactionEmoji?: string | undefined;
        autoArchiveDuration?: number | undefined;
    } | undefined;
}, {
    purpose: string;
    type: "text" | "voice" | "announcement" | "forum" | "stage";
    name: string;
    key: string;
    topic?: string | undefined;
    slowmodeSeconds?: number | undefined;
    nsfw?: boolean | undefined;
    userLimit?: number | undefined;
    bitrate?: number | undefined;
    permissionOverwrites?: {
        roleKey: string;
        allow: string[];
        deny: string[];
    }[] | undefined;
    forumConfig?: {
        tags?: {
            name: string;
            emoji?: string | undefined;
            moderated?: boolean | undefined;
        }[] | undefined;
        guidelines?: string | undefined;
        defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
        layout?: "list" | "gallery" | undefined;
        defaultReactionEmoji?: string | undefined;
        autoArchiveDuration?: number | undefined;
    } | undefined;
}>;
export declare const CategorySchema: z.ZodObject<{
    key: z.ZodString;
    name: z.ZodString;
    permissionOverwrites: z.ZodArray<z.ZodObject<{
        roleKey: z.ZodString;
        allow: z.ZodArray<z.ZodString, "many">;
        deny: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        roleKey: string;
        allow: string[];
        deny: string[];
    }, {
        roleKey: string;
        allow: string[];
        deny: string[];
    }>, "many">;
    channels: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        name: z.ZodString;
        type: z.ZodEnum<["text", "voice", "announcement", "forum", "stage"]>;
        topic: z.ZodOptional<z.ZodString>;
        slowmodeSeconds: z.ZodOptional<z.ZodNumber>;
        nsfw: z.ZodOptional<z.ZodBoolean>;
        userLimit: z.ZodOptional<z.ZodNumber>;
        bitrate: z.ZodOptional<z.ZodNumber>;
        permissionOverwrites: z.ZodOptional<z.ZodArray<z.ZodObject<{
            roleKey: z.ZodString;
            allow: z.ZodArray<z.ZodString, "many">;
            deny: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            roleKey: string;
            allow: string[];
            deny: string[];
        }, {
            roleKey: string;
            allow: string[];
            deny: string[];
        }>, "many">>;
        purpose: z.ZodString;
        forumConfig: z.ZodOptional<z.ZodObject<{
            tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                emoji: z.ZodOptional<z.ZodString>;
                moderated: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                emoji?: string | undefined;
                moderated?: boolean | undefined;
            }, {
                name: string;
                emoji?: string | undefined;
                moderated?: boolean | undefined;
            }>, "many">>;
            guidelines: z.ZodOptional<z.ZodString>;
            defaultSortOrder: z.ZodOptional<z.ZodEnum<["latest_activity", "creation_date"]>>;
            layout: z.ZodOptional<z.ZodEnum<["list", "gallery"]>>;
            defaultReactionEmoji: z.ZodOptional<z.ZodString>;
            autoArchiveDuration: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            tags?: {
                name: string;
                emoji?: string | undefined;
                moderated?: boolean | undefined;
            }[] | undefined;
            guidelines?: string | undefined;
            defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
            layout?: "list" | "gallery" | undefined;
            defaultReactionEmoji?: string | undefined;
            autoArchiveDuration?: number | undefined;
        }, {
            tags?: {
                name: string;
                emoji?: string | undefined;
                moderated?: boolean | undefined;
            }[] | undefined;
            guidelines?: string | undefined;
            defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
            layout?: "list" | "gallery" | undefined;
            defaultReactionEmoji?: string | undefined;
            autoArchiveDuration?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        purpose: string;
        type: "text" | "voice" | "announcement" | "forum" | "stage";
        name: string;
        key: string;
        topic?: string | undefined;
        slowmodeSeconds?: number | undefined;
        nsfw?: boolean | undefined;
        userLimit?: number | undefined;
        bitrate?: number | undefined;
        permissionOverwrites?: {
            roleKey: string;
            allow: string[];
            deny: string[];
        }[] | undefined;
        forumConfig?: {
            tags?: {
                name: string;
                emoji?: string | undefined;
                moderated?: boolean | undefined;
            }[] | undefined;
            guidelines?: string | undefined;
            defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
            layout?: "list" | "gallery" | undefined;
            defaultReactionEmoji?: string | undefined;
            autoArchiveDuration?: number | undefined;
        } | undefined;
    }, {
        purpose: string;
        type: "text" | "voice" | "announcement" | "forum" | "stage";
        name: string;
        key: string;
        topic?: string | undefined;
        slowmodeSeconds?: number | undefined;
        nsfw?: boolean | undefined;
        userLimit?: number | undefined;
        bitrate?: number | undefined;
        permissionOverwrites?: {
            roleKey: string;
            allow: string[];
            deny: string[];
        }[] | undefined;
        forumConfig?: {
            tags?: {
                name: string;
                emoji?: string | undefined;
                moderated?: boolean | undefined;
            }[] | undefined;
            guidelines?: string | undefined;
            defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
            layout?: "list" | "gallery" | undefined;
            defaultReactionEmoji?: string | undefined;
            autoArchiveDuration?: number | undefined;
        } | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    name: string;
    key: string;
    permissionOverwrites: {
        roleKey: string;
        allow: string[];
        deny: string[];
    }[];
    channels: {
        purpose: string;
        type: "text" | "voice" | "announcement" | "forum" | "stage";
        name: string;
        key: string;
        topic?: string | undefined;
        slowmodeSeconds?: number | undefined;
        nsfw?: boolean | undefined;
        userLimit?: number | undefined;
        bitrate?: number | undefined;
        permissionOverwrites?: {
            roleKey: string;
            allow: string[];
            deny: string[];
        }[] | undefined;
        forumConfig?: {
            tags?: {
                name: string;
                emoji?: string | undefined;
                moderated?: boolean | undefined;
            }[] | undefined;
            guidelines?: string | undefined;
            defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
            layout?: "list" | "gallery" | undefined;
            defaultReactionEmoji?: string | undefined;
            autoArchiveDuration?: number | undefined;
        } | undefined;
    }[];
}, {
    name: string;
    key: string;
    permissionOverwrites: {
        roleKey: string;
        allow: string[];
        deny: string[];
    }[];
    channels: {
        purpose: string;
        type: "text" | "voice" | "announcement" | "forum" | "stage";
        name: string;
        key: string;
        topic?: string | undefined;
        slowmodeSeconds?: number | undefined;
        nsfw?: boolean | undefined;
        userLimit?: number | undefined;
        bitrate?: number | undefined;
        permissionOverwrites?: {
            roleKey: string;
            allow: string[];
            deny: string[];
        }[] | undefined;
        forumConfig?: {
            tags?: {
                name: string;
                emoji?: string | undefined;
                moderated?: boolean | undefined;
            }[] | undefined;
            guidelines?: string | undefined;
            defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
            layout?: "list" | "gallery" | undefined;
            defaultReactionEmoji?: string | undefined;
            autoArchiveDuration?: number | undefined;
        } | undefined;
    }[];
}>;
export declare const RoleSchema: z.ZodObject<{
    key: z.ZodString;
    name: z.ZodString;
    color: z.ZodString;
    hoist: z.ZodBoolean;
    mentionable: z.ZodBoolean;
    permissions: z.ZodArray<z.ZodString, "many">;
    purpose: z.ZodString;
}, "strip", z.ZodTypeAny, {
    purpose: string;
    name: string;
    color: string;
    key: string;
    hoist: boolean;
    mentionable: boolean;
    permissions: string[];
}, {
    purpose: string;
    name: string;
    color: string;
    key: string;
    hoist: boolean;
    mentionable: boolean;
    permissions: string[];
}>;
export declare const PostBuildActionSchema: z.ZodObject<{
    type: z.ZodEnum<["welcome_message", "welcome_banner", "rules_post", "ticket_panel", "verification_gate", "self_role_message", "bot_invite_panel", "announcement_post"]>;
    params: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    params: Record<string, unknown>;
    type: "welcome_message" | "welcome_banner" | "rules_post" | "ticket_panel" | "verification_gate" | "self_role_message" | "bot_invite_panel" | "announcement_post";
}, {
    params: Record<string, unknown>;
    type: "welcome_message" | "welcome_banner" | "rules_post" | "ticket_panel" | "verification_gate" | "self_role_message" | "bot_invite_panel" | "announcement_post";
}>;
export declare const BuildPlanSchema: z.ZodObject<{
    version: z.ZodLiteral<1>;
    serverName: z.ZodString;
    description: z.ZodString;
    brand: z.ZodObject<{
        primaryColor: z.ZodString;
        tone: z.ZodEnum<["formal", "friendly", "playful", "edgy", "hype"]>;
        iconUrl: z.ZodOptional<z.ZodString>;
        bannerUrl: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        primaryColor: string;
        tone: "formal" | "friendly" | "playful" | "edgy" | "hype";
        iconUrl?: string | undefined;
        bannerUrl?: string | undefined;
    }, {
        primaryColor: string;
        tone: "formal" | "friendly" | "playful" | "edgy" | "hype";
        iconUrl?: string | undefined;
        bannerUrl?: string | undefined;
    }>;
    serverSettings: z.ZodObject<{
        verificationLevel: z.ZodEnum<["none", "low", "medium", "high", "very_high"]>;
        defaultNotifications: z.ZodEnum<["all", "mentions"]>;
        contentFilter: z.ZodEnum<["disabled", "no_role", "all"]>;
    }, "strip", z.ZodTypeAny, {
        verificationLevel: "none" | "low" | "medium" | "high" | "very_high";
        defaultNotifications: "all" | "mentions";
        contentFilter: "all" | "disabled" | "no_role";
    }, {
        verificationLevel: "none" | "low" | "medium" | "high" | "very_high";
        defaultNotifications: "all" | "mentions";
        contentFilter: "all" | "disabled" | "no_role";
    }>;
    roles: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        name: z.ZodString;
        color: z.ZodString;
        hoist: z.ZodBoolean;
        mentionable: z.ZodBoolean;
        permissions: z.ZodArray<z.ZodString, "many">;
        purpose: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        purpose: string;
        name: string;
        color: string;
        key: string;
        hoist: boolean;
        mentionable: boolean;
        permissions: string[];
    }, {
        purpose: string;
        name: string;
        color: string;
        key: string;
        hoist: boolean;
        mentionable: boolean;
        permissions: string[];
    }>, "many">;
    categories: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        name: z.ZodString;
        permissionOverwrites: z.ZodArray<z.ZodObject<{
            roleKey: z.ZodString;
            allow: z.ZodArray<z.ZodString, "many">;
            deny: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            roleKey: string;
            allow: string[];
            deny: string[];
        }, {
            roleKey: string;
            allow: string[];
            deny: string[];
        }>, "many">;
        channels: z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            name: z.ZodString;
            type: z.ZodEnum<["text", "voice", "announcement", "forum", "stage"]>;
            topic: z.ZodOptional<z.ZodString>;
            slowmodeSeconds: z.ZodOptional<z.ZodNumber>;
            nsfw: z.ZodOptional<z.ZodBoolean>;
            userLimit: z.ZodOptional<z.ZodNumber>;
            bitrate: z.ZodOptional<z.ZodNumber>;
            permissionOverwrites: z.ZodOptional<z.ZodArray<z.ZodObject<{
                roleKey: z.ZodString;
                allow: z.ZodArray<z.ZodString, "many">;
                deny: z.ZodArray<z.ZodString, "many">;
            }, "strip", z.ZodTypeAny, {
                roleKey: string;
                allow: string[];
                deny: string[];
            }, {
                roleKey: string;
                allow: string[];
                deny: string[];
            }>, "many">>;
            purpose: z.ZodString;
            forumConfig: z.ZodOptional<z.ZodObject<{
                tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    emoji: z.ZodOptional<z.ZodString>;
                    moderated: z.ZodOptional<z.ZodBoolean>;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    emoji?: string | undefined;
                    moderated?: boolean | undefined;
                }, {
                    name: string;
                    emoji?: string | undefined;
                    moderated?: boolean | undefined;
                }>, "many">>;
                guidelines: z.ZodOptional<z.ZodString>;
                defaultSortOrder: z.ZodOptional<z.ZodEnum<["latest_activity", "creation_date"]>>;
                layout: z.ZodOptional<z.ZodEnum<["list", "gallery"]>>;
                defaultReactionEmoji: z.ZodOptional<z.ZodString>;
                autoArchiveDuration: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                tags?: {
                    name: string;
                    emoji?: string | undefined;
                    moderated?: boolean | undefined;
                }[] | undefined;
                guidelines?: string | undefined;
                defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
                layout?: "list" | "gallery" | undefined;
                defaultReactionEmoji?: string | undefined;
                autoArchiveDuration?: number | undefined;
            }, {
                tags?: {
                    name: string;
                    emoji?: string | undefined;
                    moderated?: boolean | undefined;
                }[] | undefined;
                guidelines?: string | undefined;
                defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
                layout?: "list" | "gallery" | undefined;
                defaultReactionEmoji?: string | undefined;
                autoArchiveDuration?: number | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            purpose: string;
            type: "text" | "voice" | "announcement" | "forum" | "stage";
            name: string;
            key: string;
            topic?: string | undefined;
            slowmodeSeconds?: number | undefined;
            nsfw?: boolean | undefined;
            userLimit?: number | undefined;
            bitrate?: number | undefined;
            permissionOverwrites?: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[] | undefined;
            forumConfig?: {
                tags?: {
                    name: string;
                    emoji?: string | undefined;
                    moderated?: boolean | undefined;
                }[] | undefined;
                guidelines?: string | undefined;
                defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
                layout?: "list" | "gallery" | undefined;
                defaultReactionEmoji?: string | undefined;
                autoArchiveDuration?: number | undefined;
            } | undefined;
        }, {
            purpose: string;
            type: "text" | "voice" | "announcement" | "forum" | "stage";
            name: string;
            key: string;
            topic?: string | undefined;
            slowmodeSeconds?: number | undefined;
            nsfw?: boolean | undefined;
            userLimit?: number | undefined;
            bitrate?: number | undefined;
            permissionOverwrites?: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[] | undefined;
            forumConfig?: {
                tags?: {
                    name: string;
                    emoji?: string | undefined;
                    moderated?: boolean | undefined;
                }[] | undefined;
                guidelines?: string | undefined;
                defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
                layout?: "list" | "gallery" | undefined;
                defaultReactionEmoji?: string | undefined;
                autoArchiveDuration?: number | undefined;
            } | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        name: string;
        key: string;
        permissionOverwrites: {
            roleKey: string;
            allow: string[];
            deny: string[];
        }[];
        channels: {
            purpose: string;
            type: "text" | "voice" | "announcement" | "forum" | "stage";
            name: string;
            key: string;
            topic?: string | undefined;
            slowmodeSeconds?: number | undefined;
            nsfw?: boolean | undefined;
            userLimit?: number | undefined;
            bitrate?: number | undefined;
            permissionOverwrites?: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[] | undefined;
            forumConfig?: {
                tags?: {
                    name: string;
                    emoji?: string | undefined;
                    moderated?: boolean | undefined;
                }[] | undefined;
                guidelines?: string | undefined;
                defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
                layout?: "list" | "gallery" | undefined;
                defaultReactionEmoji?: string | undefined;
                autoArchiveDuration?: number | undefined;
            } | undefined;
        }[];
    }, {
        name: string;
        key: string;
        permissionOverwrites: {
            roleKey: string;
            allow: string[];
            deny: string[];
        }[];
        channels: {
            purpose: string;
            type: "text" | "voice" | "announcement" | "forum" | "stage";
            name: string;
            key: string;
            topic?: string | undefined;
            slowmodeSeconds?: number | undefined;
            nsfw?: boolean | undefined;
            userLimit?: number | undefined;
            bitrate?: number | undefined;
            permissionOverwrites?: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[] | undefined;
            forumConfig?: {
                tags?: {
                    name: string;
                    emoji?: string | undefined;
                    moderated?: boolean | undefined;
                }[] | undefined;
                guidelines?: string | undefined;
                defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
                layout?: "list" | "gallery" | undefined;
                defaultReactionEmoji?: string | undefined;
                autoArchiveDuration?: number | undefined;
            } | undefined;
        }[];
    }>, "many">;
    bots: z.ZodArray<z.ZodObject<{
        botId: z.ZodString;
        why: z.ZodString;
        setupSteps: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        botId: string;
        why: string;
        setupSteps: string[];
    }, {
        botId: string;
        why: string;
        setupSteps: string[];
    }>, "many">;
    postBuildActions: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["welcome_message", "welcome_banner", "rules_post", "ticket_panel", "verification_gate", "self_role_message", "bot_invite_panel", "announcement_post"]>;
        params: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        params: Record<string, unknown>;
        type: "welcome_message" | "welcome_banner" | "rules_post" | "ticket_panel" | "verification_gate" | "self_role_message" | "bot_invite_panel" | "announcement_post";
    }, {
        params: Record<string, unknown>;
        type: "welcome_message" | "welcome_banner" | "rules_post" | "ticket_panel" | "verification_gate" | "self_role_message" | "bot_invite_panel" | "announcement_post";
    }>, "many">;
    autoModRules: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        type: z.ZodEnum<["keyword", "spam", "mention_spam", "keyword_preset"]>;
        keywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        regexPatterns: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        presets: z.ZodOptional<z.ZodArray<z.ZodEnum<["profanity", "sexual_content", "slurs"]>, "many">>;
        mentionLimit: z.ZodOptional<z.ZodNumber>;
        actions: z.ZodArray<z.ZodEnum<["block", "alert", "timeout"]>, "many">;
        alertChannelKey: z.ZodOptional<z.ZodString>;
        timeoutDurationSeconds: z.ZodOptional<z.ZodNumber>;
        enabled: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        type: "keyword" | "spam" | "mention_spam" | "keyword_preset";
        name: string;
        actions: ("block" | "alert" | "timeout")[];
        keywords?: string[] | undefined;
        regexPatterns?: string[] | undefined;
        presets?: ("profanity" | "sexual_content" | "slurs")[] | undefined;
        mentionLimit?: number | undefined;
        alertChannelKey?: string | undefined;
        timeoutDurationSeconds?: number | undefined;
        enabled?: boolean | undefined;
    }, {
        type: "keyword" | "spam" | "mention_spam" | "keyword_preset";
        name: string;
        actions: ("block" | "alert" | "timeout")[];
        keywords?: string[] | undefined;
        regexPatterns?: string[] | undefined;
        presets?: ("profanity" | "sexual_content" | "slurs")[] | undefined;
        mentionLimit?: number | undefined;
        alertChannelKey?: string | undefined;
        timeoutDurationSeconds?: number | undefined;
        enabled?: boolean | undefined;
    }>, "many">>;
    webhooks: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        targetChannelKey: z.ZodString;
        purpose: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        purpose: string;
        name: string;
        targetChannelKey: string;
    }, {
        purpose: string;
        name: string;
        targetChannelKey: string;
    }>, "many">>;
    embeds: z.ZodOptional<z.ZodArray<z.ZodObject<{
        targetChannelKey: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        color: z.ZodOptional<z.ZodString>;
        footer: z.ZodOptional<z.ZodString>;
        reactions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        targetChannelKey: string;
        title: string;
        description: string;
        color?: string | undefined;
        footer?: string | undefined;
        reactions?: string[] | undefined;
    }, {
        targetChannelKey: string;
        title: string;
        description: string;
        color?: string | undefined;
        footer?: string | undefined;
        reactions?: string[] | undefined;
    }>, "many">>;
    forumSeedPosts: z.ZodOptional<z.ZodArray<z.ZodObject<{
        forumChannelKey: z.ZodString;
        title: z.ZodString;
        content: z.ZodString;
        tagName: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        forumChannelKey: string;
        content: string;
        tagName?: string | undefined;
    }, {
        title: string;
        forumChannelKey: string;
        content: string;
        tagName?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    roles: {
        purpose: string;
        name: string;
        color: string;
        key: string;
        hoist: boolean;
        mentionable: boolean;
        permissions: string[];
    }[];
    serverName: string;
    description: string;
    version: 1;
    brand: {
        primaryColor: string;
        tone: "formal" | "friendly" | "playful" | "edgy" | "hype";
        iconUrl?: string | undefined;
        bannerUrl?: string | undefined;
    };
    serverSettings: {
        verificationLevel: "none" | "low" | "medium" | "high" | "very_high";
        defaultNotifications: "all" | "mentions";
        contentFilter: "all" | "disabled" | "no_role";
    };
    categories: {
        name: string;
        key: string;
        permissionOverwrites: {
            roleKey: string;
            allow: string[];
            deny: string[];
        }[];
        channels: {
            purpose: string;
            type: "text" | "voice" | "announcement" | "forum" | "stage";
            name: string;
            key: string;
            topic?: string | undefined;
            slowmodeSeconds?: number | undefined;
            nsfw?: boolean | undefined;
            userLimit?: number | undefined;
            bitrate?: number | undefined;
            permissionOverwrites?: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[] | undefined;
            forumConfig?: {
                tags?: {
                    name: string;
                    emoji?: string | undefined;
                    moderated?: boolean | undefined;
                }[] | undefined;
                guidelines?: string | undefined;
                defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
                layout?: "list" | "gallery" | undefined;
                defaultReactionEmoji?: string | undefined;
                autoArchiveDuration?: number | undefined;
            } | undefined;
        }[];
    }[];
    bots: {
        botId: string;
        why: string;
        setupSteps: string[];
    }[];
    postBuildActions: {
        params: Record<string, unknown>;
        type: "welcome_message" | "welcome_banner" | "rules_post" | "ticket_panel" | "verification_gate" | "self_role_message" | "bot_invite_panel" | "announcement_post";
    }[];
    autoModRules?: {
        type: "keyword" | "spam" | "mention_spam" | "keyword_preset";
        name: string;
        actions: ("block" | "alert" | "timeout")[];
        keywords?: string[] | undefined;
        regexPatterns?: string[] | undefined;
        presets?: ("profanity" | "sexual_content" | "slurs")[] | undefined;
        mentionLimit?: number | undefined;
        alertChannelKey?: string | undefined;
        timeoutDurationSeconds?: number | undefined;
        enabled?: boolean | undefined;
    }[] | undefined;
    webhooks?: {
        purpose: string;
        name: string;
        targetChannelKey: string;
    }[] | undefined;
    embeds?: {
        targetChannelKey: string;
        title: string;
        description: string;
        color?: string | undefined;
        footer?: string | undefined;
        reactions?: string[] | undefined;
    }[] | undefined;
    forumSeedPosts?: {
        title: string;
        forumChannelKey: string;
        content: string;
        tagName?: string | undefined;
    }[] | undefined;
}, {
    roles: {
        purpose: string;
        name: string;
        color: string;
        key: string;
        hoist: boolean;
        mentionable: boolean;
        permissions: string[];
    }[];
    serverName: string;
    description: string;
    version: 1;
    brand: {
        primaryColor: string;
        tone: "formal" | "friendly" | "playful" | "edgy" | "hype";
        iconUrl?: string | undefined;
        bannerUrl?: string | undefined;
    };
    serverSettings: {
        verificationLevel: "none" | "low" | "medium" | "high" | "very_high";
        defaultNotifications: "all" | "mentions";
        contentFilter: "all" | "disabled" | "no_role";
    };
    categories: {
        name: string;
        key: string;
        permissionOverwrites: {
            roleKey: string;
            allow: string[];
            deny: string[];
        }[];
        channels: {
            purpose: string;
            type: "text" | "voice" | "announcement" | "forum" | "stage";
            name: string;
            key: string;
            topic?: string | undefined;
            slowmodeSeconds?: number | undefined;
            nsfw?: boolean | undefined;
            userLimit?: number | undefined;
            bitrate?: number | undefined;
            permissionOverwrites?: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[] | undefined;
            forumConfig?: {
                tags?: {
                    name: string;
                    emoji?: string | undefined;
                    moderated?: boolean | undefined;
                }[] | undefined;
                guidelines?: string | undefined;
                defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
                layout?: "list" | "gallery" | undefined;
                defaultReactionEmoji?: string | undefined;
                autoArchiveDuration?: number | undefined;
            } | undefined;
        }[];
    }[];
    bots: {
        botId: string;
        why: string;
        setupSteps: string[];
    }[];
    postBuildActions: {
        params: Record<string, unknown>;
        type: "welcome_message" | "welcome_banner" | "rules_post" | "ticket_panel" | "verification_gate" | "self_role_message" | "bot_invite_panel" | "announcement_post";
    }[];
    autoModRules?: {
        type: "keyword" | "spam" | "mention_spam" | "keyword_preset";
        name: string;
        actions: ("block" | "alert" | "timeout")[];
        keywords?: string[] | undefined;
        regexPatterns?: string[] | undefined;
        presets?: ("profanity" | "sexual_content" | "slurs")[] | undefined;
        mentionLimit?: number | undefined;
        alertChannelKey?: string | undefined;
        timeoutDurationSeconds?: number | undefined;
        enabled?: boolean | undefined;
    }[] | undefined;
    webhooks?: {
        purpose: string;
        name: string;
        targetChannelKey: string;
    }[] | undefined;
    embeds?: {
        targetChannelKey: string;
        title: string;
        description: string;
        color?: string | undefined;
        footer?: string | undefined;
        reactions?: string[] | undefined;
    }[] | undefined;
    forumSeedPosts?: {
        title: string;
        forumChannelKey: string;
        content: string;
        tagName?: string | undefined;
    }[] | undefined;
}>;
export type BuildPlan = z.infer<typeof BuildPlanSchema>;
export declare const PlanChangeSchema: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
    kind: z.ZodLiteral<"delete_channel">;
    channelKey: z.ZodString;
}, "strip", z.ZodTypeAny, {
    kind: "delete_channel";
    channelKey: string;
}, {
    kind: "delete_channel";
    channelKey: string;
}>, z.ZodObject<{
    kind: z.ZodLiteral<"add_channel">;
    category: z.ZodString;
    channel: z.ZodObject<{
        key: z.ZodString;
        name: z.ZodString;
        type: z.ZodEnum<["text", "voice", "announcement", "forum", "stage"]>;
        topic: z.ZodOptional<z.ZodString>;
        slowmodeSeconds: z.ZodOptional<z.ZodNumber>;
        nsfw: z.ZodOptional<z.ZodBoolean>;
        userLimit: z.ZodOptional<z.ZodNumber>;
        bitrate: z.ZodOptional<z.ZodNumber>;
        permissionOverwrites: z.ZodOptional<z.ZodArray<z.ZodObject<{
            roleKey: z.ZodString;
            allow: z.ZodArray<z.ZodString, "many">;
            deny: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            roleKey: string;
            allow: string[];
            deny: string[];
        }, {
            roleKey: string;
            allow: string[];
            deny: string[];
        }>, "many">>;
        purpose: z.ZodString;
        forumConfig: z.ZodOptional<z.ZodObject<{
            tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                emoji: z.ZodOptional<z.ZodString>;
                moderated: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                emoji?: string | undefined;
                moderated?: boolean | undefined;
            }, {
                name: string;
                emoji?: string | undefined;
                moderated?: boolean | undefined;
            }>, "many">>;
            guidelines: z.ZodOptional<z.ZodString>;
            defaultSortOrder: z.ZodOptional<z.ZodEnum<["latest_activity", "creation_date"]>>;
            layout: z.ZodOptional<z.ZodEnum<["list", "gallery"]>>;
            defaultReactionEmoji: z.ZodOptional<z.ZodString>;
            autoArchiveDuration: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            tags?: {
                name: string;
                emoji?: string | undefined;
                moderated?: boolean | undefined;
            }[] | undefined;
            guidelines?: string | undefined;
            defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
            layout?: "list" | "gallery" | undefined;
            defaultReactionEmoji?: string | undefined;
            autoArchiveDuration?: number | undefined;
        }, {
            tags?: {
                name: string;
                emoji?: string | undefined;
                moderated?: boolean | undefined;
            }[] | undefined;
            guidelines?: string | undefined;
            defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
            layout?: "list" | "gallery" | undefined;
            defaultReactionEmoji?: string | undefined;
            autoArchiveDuration?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        purpose: string;
        type: "text" | "voice" | "announcement" | "forum" | "stage";
        name: string;
        key: string;
        topic?: string | undefined;
        slowmodeSeconds?: number | undefined;
        nsfw?: boolean | undefined;
        userLimit?: number | undefined;
        bitrate?: number | undefined;
        permissionOverwrites?: {
            roleKey: string;
            allow: string[];
            deny: string[];
        }[] | undefined;
        forumConfig?: {
            tags?: {
                name: string;
                emoji?: string | undefined;
                moderated?: boolean | undefined;
            }[] | undefined;
            guidelines?: string | undefined;
            defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
            layout?: "list" | "gallery" | undefined;
            defaultReactionEmoji?: string | undefined;
            autoArchiveDuration?: number | undefined;
        } | undefined;
    }, {
        purpose: string;
        type: "text" | "voice" | "announcement" | "forum" | "stage";
        name: string;
        key: string;
        topic?: string | undefined;
        slowmodeSeconds?: number | undefined;
        nsfw?: boolean | undefined;
        userLimit?: number | undefined;
        bitrate?: number | undefined;
        permissionOverwrites?: {
            roleKey: string;
            allow: string[];
            deny: string[];
        }[] | undefined;
        forumConfig?: {
            tags?: {
                name: string;
                emoji?: string | undefined;
                moderated?: boolean | undefined;
            }[] | undefined;
            guidelines?: string | undefined;
            defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
            layout?: "list" | "gallery" | undefined;
            defaultReactionEmoji?: string | undefined;
            autoArchiveDuration?: number | undefined;
        } | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    kind: "add_channel";
    category: string;
    channel: {
        purpose: string;
        type: "text" | "voice" | "announcement" | "forum" | "stage";
        name: string;
        key: string;
        topic?: string | undefined;
        slowmodeSeconds?: number | undefined;
        nsfw?: boolean | undefined;
        userLimit?: number | undefined;
        bitrate?: number | undefined;
        permissionOverwrites?: {
            roleKey: string;
            allow: string[];
            deny: string[];
        }[] | undefined;
        forumConfig?: {
            tags?: {
                name: string;
                emoji?: string | undefined;
                moderated?: boolean | undefined;
            }[] | undefined;
            guidelines?: string | undefined;
            defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
            layout?: "list" | "gallery" | undefined;
            defaultReactionEmoji?: string | undefined;
            autoArchiveDuration?: number | undefined;
        } | undefined;
    };
}, {
    kind: "add_channel";
    category: string;
    channel: {
        purpose: string;
        type: "text" | "voice" | "announcement" | "forum" | "stage";
        name: string;
        key: string;
        topic?: string | undefined;
        slowmodeSeconds?: number | undefined;
        nsfw?: boolean | undefined;
        userLimit?: number | undefined;
        bitrate?: number | undefined;
        permissionOverwrites?: {
            roleKey: string;
            allow: string[];
            deny: string[];
        }[] | undefined;
        forumConfig?: {
            tags?: {
                name: string;
                emoji?: string | undefined;
                moderated?: boolean | undefined;
            }[] | undefined;
            guidelines?: string | undefined;
            defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
            layout?: "list" | "gallery" | undefined;
            defaultReactionEmoji?: string | undefined;
            autoArchiveDuration?: number | undefined;
        } | undefined;
    };
}>, z.ZodObject<{
    kind: z.ZodLiteral<"modify_channel">;
    channelKey: z.ZodString;
    changes: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    kind: "modify_channel";
    channelKey: string;
    changes: Record<string, unknown>;
}, {
    kind: "modify_channel";
    channelKey: string;
    changes: Record<string, unknown>;
}>, z.ZodObject<{
    kind: z.ZodLiteral<"delete_role">;
    roleKey: z.ZodString;
}, "strip", z.ZodTypeAny, {
    roleKey: string;
    kind: "delete_role";
}, {
    roleKey: string;
    kind: "delete_role";
}>, z.ZodObject<{
    kind: z.ZodLiteral<"add_role">;
    role: z.ZodObject<{
        key: z.ZodString;
        name: z.ZodString;
        color: z.ZodString;
        hoist: z.ZodBoolean;
        mentionable: z.ZodBoolean;
        permissions: z.ZodArray<z.ZodString, "many">;
        purpose: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        purpose: string;
        name: string;
        color: string;
        key: string;
        hoist: boolean;
        mentionable: boolean;
        permissions: string[];
    }, {
        purpose: string;
        name: string;
        color: string;
        key: string;
        hoist: boolean;
        mentionable: boolean;
        permissions: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    kind: "add_role";
    role: {
        purpose: string;
        name: string;
        color: string;
        key: string;
        hoist: boolean;
        mentionable: boolean;
        permissions: string[];
    };
}, {
    kind: "add_role";
    role: {
        purpose: string;
        name: string;
        color: string;
        key: string;
        hoist: boolean;
        mentionable: boolean;
        permissions: string[];
    };
}>, z.ZodObject<{
    kind: z.ZodLiteral<"modify_role">;
    roleKey: z.ZodString;
    changes: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    roleKey: string;
    kind: "modify_role";
    changes: Record<string, unknown>;
}, {
    roleKey: string;
    kind: "modify_role";
    changes: Record<string, unknown>;
}>, z.ZodObject<{
    kind: z.ZodLiteral<"delete_category">;
    categoryKey: z.ZodString;
}, "strip", z.ZodTypeAny, {
    kind: "delete_category";
    categoryKey: string;
}, {
    kind: "delete_category";
    categoryKey: string;
}>, z.ZodObject<{
    kind: z.ZodLiteral<"add_category">;
    category: z.ZodObject<{
        key: z.ZodString;
        name: z.ZodString;
        permissionOverwrites: z.ZodArray<z.ZodObject<{
            roleKey: z.ZodString;
            allow: z.ZodArray<z.ZodString, "many">;
            deny: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            roleKey: string;
            allow: string[];
            deny: string[];
        }, {
            roleKey: string;
            allow: string[];
            deny: string[];
        }>, "many">;
        channels: z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            name: z.ZodString;
            type: z.ZodEnum<["text", "voice", "announcement", "forum", "stage"]>;
            topic: z.ZodOptional<z.ZodString>;
            slowmodeSeconds: z.ZodOptional<z.ZodNumber>;
            nsfw: z.ZodOptional<z.ZodBoolean>;
            userLimit: z.ZodOptional<z.ZodNumber>;
            bitrate: z.ZodOptional<z.ZodNumber>;
            permissionOverwrites: z.ZodOptional<z.ZodArray<z.ZodObject<{
                roleKey: z.ZodString;
                allow: z.ZodArray<z.ZodString, "many">;
                deny: z.ZodArray<z.ZodString, "many">;
            }, "strip", z.ZodTypeAny, {
                roleKey: string;
                allow: string[];
                deny: string[];
            }, {
                roleKey: string;
                allow: string[];
                deny: string[];
            }>, "many">>;
            purpose: z.ZodString;
            forumConfig: z.ZodOptional<z.ZodObject<{
                tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    emoji: z.ZodOptional<z.ZodString>;
                    moderated: z.ZodOptional<z.ZodBoolean>;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    emoji?: string | undefined;
                    moderated?: boolean | undefined;
                }, {
                    name: string;
                    emoji?: string | undefined;
                    moderated?: boolean | undefined;
                }>, "many">>;
                guidelines: z.ZodOptional<z.ZodString>;
                defaultSortOrder: z.ZodOptional<z.ZodEnum<["latest_activity", "creation_date"]>>;
                layout: z.ZodOptional<z.ZodEnum<["list", "gallery"]>>;
                defaultReactionEmoji: z.ZodOptional<z.ZodString>;
                autoArchiveDuration: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                tags?: {
                    name: string;
                    emoji?: string | undefined;
                    moderated?: boolean | undefined;
                }[] | undefined;
                guidelines?: string | undefined;
                defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
                layout?: "list" | "gallery" | undefined;
                defaultReactionEmoji?: string | undefined;
                autoArchiveDuration?: number | undefined;
            }, {
                tags?: {
                    name: string;
                    emoji?: string | undefined;
                    moderated?: boolean | undefined;
                }[] | undefined;
                guidelines?: string | undefined;
                defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
                layout?: "list" | "gallery" | undefined;
                defaultReactionEmoji?: string | undefined;
                autoArchiveDuration?: number | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            purpose: string;
            type: "text" | "voice" | "announcement" | "forum" | "stage";
            name: string;
            key: string;
            topic?: string | undefined;
            slowmodeSeconds?: number | undefined;
            nsfw?: boolean | undefined;
            userLimit?: number | undefined;
            bitrate?: number | undefined;
            permissionOverwrites?: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[] | undefined;
            forumConfig?: {
                tags?: {
                    name: string;
                    emoji?: string | undefined;
                    moderated?: boolean | undefined;
                }[] | undefined;
                guidelines?: string | undefined;
                defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
                layout?: "list" | "gallery" | undefined;
                defaultReactionEmoji?: string | undefined;
                autoArchiveDuration?: number | undefined;
            } | undefined;
        }, {
            purpose: string;
            type: "text" | "voice" | "announcement" | "forum" | "stage";
            name: string;
            key: string;
            topic?: string | undefined;
            slowmodeSeconds?: number | undefined;
            nsfw?: boolean | undefined;
            userLimit?: number | undefined;
            bitrate?: number | undefined;
            permissionOverwrites?: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[] | undefined;
            forumConfig?: {
                tags?: {
                    name: string;
                    emoji?: string | undefined;
                    moderated?: boolean | undefined;
                }[] | undefined;
                guidelines?: string | undefined;
                defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
                layout?: "list" | "gallery" | undefined;
                defaultReactionEmoji?: string | undefined;
                autoArchiveDuration?: number | undefined;
            } | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        name: string;
        key: string;
        permissionOverwrites: {
            roleKey: string;
            allow: string[];
            deny: string[];
        }[];
        channels: {
            purpose: string;
            type: "text" | "voice" | "announcement" | "forum" | "stage";
            name: string;
            key: string;
            topic?: string | undefined;
            slowmodeSeconds?: number | undefined;
            nsfw?: boolean | undefined;
            userLimit?: number | undefined;
            bitrate?: number | undefined;
            permissionOverwrites?: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[] | undefined;
            forumConfig?: {
                tags?: {
                    name: string;
                    emoji?: string | undefined;
                    moderated?: boolean | undefined;
                }[] | undefined;
                guidelines?: string | undefined;
                defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
                layout?: "list" | "gallery" | undefined;
                defaultReactionEmoji?: string | undefined;
                autoArchiveDuration?: number | undefined;
            } | undefined;
        }[];
    }, {
        name: string;
        key: string;
        permissionOverwrites: {
            roleKey: string;
            allow: string[];
            deny: string[];
        }[];
        channels: {
            purpose: string;
            type: "text" | "voice" | "announcement" | "forum" | "stage";
            name: string;
            key: string;
            topic?: string | undefined;
            slowmodeSeconds?: number | undefined;
            nsfw?: boolean | undefined;
            userLimit?: number | undefined;
            bitrate?: number | undefined;
            permissionOverwrites?: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[] | undefined;
            forumConfig?: {
                tags?: {
                    name: string;
                    emoji?: string | undefined;
                    moderated?: boolean | undefined;
                }[] | undefined;
                guidelines?: string | undefined;
                defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
                layout?: "list" | "gallery" | undefined;
                defaultReactionEmoji?: string | undefined;
                autoArchiveDuration?: number | undefined;
            } | undefined;
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    kind: "add_category";
    category: {
        name: string;
        key: string;
        permissionOverwrites: {
            roleKey: string;
            allow: string[];
            deny: string[];
        }[];
        channels: {
            purpose: string;
            type: "text" | "voice" | "announcement" | "forum" | "stage";
            name: string;
            key: string;
            topic?: string | undefined;
            slowmodeSeconds?: number | undefined;
            nsfw?: boolean | undefined;
            userLimit?: number | undefined;
            bitrate?: number | undefined;
            permissionOverwrites?: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[] | undefined;
            forumConfig?: {
                tags?: {
                    name: string;
                    emoji?: string | undefined;
                    moderated?: boolean | undefined;
                }[] | undefined;
                guidelines?: string | undefined;
                defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
                layout?: "list" | "gallery" | undefined;
                defaultReactionEmoji?: string | undefined;
                autoArchiveDuration?: number | undefined;
            } | undefined;
        }[];
    };
}, {
    kind: "add_category";
    category: {
        name: string;
        key: string;
        permissionOverwrites: {
            roleKey: string;
            allow: string[];
            deny: string[];
        }[];
        channels: {
            purpose: string;
            type: "text" | "voice" | "announcement" | "forum" | "stage";
            name: string;
            key: string;
            topic?: string | undefined;
            slowmodeSeconds?: number | undefined;
            nsfw?: boolean | undefined;
            userLimit?: number | undefined;
            bitrate?: number | undefined;
            permissionOverwrites?: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[] | undefined;
            forumConfig?: {
                tags?: {
                    name: string;
                    emoji?: string | undefined;
                    moderated?: boolean | undefined;
                }[] | undefined;
                guidelines?: string | undefined;
                defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
                layout?: "list" | "gallery" | undefined;
                defaultReactionEmoji?: string | undefined;
                autoArchiveDuration?: number | undefined;
            } | undefined;
        }[];
    };
}>, z.ZodObject<{
    kind: z.ZodLiteral<"modify_server_settings">;
    changes: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    kind: "modify_server_settings";
    changes: Record<string, unknown>;
}, {
    kind: "modify_server_settings";
    changes: Record<string, unknown>;
}>, z.ZodObject<{
    kind: z.ZodLiteral<"add_post_build_action">;
    action: z.ZodObject<{
        type: z.ZodEnum<["welcome_message", "welcome_banner", "rules_post", "ticket_panel", "verification_gate", "self_role_message", "bot_invite_panel", "announcement_post"]>;
        params: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        params: Record<string, unknown>;
        type: "welcome_message" | "welcome_banner" | "rules_post" | "ticket_panel" | "verification_gate" | "self_role_message" | "bot_invite_panel" | "announcement_post";
    }, {
        params: Record<string, unknown>;
        type: "welcome_message" | "welcome_banner" | "rules_post" | "ticket_panel" | "verification_gate" | "self_role_message" | "bot_invite_panel" | "announcement_post";
    }>;
}, "strip", z.ZodTypeAny, {
    kind: "add_post_build_action";
    action: {
        params: Record<string, unknown>;
        type: "welcome_message" | "welcome_banner" | "rules_post" | "ticket_panel" | "verification_gate" | "self_role_message" | "bot_invite_panel" | "announcement_post";
    };
}, {
    kind: "add_post_build_action";
    action: {
        params: Record<string, unknown>;
        type: "welcome_message" | "welcome_banner" | "rules_post" | "ticket_panel" | "verification_gate" | "self_role_message" | "bot_invite_panel" | "announcement_post";
    };
}>, z.ZodObject<{
    kind: z.ZodLiteral<"add_automod_rule">;
    rule: z.ZodObject<{
        name: z.ZodString;
        type: z.ZodEnum<["keyword", "spam", "mention_spam", "keyword_preset"]>;
        keywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        regexPatterns: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        presets: z.ZodOptional<z.ZodArray<z.ZodEnum<["profanity", "sexual_content", "slurs"]>, "many">>;
        mentionLimit: z.ZodOptional<z.ZodNumber>;
        actions: z.ZodArray<z.ZodEnum<["block", "alert", "timeout"]>, "many">;
        alertChannelKey: z.ZodOptional<z.ZodString>;
        timeoutDurationSeconds: z.ZodOptional<z.ZodNumber>;
        enabled: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        type: "keyword" | "spam" | "mention_spam" | "keyword_preset";
        name: string;
        actions: ("block" | "alert" | "timeout")[];
        keywords?: string[] | undefined;
        regexPatterns?: string[] | undefined;
        presets?: ("profanity" | "sexual_content" | "slurs")[] | undefined;
        mentionLimit?: number | undefined;
        alertChannelKey?: string | undefined;
        timeoutDurationSeconds?: number | undefined;
        enabled?: boolean | undefined;
    }, {
        type: "keyword" | "spam" | "mention_spam" | "keyword_preset";
        name: string;
        actions: ("block" | "alert" | "timeout")[];
        keywords?: string[] | undefined;
        regexPatterns?: string[] | undefined;
        presets?: ("profanity" | "sexual_content" | "slurs")[] | undefined;
        mentionLimit?: number | undefined;
        alertChannelKey?: string | undefined;
        timeoutDurationSeconds?: number | undefined;
        enabled?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    kind: "add_automod_rule";
    rule: {
        type: "keyword" | "spam" | "mention_spam" | "keyword_preset";
        name: string;
        actions: ("block" | "alert" | "timeout")[];
        keywords?: string[] | undefined;
        regexPatterns?: string[] | undefined;
        presets?: ("profanity" | "sexual_content" | "slurs")[] | undefined;
        mentionLimit?: number | undefined;
        alertChannelKey?: string | undefined;
        timeoutDurationSeconds?: number | undefined;
        enabled?: boolean | undefined;
    };
}, {
    kind: "add_automod_rule";
    rule: {
        type: "keyword" | "spam" | "mention_spam" | "keyword_preset";
        name: string;
        actions: ("block" | "alert" | "timeout")[];
        keywords?: string[] | undefined;
        regexPatterns?: string[] | undefined;
        presets?: ("profanity" | "sexual_content" | "slurs")[] | undefined;
        mentionLimit?: number | undefined;
        alertChannelKey?: string | undefined;
        timeoutDurationSeconds?: number | undefined;
        enabled?: boolean | undefined;
    };
}>, z.ZodObject<{
    kind: z.ZodLiteral<"add_webhook">;
    webhook: z.ZodObject<{
        name: z.ZodString;
        targetChannelKey: z.ZodString;
        purpose: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        purpose: string;
        name: string;
        targetChannelKey: string;
    }, {
        purpose: string;
        name: string;
        targetChannelKey: string;
    }>;
}, "strip", z.ZodTypeAny, {
    kind: "add_webhook";
    webhook: {
        purpose: string;
        name: string;
        targetChannelKey: string;
    };
}, {
    kind: "add_webhook";
    webhook: {
        purpose: string;
        name: string;
        targetChannelKey: string;
    };
}>, z.ZodObject<{
    kind: z.ZodLiteral<"add_embed">;
    embed: z.ZodObject<{
        targetChannelKey: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        color: z.ZodOptional<z.ZodString>;
        footer: z.ZodOptional<z.ZodString>;
        reactions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        targetChannelKey: string;
        title: string;
        description: string;
        color?: string | undefined;
        footer?: string | undefined;
        reactions?: string[] | undefined;
    }, {
        targetChannelKey: string;
        title: string;
        description: string;
        color?: string | undefined;
        footer?: string | undefined;
        reactions?: string[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    kind: "add_embed";
    embed: {
        targetChannelKey: string;
        title: string;
        description: string;
        color?: string | undefined;
        footer?: string | undefined;
        reactions?: string[] | undefined;
    };
}, {
    kind: "add_embed";
    embed: {
        targetChannelKey: string;
        title: string;
        description: string;
        color?: string | undefined;
        footer?: string | undefined;
        reactions?: string[] | undefined;
    };
}>, z.ZodObject<{
    kind: z.ZodLiteral<"add_forum_seed">;
    seed: z.ZodObject<{
        forumChannelKey: z.ZodString;
        title: z.ZodString;
        content: z.ZodString;
        tagName: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        forumChannelKey: string;
        content: string;
        tagName?: string | undefined;
    }, {
        title: string;
        forumChannelKey: string;
        content: string;
        tagName?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    kind: "add_forum_seed";
    seed: {
        title: string;
        forumChannelKey: string;
        content: string;
        tagName?: string | undefined;
    };
}, {
    kind: "add_forum_seed";
    seed: {
        title: string;
        forumChannelKey: string;
        content: string;
        tagName?: string | undefined;
    };
}>, z.ZodObject<{
    kind: z.ZodLiteral<"full_rebuild">;
    plan: z.ZodLazy<z.ZodObject<{
        version: z.ZodLiteral<1>;
        serverName: z.ZodString;
        description: z.ZodString;
        brand: z.ZodObject<{
            primaryColor: z.ZodString;
            tone: z.ZodEnum<["formal", "friendly", "playful", "edgy", "hype"]>;
            iconUrl: z.ZodOptional<z.ZodString>;
            bannerUrl: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            primaryColor: string;
            tone: "formal" | "friendly" | "playful" | "edgy" | "hype";
            iconUrl?: string | undefined;
            bannerUrl?: string | undefined;
        }, {
            primaryColor: string;
            tone: "formal" | "friendly" | "playful" | "edgy" | "hype";
            iconUrl?: string | undefined;
            bannerUrl?: string | undefined;
        }>;
        serverSettings: z.ZodObject<{
            verificationLevel: z.ZodEnum<["none", "low", "medium", "high", "very_high"]>;
            defaultNotifications: z.ZodEnum<["all", "mentions"]>;
            contentFilter: z.ZodEnum<["disabled", "no_role", "all"]>;
        }, "strip", z.ZodTypeAny, {
            verificationLevel: "none" | "low" | "medium" | "high" | "very_high";
            defaultNotifications: "all" | "mentions";
            contentFilter: "all" | "disabled" | "no_role";
        }, {
            verificationLevel: "none" | "low" | "medium" | "high" | "very_high";
            defaultNotifications: "all" | "mentions";
            contentFilter: "all" | "disabled" | "no_role";
        }>;
        roles: z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            name: z.ZodString;
            color: z.ZodString;
            hoist: z.ZodBoolean;
            mentionable: z.ZodBoolean;
            permissions: z.ZodArray<z.ZodString, "many">;
            purpose: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            purpose: string;
            name: string;
            color: string;
            key: string;
            hoist: boolean;
            mentionable: boolean;
            permissions: string[];
        }, {
            purpose: string;
            name: string;
            color: string;
            key: string;
            hoist: boolean;
            mentionable: boolean;
            permissions: string[];
        }>, "many">;
        categories: z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            name: z.ZodString;
            permissionOverwrites: z.ZodArray<z.ZodObject<{
                roleKey: z.ZodString;
                allow: z.ZodArray<z.ZodString, "many">;
                deny: z.ZodArray<z.ZodString, "many">;
            }, "strip", z.ZodTypeAny, {
                roleKey: string;
                allow: string[];
                deny: string[];
            }, {
                roleKey: string;
                allow: string[];
                deny: string[];
            }>, "many">;
            channels: z.ZodArray<z.ZodObject<{
                key: z.ZodString;
                name: z.ZodString;
                type: z.ZodEnum<["text", "voice", "announcement", "forum", "stage"]>;
                topic: z.ZodOptional<z.ZodString>;
                slowmodeSeconds: z.ZodOptional<z.ZodNumber>;
                nsfw: z.ZodOptional<z.ZodBoolean>;
                userLimit: z.ZodOptional<z.ZodNumber>;
                bitrate: z.ZodOptional<z.ZodNumber>;
                permissionOverwrites: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    roleKey: z.ZodString;
                    allow: z.ZodArray<z.ZodString, "many">;
                    deny: z.ZodArray<z.ZodString, "many">;
                }, "strip", z.ZodTypeAny, {
                    roleKey: string;
                    allow: string[];
                    deny: string[];
                }, {
                    roleKey: string;
                    allow: string[];
                    deny: string[];
                }>, "many">>;
                purpose: z.ZodString;
                forumConfig: z.ZodOptional<z.ZodObject<{
                    tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        name: z.ZodString;
                        emoji: z.ZodOptional<z.ZodString>;
                        moderated: z.ZodOptional<z.ZodBoolean>;
                    }, "strip", z.ZodTypeAny, {
                        name: string;
                        emoji?: string | undefined;
                        moderated?: boolean | undefined;
                    }, {
                        name: string;
                        emoji?: string | undefined;
                        moderated?: boolean | undefined;
                    }>, "many">>;
                    guidelines: z.ZodOptional<z.ZodString>;
                    defaultSortOrder: z.ZodOptional<z.ZodEnum<["latest_activity", "creation_date"]>>;
                    layout: z.ZodOptional<z.ZodEnum<["list", "gallery"]>>;
                    defaultReactionEmoji: z.ZodOptional<z.ZodString>;
                    autoArchiveDuration: z.ZodOptional<z.ZodNumber>;
                }, "strip", z.ZodTypeAny, {
                    tags?: {
                        name: string;
                        emoji?: string | undefined;
                        moderated?: boolean | undefined;
                    }[] | undefined;
                    guidelines?: string | undefined;
                    defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
                    layout?: "list" | "gallery" | undefined;
                    defaultReactionEmoji?: string | undefined;
                    autoArchiveDuration?: number | undefined;
                }, {
                    tags?: {
                        name: string;
                        emoji?: string | undefined;
                        moderated?: boolean | undefined;
                    }[] | undefined;
                    guidelines?: string | undefined;
                    defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
                    layout?: "list" | "gallery" | undefined;
                    defaultReactionEmoji?: string | undefined;
                    autoArchiveDuration?: number | undefined;
                }>>;
            }, "strip", z.ZodTypeAny, {
                purpose: string;
                type: "text" | "voice" | "announcement" | "forum" | "stage";
                name: string;
                key: string;
                topic?: string | undefined;
                slowmodeSeconds?: number | undefined;
                nsfw?: boolean | undefined;
                userLimit?: number | undefined;
                bitrate?: number | undefined;
                permissionOverwrites?: {
                    roleKey: string;
                    allow: string[];
                    deny: string[];
                }[] | undefined;
                forumConfig?: {
                    tags?: {
                        name: string;
                        emoji?: string | undefined;
                        moderated?: boolean | undefined;
                    }[] | undefined;
                    guidelines?: string | undefined;
                    defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
                    layout?: "list" | "gallery" | undefined;
                    defaultReactionEmoji?: string | undefined;
                    autoArchiveDuration?: number | undefined;
                } | undefined;
            }, {
                purpose: string;
                type: "text" | "voice" | "announcement" | "forum" | "stage";
                name: string;
                key: string;
                topic?: string | undefined;
                slowmodeSeconds?: number | undefined;
                nsfw?: boolean | undefined;
                userLimit?: number | undefined;
                bitrate?: number | undefined;
                permissionOverwrites?: {
                    roleKey: string;
                    allow: string[];
                    deny: string[];
                }[] | undefined;
                forumConfig?: {
                    tags?: {
                        name: string;
                        emoji?: string | undefined;
                        moderated?: boolean | undefined;
                    }[] | undefined;
                    guidelines?: string | undefined;
                    defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
                    layout?: "list" | "gallery" | undefined;
                    defaultReactionEmoji?: string | undefined;
                    autoArchiveDuration?: number | undefined;
                } | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            name: string;
            key: string;
            permissionOverwrites: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[];
            channels: {
                purpose: string;
                type: "text" | "voice" | "announcement" | "forum" | "stage";
                name: string;
                key: string;
                topic?: string | undefined;
                slowmodeSeconds?: number | undefined;
                nsfw?: boolean | undefined;
                userLimit?: number | undefined;
                bitrate?: number | undefined;
                permissionOverwrites?: {
                    roleKey: string;
                    allow: string[];
                    deny: string[];
                }[] | undefined;
                forumConfig?: {
                    tags?: {
                        name: string;
                        emoji?: string | undefined;
                        moderated?: boolean | undefined;
                    }[] | undefined;
                    guidelines?: string | undefined;
                    defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
                    layout?: "list" | "gallery" | undefined;
                    defaultReactionEmoji?: string | undefined;
                    autoArchiveDuration?: number | undefined;
                } | undefined;
            }[];
        }, {
            name: string;
            key: string;
            permissionOverwrites: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[];
            channels: {
                purpose: string;
                type: "text" | "voice" | "announcement" | "forum" | "stage";
                name: string;
                key: string;
                topic?: string | undefined;
                slowmodeSeconds?: number | undefined;
                nsfw?: boolean | undefined;
                userLimit?: number | undefined;
                bitrate?: number | undefined;
                permissionOverwrites?: {
                    roleKey: string;
                    allow: string[];
                    deny: string[];
                }[] | undefined;
                forumConfig?: {
                    tags?: {
                        name: string;
                        emoji?: string | undefined;
                        moderated?: boolean | undefined;
                    }[] | undefined;
                    guidelines?: string | undefined;
                    defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
                    layout?: "list" | "gallery" | undefined;
                    defaultReactionEmoji?: string | undefined;
                    autoArchiveDuration?: number | undefined;
                } | undefined;
            }[];
        }>, "many">;
        bots: z.ZodArray<z.ZodObject<{
            botId: z.ZodString;
            why: z.ZodString;
            setupSteps: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            botId: string;
            why: string;
            setupSteps: string[];
        }, {
            botId: string;
            why: string;
            setupSteps: string[];
        }>, "many">;
        postBuildActions: z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["welcome_message", "welcome_banner", "rules_post", "ticket_panel", "verification_gate", "self_role_message", "bot_invite_panel", "announcement_post"]>;
            params: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, "strip", z.ZodTypeAny, {
            params: Record<string, unknown>;
            type: "welcome_message" | "welcome_banner" | "rules_post" | "ticket_panel" | "verification_gate" | "self_role_message" | "bot_invite_panel" | "announcement_post";
        }, {
            params: Record<string, unknown>;
            type: "welcome_message" | "welcome_banner" | "rules_post" | "ticket_panel" | "verification_gate" | "self_role_message" | "bot_invite_panel" | "announcement_post";
        }>, "many">;
        autoModRules: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            type: z.ZodEnum<["keyword", "spam", "mention_spam", "keyword_preset"]>;
            keywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            regexPatterns: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            presets: z.ZodOptional<z.ZodArray<z.ZodEnum<["profanity", "sexual_content", "slurs"]>, "many">>;
            mentionLimit: z.ZodOptional<z.ZodNumber>;
            actions: z.ZodArray<z.ZodEnum<["block", "alert", "timeout"]>, "many">;
            alertChannelKey: z.ZodOptional<z.ZodString>;
            timeoutDurationSeconds: z.ZodOptional<z.ZodNumber>;
            enabled: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            type: "keyword" | "spam" | "mention_spam" | "keyword_preset";
            name: string;
            actions: ("block" | "alert" | "timeout")[];
            keywords?: string[] | undefined;
            regexPatterns?: string[] | undefined;
            presets?: ("profanity" | "sexual_content" | "slurs")[] | undefined;
            mentionLimit?: number | undefined;
            alertChannelKey?: string | undefined;
            timeoutDurationSeconds?: number | undefined;
            enabled?: boolean | undefined;
        }, {
            type: "keyword" | "spam" | "mention_spam" | "keyword_preset";
            name: string;
            actions: ("block" | "alert" | "timeout")[];
            keywords?: string[] | undefined;
            regexPatterns?: string[] | undefined;
            presets?: ("profanity" | "sexual_content" | "slurs")[] | undefined;
            mentionLimit?: number | undefined;
            alertChannelKey?: string | undefined;
            timeoutDurationSeconds?: number | undefined;
            enabled?: boolean | undefined;
        }>, "many">>;
        webhooks: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            targetChannelKey: z.ZodString;
            purpose: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            purpose: string;
            name: string;
            targetChannelKey: string;
        }, {
            purpose: string;
            name: string;
            targetChannelKey: string;
        }>, "many">>;
        embeds: z.ZodOptional<z.ZodArray<z.ZodObject<{
            targetChannelKey: z.ZodString;
            title: z.ZodString;
            description: z.ZodString;
            color: z.ZodOptional<z.ZodString>;
            footer: z.ZodOptional<z.ZodString>;
            reactions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            targetChannelKey: string;
            title: string;
            description: string;
            color?: string | undefined;
            footer?: string | undefined;
            reactions?: string[] | undefined;
        }, {
            targetChannelKey: string;
            title: string;
            description: string;
            color?: string | undefined;
            footer?: string | undefined;
            reactions?: string[] | undefined;
        }>, "many">>;
        forumSeedPosts: z.ZodOptional<z.ZodArray<z.ZodObject<{
            forumChannelKey: z.ZodString;
            title: z.ZodString;
            content: z.ZodString;
            tagName: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            title: string;
            forumChannelKey: string;
            content: string;
            tagName?: string | undefined;
        }, {
            title: string;
            forumChannelKey: string;
            content: string;
            tagName?: string | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        roles: {
            purpose: string;
            name: string;
            color: string;
            key: string;
            hoist: boolean;
            mentionable: boolean;
            permissions: string[];
        }[];
        serverName: string;
        description: string;
        version: 1;
        brand: {
            primaryColor: string;
            tone: "formal" | "friendly" | "playful" | "edgy" | "hype";
            iconUrl?: string | undefined;
            bannerUrl?: string | undefined;
        };
        serverSettings: {
            verificationLevel: "none" | "low" | "medium" | "high" | "very_high";
            defaultNotifications: "all" | "mentions";
            contentFilter: "all" | "disabled" | "no_role";
        };
        categories: {
            name: string;
            key: string;
            permissionOverwrites: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[];
            channels: {
                purpose: string;
                type: "text" | "voice" | "announcement" | "forum" | "stage";
                name: string;
                key: string;
                topic?: string | undefined;
                slowmodeSeconds?: number | undefined;
                nsfw?: boolean | undefined;
                userLimit?: number | undefined;
                bitrate?: number | undefined;
                permissionOverwrites?: {
                    roleKey: string;
                    allow: string[];
                    deny: string[];
                }[] | undefined;
                forumConfig?: {
                    tags?: {
                        name: string;
                        emoji?: string | undefined;
                        moderated?: boolean | undefined;
                    }[] | undefined;
                    guidelines?: string | undefined;
                    defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
                    layout?: "list" | "gallery" | undefined;
                    defaultReactionEmoji?: string | undefined;
                    autoArchiveDuration?: number | undefined;
                } | undefined;
            }[];
        }[];
        bots: {
            botId: string;
            why: string;
            setupSteps: string[];
        }[];
        postBuildActions: {
            params: Record<string, unknown>;
            type: "welcome_message" | "welcome_banner" | "rules_post" | "ticket_panel" | "verification_gate" | "self_role_message" | "bot_invite_panel" | "announcement_post";
        }[];
        autoModRules?: {
            type: "keyword" | "spam" | "mention_spam" | "keyword_preset";
            name: string;
            actions: ("block" | "alert" | "timeout")[];
            keywords?: string[] | undefined;
            regexPatterns?: string[] | undefined;
            presets?: ("profanity" | "sexual_content" | "slurs")[] | undefined;
            mentionLimit?: number | undefined;
            alertChannelKey?: string | undefined;
            timeoutDurationSeconds?: number | undefined;
            enabled?: boolean | undefined;
        }[] | undefined;
        webhooks?: {
            purpose: string;
            name: string;
            targetChannelKey: string;
        }[] | undefined;
        embeds?: {
            targetChannelKey: string;
            title: string;
            description: string;
            color?: string | undefined;
            footer?: string | undefined;
            reactions?: string[] | undefined;
        }[] | undefined;
        forumSeedPosts?: {
            title: string;
            forumChannelKey: string;
            content: string;
            tagName?: string | undefined;
        }[] | undefined;
    }, {
        roles: {
            purpose: string;
            name: string;
            color: string;
            key: string;
            hoist: boolean;
            mentionable: boolean;
            permissions: string[];
        }[];
        serverName: string;
        description: string;
        version: 1;
        brand: {
            primaryColor: string;
            tone: "formal" | "friendly" | "playful" | "edgy" | "hype";
            iconUrl?: string | undefined;
            bannerUrl?: string | undefined;
        };
        serverSettings: {
            verificationLevel: "none" | "low" | "medium" | "high" | "very_high";
            defaultNotifications: "all" | "mentions";
            contentFilter: "all" | "disabled" | "no_role";
        };
        categories: {
            name: string;
            key: string;
            permissionOverwrites: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[];
            channels: {
                purpose: string;
                type: "text" | "voice" | "announcement" | "forum" | "stage";
                name: string;
                key: string;
                topic?: string | undefined;
                slowmodeSeconds?: number | undefined;
                nsfw?: boolean | undefined;
                userLimit?: number | undefined;
                bitrate?: number | undefined;
                permissionOverwrites?: {
                    roleKey: string;
                    allow: string[];
                    deny: string[];
                }[] | undefined;
                forumConfig?: {
                    tags?: {
                        name: string;
                        emoji?: string | undefined;
                        moderated?: boolean | undefined;
                    }[] | undefined;
                    guidelines?: string | undefined;
                    defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
                    layout?: "list" | "gallery" | undefined;
                    defaultReactionEmoji?: string | undefined;
                    autoArchiveDuration?: number | undefined;
                } | undefined;
            }[];
        }[];
        bots: {
            botId: string;
            why: string;
            setupSteps: string[];
        }[];
        postBuildActions: {
            params: Record<string, unknown>;
            type: "welcome_message" | "welcome_banner" | "rules_post" | "ticket_panel" | "verification_gate" | "self_role_message" | "bot_invite_panel" | "announcement_post";
        }[];
        autoModRules?: {
            type: "keyword" | "spam" | "mention_spam" | "keyword_preset";
            name: string;
            actions: ("block" | "alert" | "timeout")[];
            keywords?: string[] | undefined;
            regexPatterns?: string[] | undefined;
            presets?: ("profanity" | "sexual_content" | "slurs")[] | undefined;
            mentionLimit?: number | undefined;
            alertChannelKey?: string | undefined;
            timeoutDurationSeconds?: number | undefined;
            enabled?: boolean | undefined;
        }[] | undefined;
        webhooks?: {
            purpose: string;
            name: string;
            targetChannelKey: string;
        }[] | undefined;
        embeds?: {
            targetChannelKey: string;
            title: string;
            description: string;
            color?: string | undefined;
            footer?: string | undefined;
            reactions?: string[] | undefined;
        }[] | undefined;
        forumSeedPosts?: {
            title: string;
            forumChannelKey: string;
            content: string;
            tagName?: string | undefined;
        }[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    kind: "full_rebuild";
    plan: {
        roles: {
            purpose: string;
            name: string;
            color: string;
            key: string;
            hoist: boolean;
            mentionable: boolean;
            permissions: string[];
        }[];
        serverName: string;
        description: string;
        version: 1;
        brand: {
            primaryColor: string;
            tone: "formal" | "friendly" | "playful" | "edgy" | "hype";
            iconUrl?: string | undefined;
            bannerUrl?: string | undefined;
        };
        serverSettings: {
            verificationLevel: "none" | "low" | "medium" | "high" | "very_high";
            defaultNotifications: "all" | "mentions";
            contentFilter: "all" | "disabled" | "no_role";
        };
        categories: {
            name: string;
            key: string;
            permissionOverwrites: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[];
            channels: {
                purpose: string;
                type: "text" | "voice" | "announcement" | "forum" | "stage";
                name: string;
                key: string;
                topic?: string | undefined;
                slowmodeSeconds?: number | undefined;
                nsfw?: boolean | undefined;
                userLimit?: number | undefined;
                bitrate?: number | undefined;
                permissionOverwrites?: {
                    roleKey: string;
                    allow: string[];
                    deny: string[];
                }[] | undefined;
                forumConfig?: {
                    tags?: {
                        name: string;
                        emoji?: string | undefined;
                        moderated?: boolean | undefined;
                    }[] | undefined;
                    guidelines?: string | undefined;
                    defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
                    layout?: "list" | "gallery" | undefined;
                    defaultReactionEmoji?: string | undefined;
                    autoArchiveDuration?: number | undefined;
                } | undefined;
            }[];
        }[];
        bots: {
            botId: string;
            why: string;
            setupSteps: string[];
        }[];
        postBuildActions: {
            params: Record<string, unknown>;
            type: "welcome_message" | "welcome_banner" | "rules_post" | "ticket_panel" | "verification_gate" | "self_role_message" | "bot_invite_panel" | "announcement_post";
        }[];
        autoModRules?: {
            type: "keyword" | "spam" | "mention_spam" | "keyword_preset";
            name: string;
            actions: ("block" | "alert" | "timeout")[];
            keywords?: string[] | undefined;
            regexPatterns?: string[] | undefined;
            presets?: ("profanity" | "sexual_content" | "slurs")[] | undefined;
            mentionLimit?: number | undefined;
            alertChannelKey?: string | undefined;
            timeoutDurationSeconds?: number | undefined;
            enabled?: boolean | undefined;
        }[] | undefined;
        webhooks?: {
            purpose: string;
            name: string;
            targetChannelKey: string;
        }[] | undefined;
        embeds?: {
            targetChannelKey: string;
            title: string;
            description: string;
            color?: string | undefined;
            footer?: string | undefined;
            reactions?: string[] | undefined;
        }[] | undefined;
        forumSeedPosts?: {
            title: string;
            forumChannelKey: string;
            content: string;
            tagName?: string | undefined;
        }[] | undefined;
    };
}, {
    kind: "full_rebuild";
    plan: {
        roles: {
            purpose: string;
            name: string;
            color: string;
            key: string;
            hoist: boolean;
            mentionable: boolean;
            permissions: string[];
        }[];
        serverName: string;
        description: string;
        version: 1;
        brand: {
            primaryColor: string;
            tone: "formal" | "friendly" | "playful" | "edgy" | "hype";
            iconUrl?: string | undefined;
            bannerUrl?: string | undefined;
        };
        serverSettings: {
            verificationLevel: "none" | "low" | "medium" | "high" | "very_high";
            defaultNotifications: "all" | "mentions";
            contentFilter: "all" | "disabled" | "no_role";
        };
        categories: {
            name: string;
            key: string;
            permissionOverwrites: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[];
            channels: {
                purpose: string;
                type: "text" | "voice" | "announcement" | "forum" | "stage";
                name: string;
                key: string;
                topic?: string | undefined;
                slowmodeSeconds?: number | undefined;
                nsfw?: boolean | undefined;
                userLimit?: number | undefined;
                bitrate?: number | undefined;
                permissionOverwrites?: {
                    roleKey: string;
                    allow: string[];
                    deny: string[];
                }[] | undefined;
                forumConfig?: {
                    tags?: {
                        name: string;
                        emoji?: string | undefined;
                        moderated?: boolean | undefined;
                    }[] | undefined;
                    guidelines?: string | undefined;
                    defaultSortOrder?: "latest_activity" | "creation_date" | undefined;
                    layout?: "list" | "gallery" | undefined;
                    defaultReactionEmoji?: string | undefined;
                    autoArchiveDuration?: number | undefined;
                } | undefined;
            }[];
        }[];
        bots: {
            botId: string;
            why: string;
            setupSteps: string[];
        }[];
        postBuildActions: {
            params: Record<string, unknown>;
            type: "welcome_message" | "welcome_banner" | "rules_post" | "ticket_panel" | "verification_gate" | "self_role_message" | "bot_invite_panel" | "announcement_post";
        }[];
        autoModRules?: {
            type: "keyword" | "spam" | "mention_spam" | "keyword_preset";
            name: string;
            actions: ("block" | "alert" | "timeout")[];
            keywords?: string[] | undefined;
            regexPatterns?: string[] | undefined;
            presets?: ("profanity" | "sexual_content" | "slurs")[] | undefined;
            mentionLimit?: number | undefined;
            alertChannelKey?: string | undefined;
            timeoutDurationSeconds?: number | undefined;
            enabled?: boolean | undefined;
        }[] | undefined;
        webhooks?: {
            purpose: string;
            name: string;
            targetChannelKey: string;
        }[] | undefined;
        embeds?: {
            targetChannelKey: string;
            title: string;
            description: string;
            color?: string | undefined;
            footer?: string | undefined;
            reactions?: string[] | undefined;
        }[] | undefined;
        forumSeedPosts?: {
            title: string;
            forumChannelKey: string;
            content: string;
            tagName?: string | undefined;
        }[] | undefined;
    };
}>]>;
export type PlanChange = z.infer<typeof PlanChangeSchema>;
export type ForumTag = z.infer<typeof ForumTagSchema>;
export type ForumConfig = z.infer<typeof ForumConfigSchema>;
export type EmbedContent = z.infer<typeof EmbedContentSchema>;
export type AutoModRule = z.infer<typeof AutoModRuleSchema>;
export type Webhook = z.infer<typeof WebhookSchema>;
export type ForumSeedPost = z.infer<typeof ForumSeedPostSchema>;
export type Branding = z.infer<typeof BrandingSchema>;
export type Channel = z.infer<typeof ChannelSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type Role = z.infer<typeof RoleSchema>;

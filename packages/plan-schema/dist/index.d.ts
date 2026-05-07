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
export declare const BuildPlanSchema: z.ZodObject<{
    version: z.ZodLiteral<1>;
    serverName: z.ZodString;
    description: z.ZodString;
    brand: z.ZodObject<{
        primaryColor: z.ZodString;
        tone: z.ZodEnum<["formal", "friendly", "playful", "edgy", "hype"]>;
    }, "strip", z.ZodTypeAny, {
        primaryColor: string;
        tone: "formal" | "friendly" | "playful" | "edgy" | "hype";
    }, {
        primaryColor: string;
        tone: "formal" | "friendly" | "playful" | "edgy" | "hype";
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
        key: string;
        name: string;
        color: string;
        hoist: boolean;
        mentionable: boolean;
        permissions: string[];
    }, {
        purpose: string;
        key: string;
        name: string;
        color: string;
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
        }, "strip", z.ZodTypeAny, {
            purpose: string;
            type: "text" | "voice" | "announcement" | "forum" | "stage";
            key: string;
            name: string;
            permissionOverwrites?: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[] | undefined;
            topic?: string | undefined;
            slowmodeSeconds?: number | undefined;
            nsfw?: boolean | undefined;
            userLimit?: number | undefined;
            bitrate?: number | undefined;
        }, {
            purpose: string;
            type: "text" | "voice" | "announcement" | "forum" | "stage";
            key: string;
            name: string;
            permissionOverwrites?: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[] | undefined;
            topic?: string | undefined;
            slowmodeSeconds?: number | undefined;
            nsfw?: boolean | undefined;
            userLimit?: number | undefined;
            bitrate?: number | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        key: string;
        name: string;
        permissionOverwrites: {
            roleKey: string;
            allow: string[];
            deny: string[];
        }[];
        channels: {
            purpose: string;
            type: "text" | "voice" | "announcement" | "forum" | "stage";
            key: string;
            name: string;
            permissionOverwrites?: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[] | undefined;
            topic?: string | undefined;
            slowmodeSeconds?: number | undefined;
            nsfw?: boolean | undefined;
            userLimit?: number | undefined;
            bitrate?: number | undefined;
        }[];
    }, {
        key: string;
        name: string;
        permissionOverwrites: {
            roleKey: string;
            allow: string[];
            deny: string[];
        }[];
        channels: {
            purpose: string;
            type: "text" | "voice" | "announcement" | "forum" | "stage";
            key: string;
            name: string;
            permissionOverwrites?: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[] | undefined;
            topic?: string | undefined;
            slowmodeSeconds?: number | undefined;
            nsfw?: boolean | undefined;
            userLimit?: number | undefined;
            bitrate?: number | undefined;
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
        type: z.ZodEnum<["welcome_message", "rules_post", "ticket_panel", "verification_gate", "self_role_message"]>;
        params: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        params: Record<string, unknown>;
        type: "welcome_message" | "rules_post" | "ticket_panel" | "verification_gate" | "self_role_message";
    }, {
        params: Record<string, unknown>;
        type: "welcome_message" | "rules_post" | "ticket_panel" | "verification_gate" | "self_role_message";
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    roles: {
        purpose: string;
        key: string;
        name: string;
        color: string;
        hoist: boolean;
        mentionable: boolean;
        permissions: string[];
    }[];
    serverName: string;
    version: 1;
    description: string;
    brand: {
        primaryColor: string;
        tone: "formal" | "friendly" | "playful" | "edgy" | "hype";
    };
    serverSettings: {
        verificationLevel: "none" | "low" | "medium" | "high" | "very_high";
        defaultNotifications: "all" | "mentions";
        contentFilter: "all" | "disabled" | "no_role";
    };
    categories: {
        key: string;
        name: string;
        permissionOverwrites: {
            roleKey: string;
            allow: string[];
            deny: string[];
        }[];
        channels: {
            purpose: string;
            type: "text" | "voice" | "announcement" | "forum" | "stage";
            key: string;
            name: string;
            permissionOverwrites?: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[] | undefined;
            topic?: string | undefined;
            slowmodeSeconds?: number | undefined;
            nsfw?: boolean | undefined;
            userLimit?: number | undefined;
            bitrate?: number | undefined;
        }[];
    }[];
    bots: {
        botId: string;
        why: string;
        setupSteps: string[];
    }[];
    postBuildActions: {
        params: Record<string, unknown>;
        type: "welcome_message" | "rules_post" | "ticket_panel" | "verification_gate" | "self_role_message";
    }[];
}, {
    roles: {
        purpose: string;
        key: string;
        name: string;
        color: string;
        hoist: boolean;
        mentionable: boolean;
        permissions: string[];
    }[];
    serverName: string;
    version: 1;
    description: string;
    brand: {
        primaryColor: string;
        tone: "formal" | "friendly" | "playful" | "edgy" | "hype";
    };
    serverSettings: {
        verificationLevel: "none" | "low" | "medium" | "high" | "very_high";
        defaultNotifications: "all" | "mentions";
        contentFilter: "all" | "disabled" | "no_role";
    };
    categories: {
        key: string;
        name: string;
        permissionOverwrites: {
            roleKey: string;
            allow: string[];
            deny: string[];
        }[];
        channels: {
            purpose: string;
            type: "text" | "voice" | "announcement" | "forum" | "stage";
            key: string;
            name: string;
            permissionOverwrites?: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[] | undefined;
            topic?: string | undefined;
            slowmodeSeconds?: number | undefined;
            nsfw?: boolean | undefined;
            userLimit?: number | undefined;
            bitrate?: number | undefined;
        }[];
    }[];
    bots: {
        botId: string;
        why: string;
        setupSteps: string[];
    }[];
    postBuildActions: {
        params: Record<string, unknown>;
        type: "welcome_message" | "rules_post" | "ticket_panel" | "verification_gate" | "self_role_message";
    }[];
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
    }, "strip", z.ZodTypeAny, {
        purpose: string;
        type: "text" | "voice" | "announcement" | "forum" | "stage";
        key: string;
        name: string;
        permissionOverwrites?: {
            roleKey: string;
            allow: string[];
            deny: string[];
        }[] | undefined;
        topic?: string | undefined;
        slowmodeSeconds?: number | undefined;
        nsfw?: boolean | undefined;
        userLimit?: number | undefined;
        bitrate?: number | undefined;
    }, {
        purpose: string;
        type: "text" | "voice" | "announcement" | "forum" | "stage";
        key: string;
        name: string;
        permissionOverwrites?: {
            roleKey: string;
            allow: string[];
            deny: string[];
        }[] | undefined;
        topic?: string | undefined;
        slowmodeSeconds?: number | undefined;
        nsfw?: boolean | undefined;
        userLimit?: number | undefined;
        bitrate?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    kind: "add_channel";
    category: string;
    channel: {
        purpose: string;
        type: "text" | "voice" | "announcement" | "forum" | "stage";
        key: string;
        name: string;
        permissionOverwrites?: {
            roleKey: string;
            allow: string[];
            deny: string[];
        }[] | undefined;
        topic?: string | undefined;
        slowmodeSeconds?: number | undefined;
        nsfw?: boolean | undefined;
        userLimit?: number | undefined;
        bitrate?: number | undefined;
    };
}, {
    kind: "add_channel";
    category: string;
    channel: {
        purpose: string;
        type: "text" | "voice" | "announcement" | "forum" | "stage";
        key: string;
        name: string;
        permissionOverwrites?: {
            roleKey: string;
            allow: string[];
            deny: string[];
        }[] | undefined;
        topic?: string | undefined;
        slowmodeSeconds?: number | undefined;
        nsfw?: boolean | undefined;
        userLimit?: number | undefined;
        bitrate?: number | undefined;
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
        key: string;
        name: string;
        color: string;
        hoist: boolean;
        mentionable: boolean;
        permissions: string[];
    }, {
        purpose: string;
        key: string;
        name: string;
        color: string;
        hoist: boolean;
        mentionable: boolean;
        permissions: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    kind: "add_role";
    role: {
        purpose: string;
        key: string;
        name: string;
        color: string;
        hoist: boolean;
        mentionable: boolean;
        permissions: string[];
    };
}, {
    kind: "add_role";
    role: {
        purpose: string;
        key: string;
        name: string;
        color: string;
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
        }, "strip", z.ZodTypeAny, {
            purpose: string;
            type: "text" | "voice" | "announcement" | "forum" | "stage";
            key: string;
            name: string;
            permissionOverwrites?: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[] | undefined;
            topic?: string | undefined;
            slowmodeSeconds?: number | undefined;
            nsfw?: boolean | undefined;
            userLimit?: number | undefined;
            bitrate?: number | undefined;
        }, {
            purpose: string;
            type: "text" | "voice" | "announcement" | "forum" | "stage";
            key: string;
            name: string;
            permissionOverwrites?: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[] | undefined;
            topic?: string | undefined;
            slowmodeSeconds?: number | undefined;
            nsfw?: boolean | undefined;
            userLimit?: number | undefined;
            bitrate?: number | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        key: string;
        name: string;
        permissionOverwrites: {
            roleKey: string;
            allow: string[];
            deny: string[];
        }[];
        channels: {
            purpose: string;
            type: "text" | "voice" | "announcement" | "forum" | "stage";
            key: string;
            name: string;
            permissionOverwrites?: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[] | undefined;
            topic?: string | undefined;
            slowmodeSeconds?: number | undefined;
            nsfw?: boolean | undefined;
            userLimit?: number | undefined;
            bitrate?: number | undefined;
        }[];
    }, {
        key: string;
        name: string;
        permissionOverwrites: {
            roleKey: string;
            allow: string[];
            deny: string[];
        }[];
        channels: {
            purpose: string;
            type: "text" | "voice" | "announcement" | "forum" | "stage";
            key: string;
            name: string;
            permissionOverwrites?: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[] | undefined;
            topic?: string | undefined;
            slowmodeSeconds?: number | undefined;
            nsfw?: boolean | undefined;
            userLimit?: number | undefined;
            bitrate?: number | undefined;
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    kind: "add_category";
    category: {
        key: string;
        name: string;
        permissionOverwrites: {
            roleKey: string;
            allow: string[];
            deny: string[];
        }[];
        channels: {
            purpose: string;
            type: "text" | "voice" | "announcement" | "forum" | "stage";
            key: string;
            name: string;
            permissionOverwrites?: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[] | undefined;
            topic?: string | undefined;
            slowmodeSeconds?: number | undefined;
            nsfw?: boolean | undefined;
            userLimit?: number | undefined;
            bitrate?: number | undefined;
        }[];
    };
}, {
    kind: "add_category";
    category: {
        key: string;
        name: string;
        permissionOverwrites: {
            roleKey: string;
            allow: string[];
            deny: string[];
        }[];
        channels: {
            purpose: string;
            type: "text" | "voice" | "announcement" | "forum" | "stage";
            key: string;
            name: string;
            permissionOverwrites?: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[] | undefined;
            topic?: string | undefined;
            slowmodeSeconds?: number | undefined;
            nsfw?: boolean | undefined;
            userLimit?: number | undefined;
            bitrate?: number | undefined;
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
        type: z.ZodEnum<["welcome_message", "rules_post", "ticket_panel", "verification_gate", "self_role_message"]>;
        params: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        params: Record<string, unknown>;
        type: "welcome_message" | "rules_post" | "ticket_panel" | "verification_gate" | "self_role_message";
    }, {
        params: Record<string, unknown>;
        type: "welcome_message" | "rules_post" | "ticket_panel" | "verification_gate" | "self_role_message";
    }>;
}, "strip", z.ZodTypeAny, {
    kind: "add_post_build_action";
    action: {
        params: Record<string, unknown>;
        type: "welcome_message" | "rules_post" | "ticket_panel" | "verification_gate" | "self_role_message";
    };
}, {
    kind: "add_post_build_action";
    action: {
        params: Record<string, unknown>;
        type: "welcome_message" | "rules_post" | "ticket_panel" | "verification_gate" | "self_role_message";
    };
}>, z.ZodObject<{
    kind: z.ZodLiteral<"full_rebuild">;
    plan: z.ZodObject<{
        version: z.ZodLiteral<1>;
        serverName: z.ZodString;
        description: z.ZodString;
        brand: z.ZodObject<{
            primaryColor: z.ZodString;
            tone: z.ZodEnum<["formal", "friendly", "playful", "edgy", "hype"]>;
        }, "strip", z.ZodTypeAny, {
            primaryColor: string;
            tone: "formal" | "friendly" | "playful" | "edgy" | "hype";
        }, {
            primaryColor: string;
            tone: "formal" | "friendly" | "playful" | "edgy" | "hype";
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
            key: string;
            name: string;
            color: string;
            hoist: boolean;
            mentionable: boolean;
            permissions: string[];
        }, {
            purpose: string;
            key: string;
            name: string;
            color: string;
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
            }, "strip", z.ZodTypeAny, {
                purpose: string;
                type: "text" | "voice" | "announcement" | "forum" | "stage";
                key: string;
                name: string;
                permissionOverwrites?: {
                    roleKey: string;
                    allow: string[];
                    deny: string[];
                }[] | undefined;
                topic?: string | undefined;
                slowmodeSeconds?: number | undefined;
                nsfw?: boolean | undefined;
                userLimit?: number | undefined;
                bitrate?: number | undefined;
            }, {
                purpose: string;
                type: "text" | "voice" | "announcement" | "forum" | "stage";
                key: string;
                name: string;
                permissionOverwrites?: {
                    roleKey: string;
                    allow: string[];
                    deny: string[];
                }[] | undefined;
                topic?: string | undefined;
                slowmodeSeconds?: number | undefined;
                nsfw?: boolean | undefined;
                userLimit?: number | undefined;
                bitrate?: number | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            key: string;
            name: string;
            permissionOverwrites: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[];
            channels: {
                purpose: string;
                type: "text" | "voice" | "announcement" | "forum" | "stage";
                key: string;
                name: string;
                permissionOverwrites?: {
                    roleKey: string;
                    allow: string[];
                    deny: string[];
                }[] | undefined;
                topic?: string | undefined;
                slowmodeSeconds?: number | undefined;
                nsfw?: boolean | undefined;
                userLimit?: number | undefined;
                bitrate?: number | undefined;
            }[];
        }, {
            key: string;
            name: string;
            permissionOverwrites: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[];
            channels: {
                purpose: string;
                type: "text" | "voice" | "announcement" | "forum" | "stage";
                key: string;
                name: string;
                permissionOverwrites?: {
                    roleKey: string;
                    allow: string[];
                    deny: string[];
                }[] | undefined;
                topic?: string | undefined;
                slowmodeSeconds?: number | undefined;
                nsfw?: boolean | undefined;
                userLimit?: number | undefined;
                bitrate?: number | undefined;
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
            type: z.ZodEnum<["welcome_message", "rules_post", "ticket_panel", "verification_gate", "self_role_message"]>;
            params: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, "strip", z.ZodTypeAny, {
            params: Record<string, unknown>;
            type: "welcome_message" | "rules_post" | "ticket_panel" | "verification_gate" | "self_role_message";
        }, {
            params: Record<string, unknown>;
            type: "welcome_message" | "rules_post" | "ticket_panel" | "verification_gate" | "self_role_message";
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        roles: {
            purpose: string;
            key: string;
            name: string;
            color: string;
            hoist: boolean;
            mentionable: boolean;
            permissions: string[];
        }[];
        serverName: string;
        version: 1;
        description: string;
        brand: {
            primaryColor: string;
            tone: "formal" | "friendly" | "playful" | "edgy" | "hype";
        };
        serverSettings: {
            verificationLevel: "none" | "low" | "medium" | "high" | "very_high";
            defaultNotifications: "all" | "mentions";
            contentFilter: "all" | "disabled" | "no_role";
        };
        categories: {
            key: string;
            name: string;
            permissionOverwrites: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[];
            channels: {
                purpose: string;
                type: "text" | "voice" | "announcement" | "forum" | "stage";
                key: string;
                name: string;
                permissionOverwrites?: {
                    roleKey: string;
                    allow: string[];
                    deny: string[];
                }[] | undefined;
                topic?: string | undefined;
                slowmodeSeconds?: number | undefined;
                nsfw?: boolean | undefined;
                userLimit?: number | undefined;
                bitrate?: number | undefined;
            }[];
        }[];
        bots: {
            botId: string;
            why: string;
            setupSteps: string[];
        }[];
        postBuildActions: {
            params: Record<string, unknown>;
            type: "welcome_message" | "rules_post" | "ticket_panel" | "verification_gate" | "self_role_message";
        }[];
    }, {
        roles: {
            purpose: string;
            key: string;
            name: string;
            color: string;
            hoist: boolean;
            mentionable: boolean;
            permissions: string[];
        }[];
        serverName: string;
        version: 1;
        description: string;
        brand: {
            primaryColor: string;
            tone: "formal" | "friendly" | "playful" | "edgy" | "hype";
        };
        serverSettings: {
            verificationLevel: "none" | "low" | "medium" | "high" | "very_high";
            defaultNotifications: "all" | "mentions";
            contentFilter: "all" | "disabled" | "no_role";
        };
        categories: {
            key: string;
            name: string;
            permissionOverwrites: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[];
            channels: {
                purpose: string;
                type: "text" | "voice" | "announcement" | "forum" | "stage";
                key: string;
                name: string;
                permissionOverwrites?: {
                    roleKey: string;
                    allow: string[];
                    deny: string[];
                }[] | undefined;
                topic?: string | undefined;
                slowmodeSeconds?: number | undefined;
                nsfw?: boolean | undefined;
                userLimit?: number | undefined;
                bitrate?: number | undefined;
            }[];
        }[];
        bots: {
            botId: string;
            why: string;
            setupSteps: string[];
        }[];
        postBuildActions: {
            params: Record<string, unknown>;
            type: "welcome_message" | "rules_post" | "ticket_panel" | "verification_gate" | "self_role_message";
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    kind: "full_rebuild";
    plan: {
        roles: {
            purpose: string;
            key: string;
            name: string;
            color: string;
            hoist: boolean;
            mentionable: boolean;
            permissions: string[];
        }[];
        serverName: string;
        version: 1;
        description: string;
        brand: {
            primaryColor: string;
            tone: "formal" | "friendly" | "playful" | "edgy" | "hype";
        };
        serverSettings: {
            verificationLevel: "none" | "low" | "medium" | "high" | "very_high";
            defaultNotifications: "all" | "mentions";
            contentFilter: "all" | "disabled" | "no_role";
        };
        categories: {
            key: string;
            name: string;
            permissionOverwrites: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[];
            channels: {
                purpose: string;
                type: "text" | "voice" | "announcement" | "forum" | "stage";
                key: string;
                name: string;
                permissionOverwrites?: {
                    roleKey: string;
                    allow: string[];
                    deny: string[];
                }[] | undefined;
                topic?: string | undefined;
                slowmodeSeconds?: number | undefined;
                nsfw?: boolean | undefined;
                userLimit?: number | undefined;
                bitrate?: number | undefined;
            }[];
        }[];
        bots: {
            botId: string;
            why: string;
            setupSteps: string[];
        }[];
        postBuildActions: {
            params: Record<string, unknown>;
            type: "welcome_message" | "rules_post" | "ticket_panel" | "verification_gate" | "self_role_message";
        }[];
    };
}, {
    kind: "full_rebuild";
    plan: {
        roles: {
            purpose: string;
            key: string;
            name: string;
            color: string;
            hoist: boolean;
            mentionable: boolean;
            permissions: string[];
        }[];
        serverName: string;
        version: 1;
        description: string;
        brand: {
            primaryColor: string;
            tone: "formal" | "friendly" | "playful" | "edgy" | "hype";
        };
        serverSettings: {
            verificationLevel: "none" | "low" | "medium" | "high" | "very_high";
            defaultNotifications: "all" | "mentions";
            contentFilter: "all" | "disabled" | "no_role";
        };
        categories: {
            key: string;
            name: string;
            permissionOverwrites: {
                roleKey: string;
                allow: string[];
                deny: string[];
            }[];
            channels: {
                purpose: string;
                type: "text" | "voice" | "announcement" | "forum" | "stage";
                key: string;
                name: string;
                permissionOverwrites?: {
                    roleKey: string;
                    allow: string[];
                    deny: string[];
                }[] | undefined;
                topic?: string | undefined;
                slowmodeSeconds?: number | undefined;
                nsfw?: boolean | undefined;
                userLimit?: number | undefined;
                bitrate?: number | undefined;
            }[];
        }[];
        bots: {
            botId: string;
            why: string;
            setupSteps: string[];
        }[];
        postBuildActions: {
            params: Record<string, unknown>;
            type: "welcome_message" | "rules_post" | "ticket_panel" | "verification_gate" | "self_role_message";
        }[];
    };
}>]>;
export type PlanChange = z.infer<typeof PlanChangeSchema>;

import { ToolRegistry } from "./index.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ChannelType, AutoModerationRuleTriggerType, AutoModerationActionType, AutoModerationRuleKeywordPresetType } from "discord.js";
import {
  ConfigureAutoModInput, SetupWelcomeScreenInput, ConfigureServerInput,
  CreateWebhookInput, SendEmbedInput, PostBotInvitePanelInput
} from "../schemas/automation.js";

// ── Bot catalog with GRANULAR permissions (no admin!) ──
const BOT_CATALOG: Record<string, { name: string; clientId: string; permissions: bigint; description: string; category: string; setupGuide: string }> = {
  "carl-bot": {
    name: "Carl-bot", clientId: "235148962103951360",
    permissions: 1642824531190n, // ManageRoles, ManageChannels, KickMembers, BanMembers, ManageMessages, EmbedLinks, ReadMessageHistory, AddReactions, ManageWebhooks, ManageEmojis
    description: "Reaction roles, advanced logging, automod, embeds, and custom commands",
    category: "Moderation & Automation",
    setupGuide: "1. Visit carl.gg dashboard\n2. Select your server\n3. Enable Automod, Logging, and Reaction Roles modules"
  },
  "dyno": {
    name: "Dyno", clientId: "161660517914509312",
    permissions: 470150358n,
    description: "Best-in-class audit logging, anti-spam, and heavy-traffic resilience (10.6M servers)",
    category: "Moderation & Logging",
    setupGuide: "1. Visit dyno.gg dashboard\n2. Enable Automod and Action Log\n3. Set log channel to #audit-log"
  },
  "ticket-tool": {
    name: "Ticket Tool", clientId: "557628352828014614",
    permissions: 326417525840n,
    description: "Private ephemeral ticket channels for 1-on-1 support (4.45M servers)",
    category: "Support & Tickets",
    setupGuide: "1. Run /setup in #create-ticket\n2. Configure ticket categories and staff roles\n3. Set transcript channel to #ticket-transcripts"
  },
  "arcane": {
    name: "Arcane", clientId: "530082442967646230",
    permissions: 268503126n,
    description: "XP leveling with voice tracking, role rewards, and leaderboards",
    category: "Engagement & Leveling",
    setupGuide: "1. Visit arcane.bot dashboard\n2. Configure XP rates and level-up roles\n3. Blacklist #bot-commands from XP"
  },
  "statbot": {
    name: "Statbot", clientId: "491769129318088714",
    permissions: 1073743872n,
    description: "Deep analytics: member engagement velocity, peak hours, channel activity charts",
    category: "Analytics",
    setupGuide: "1. Visit statbot.net dashboard\n2. Enable tracking for all channels\n3. Set counter channels if desired"
  },
  "apollo": {
    name: "Apollo", clientId: "475744554910351370",
    permissions: 335670337n,
    description: "Timezone-aware event scheduling with RSVP tracking and DM reminders",
    category: "Events & Scheduling",
    setupGuide: "1. Use /event create to make events\n2. Members RSVP with reactions\n3. Auto-reminders sent via DM"
  },
  "sapphire": {
    name: "Sapphire", clientId: "398627907818569728",
    permissions: 268633174n,
    description: "Free all-rounder: thread management, AI-assisted moderation, social notifications",
    category: "Utility",
    setupGuide: "1. Visit sapph.xyz dashboard\n2. Enable features as needed\n3. No aggressive paywalls"
  },
  "xenon": {
    name: "Xenon", clientId: "416358583220043796",
    permissions: 8n,
    description: "Full server backup, clone, and restore. Disaster recovery essential.",
    category: "Backup & Recovery",
    setupGuide: "1. Run /backup create to save server state\n2. Schedule automatic backups\n3. Use /backup load to restore"
  },
  "wick": {
    name: "Wick", clientId: "536991182035746816",
    permissions: 8n,
    description: "Anti-nuke protection, anti-raid CAPTCHA, suspicious account quarantine",
    category: "Security",
    setupGuide: "1. Visit wickbot.com dashboard\n2. Enable Anti-Nuke and Verification\n3. Set quarantine role and whitelist trusted bots"
  },
  "giveawaybot": {
    name: "GiveawayBot", clientId: "294882584201003009",
    permissions: 347200n,
    description: "Reaction-based giveaways with duration, winners, and re-rolls",
    category: "Engagement",
    setupGuide: "1. Use /giveaway start in desired channel\n2. Set prize, duration, and winner count\n3. Bot auto-selects winners"
  },
  "invite-tracker": {
    name: "Invite Tracker", clientId: "720351927581278219",
    permissions: 268435521n,
    description: "Track which invites bring members, detect fake joins, reward recruiters",
    category: "Growth & Analytics",
    setupGuide: "1. Bot auto-tracks invite usage\n2. Use /invites to see leaderboard\n3. Set auto-roles for top inviters"
  },
  "jockie-music": {
    name: "Jockie Music", clientId: "411916947773587456",
    permissions: 36700160n,
    description: "Multi-instance music bot (4 separate instances per server). Legal streaming.",
    category: "Music & Audio",
    setupGuide: "1. Invite all 4 instances for multi-channel audio\n2. Use /play in voice channels\n3. Set DJ role for queue control"
  }
};

function generateInviteUrl(botId: string, guildId: string): string | null {
  const bot = BOT_CATALOG[botId];
  if (!bot) return null;
  return `https://discord.com/oauth2/authorize?client_id=${bot.clientId}&permissions=${bot.permissions}&scope=bot%20applications.commands&guild_id=${guildId}&disable_guild_select=true`;
}

export function registerAutomationTools(registry: ToolRegistry) {

  // ── AUTOMOD ──
  registry.register({
    name: "configure_automod",
    description: "Configure Discord's native AutoMod rules (keyword filters, spam protection, mention spam). No bots needed.",
    inputSchema: zodToJsonSchema(ConfigureAutoModInput) as any
  }, async (args, discordClient, limiter) => {
    const { guildId, rules } = args as any;
    const guild = await discordClient.getGuild(guildId);
    const created: any[] = [];

    for (const rule of rules) {
      const triggerType =
        rule.type === "keyword" ? AutoModerationRuleTriggerType.Keyword :
        rule.type === "spam" ? AutoModerationRuleTriggerType.Spam :
        rule.type === "mention_spam" ? AutoModerationRuleTriggerType.MentionSpam :
        AutoModerationRuleTriggerType.KeywordPreset;

      const actions: any[] = [];
      for (const action of rule.actions) {
        if (action === "block") actions.push({ type: AutoModerationActionType.BlockMessage });
        if (action === "alert" && rule.alertChannelId) actions.push({ type: AutoModerationActionType.SendAlertMessage, metadata: { channelId: rule.alertChannelId } });
        if (action === "timeout") actions.push({ type: AutoModerationActionType.Timeout, metadata: { durationSeconds: rule.timeoutDurationSeconds || 60 } });
      }

      const triggerMetadata: any = {};
      if (rule.keywords) triggerMetadata.keywordFilter = rule.keywords;
      if (rule.regexPatterns) triggerMetadata.regexPatterns = rule.regexPatterns;
      if (rule.allowList) triggerMetadata.allowList = rule.allowList;
      if (rule.presets) {
        triggerMetadata.presets = rule.presets.map((p: string) =>
          p === "profanity" ? AutoModerationRuleKeywordPresetType.Profanity :
          p === "sexual_content" ? AutoModerationRuleKeywordPresetType.SexualContent :
          AutoModerationRuleKeywordPresetType.Slurs
        );
      }
      if (rule.mentionLimit !== undefined) triggerMetadata.mentionTotalLimit = rule.mentionLimit;

      const autoModRule = await limiter.run({ scope: "guild", guildId }, () =>
        guild.autoModerationRules.create({
          name: rule.name,
          eventType: 1, // MESSAGE_SEND
          triggerType,
          triggerMetadata,
          actions,
          enabled: rule.enabled !== false
        })
      );
      created.push({ id: autoModRule.id, name: autoModRule.name, type: rule.type });
    }
    return { created, count: created.length };
  });

  // ── SERVER CONFIG ──
  registry.register({
    name: "configure_server",
    description: "Configure server-level settings: verification level, content filter, notification defaults, system channel",
    inputSchema: zodToJsonSchema(ConfigureServerInput) as any
  }, async (args, discordClient, limiter) => {
    const { guildId, verificationLevel, explicitContentFilter, defaultMessageNotifications, systemChannelId, systemChannelFlags } = args as any;
    const guild = await discordClient.getGuild(guildId);
    const opts: any = {};
    if (verificationLevel !== undefined) opts.verificationLevel = verificationLevel;
    if (explicitContentFilter !== undefined) opts.explicitContentFilter = explicitContentFilter;
    if (defaultMessageNotifications !== undefined) opts.defaultMessageNotifications = defaultMessageNotifications;
    if (systemChannelId !== undefined) opts.systemChannelId = systemChannelId;
    if (systemChannelFlags !== undefined) opts.systemChannelFlags = systemChannelFlags;
    
    await limiter.run({ scope: "guild", guildId }, () => guild.edit(opts));
    return { configured: Object.keys(opts) };
  });

  // ── WELCOME SCREEN ──
  registry.register({
    name: "setup_welcome_screen",
    description: "Configure Discord's native Welcome Screen that users see on first join",
    inputSchema: zodToJsonSchema(SetupWelcomeScreenInput) as any
  }, async (args, discordClient, limiter) => {
    const { guildId, description, channels } = args as any;
    const guild = await discordClient.getGuild(guildId);
    
    // Enable community features if not already (required for welcome screen)
    try {
      await limiter.run({ scope: "guild", guildId }, () =>
        (guild as any).edit({
          welcomeScreen: {
            enabled: true,
            description,
            welcomeChannels: channels.map((ch: any) => ({
              channelId: ch.channelId,
              description: ch.description,
              emoji: ch.emoji ? (ch.emoji.length <= 2 ? { name: ch.emoji } : { id: ch.emoji }) : undefined
            }))
          }
        })
      );
    } catch (e: any) {
      // Community features may not be enabled — graceful fallback
      return { success: false, error: e.message, hint: "Welcome Screen requires Community Server features to be enabled. Enable via Server Settings > Enable Community." };
    }
    return { success: true, description, channelCount: channels.length };
  });

  // ── WEBHOOKS ──
  registry.register({
    name: "create_webhook",
    description: "Create a webhook in a channel for external integrations (GitHub, CI/CD, etc.)",
    inputSchema: zodToJsonSchema(CreateWebhookInput) as any
  }, async (args, discordClient, limiter) => {
    const { channelId, name, reason } = args as any;
    const client = await discordClient.getClient();
    const channel = await client.channels.fetch(channelId);
    if (!channel || !('createWebhook' in channel)) throw new Error("Channel doesn't support webhooks");
    
    const webhook = await limiter.run({ scope: "global" }, async (): Promise<any> =>
      (channel as any).createWebhook({ name, reason: reason || "GuildForge automation" })
    );
    return {
      id: webhook.id,
      token: webhook.token,
      url: webhook.url,
      hint: `Add this URL to your GitHub repo: Settings > Webhooks > Add webhook > Payload URL: ${webhook.url}`
    };
  });

  // ── SEND EMBED ──
  registry.register({
    name: "send_embed",
    description: "Send a rich embed message to a channel",
    inputSchema: zodToJsonSchema(SendEmbedInput) as any
  }, async (args, discordClient, limiter) => {
    const { channelId, embeds, content } = args as any;
    const client = await discordClient.getClient();
    const channel = await client.channels.fetch(channelId);
    if (!channel || !('send' in channel)) throw new Error("Channel doesn't support messages");
    
    const msg = await limiter.run({ scope: "global" }, async (): Promise<any> =>
      (channel as any).send({ content, embeds })
    );
    return { messageId: msg.id, channelId };
  });

  // ── BOT INVITE PANEL ──
  registry.register({
    name: "post_bot_invite_panel",
    description: "Post a rich embed with one-click bot invite links for the server. Each bot gets its own invite URL with correct granular permissions (never admin).",
    inputSchema: zodToJsonSchema(PostBotInvitePanelInput) as any
  }, async (args, discordClient, limiter) => {
    const { channelId, guildId, botIds, title } = args as any;
    const client = await discordClient.getClient();
    const channel = await client.channels.fetch(channelId);
    if (!channel || !('send' in channel)) throw new Error("Channel doesn't support messages");

    const embeds: any[] = [];
    const essentialBots: any[] = [];
    const optionalBots: any[] = [];

    for (const botId of botIds) {
      const bot = BOT_CATALOG[botId];
      if (!bot) continue;
      const url = generateInviteUrl(botId, guildId)!;
      const entry = { bot, url, botId };
      if (["carl-bot", "dyno", "ticket-tool", "wick", "xenon"].includes(botId)) {
        essentialBots.push(entry);
      } else {
        optionalBots.push(entry);
      }
    }

    if (essentialBots.length > 0) {
      embeds.push({
        title: "🔒 Essential Infrastructure — Install These First",
        description: essentialBots.map(e =>
          `**[${e.bot.name}](${e.url})** — ${e.bot.category}\n${e.bot.description}\n\`\`\`\n${e.bot.setupGuide}\n\`\`\``
        ).join('\n\n'),
        color: 0xe74c3c,
        footer: { text: "⚠️ All bots use granular permissions — never Administrator" }
      });
    }

    if (optionalBots.length > 0) {
      embeds.push({
        title: "⚡ Engagement & Growth — Recommended",
        description: optionalBots.map(e =>
          `**[${e.bot.name}](${e.url})** — ${e.bot.category}\n${e.bot.description}\n\`\`\`\n${e.bot.setupGuide}\n\`\`\``
        ).join('\n\n'),
        color: 0x3498db,
        footer: { text: "These bots drive daily retention and community growth" }
      });
    }

    if (embeds.length === 0) {
      throw new Error("No valid bot IDs provided");
    }

    const msg = await limiter.run({ scope: "global" }, async (): Promise<any> =>
      (channel as any).send({
        content: title || "## 🤖 Bot Setup Panel\nClick each bot name to invite with correct permissions. Follow the setup guide after inviting.",
        embeds
      })
    );

    return {
      messageId: msg.id,
      botsLinked: [...essentialBots, ...optionalBots].map(e => e.botId),
      count: essentialBots.length + optionalBots.length
    };
  });
}

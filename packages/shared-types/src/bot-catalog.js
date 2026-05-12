// Unified bot catalog — shared between MCP server and API agent
// NEVER use permissions=8 (Administrator). All bots get granular least-privilege perms.
export const BOT_CATALOG = [
    {
        botId: "carl-bot",
        name: "Carl-bot",
        clientId: "235148962103951360",
        permissions: "1642824531190",
        description: "Reaction roles, advanced logging, automod, embeds, and custom commands",
        category: "Moderation & Automation",
        features: ["Reaction roles", "Automod", "Welcome messages", "Logging", "Custom commands", "Embeds"],
        setupGuide: "1. Visit carl.gg dashboard\n2. Select your server\n3. Enable Automod, Logging, and Reaction Roles modules"
    },
    {
        botId: "dyno",
        name: "Dyno",
        clientId: "161660517914509312",
        permissions: "470150358",
        description: "Best-in-class audit logging, anti-spam, and heavy-traffic resilience (10.6M servers)",
        category: "Moderation & Logging",
        features: ["Automod", "Action logs", "Custom commands", "Moderation"],
        setupGuide: "1. Visit dyno.gg dashboard\n2. Enable Automod and Action Log\n3. Set log channel to #audit-log"
    },
    {
        botId: "ticket-tool",
        name: "Ticket Tool",
        clientId: "557628352828014614",
        permissions: "326417525840",
        description: "Private ephemeral ticket channels for 1-on-1 support (4.45M servers)",
        category: "Support & Tickets",
        features: ["Ticketing panels", "Transcripts", "Claiming", "Multi-panel"],
        setupGuide: "1. Run /setup in #create-ticket\n2. Configure ticket categories and staff roles\n3. Set transcript channel to #ticket-transcripts"
    },
    {
        botId: "arcane",
        name: "Arcane",
        clientId: "530082442967646230",
        permissions: "268503126",
        description: "XP leveling with voice tracking, role rewards, and leaderboards",
        category: "Engagement & Leveling",
        features: ["XP leveling", "Voice tracking", "Role rewards", "Leaderboards"],
        setupGuide: "1. Visit arcane.bot dashboard\n2. Configure XP rates and level-up roles\n3. Blacklist #bot-commands from XP"
    },
    {
        botId: "wick",
        name: "Wick",
        clientId: "536991182035746816",
        permissions: "2199023255551",
        description: "Anti-nuke protection, anti-raid CAPTCHA, suspicious account quarantine",
        category: "Security",
        features: ["Anti-nuke", "Verification", "Raid protection", "Quarantine"],
        setupGuide: "1. Visit wickbot.com dashboard\n2. Enable Anti-Nuke and Verification\n3. Set quarantine role and whitelist trusted bots"
    },
    {
        botId: "xenon",
        name: "Xenon",
        clientId: "416358583220043796",
        permissions: "2199023255551",
        description: "Full server backup, clone, and restore. Disaster recovery essential.",
        category: "Backup & Recovery",
        features: ["Server backup", "Server clone", "Template sharing", "Scheduled backups"],
        setupGuide: "1. Run /backup create to save server state\n2. Schedule automatic backups\n3. Use /backup load to restore"
    },
    {
        botId: "statbot",
        name: "Statbot",
        clientId: "491769129318088714",
        permissions: "1073743872",
        description: "Deep analytics: member engagement velocity, peak hours, channel activity charts",
        category: "Analytics",
        features: ["Server analytics", "Channel stats", "Member tracking", "Counter channels"],
        setupGuide: "1. Visit statbot.net dashboard\n2. Enable tracking for all channels\n3. Set counter channels if desired"
    },
    {
        botId: "apollo",
        name: "Apollo",
        clientId: "475744554910351370",
        permissions: "335670337",
        description: "Timezone-aware event scheduling with RSVP tracking and DM reminders",
        category: "Events & Scheduling",
        features: ["Event creation", "RSVPs", "DM reminders", "Timezone support"],
        setupGuide: "1. Use /event create to make events\n2. Members RSVP with reactions\n3. Auto-reminders sent via DM"
    },
    {
        botId: "sapphire",
        name: "Sapphire",
        clientId: "398627907818569728",
        permissions: "268633174",
        description: "Free all-rounder: thread management, AI-assisted moderation, social notifications",
        category: "Utility",
        features: ["Thread management", "Social notifications", "Moderation", "No paywall"],
        setupGuide: "1. Visit sapph.xyz dashboard\n2. Enable features as needed\n3. No aggressive paywalls"
    },
    {
        botId: "giveawaybot",
        name: "GiveawayBot",
        clientId: "294882584201003009",
        permissions: "347200",
        description: "Reaction-based giveaways with duration, winners, and re-rolls",
        category: "Engagement",
        features: ["Giveaway creation", "Winner selection", "Re-rolls", "Requirement gating"],
        setupGuide: "1. Use /giveaway start in desired channel\n2. Set prize, duration, and winner count\n3. Bot auto-selects winners"
    },
    {
        botId: "invite-tracker",
        name: "Invite Tracker",
        clientId: "720351927581278219",
        permissions: "268435521",
        description: "Track which invites bring members, detect fake joins, reward recruiters",
        category: "Growth & Analytics",
        features: ["Invite tracking", "Leaderboard", "Fake join detection", "Auto-roles"],
        setupGuide: "1. Bot auto-tracks invite usage\n2. Use /invites to see leaderboard\n3. Set auto-roles for top inviters"
    },
    {
        botId: "jockie-music",
        name: "Jockie Music",
        clientId: "411916947773587456",
        permissions: "36700160",
        description: "Multi-instance music bot (4 separate instances per server). Legal streaming.",
        category: "Music & Audio",
        features: ["Music playback", "Multi-instance", "DJ roles", "Queue management"],
        setupGuide: "1. Invite all 4 instances for multi-channel audio\n2. Use /play in voice channels\n3. Set DJ role for queue control"
    }
];
export function getBotById(botId) {
    return BOT_CATALOG.find(b => b.botId === botId);
}
export function getBotsByCategory(category) {
    return BOT_CATALOG.filter(b => b.category.toLowerCase().includes(category.toLowerCase()));
}
export function generateInviteUrl(botId, guildId) {
    const bot = getBotById(botId);
    if (!bot)
        return null;
    return `https://discord.com/oauth2/authorize?client_id=${bot.clientId}&permissions=${bot.permissions}&scope=bot%20applications.commands&guild_id=${guildId}&disable_guild_select=true`;
}

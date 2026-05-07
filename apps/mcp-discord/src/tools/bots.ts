import { ToolRegistry } from "./index.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { RecommendBotsInput, GenerateBotInviteUrlInput } from "../schemas/guild.js";

const BOT_CATALOG = [
  { id: "carl-bot", clientId: "235148962103951360", category: ["moderation", "automation"], why: "Advanced logging, automod, and reaction roles." },
  { id: "mee6", clientId: "159985870458322944", category: ["leveling", "moderation"], why: "Easy to use leveling system and basic moderation." },
  { id: "dyno", clientId: "161660517914509312", category: ["moderation", "automod"], why: "Powerful web dashboard for server management." },
  { id: "ticket-tool", clientId: "557628352828014614", category: ["tickets"], why: "Industry standard for private support threads." },
  { id: "sesh", clientId: "616754792965865495", category: ["events"], why: "Advanced timezone-aware event scheduling." },
  { id: "statbot", clientId: "491769129318088714", category: ["analytics"], why: "Deep server analytics and activity tracking." },
  { id: "yagpdb", clientId: "204255221017214977", category: ["multipurpose"], why: "Highly customizable automated responses and feeds." },
  { id: "rythm", clientId: "235088799074484224", category: ["music"], why: "High quality music playback for voice channels." },
  { id: "wick", clientId: "536991182035746816", category: ["security"], why: "Anti-nuke, anti-spam, and advanced verification." },
  { id: "arcane", clientId: "530082442967646230", category: ["leveling"], why: "Alternative leveling bot with voice activity XP." }
];

export function registerBotTools(registry: ToolRegistry) {
  registry.register({
    name: "recommend_bots",
    description: "Recommend bots based on guild context",
    inputSchema: zodToJsonSchema(RecommendBotsInput) as any
  }, async (args, discordClient, limiter) => {
    const { guildContext } = args as any;
    const { type, features } = guildContext;
    
    const bots = [];
    if (features.includes("tickets")) bots.push(BOT_CATALOG.find(b => b.id === "ticket-tool"));
    if (features.includes("events")) bots.push(BOT_CATALOG.find(b => b.id === "sesh"));
    if (features.includes("analytics")) bots.push(BOT_CATALOG.find(b => b.id === "statbot"));
    if (features.includes("leveling")) bots.push(BOT_CATALOG.find(b => b.id === "arcane") || BOT_CATALOG.find(b => b.id === "mee6"));
    
    if (!bots.find(b => b?.category.includes("moderation"))) {
      bots.push(BOT_CATALOG.find(b => b.id === "carl-bot"));
    }

    return { bots: bots.filter(Boolean).map(b => ({ id: b!.id, name: b!.id, why: b!.why, clientId: b!.clientId })) };
  });

  registry.register({
    name: "generate_bot_invite_url",
    description: "Generate OAuth invite URL for a bot",
    inputSchema: zodToJsonSchema(GenerateBotInviteUrlInput) as any
  }, async (args, discordClient, limiter) => {
    const { botId, guildId, additionalPermissions } = args as any;
    const bot = BOT_CATALOG.find(b => b.id === botId);
    if (!bot) throw new Error("Unknown bot ID");
    
    const permissions = 8;
    const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${bot.clientId}&permissions=${permissions}&scope=bot%20applications.commands&guild_id=${guildId}&disable_guild_select=true`;
    
    return { inviteUrl, requiredPermissionsExplained: "Administrator permission is requested for maximum functionality. Adjust before accepting if desired." };
  });
}

import { FastifyInstance } from "fastify";
import { env } from "../env";
import { discordAuth } from "../services/discord-oauth";
import { decryptToken, encryptToken } from "../services/crypto";

const MANAGE_GUILD = 0x20;

async function fetchWithTokenRefresh(
  app: FastifyInstance,
  userId: string,
  url: string
): Promise<any[]> {
  const account = await app.prisma.oAuthAccount.findFirst({
    where: { userId, provider: "discord" }
  });
  if (!account) throw new Error("No discord account linked");

  const attempt = await fetch(url, {
    headers: { Authorization: `Bearer ${decryptToken(account.accessToken)}` }
  });

  if (attempt.ok) return attempt.json();

  // Token expired — attempt refresh
  if (attempt.status === 401 && account.refreshToken) {
    try {
      const refreshed = await discordAuth.refreshAccessToken(decryptToken(account.refreshToken));
      const newAccessToken = refreshed.accessToken;
      const newRefreshToken = refreshed.refreshToken ?? account.refreshToken;
      const newExpiry = refreshed.accessTokenExpiresAt ?? null;

      await app.prisma.oAuthAccount.update({
        where: {
          provider_providerUserId: {
            provider: account.provider,
            providerUserId: account.providerUserId
          }
        },
        data: {
          accessToken: encryptToken(newAccessToken),
          refreshToken: newRefreshToken ? encryptToken(newRefreshToken) : account.refreshToken,
          expiresAt: newExpiry
        }
      });

      const retry = await fetch(url, {
        headers: { Authorization: `Bearer ${newAccessToken}` }
      });
      if (!retry.ok) throw new Error("Failed to fetch after token refresh");
      return retry.json();
    } catch (refreshErr) {
      throw new Error("Session expired — please log in again");
    }
  }

  throw new Error("Failed to fetch Discord data");
}

export default async function (app: FastifyInstance) {
  app.addHook("preHandler", async (req, reply) => {
    const sessionId = req.cookies[app.lucia.sessionCookieName];
    if (!sessionId) return reply.status(401).send({ error: "Unauthorized" });
    const { session, user } = await app.lucia.validateSession(sessionId);
    if (!session) {
      reply.clearCookie(app.lucia.sessionCookieName);
      return reply.status(401).send({ error: "Unauthorized" });
    }
    req.user = user;
    req.session = session;
  });

  app.get("/", async (req, reply) => {
    let guilds: any[];
    try {
      guilds = await fetchWithTokenRefresh(
        app,
        req.user!.id,
        "https://discord.com/api/v10/users/@me/guilds"
      );
    } catch (e: any) {
      return reply.status(401).send({ error: e.message });
    }

    const managed = guilds.filter(g => (Number(g.permissions) & MANAGE_GUILD) === MANAGE_GUILD);

    const botRes = await fetch("https://discord.com/api/v10/users/@me/guilds", {
      headers: { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}` }
    });
    let botGuilds = new Set<string>();
    if (botRes.ok) {
      const bGuilds = await botRes.json() as any[];
      botGuilds = new Set(bGuilds.map(g => g.id));
    }

    return managed.map(g => ({
      id: g.id,
      name: g.name,
      icon: g.icon,
      botPresent: botGuilds.has(g.id),
      inviteUrlIfMissing: botGuilds.has(g.id) ? null : `https://discord.com/oauth2/authorize?client_id=${env.DISCORD_CLIENT_ID}&permissions=8&scope=bot%20applications.commands&guild_id=${g.id}&disable_guild_select=true`
    }));
  });


  app.post("/:id/connect", async (req) => {
    const { id } = req.params as { id: string };
    
    const botRes = await fetch("https://discord.com/api/v10/users/@me/guilds", {
      headers: { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}` }
    });
    const bGuilds = await botRes.json() as any[];
    const botGuild = bGuilds.find(g => g.id === id);

    if (!botGuild) {
      return { 
        connected: false, 
        inviteUrl: `https://discord.com/oauth2/authorize?client_id=${env.DISCORD_CLIENT_ID}&permissions=8&scope=bot%20applications.commands&guild_id=${id}&disable_guild_select=true` 
      };
    }

    const guild = await app.prisma.managedGuild.upsert({
      where: { discordGuildId: id },
      update: { guildName: botGuild.name, iconUrl: botGuild.icon },
      create: {
        discordGuildId: id,
        ownerUserId: req.user!.id,
        guildName: botGuild.name,
        iconUrl: botGuild.icon
      }
    });

    return { connected: true, guild };
  });

  app.post("/:id/audit", async (req, reply) => {
    const { id } = req.params as { id: string };

    const { MCPDiscordClient } = await import("../services/mcp");
    const mcpClient = new MCPDiscordClient();
    
    const result = await mcpClient.callTool("get_guild", { guildId: id });

    const structure = (result.content[0] as any).text;

    const { getProvider } = await import("../services/llm");
    const provider = getProvider();
    
    const { z } = await import("zod");
    const recommendationsSchema = z.object({
      recommendations: z.array(z.object({
        description: z.string(),
        rationale: z.string()
      }))
    });

    try {
      const suggestions = await provider.generate({
        systemPrompt: "You are an AI Discord architect. Suggest structural improvements for this guild. E.g. 'Your #off-topic has heavy traffic; consider a slowmode of 5s.'",
        userPrompt: `Current structure:\n${structure}`,
        schema: recommendationsSchema
      });

      // Optionally record the audit in the DB
      await app.prisma.managedGuild.update({
        where: { discordGuildId: id },
        data: { lastAuditAt: new Date() }
      }).catch(() => {});

      return suggestions;
    } catch (e: any) {
      req.log.error(e);
      return reply.status(500).send({ error: "Failed to generate audit" });
    }
  });

  app.get("/:id/bot-status", async (req, reply) => {
    const { id } = req.params as { id: string };
    const guild = await app.prisma.managedGuild.findUnique({
      where: { discordGuildId: id }
    });
    if (!guild) return reply.status(404).send({ error: "Guild not found" });
    return { botSetupStatus: guild.botSetupStatus || {} };
  });

  app.post("/:id/bot-status", async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = req.body as any; // e.g., { "carl-bot": true, "mee6": false }
    
    try {
      const guild = await app.prisma.managedGuild.update({
        where: { discordGuildId: id },
        data: { botSetupStatus: body }
      });
      return { botSetupStatus: guild.botSetupStatus };
    } catch (e) {
      return reply.status(500).send({ error: "Failed to update bot setup status" });
    }
  });
}

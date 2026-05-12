import { FastifyInstance } from "fastify";
import { generateState } from "arctic";
import { discordAuth } from "../../services/discord-oauth";
import { env } from "../../env";
import { encryptToken } from "../../services/crypto";

export default async function (app: FastifyInstance) {
  app.get("/login", async (req, reply) => {
    const state = generateState();
    const url = await discordAuth.createAuthorizationURL(state, {
      scopes: ["identify", "email", "guilds", "guilds.members.read"]
    });

    reply.setCookie("discord_oauth_state", state, {
      path: "/",
      secure: env.API_URL.startsWith("https"),
      httpOnly: true,
      maxAge: 60 * 10,
      sameSite: "lax"
    });

    return reply.redirect(url.toString());
  });

  app.get("/callback", async (req, reply) => {
    const { code, state } = req.query as { code?: string; state?: string };
    const storedState = req.cookies.discord_oauth_state;

    if (!code || !state || !storedState || state !== storedState) {
      return reply.status(400).send({ error: "Invalid state or missing code" });
    }

    try {
      const tokens = await discordAuth.validateAuthorizationCode(code);
      
      const discordUserRes = await fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${tokens.accessToken}` }
      });
      const discordUser = await discordUserRes.json();

      let user = await app.prisma.user.findUnique({
        where: { discordId: discordUser.id }
      });

      if (!user) {
        user = await app.prisma.user.create({
          data: {
            discordId: discordUser.id,
            username: discordUser.username,
            avatar: discordUser.avatar,
            email: discordUser.email
          }
        });
      }

      await app.prisma.oAuthAccount.upsert({
        where: { provider_providerUserId: { provider: "discord", providerUserId: discordUser.id } },
        update: {
          accessToken: encryptToken(tokens.accessToken),
          refreshToken: tokens.refreshToken ? encryptToken(tokens.refreshToken) : null,
          expiresAt: tokens.accessTokenExpiresAt
        },
        create: {
          provider: "discord",
          providerUserId: discordUser.id,
          userId: user.id,
          accessToken: encryptToken(tokens.accessToken),
          refreshToken: tokens.refreshToken ? encryptToken(tokens.refreshToken) : null,
          expiresAt: tokens.accessTokenExpiresAt
        }
      });

      const session = await app.lucia.createSession(user.id, {});
      const sessionCookie = app.lucia.createSessionCookie(session.id);

      reply.setCookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
      return reply.redirect(env.WEB_URL + "/dashboard");
    } catch (e: any) {
      app.log.error(e);
      return reply.status(500).send({ error: "Authentication failed" });
    }
  });
}

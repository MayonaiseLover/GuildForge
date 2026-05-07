import { Discord } from "arctic";
import { env } from "../env";
export const discordAuth = new Discord(env.DISCORD_CLIENT_ID || "dummy", env.DISCORD_CLIENT_SECRET || "dummy", `${env.API_URL}/auth/discord/callback`);

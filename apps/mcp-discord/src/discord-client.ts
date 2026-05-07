import { Client, GatewayIntentBits, Guild } from "discord.js";
import { MCPDiscordError } from "./errors.js";

export class DiscordClient {
  private client: Client;
  private ready: Promise<void>;

  constructor(token: string) {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
      ],
    });
    this.ready = new Promise((resolve, reject) => {
      this.client.once("ready", () => resolve());
      this.client.once("error", reject);
      this.client.login(token).catch(reject);
    });
  }

  async getClient(): Promise<Client> {
    await this.ready;
    return this.client;
  }

  async getGuild(guildId: string): Promise<Guild> {
    const client = await this.getClient();
    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) {
      throw new MCPDiscordError("GUILD_NOT_FOUND", `Guild ${guildId} not found or bot lacks access.`, false);
    }
    return guild;
  }

  async destroy(): Promise<void> {
    await this.client.destroy();
  }
}

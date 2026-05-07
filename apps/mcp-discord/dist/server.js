import {
  DiscordClient,
  RateLimiter,
  registerAllTools
} from "./chunk-W4YRPANE.js";

// src/server.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
async function main() {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    console.error("DISCORD_BOT_TOKEN environment variable is required.");
    process.exit(1);
  }
  const discordClient = new DiscordClient(token);
  const limiter = new RateLimiter();
  const server = new Server({ name: "guildforge-mcp-discord", version: "0.1.0" }, { capabilities: { tools: {} } });
  registerAllTools(server, discordClient, limiter);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("GuildForge Discord MCP Server running on stdio");
}
main().catch(console.error);

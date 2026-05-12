import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAllTools } from "./tools/index.js";
import { DiscordClient } from "./discord-client.js";
import { RateLimiter } from "./ratelimit.js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    console.error("DISCORD_BOT_TOKEN environment variable is required.");
    process.exit(1);
  }

  const discordClient = new DiscordClient(token);
  const limiter = new RateLimiter();
  const server = new Server(
    { name: "guildforge-mcp-discord", version: "0.2.0" },
    { capabilities: { tools: {}, resources: {} } }
  );

  // Register the architecture knowledge base as an MCP resource
  server.setRequestHandler({ method: "resources/list" } as any, async () => ({
    resources: [{
      uri: "guildforge://knowledge/server-architecture-guide",
      name: "Server Architecture Guide",
      description: "Enterprise-grade Discord server architecture rules. Read this BEFORE generating any server. Contains role hierarchy, channel taxonomy, embed templates, bot recommendations, and security protocols.",
      mimeType: "text/markdown"
    }]
  }));

  server.setRequestHandler({ method: "resources/read" } as any, async (request: any) => {
    const { uri } = request.params;
    if (uri === "guildforge://knowledge/server-architecture-guide") {
      const content = readFileSync(resolve(__dirname, "knowledge/server-architecture-guide.md"), "utf-8");
      return { contents: [{ uri, mimeType: "text/markdown", text: content }] };
    }
    throw new Error(`Unknown resource: ${uri}`);
  });

  registerAllTools(server, discordClient, limiter);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error("GuildForge Discord MCP Server v0.2.0 running on stdio");
}

main().catch(console.error);

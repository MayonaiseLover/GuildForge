import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ListToolsRequestSchema, CallToolRequestSchema, Tool } from "@modelcontextprotocol/sdk/types.js";
import { registerGuildTools } from "./guilds.js";
import { registerChannelTools } from "./channels.js";
import { registerRoleTools } from "./roles.js";
import { registerPermissionTools } from "./permissions.js";
import { registerSnapshotTools } from "./snapshots.js";
import { registerBotTools } from "./bots.js";
import { registerTemplateTools } from "./templates.js";
import { registerAutomationTools } from "./automation.js";
import { DiscordClient } from "../discord-client.js";
import { RateLimiter } from "../ratelimit.js";

export type ToolHandler = (args: any, discordClient: DiscordClient, limiter: RateLimiter) => Promise<any>;

export class ToolRegistry {
  public tools: Tool[] = [];
  public handlers: Record<string, ToolHandler> = {};

  register(tool: Tool, handler: ToolHandler) {
    this.tools.push(tool);
    this.handlers[tool.name] = handler;
  }
}

export function registerAllTools(server: Server, discordClient: DiscordClient, limiter: RateLimiter) {
  const registry = new ToolRegistry();

  registerGuildTools(registry);
  registerChannelTools(registry);
  registerRoleTools(registry);
  registerPermissionTools(registry);
  registerSnapshotTools(registry);
  registerBotTools(registry);
  registerTemplateTools(registry);
  registerAutomationTools(registry);

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: registry.tools
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const name = request.params.name;
    const args = request.params.arguments || {};
    const handler = registry.handlers[name];
    
    if (!handler) {
      throw new Error(`Tool not found: ${name}`);
    }

    try {
      const data = await handler(args, discordClient, limiter);
      return {
        content: [{ type: "text", text: JSON.stringify({ ok: true, data }) }],
        isError: false
      };
    } catch (error: any) {
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({ 
            ok: false, 
            error: { 
              code: error.code || "UNKNOWN", 
              message: error.message || String(error), 
              recoverable: error.recoverable || false 
            } 
          }) 
        }],
        isError: true
      };
    }
  });
}

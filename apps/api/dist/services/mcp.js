import { Client } from "@modelcontextprotocol/sdk/client/index";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export class MCPDiscordClient {
    client;
    connected = false;
    transport;
    constructor() {
        this.client = new Client({ name: "GuildForgeAPI", version: "0.1.0" }, { capabilities: {} });
    }
    async connect() {
        if (this.connected)
            return;
        if (process.env.MCP_DISCORD_URL) {
            this.transport = new SSEClientTransport(new URL(process.env.MCP_DISCORD_URL));
        }
        else {
            // Local fallback
            const mcpPath = path.resolve(__dirname, "../../../../mcp-discord/src/index.ts");
            this.transport = new StdioClientTransport({
                command: "npx",
                args: ["tsx", mcpPath],
                env: process.env
            });
        }
        await this.client.connect(this.transport);
        this.connected = true;
    }
    async callTool(name, args) {
        await this.connect();
        const result = await this.client.callTool({ name, arguments: args });
        return result;
    }
    async healthCheck() {
        try {
            await this.connect();
            const tools = await this.client.listTools();
            return tools.tools.length > 0;
        }
        catch (err) {
            return false;
        }
    }
    async disconnect() {
        if (this.connected && this.transport) {
            await this.transport.close();
            this.connected = false;
        }
    }
}

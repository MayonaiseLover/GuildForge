import { Client, Guild } from 'discord.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

declare class DiscordClient {
    private client;
    private ready;
    constructor(token: string);
    getClient(): Promise<Client>;
    getGuild(guildId: string): Promise<Guild>;
    destroy(): Promise<void>;
}

declare class MCPDiscordError extends Error {
    readonly code: string;
    readonly recoverable: boolean;
    constructor(code: string, message: string, recoverable?: boolean);
}

declare class RateLimiter {
    private globalQueue;
    private guildQueues;
    run<T>(options: {
        scope: "global" | "guild";
        guildId?: string;
    }, fn: () => Promise<T>): Promise<T>;
}

type ToolHandler = (args: any, discordClient: DiscordClient, limiter: RateLimiter) => Promise<any>;
declare class ToolRegistry {
    tools: Tool[];
    handlers: Record<string, ToolHandler>;
    register(tool: Tool, handler: ToolHandler): void;
}
declare function registerAllTools(server: Server, discordClient: DiscordClient, limiter: RateLimiter): void;

export { DiscordClient, MCPDiscordError, RateLimiter, type ToolHandler, ToolRegistry, registerAllTools };

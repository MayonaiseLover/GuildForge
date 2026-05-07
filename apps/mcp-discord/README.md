# @guildforge/mcp-discord

A standalone Model Context Protocol (MCP) server that empowers AI agents to autonomously build and manage Discord servers. 

This package is part of the [GuildForge](https://github.com/guildforge/guildforge) project but operates entirely on its own. You can plug it into Claude Desktop, Cursor, Cline, or any other MCP-compatible client to give your AI full control over Discord.

## Features

- **Channel Management:** Create, delete, and modify categories, text channels, voice channels, and forums.
- **Role Hierarchy:** Architect roles, manage hoisted colors, and assign permissions.
- **Granular Permissions:** Modify channel-specific overrides instantly.
- **Invite Generation:** Create permanent or temporary invites to specific channels.
- **Bot Integrations:** Check bot invite links and statuses.
- **Reversible Actions:** Snapshots and rollback capabilities to undo unwanted changes.

## Quickstart

Add it directly to your MCP client! All you need is a Discord Bot Token (`DISCORD_BOT_TOKEN`) with proper intents enabled (Server Members, Message Content) and Administrative privileges.

### Claude Desktop Configuration

Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "guildforge-discord": {
      "command": "npx",
      "args": ["-y", "@guildforge/mcp-discord"],
      "env": {
        "DISCORD_BOT_TOKEN": "your-secure-discord-bot-token"
      }
    }
  }
}
```

## Available Tools

The server exposes the following MCP tools to the AI:

- `list_user_guilds`: List guilds the bot is in
- `get_guild`: Get full guild structure
- `create_category`: Create a category
- `create_text_channel`: Create a text channel
- `create_voice_channel`: Create a voice channel
- `create_role`: Create a role
- `update_permissions`: Update channel permissions
- `delete_channel`: Delete a channel
- `delete_role`: Delete a role
- `generate_invite`: Generate an invite link for a specific channel
- `take_snapshot`: Capture current state for rollback

## Learn More

This MCP server is the core engine behind [GuildForge.dev](https://guildforge.dev) — "Describe your Discord server. Get it built in 60 seconds."

- [Source Code (GitHub)](https://github.com/guildforge/guildforge)
- [Model Context Protocol](https://modelcontextprotocol.io/)

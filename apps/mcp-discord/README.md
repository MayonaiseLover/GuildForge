# @guildforge/mcp-discord

Standalone MCP (Model Context Protocol) server that exposes 25+ Discord API operations as LLM tool calls. Works with any MCP-compatible client: Claude Desktop, Cursor, Cline, or the GuildForge web app.

## Quick Start

```bash
# Run directly with npx
DISCORD_BOT_TOKEN=your_token npx @guildforge/mcp-discord

# Or install globally
npm install -g @guildforge/mcp-discord
guildforge-mcp
```

### Claude Desktop Configuration

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "discord": {
      "command": "npx",
      "args": ["@guildforge/mcp-discord"],
      "env": {
        "DISCORD_BOT_TOKEN": "your_bot_token"
      }
    }
  }
}
```

## Available Tools

### Channel Management
| Tool | Description |
|------|-------------|
| `create_category` | Create a channel category |
| `create_text_channel` | Create a text channel with topic, slowmode, NSFW |
| `create_voice_channel` | Create a voice channel with user limit and bitrate |
| `create_forum_channel` | Create a forum with tags, guidelines, sort order, layout |
| `create_stage_channel` | Create a stage channel |
| `create_announcement_channel` | Create an announcement channel |
| `create_forum_post` | Create a thread/post inside a forum channel |
| `update_channel` | Update channel properties |
| `delete_channel` | Delete a channel |
| `move_channel` | Move a channel to a different position/category |
| `list_channels` | List all channels in a guild |

### Role Management
| Tool | Description |
|------|-------------|
| `create_role` | Create a role with color, permissions, hoist |
| `delete_role` | Delete a role |
| `reorder_roles` | Reorder role hierarchy |

### Permissions
| Tool | Description |
|------|-------------|
| `add_channel_permission_overwrite` | Set permission overwrites on a channel |

### Server Management
| Tool | Description |
|------|-------------|
| `configure_server` | Set verification level, content filter, notifications |
| `setup_welcome_screen` | Configure Discord's native welcome screen |
| `set_guild_branding` | Set server icon, banner, name, description |

### Automation
| Tool | Description |
|------|-------------|
| `configure_automod` | Create AutoMod rules (keyword, spam, preset) |
| `create_webhook` | Create webhooks for external integrations |
| `send_embed` | Send rich embed messages |
| `post_bot_invite_panel` | Post bot invite panels with granular permissions |

### Templates
| Tool | Description |
|------|-------------|
| `create_ticket_panel` | Create a full ticket system with support role |
| `create_verification_gate` | Create verification gate with roles and channel |
| `create_welcome_flow` | Create welcome channel with rich embed |
| `create_self_assignable_roles` | Create reaction-role channel |

### Snapshots
| Tool | Description |
|------|-------------|
| `snapshot_guild` | Save current server state for rollback |
| `restore_snapshot` | Restore server from a snapshot |

## Bot Catalog

The server includes a curated catalog of 12 bots with **granular permissions** (never Administrator):

- **Carl-bot** — Reaction roles, automod, logging
- **Dyno** — Audit logging, anti-spam
- **Ticket Tool** — Private support tickets
- **Wick** — Anti-nuke protection
- **Xenon** — Server backup/restore
- **Arcane** — XP leveling
- **Statbot** — Analytics
- **Apollo** — Event scheduling
- **GiveawayBot** — Reaction giveaways
- **Invite Tracker** — Invite analytics
- **Jockie Music** — Multi-instance music

## Rate Limiting

Built-in rate limiter respects Discord's API limits:
- Per-guild bucket (30 req/60s)
- Global bucket (50 req/s)
- Automatic retry with exponential backoff

## License

MIT

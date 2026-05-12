# Getting Started with GuildForge

This guide walks you through setting up GuildForge from scratch — whether you're using the hosted web app or the standalone MCP server.

---

## Option A: Use the Web App (Easiest)

1. Go to [guildforge.dev](https://guildforge.dev)
2. Click **Start Building Free**
3. Log in with your Discord account
4. Select a server from the dropdown (your bot must be invited — see below)
5. Describe the server you want, or use the guided form
6. Review the generated Preview Tree
7. Click **Deploy** — done!

---

## Option B: Use the MCP Server (For AI Power Users)

The MCP server lets you control Discord directly from Claude Desktop, Cursor, or Cline.

### Step 1: Create a Discord Bot

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Click **New Application** → name it (e.g., "GuildForge Bot")
3. Go to the **Bot** tab
4. Click **Reset Token** → copy your bot token somewhere safe
5. Scroll down and enable these **Privileged Gateway Intents**:
   - ✅ Server Members Intent
   - ✅ Message Content Intent
6. Click **Save Changes**

### Step 2: Invite the Bot to Your Server

1. Go to the **OAuth2** tab → **URL Generator**
2. Under **Scopes**, check `bot`
3. Under **Bot Permissions**, check `Administrator`
4. Copy the generated URL and open it in your browser
5. Select the server you want to manage → **Authorize**

> ⚠️ The bot needs Administrator permissions to create channels, roles, and set permissions.

### Step 3: Configure the MCP Server

Add this to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "guildforge-discord": {
      "command": "npx",
      "args": ["-y", "@guildforge/mcp-discord"],
      "env": {
        "DISCORD_BOT_TOKEN": "paste-your-bot-token-here"
      }
    }
  }
}
```

**For Cursor:** Go to Settings → MCP → Add Server → use the same config above.

**For Cline:** Add to your MCP server list in the Cline settings panel.

### Step 4: Start Building

Open Claude Desktop (or your MCP client) and try:

> "List my Discord servers"

Then:

> "Build a professional community server for my open-source Python project called PureFrame. It needs support channels, a development section, media-type discussion channels, voice channels, and proper role hierarchy with Admin, Moderator, Contributor, and Community roles."

The AI will use GuildForge's MCP tools to:
- Create categories and channels
- Set up roles with proper colors and hierarchy
- Configure permissions (read-only channels, staff-only areas)
- Send welcome and rules embeds
- Generate a permanent invite link

---

## Option C: Self-Host the Full Stack

See the [Self-Hosting Guide](./self-hosting.md) for Docker Compose setup with PostgreSQL, Redis, and the Next.js frontend.

---

## Available MCP Tools

Once the MCP server is running, your AI agent can use these tools:

| Tool | Description |
|------|-------------|
| `list_user_guilds` | List all servers the bot is in |
| `get_guild` | Get full server structure (categories, channels, roles) |
| `create_category` | Create a channel category |
| `create_text_channel` | Create a text channel inside a category |
| `create_voice_channel` | Create a voice channel |
| `create_role` | Create a role with color and permissions |
| `update_permissions` | Set channel-specific permission overrides |
| `delete_channel` | Remove a channel |
| `delete_role` | Remove a role |
| `generate_invite` | Create a permanent or temporary invite link |
| `take_snapshot` | Capture current server state for rollback |

---

## Tips

- **Start with a test server.** Create a throwaway Discord server to experiment before deploying to your real community.
- **Use snapshots.** Run `take_snapshot` before major changes so you can roll back.
- **Be specific in your prompts.** Instead of "make a gaming server", try: "Build a competitive Valorant team server with 5 team voice channels, a scrim-scheduling text channel, VOD review channel, and roles for IGL, Duelist, Controller, Sentinel, and Initiator."
- **Iterate with chat.** After the initial build, say things like "make the Contributor role mentionable" or "add a #memes channel to the Community category."

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Bot won't come online | Check your `DISCORD_BOT_TOKEN` is correct and not expired |
| "Missing Permissions" errors | Make sure the bot has Administrator permission in the server |
| "Used disallowed intents" | Enable Server Members + Message Content intents in the Developer Portal |
| Channels created but no permissions | The bot's role must be higher than the roles it's trying to manage |
| MCP server not detected | Restart your MCP client after editing the config file |

---

## Example: What GuildForge Built for PureFrame

We used GuildForge to build the official [PureFrame Community Discord](https://discord.gg/fY7vqVk2bd) — an open-source AI video censorship tool.

**Prompt used:**
> "Build a professional community server for PureFrame, an open-source Python AI tool that blurs explicit content in video files. Include support channels for installation and usage, a development section for contributors, media-type channels matching PureFrame's content profiles (live-action, anime, animation, low-light), voice channels, and a staff area."

**Result (deployed in ~15 seconds):**
- 📋 INFORMATION — 5 read-only channels (welcome, rules, announcements, changelog, roadmap)
- 💬 COMMUNITY — 4 channels (general-chat, introductions, showcase, off-topic)
- 🛠️ SUPPORT — 4 channels (installation-help, usage-questions, bug-reports, false-positives)
- 👨‍💻 DEVELOPMENT — 5 channels (contributing, architecture, ci-cd, feature-requests, github-feed)
- 🎬 MEDIA TYPES — 4 channels (live-action, anime, animation, low-light)
- 🔊 VOICE — 3 voice channels
- 🔒 STAFF — 3 locked channels
- 🎨 5 roles with color-coded hierarchy

**[Join the PureFrame Discord →](https://discord.gg/fY7vqVk2bd)**

<div align="center">
  <h1>⚔️ GuildForge</h1>
  <p><b>Describe your Discord server. Get it built in 60 seconds.</b></p>
  <br />
  <a href="https://github.com/guildforge/guildforge/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" /></a>
  <a href="https://github.com/guildforge/guildforge/actions"><img src="https://img.shields.io/github/actions/workflow/status/guildforge/guildforge/ci.yml?branch=main" alt="CI" /></a>
  <a href="https://github.com/guildforge/guildforge/stargazers"><img src="https://img.shields.io/github/stars/guildforge/guildforge?style=social" alt="Stars" /></a>
</div>

---

## What is GuildForge?

GuildForge is an **AI-powered Discord server architect** that converts natural language descriptions into fully-built, enterprise-grade Discord communities — complete with channels, forums, roles, permissions, AutoMod rules, rich embeds, webhooks, and bot recommendations.

**One prompt. 60 seconds. Production-ready server.**

### What you get:
- 🏗️ **Smart Architecture** — Categories, channels, forums with tags & guidelines, voice rooms
- 🛡️ **Native Security** — AutoMod rules, verification gates, content filters — no bots needed
- 🎨 **Rich Embeds** — Welcome messages, rules, contributing guides, ticket systems
- 🤖 **Bot Ecosystem** — 12-bot catalog with granular permissions (never admin) and 1-click invites
- 🔗 **Webhook Integration** — GitHub, CI/CD, changelog feeds pre-configured
- 📋 **Forum Seeding** — Bug report templates, quick start guides, documentation posted automatically
- 🔄 **Full Rollback** — Snapshot before any changes, one-click revert

---

## 🏗️ Architecture

GuildForge is a monorepo with three main components:

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (Next.js)                                     │
│  Landing page → Dashboard → Preview Tree → Deploy       │
└────────────────────┬────────────────────────────────────┘
                     │ REST + SSE
┌────────────────────┴────────────────────────────────────┐
│  API (Fastify)                                          │
│  OAuth → Agent (Claude) → Plan → Validate → Execute     │
└────────────────────┬────────────────────────────────────┘
                     │ MCP Protocol
┌────────────────────┴────────────────────────────────────┐
│  MCP Server (@guildforge/mcp-discord)                   │
│  20+ Discord API tools: channels, roles, forums,        │
│  automod, webhooks, embeds, snapshots, bot panels       │
└─────────────────────────────────────────────────────────┘
```

- **Standalone MCP Server**: `@guildforge/mcp-discord` is a published npm package that allows AI agents (Claude Desktop, Cursor, Cline) to interact directly with the Discord API as tool calls.
- **Backend (Fastify)**: High-performance API that orchestrates BuildPlan schemas using Claude, managing user sessions, and executing server builds safely with SSE streaming.
- **Frontend (Next.js)**: Reactive dashboard with Preview Tree so users can visually inspect the AI's plan before deploying.

---

## 📦 Standalone MCP Package

Use our MCP server independently from the web app:

```bash
npx @guildforge/mcp-discord
```

Available tools: `create_category`, `create_text_channel`, `create_voice_channel`, `create_forum_channel`, `create_role`, `update_permissions`, `configure_automod`, `create_webhook`, `send_embed`, `post_bot_invite_panel`, `snapshot_guild`, `restore_snapshot`, and more.

See the [MCP Package README](apps/mcp-discord/README.md) for full docs.

---

## 🚀 Use Cases

| Prompt | Result | Time |
|--------|--------|------|
| "An NFT community with verification gates and holder-only alpha channels" | 14 channels, 8 roles, verification gate, AutoMod | ~38s |
| "A competitive gaming server with locked team voice channels and LFG" | 18 channels, 6 voice rooms, team roles | ~42s |
| "A software dev community with GitHub webhooks and tech-stack roles" | 22 channels, 3 forums, webhooks, 14 embeds | ~51s |
| "A college study group with channels for Math, Physics, and CS" | 11 channels, subject roles, study voice rooms | ~29s |

---

## 🛠️ Quick Install (Self-Hosted)

### Prerequisites
- Node.js 20+
- pnpm 9+
- PostgreSQL 16+ (or Docker)
- Discord Bot Token ([create one](https://discord.com/developers/applications))
- Anthropic API Key ([get one](https://console.anthropic.com/))

### Setup

```bash
# Clone
git clone https://github.com/guildforge/guildforge.git
cd guildforge

# Install
pnpm install

# Environment
cp .env.example .env
# Fill in all required vars — see .env.example for descriptions
# Critical: SESSION_SECRET must be ≥32 chars (used for cookie signing AND OAuth token encryption at rest)

# Start database
docker compose up -d db

# Run migrations
npx prisma migrate deploy

# Run all services
pnpm dev
# API → http://localhost:3001
# Web → http://localhost:3000
```

### Production (Docker Compose)

```bash
git clone https://github.com/guildforge/guildforge.git
cd guildforge
cp .env.example .env.prod
# Edit .env.prod with real secrets
docker compose --env-file .env.prod up -d
# API auto-runs prisma migrate deploy before starting
```

**Required environment variables:**

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | ≥32-char random string — used for cookie signing **and** AES-256-GCM OAuth token encryption |
| `DISCORD_CLIENT_ID` | OAuth app client ID |
| `DISCORD_CLIENT_SECRET` | OAuth app client secret |
| `DISCORD_BOT_TOKEN` | Bot token (Administrator permission required) |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `API_URL` | Public API URL (e.g. `https://api.yourdomain.com`) |
| `WEB_URL` | Public web URL (e.g. `https://yourdomain.com`) |
| `NEXT_PUBLIC_API_URL` | Same as API_URL — injected into Next.js client bundle |

---

## 🗺️ Roadmap

- [x] Phase 1: Standalone Discord MCP Server (20+ tools)
- [x] Phase 2: OAuth & Core Backend
- [x] Phase 3: Build Plan Orchestration (Claude agent)
- [x] Phase 4: Frontend Preview Tree
- [x] Phase 5: Agentic Iteration (chat refinement)
- [x] Phase 6: Reactive Deployment Engine (SSE streaming)
- [x] Phase 7: Enterprise Features (forums, AutoMod, webhooks, embeds)
- [x] Phase 8: Community Templates (share & discover server configs)
- [x] Phase 9: Server Analytics Dashboard

---

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) to get started.

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

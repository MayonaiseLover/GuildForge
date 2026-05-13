<div align="center">
  <img src="assets/logo.png" alt="GuildForge" width="120" height="120" />
  <h1>GuildForge</h1>
  <p><strong>AI-Powered Discord Server Architect</strong></p>
  <p>Describe your community. Deploy it in 60 seconds.</p>

  <br />

  <a href="https://github.com/MayonaiseLover/GuildForge/actions/workflows/ci.yml"><img src="https://github.com/MayonaiseLover/GuildForge/actions/workflows/ci.yml/badge.svg?branch=master" alt="CI" /></a>
  <a href="https://github.com/MayonaiseLover/GuildForge/blob/master/LICENSE"><img src="https://img.shields.io/github/license/MayonaiseLover/GuildForge?color=6366f1&label=License" alt="License" /></a>
  <a href="https://github.com/MayonaiseLover/GuildForge/stargazers"><img src="https://img.shields.io/github/stars/MayonaiseLover/GuildForge?style=flat&color=8b5cf6&label=Stars" alt="Stars" /></a>
  <a href="https://github.com/MayonaiseLover/GuildForge"><img src="https://img.shields.io/github/languages/code-size/MayonaiseLover/GuildForge?color=6366f1&label=Code%20Size" alt="Code Size" /></a>
  <a href="https://github.com/MayonaiseLover/GuildForge/commits/master"><img src="https://img.shields.io/github/last-commit/MayonaiseLover/GuildForge?color=8b5cf6&label=Last%20Commit" alt="Last Commit" /></a>
  <img src="https://img.shields.io/badge/API%20Docs-Swagger-85EA2D?logo=swagger" alt="API Docs" />
  <img src="https://img.shields.io/badge/Security-Hardened-2ea44f?logo=shield" alt="Security" />

  <br /><br />

  <img src="assets/banner.png" alt="GuildForge Banner" width="800" />
</div>

<br />

## ✨ What is GuildForge?

GuildForge is an **enterprise-grade Discord infrastructure tool** that converts natural language prompts into fully-deployed, production-ready Discord servers — complete with channels, forums, roles, permissions, AutoMod rules, webhooks, embeds, and bot integrations.

> *"Build me a developer community with GitHub integration, tech-stack roles, and a Q&A forum."*
>
> **→ 22 channels, 3 forums, 14 embeds, GitHub webhooks — deployed in 51 seconds.**

<br />

<div align="center">
  <img src="assets/demo.png" alt="GuildForge Demo" width="800" />
  <br />
  <sub>Preview Tree + AI Chat — inspect every channel, role, and permission before deploying</sub>
</div>

<br />

## 🎯 Key Features

<table>
<tr>
<td width="50%">

### 🏗️ Smart Architecture
Categories, text/voice/forum channels with tags & guidelines — all generated from a single prompt

### 🛡️ Native Security
AutoMod rules, verification gates, content filters — built into Discord, no third-party bots needed

### 🤖 Bot Ecosystem
12-bot catalog with **granular permissions** (never admin) and one-click invite panels

</td>
<td width="50%">

### 🎨 Rich Content
Welcome embeds, rules, contributing guides, ticket systems — posted automatically on deploy

### 🔗 Webhook Integration
GitHub, CI/CD, changelog feeds pre-configured with correct payloads and target channels

### 🔄 Full Rollback
Snapshot your entire server state before changes — one-click revert if anything goes wrong

</td>
</tr>
</table>

## ⚡ Use Cases

| Prompt | What Gets Built | Time |
|--------|----------------|------|
| *"An NFT community with verification gates and holder-only alpha channels"* | 14 channels · 8 roles · verification gate · AutoMod | ~38s |
| *"A competitive gaming server with locked team voice channels and LFG"* | 18 channels · 6 voice rooms · team roles | ~42s |
| *"A software dev community with GitHub webhooks and tech-stack roles"* | 22 channels · 3 forums · webhooks · 14 embeds | ~51s |
| *"A college study group with channels for Math, Physics, and CS"* | 11 channels · subject roles · study voice rooms | ~29s |

<br />

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (Next.js 14)                                      │
│  Landing · Dashboard · Preview Tree · Deploy · Templates    │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST + SSE
┌──────────────────────────┴──────────────────────────────────┐
│  API (Fastify)                                              │
│  OAuth → LLM Engine → Plan → Validate → Execute            │
│  Teams · Billing · Monitoring · Templates · Conversations   │
└──────────────────────────┬──────────────────────────────────┘
                           │ Model Context Protocol
┌──────────────────────────┴──────────────────────────────────┐
│  MCP Server (@guildforge/mcp-discord)                       │
│  20+ tools: channels, roles, forums, automod, webhooks,     │
│  embeds, snapshots, bot panels, templates                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│  Multi-LLM Provider Registry                                │
│  Anthropic · OpenAI · Gemini · Groq · Grok · DeepSeek       │
│  Hot-swap providers via env config — zero code changes       │
└─────────────────────────────────────────────────────────────┘
```

| Layer | Tech | Purpose |
|-------|------|---------|
| **Frontend** | Next.js 16, React 19, Framer Motion, Tailwind CSS | Dashboard, Preview Tree, real-time deploy, billing, monitoring |
| **API** | Fastify, Prisma, PostgreSQL, Lucia Auth | Agent orchestration, SSE streaming, teams, health monitoring |
| **LLM Engine** | Anthropic, OpenAI, Gemini, Groq, Grok, DeepSeek | Multi-provider registry with structured output + tool calling |
| **MCP Server** | discord.js 14, Zod, MCP SDK | Standalone Discord API as LLM-callable tools |
| **Shared** | Turborepo, pnpm workspaces, Vitest | Monorepo orchestration, shared schemas, testing |

<br />

## 📦 Standalone MCP Package

Use the Discord MCP server independently — works with **Claude Desktop**, **Cursor**, **Cline**, and any MCP-compatible client:

```bash
npx @guildforge/mcp-discord
```

<details>
<summary><strong>Available Tools (20+)</strong></summary>

| Tool | Description |
|------|-------------|
| `create_category` | Create a channel category with position & permissions |
| `create_text_channel` | Text channel with topic, slowmode, NSFW settings |
| `create_voice_channel` | Voice channel with bitrate & user limits |
| `create_forum_channel` | Forum with tags, guidelines, default reactions |
| `create_role` | Role with color, permissions, hoist & mentionable |
| `update_permissions` | Fine-grained permission overwrites per role/channel |
| `configure_automod` | Keyword filters, spam protection, mention limits |
| `setup_welcome_screen` | Welcome screen with channel descriptions & emoji |
| `configure_server` | Server-level settings (verification, content filter) |
| `create_webhook` | Webhook for external integrations (GitHub, CI/CD) |
| `send_embed` | Rich embed messages with fields, colors, thumbnails |
| `post_bot_invite_panel` | Bot catalog with permission-scoped invite links |
| `snapshot_guild` | Capture full server state for rollback |
| `restore_snapshot` | Restore server to a previous snapshot |
| `create_forum_post` | Seed forums with starter content |

</details>

<br />

## 🚀 Quick Start

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 20+ |
| pnpm | 9+ |
| PostgreSQL | 16+ (or Docker) |
| [Discord Bot Token](https://discord.com/developers/applications) | with server members intent |
| `ANTHROPIC_API_KEY` | ⚡ | Anthropic Claude (default provider) |
| `OPENAI_API_KEY` | | OpenAI GPT-4o |
| `GEMINI_API_KEY` | | Google Gemini |
| `GROQ_API_KEY` | | Groq (ultra-fast inference) |
| `GROK_API_KEY` | | xAI Grok |
| `DEEPSEEK_API_KEY` | | DeepSeek |
| `LLM_PROVIDER` | | Default provider: `anthropic` \| `openai` \| `gemini` \| `groq` \| `grok` \| `deepseek` |

### Installation

```bash
# Clone
git clone https://github.com/MayonaiseLover/GuildForge.git
cd GuildForge

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials (see table below)

# Start database
docker compose up -d db

# Run migrations
npx prisma migrate deploy

# Launch all services
pnpm dev
```

| Service | URL |
|---------|-----|
| Web Dashboard | `http://localhost:3000` |
| API Server | `http://localhost:3001` |

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `SESSION_SECRET` | ✅ | ≥32-char random string — cookie signing + AES-256-GCM token encryption |
| `DISCORD_CLIENT_ID` | ✅ | OAuth application client ID |
| `DISCORD_CLIENT_SECRET` | ✅ | OAuth application client secret |
| `DISCORD_BOT_TOKEN` | ✅ | Bot token with Administrator permission |
| `ANTHROPIC_API_KEY` | ✅ | Anthropic API key for Claude |
| `API_URL` | ✅ | Public API URL (e.g. `https://api.yourdomain.com`) |
| `WEB_URL` | ✅ | Public web URL (e.g. `https://yourdomain.com`) |
| `NEXT_PUBLIC_API_URL` | ✅ | Same as `API_URL` — injected into Next.js client |

### Production Deployment

```bash
cp .env.example .env.prod
# Edit .env.prod with production secrets

docker compose --env-file .env.prod up -d
# API auto-runs prisma migrate deploy on startup
```

<br />

## 📁 Project Structure

```
GuildForge/
├── apps/
│   ├── web/                    # Next.js 14 frontend
│   │   ├── src/app/            # App Router pages
│   │   ├── src/components/     # React components (PreviewTree, ChatPanel, etc.)
│   │   └── src/lib/            # Shared utilities & pricing data
│   ├── api/                    # Fastify backend
│   │   ├── src/routes/         # REST endpoints (auth, plans, guilds, templates)
│   │   ├── src/services/       # Agent orchestrator, LLM, MCP client
│   │   └── prisma/             # Database schema & migrations
│   └── mcp-discord/            # Standalone MCP server
│       ├── src/tools/          # Discord API tool implementations
│       ├── src/schemas/        # Zod validation schemas
│       └── src/knowledge/      # Server architecture knowledge base
├── packages/
│   ├── plan-schema/            # Shared BuildPlan Zod schemas
│   └── shared-types/           # Bot catalog type definitions
├── prisma/                     # Database migrations
├── assets/                     # Brand assets (logo, banner, demo)
└── docs/                       # Documentation
```

<br />

## 🗺️ Roadmap

- [x] **Phase 1** — Standalone Discord MCP Server (20+ tools)
- [x] **Phase 2** — Discord OAuth & Session Management
- [x] **Phase 3** — AI Build Plan Orchestration (Claude agent)
- [x] **Phase 4** — Interactive Preview Tree
- [x] **Phase 5** — Agentic Chat Refinement
- [x] **Phase 6** — Reactive Deployment Engine (SSE streaming)
- [x] **Phase 7** — Enterprise Features (forums, AutoMod, webhooks, embeds)
- [x] **Phase 8** — Community Template Gallery
- [x] **Phase 9** — Server Analytics Dashboard
- [ ] **Phase 10** — Stripe Billing Integration (planned)
- [x] **Phase 11** — Team Workspaces & Collaboration
- [x] **Phase 12** — Server Health Monitoring & Alerts
- [x] **Multi-LLM** — Provider Registry (6 providers, hot-swap)

<br />

## 🧪 CI Pipeline

All checks pass on every commit:

```
✅ Tests       15/15 passed (API: 10, MCP: 5)
✅ TypeScript   0 errors (strict mode)
✅ ESLint       0 errors, 0 warnings
✅ Build        4/4 packages compile successfully
```

<br />

## 🤝 Contributing

We welcome contributions of all sizes. Please read our **[Contributing Guide](CONTRIBUTING.md)** to get started.

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

<br />

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

<br />

<div align="center">
  <sub>Built with ⚔️ by <a href="https://github.com/MayonaiseLover">MayonaiseLover</a></sub>
  <br />
  <sub>Powered by Claude · GPT-4o · Gemini · Groq · Discord.js · Next.js · Fastify</sub>
  <br /><br />
  <a href="CODE_OF_CONDUCT.md">Code of Conduct</a> · <a href="SECURITY.md">Security</a> · <a href="ACKNOWLEDGMENTS.md">Acknowledgments</a>
</div>

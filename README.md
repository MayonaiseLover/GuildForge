<div align="center">
  <img src="https://raw.githubusercontent.com/guildforge/guildforge/main/assets/logo.png" alt="GuildForge Logo" width="200" />
  <h1>GuildForge</h1>
  <p><b>Describe your Discord server. Get it built in 60 seconds.</b></p>
  <br />
  <a href="#live-demo"><img src="https://img.shields.io/badge/Live%20Demo-Active-success" alt="Live Demo" /></a>
  <a href="https://www.npmjs.com/package/@guildforge/mcp-discord"><img src="https://img.shields.io/npm/v/@guildforge/mcp-discord" alt="NPM Version" /></a>
  <a href="https://github.com/guildforge/guildforge/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" /></a>
</div>

---

## ⚡ Live Demo

See GuildForge in action! Watch the AI convert a plain text description into a fully built Discord architecture, right before your eyes.

[**Launch Live Demo**](https://guildforge.dev)

*Check out our 10-second speedrun demonstrating the build flow:*  
*(Screen recording placeholder)*

---

## 🏗️ Architecture

GuildForge operates as a monorepo containing a full-stack web application alongside a standalone **Model Context Protocol (MCP)** server.

- **Standalone MCP Server**: `@guildforge/mcp-discord` is a published npm package that allows AI agents (like Claude Desktop, Cursor, or Cline) to interact directly with the Discord API. This exposes Discord management as LLM tool calls.
- **Backend (Fastify)**: A high-performance API that orchestrates the BuildPlan schemas using Anthropic's Claude 4.5 Sonnet, managing user sessions, and executing server builds safely.
- **Frontend (Next.js)**: A reactive Next.js App Router providing a "Preview Tree" so users can visually inspect the AI's plan before hitting deploy.

---

## 📦 Standalone MCP Package

Are you building an AI agent and need it to control Discord? You can use our MCP server completely independently from the GuildForge web app!

```bash
# Add it directly to your MCP client config:
npx @guildforge/mcp-discord
```

*See the [MCP Package README](apps/mcp-discord/README.md) for full usage instructions.*

---

## 🚀 Use Cases

1. **The NFT Community Setup**: Describe "An NFT community with verification gates, alpha channels, and strict mod-only announcement rooms" and GuildForge will provision the categories, role hierarchies, and channel overrides instantly.
2. **The E-Sports Team**: "Set up a competitive gaming server with locked team voice channels, an LFG text channel, and an invite to Carl-bot for reaction roles."
3. **Study Group Hub**: "A college study server with specific text channels for Math, Physics, and CS, with an onboarding area to pick majors."

---

## 🛠️ Quick Install (Self-Hosted)

GuildForge is open-source and easy to host yourself. Check out our [Self-Hosting Guide](docs/self-hosting.md) for a comprehensive walkthrough.

### One-Liner (Docker Compose)
```bash
git clone https://github.com/guildforge/guildforge.git
cd guildforge
docker compose up -d
```

### One-Click Deploy
*(Deployment buttons placeholder - Vercel / Railway / Fly.io)*

---

## 🗺️ Roadmap

- [x] Phase 1: Standalone Discord MCP Server
- [x] Phase 2: OAuth & Core Backend
- [x] Phase 3: Build Plan Orchestration
- [x] Phase 4: Frontend Preview Tree
- [x] Phase 5: Agentic Iteration
- [x] Phase 6: Reactive Deployment Engine
- [x] Phase 7: Bot Integration Tracking
- [ ] Phase 8: Community Templates

---

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guide](CONTRIBUTING.md) to learn how to submit pull requests, report bugs, or suggest new features.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

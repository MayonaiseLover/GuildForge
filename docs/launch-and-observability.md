# GuildForge Launch Sequence & Marketing Plan

This document outlines the organized launch sequence for GuildForge to maximize exposure within the AI-agent and Discord community builder ecosystems.

## Objective
Establish GuildForge as the premiere AI Discord architect, while simultaneously making `@guildforge/mcp-discord` the standard package for MCP-based Discord automation.

## 1. Soft Launch: Reddit Communities
- **r/discordapp:** "I built an AI that generates a full Discord server in 60 seconds." Include the live demo link (`https://guildforge.dev`) and a sped-up screen recording of a complex server (e.g., an NFT server) being built from a single prompt.
- **r/SelfHosted:** "Show r/SelfHosted: GuildForge — Open-source AI Discord architect." Emphasize the docker-compose setup and the fact that it doesn't phone home.

## 2. Developer Launch: Hacker News
- **Title:** `Show HN: GuildForge — Describe a Discord server, get it built by an AI agent`
- **Body:** Focus on the architectural decision to decouple the AI agent into a standalone Model Context Protocol (MCP) server. Explain how this allows the same engine to be used in Claude Desktop, Cursor, and the web app. Emphasize the Fastify + Next.js App Router monorepo architecture.

## 3. Mainstream Tech Launch: Product Hunt
- Provide a highly curated 1-minute demo video.
- **First Comment (Maker):** Tell the story of how setting up Discord servers takes hours of tedious role/permission clicking, and how GuildForge condenses this into seconds using Claude 4.5 Sonnet.

## 4. Ecosystem Integration: Twitter / X
- Create a detailed thread aimed at AI-agent developers.
- "We just open-sourced our entire Discord MCP server. If you want your AI agents to control Discord, you can now do it with one line: `npx @guildforge/mcp-discord`."
- Tag relevant figures in the AI agent space (e.g., Anthropic devrel, MCP advocates).

## 5. Creator Outreach
- Identify top YouTube creators in the "Discord Tips / Design" niche.
- Offer them free access to the `Studio` tier to experiment with generating organic servers vs AI servers.
- Provide them with pre-configured prompts that showcase the power of the `bot_recommendation` and `auto-setup` features.

## 6. MCP Directories
- Submit `@guildforge/mcp-discord` to:
  - Official [ModelContextProtocol/servers](https://github.com/modelcontextprotocol/servers) repository.
  - Awesome-MCP lists.
  - VS Code / Cursor extension community forums.
  - Cline MCP directory.

---

## Observability & Metrics Setup

As part of the production readiness (Phase 8), the following observability tools should be configured in your environment:

### 1. Per-Build Cost Tracking
- All calls to Anthropic's Claude 4.5 Sonnet should log the `usage.input_tokens` and `usage.output_tokens`.
- In the database, the `BuildPlan` or `ManagedGuild` model records the LLM cost to enforce usage limits per tier.

### 2. Error Tracking
- Integrate **Sentry** across the Next.js frontend and Fastify backend.
- Catch and alert on any `DiscordAPIError` thrown by the MCP server to quickly identify rate-limit issues or permission errors.

### 3. Analytics
- Integrate **PostHog** or **Plausible** into the Next.js frontend to track:
  - Conversion rate of Landing Page -> Discord OAuth Login.
  - Number of prompts submitted per user.
  - Most common themes/genres requested by users.

### 4. Status Page
- Set up a `/status` endpoint returning the health of:
  - PostgreSQL database connection.
  - Redis connection.
  - Fastify API uptime.
- Connect this to an external ping service (like UptimeRobot) for public visibility.

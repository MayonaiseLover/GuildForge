# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-05-13

### Added
- **Multi-LLM Engine** — Pluggable provider architecture supporting Anthropic, OpenAI, Gemini, Groq, Grok, and DeepSeek with hot-swappable configuration.
- **MCP Discord Server** — Model Context Protocol server for Discord operations: guilds, channels, roles, bots, permissions, templates, snapshots, and automation.
- **AI Agent Orchestrator** — Conversational AI agent that generates and executes Discord server build plans with rollback support.
- **Plan Schema** — Shared Zod-based validation schema for server build plans across API and web.
- **Community Templates** — Server template marketplace with star ratings, categories, and one-click deployment.
- **Analytics Dashboard** — Build tracking, guild-level metrics, and operation success rates.
- **Team Workspaces (Phase 11)** — Multi-user teams with RBAC (owner/admin/member/viewer), invite system, and shared guild management.
- **Server Health Monitoring (Phase 12)** — Guild health checks, alert rules, and notification channels.
- **Billing Infrastructure (Phase 10)** — Plan definitions and subscription model (Stripe integration pending).
- **Security** — AES-256-GCM token encryption, Lucia session management, rate limiting, CORS, Helmet security headers.
- **Docker Compose** — Full production stack with PostgreSQL, API, MCP bot, and Next.js web app.
- **CI/CD Pipeline** — GitHub Actions with lint, typecheck, test, and build stages.
- **Governance** — CODE_OF_CONDUCT.md, SECURITY.md, CONTRIBUTING.md, ACKNOWLEDGMENTS.md.

### Security
- OAuth tokens encrypted at rest with AES-256-GCM (PBKDF2 key derivation).
- Team invite tokens use `crypto.randomBytes(32)` instead of predictable CUIDs.
- Production guard on SESSION_SECRET — encryption cannot be silently disabled.
- Security headers via `@fastify/helmet`.
- Global rate limiting (120 req/min) with per-IP keying.

## [Unreleased]

### Planned
- Stripe Checkout and Customer Portal integration.
- Real Discord API health data (replacing simulation mode).
- Alert delivery via webhooks and Discord DM notifications.
- OpenAPI/Swagger documentation.
- Frontend test suite and coverage reporting.

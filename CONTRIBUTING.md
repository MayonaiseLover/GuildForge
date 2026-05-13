# Contributing to GuildForge

Thanks for your interest in contributing! GuildForge is the AI-powered Discord server architect, and we welcome contributions from the community.

## Prerequisites

- **Node.js** 20+
- **pnpm** 9+ (`npm i -g pnpm`)
- **Docker** (for PostgreSQL + Redis)
- **Discord Application** ([Discord Developer Portal](https://discord.com/developers/applications))

## Quick Start

```bash
# Clone the repo
git clone https://github.com/MayonaiseLover/GuildForge.git
cd GuildForge

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Fill in your Discord bot token, API keys, etc.

# Start database
docker compose up -d

# Generate Prisma client + run migrations
pnpm prisma generate
pnpm prisma db push

# Start development servers
pnpm dev    # API (3001) + Web (3000)
```

## Project Structure

```
GuildForge/
├── apps/
│   ├── api/            # Fastify backend — agent orchestration, OAuth, SSE
│   ├── mcp-discord/    # Standalone MCP server — Discord API as LLM tool calls
│   └── web/            # Next.js frontend — landing page, dashboard, preview tree
├── packages/
│   ├── plan-schema/    # Zod schemas for BuildPlan (shared between api & web)
│   ├── shared-types/   # Shared TypeScript types and bot catalog
│   └── ui/             # Shared UI components (shadcn/ui based)
├── prisma/             # Database schema and migrations
└── turbo.json          # Turborepo build pipeline config
```

## Development Workflow

1. **Find an issue** — Check [GitHub Issues](https://github.com/MayonaiseLover/GuildForge/issues) for `good first issue` or `help wanted` labels
2. **Fork & branch** — Create a feature branch from `master`: `git checkout -b feat/my-feature`
3. **Write tests** — Add tests in the relevant `tests/` directory
4. **Make changes** — Keep changes focused and well-documented
5. **Verify locally** — Run the full CI check: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`
6. **Update CHANGELOG** — Add your changes under `[Unreleased]`
7. **Open a PR** — Use the PR template and link related issues

## Running Tests

```bash
# Run all tests across the monorepo
pnpm test

# Run tests for a specific package
cd apps/api && pnpm vitest run

# Watch mode
cd apps/api && pnpm vitest

# With coverage report
cd apps/api && pnpm vitest run --coverage
```

### Test Structure
- **Unit tests**: `tests/crypto.test.ts`, `tests/llm-registry.test.ts`
- **Auth tests**: `tests/auth-hook.test.ts`
- **Route integration tests**: `tests/routes.test.ts` (uses Fastify `inject()`)
- **Agent tests**: `tests/agent/*.test.ts`

## Architecture Decisions

### Authentication
- **Lucia v3** for session management (cookie-based)
- **Discord OAuth2** for identity provider
- Shared `requireAuth()` hook in `src/hooks/auth.ts` — **never copy-paste auth logic inline**

### LLM Providers
- Registry pattern in `src/services/llm/`
- Supports: Anthropic, OpenAI, Google Gemini, Groq, Grok, DeepSeek
- Add new providers by implementing the `LLMProvider` interface

### API Design
- All routes under `src/routes/`
- Rate limiting on expensive AI endpoints
- Use typed API client (`apps/web/src/lib/api.ts`) for frontend API calls

### Database
- **Prisma** ORM with PostgreSQL
- Schema in `prisma/schema.prisma`
- Run `pnpm prisma generate` after schema changes

## Security

> [!IMPORTANT]
> Security is taken seriously. Please follow these rules.

- **Never commit `.env` files** — they are in `.gitignore`
- Use `crypto.randomBytes()` for tokens, not `cuid()` or `uuid()`
- `SESSION_SECRET` is **required** in production — the app will crash without it
- All new routes must use the shared auth hook
- Report vulnerabilities privately to: security@guildforge.dev

## Code Style

- **TypeScript** with strict mode for all packages
- **ESLint + Prettier** for formatting (configured in repo)
- **Zod** for runtime validation of all external inputs
- **Fastify** plugins for backend features
- **React Server Components** preferred in the frontend
- Comments only where logic is non-obvious
- Functional style preferred over class-based

## Areas for Contribution

### MCP Server (`apps/mcp-discord/`)
- New Discord API tools (thread management, scheduled events, stage channels)
- Better rate limiting strategies
- Integration tests with Discord API mocks

### Agent Intelligence (`apps/api/src/services/agent/`)
- New server type templates in `prompts.ts`
- Better plan validation rules in `validate.ts`
- More sophisticated plan patching in `patch.ts`

### Frontend (`apps/web/`)
- Dashboard improvements (guild cards, analytics)
- Preview tree enhancements (drag-and-drop reordering)
- Mobile responsive design improvements

### Community Templates
- Pre-built server configurations for common use cases
- Template sharing and discovery system

## Reporting Bugs

Include:
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)
- Screenshots if applicable

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

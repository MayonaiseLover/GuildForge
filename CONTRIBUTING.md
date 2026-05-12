# Contributing to GuildForge

Thanks for your interest in contributing! GuildForge is the AI-powered Discord server architect, and we welcome contributions from the community.

## Quick Start

```bash
# Clone the repo
git clone https://github.com/guildforge/guildforge.git
cd guildforge

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Fill in your Discord bot token, Anthropic API key, etc.

# Start database
docker compose up -d

# Run Prisma migrations
pnpm --filter api exec prisma migrate dev

# Start development servers
pnpm dev
```

## Project Structure

```
guildforge/
├── apps/
│   ├── api/          # Fastify backend — agent orchestration, OAuth, SSE execution
│   ├── mcp-discord/  # Standalone MCP server — Discord API as LLM tool calls
│   └── web/          # Next.js frontend — landing page, dashboard, preview tree
├── packages/
│   ├── plan-schema/  # Zod schemas for BuildPlan (shared between api & web)
│   ├── shared-types/ # Shared TypeScript types and bot catalog
│   └── ui/           # Shared UI components (shadcn/ui based)
├── prisma/           # Database schema and migrations
└── docs/             # Documentation
```

## Development Workflow

1. **Find an issue** — Check [GitHub Issues](https://github.com/guildforge/guildforge/issues) for `good first issue` or `help wanted` labels
2. **Fork & branch** — Create a feature branch from `main`: `git checkout -b feat/my-feature`
3. **Write tests** — Add tests in the relevant `tests/` directory
4. **Make changes** — Keep changes focused and well-documented
5. **Lint & test** — Run `pnpm lint && pnpm test` before committing
6. **Open a PR** — Use the PR template and link related issues

## Code Style

- **TypeScript** with strict mode for all packages
- **ESLint + Prettier** for formatting (configured in repo)
- **Zod** for runtime validation of all external inputs
- **Fastify** plugins for backend features
- **React Server Components** preferred in the frontend

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

Use the [Bug Report template](https://github.com/guildforge/guildforge/issues/new?template=bug_report.yml) and include:
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)
- Screenshots if applicable

## Code of Conduct

Be respectful, constructive, and professional. We're here to build cool stuff.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

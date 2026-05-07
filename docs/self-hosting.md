# Self-Hosting GuildForge

GuildForge is designed to be easily self-hostable. Below you'll find the complete walkthrough to set up the Discord application, configure your databases, and deploy the stack.

## 1. Discord Application Setup

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click **New Application** and give it a name (e.g., "GuildForge").
3. Go to the **Bot** tab:
   - Click **Add Bot**.
   - Under **Privileged Gateway Intents**, enable **Server Members Intent** and **Message Content Intent**.
   - Copy the **Token** (keep this secret, do not expose it to the frontend).
4. Go to the **OAuth2** tab:
   - Copy the **Client ID** and **Client Secret**.
   - Under **Redirects**, add `http://localhost:3001/auth/discord/callback` (for local development) and your production URL (e.g., `https://api.yourdomain.com/auth/discord/callback`).

## 2. Required Scopes and Permissions

When generating an invite link for your bot, you need the following scopes:
- `bot`
- `applications.commands`

**Required Bot Permissions:**
- Administrator (Recommended for a server-architect bot to create channels, roles, manage webhooks, etc.)

## 3. Database Setup (Postgres + Redis)

GuildForge requires **PostgreSQL** (for relational data like users, guilds, and build plans) and **Redis** (for rate limiting and job queues).

You can run these locally via Docker:
```bash
docker run -d --name guildforge-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:15
docker run -d --name guildforge-redis -p 6379:6379 redis:7
```

## 4. Environment Configuration

Create a `.env` file in the root directory (or in `apps/api/.env` depending on your setup) with the following values:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/guildforge?schema=public"
REDIS_URL="redis://localhost:6379"

# Discord Credentials
DISCORD_CLIENT_ID="your_client_id"
DISCORD_CLIENT_SECRET="your_client_secret"
DISCORD_BOT_TOKEN="your_bot_token"
DISCORD_REDIRECT_URI="http://localhost:3001/auth/discord/callback"

# LLM Provider (Anthropic)
ANTHROPIC_API_KEY="sk-ant-..."

# App URLs
FRONTEND_URL="http://localhost:3000"
```

## 5. Running the Application

### Development
For local development, install dependencies and run the development servers using `turbo`:

```bash
pnpm install
pnpm prisma generate
pnpm prisma db push
pnpm dev
```
This will start:
- Frontend (Next.js) on `http://localhost:3000`
- Backend (Fastify) on `http://localhost:3001`

### Production (Docker Compose)
For production, you can use the provided `docker-compose.yml` (if available) or create a customized setup. Ensure that you have properly built the Next.js and Fastify apps.

```bash
docker compose up -d --build
```

## 6. SSL + Domain Setup Notes

- **Reverse Proxy**: We recommend using Nginx or Caddy as a reverse proxy in front of the Fastify API and Next.js frontend.
- **Caddy Example**:
  ```Caddyfile
  yourdomain.com {
    reverse_proxy localhost:3000
  }
  api.yourdomain.com {
    reverse_proxy localhost:3001
  }
  ```
- Make sure to update `FRONTEND_URL` and `DISCORD_REDIRECT_URI` in your `.env` to use `https://`.

## 7. Production Hardening Checklist

- [ ] Ensure `DISCORD_BOT_TOKEN` and `ANTHROPIC_API_KEY` are kept strictly server-side.
- [ ] Disable Prisma Studio (`pnpm prisma studio`) in production.
- [ ] Configure Redis with a strong password and restrict access.
- [ ] Use `trustProxy: true` in Fastify if running behind a reverse proxy (Nginx/Caddy) for accurate rate limiting.
- [ ] Enable Sentry or another error tracking tool for observability.
- [ ] Monitor LLM usage costs using custom metrics or PostHog/Plausible analytics.

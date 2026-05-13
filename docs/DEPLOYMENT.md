# GuildForge — Deployment Guide

> Production deployment instructions for Railway, Fly.io, and bare-metal/VPS.

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 20+ |
| pnpm | 11+ |
| PostgreSQL | 14+ |
| Docker (optional) | 24+ |

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/guildforge` |
| `SESSION_SECRET` | 32+ char random string for session signing | `openssl rand -hex 32` |
| `DISCORD_CLIENT_ID` | Discord OAuth2 application ID | `1234567890` |
| `DISCORD_CLIENT_SECRET` | Discord OAuth2 secret | `abc...xyz` |
| `DISCORD_BOT_TOKEN` | Bot token for DM alerts + server management | `Bot MTIz...` |
| `WEB_URL` | Public URL of the frontend (CORS origin) | `https://guildforge.app` |
| `API_URL` | Public URL of the API | `https://api.guildforge.app` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Anthropic Claude for plan generation | — |
| `OPENAI_API_KEY` | OpenAI GPT fallback provider | — |
| `SENTRY_DSN` | Error tracking (Sentry) | — (logs to stderr) |
| `LOG_LEVEL` | Pino log level | `info` |
| `NODE_ENV` | Runtime environment | `production` |
| `PORT` | API server port | `3001` |

---

## Option 1: Railway (Recommended)

Railway handles builds, scaling, and Postgres provisioning automatically.

### Steps

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login and init
railway login
railway init

# 3. Add PostgreSQL
railway add -p postgresql

# 4. Set environment variables
railway variables set SESSION_SECRET=$(openssl rand -hex 32)
railway variables set DISCORD_CLIENT_ID=your_id
railway variables set DISCORD_CLIENT_SECRET=your_secret
railway variables set DISCORD_BOT_TOKEN=your_token
railway variables set WEB_URL=https://your-app.up.railway.app
railway variables set API_URL=https://your-api.up.railway.app

# 5. Deploy API
cd apps/api
railway up --service api

# 6. Deploy Web
cd ../web
railway up --service web
```

### Railway Config (railway.toml)

```toml
[build]
builder = "dockerfile"

[deploy]
healthcheckPath = "/health"
restartPolicyType = "on-failure"
restartPolicyMaxRetries = 3
```

---

## Option 2: Fly.io

### API Deployment

```bash
# 1. Install flyctl
curl -L https://fly.io/install.sh | sh

# 2. Create app
fly launch --name guildforge-api --region iad --no-deploy

# 3. Create Postgres cluster
fly postgres create --name guildforge-db --region iad --vm-size shared-cpu-1x

# 4. Attach database
fly postgres attach --app guildforge-api guildforge-db

# 5. Set secrets
fly secrets set \
  SESSION_SECRET=$(openssl rand -hex 32) \
  DISCORD_CLIENT_ID=your_id \
  DISCORD_CLIENT_SECRET=your_secret \
  DISCORD_BOT_TOKEN=your_token \
  WEB_URL=https://guildforge-web.fly.dev \
  --app guildforge-api

# 6. Deploy
fly deploy --app guildforge-api --dockerfile apps/api/Dockerfile
```

### fly.toml (API)

```toml
app = "guildforge-api"
primary_region = "iad"

[build]
  dockerfile = "apps/api/Dockerfile"

[http_service]
  internal_port = 3001
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1

  [http_service.concurrency]
    type = "connections"
    hard_limit = 250
    soft_limit = 200

[[services.http_checks]]
  interval = "15s"
  timeout = "5s"
  path = "/health"
```

### Web Deployment

```bash
fly launch --name guildforge-web --region iad --no-deploy
fly secrets set API_URL=https://guildforge-api.fly.dev --app guildforge-web
fly deploy --app guildforge-web --dockerfile apps/web/Dockerfile
```

---

## Option 3: VPS / Bare Metal (Docker Compose)

### docker-compose.yml

```yaml
version: "3.8"

services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: guildforge
      POSTGRES_USER: guildforge
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U guildforge"]
      interval: 10s
      timeout: 5s
      retries: 3

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://guildforge:${DB_PASSWORD}@db:5432/guildforge
      SESSION_SECRET: ${SESSION_SECRET}
      DISCORD_CLIENT_ID: ${DISCORD_CLIENT_ID}
      DISCORD_CLIENT_SECRET: ${DISCORD_CLIENT_SECRET}
      DISCORD_BOT_TOKEN: ${DISCORD_BOT_TOKEN}
      WEB_URL: ${WEB_URL}
      NODE_ENV: production
    depends_on:
      db:
        condition: service_healthy

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://api:3001
      NODE_ENV: production
    depends_on:
      - api

volumes:
  pgdata:
```

### Deploy

```bash
# 1. Create .env
cat > .env << EOF
DB_PASSWORD=$(openssl rand -hex 16)
SESSION_SECRET=$(openssl rand -hex 32)
DISCORD_CLIENT_ID=your_id
DISCORD_CLIENT_SECRET=your_secret
DISCORD_BOT_TOKEN=your_token
WEB_URL=https://your-domain.com
EOF

# 2. Run migrations
docker compose run --rm api npx prisma migrate deploy

# 3. Start services
docker compose up -d

# 4. Verify
curl http://localhost:3001/health
```

---

## Database Migrations

```bash
# Generate migration from schema changes
npx prisma migrate dev --name your_migration_name

# Apply pending migrations in production
npx prisma migrate deploy

# Check migration status
npx prisma migrate status
```

---

## Monitoring

### Prometheus Scrape Config

```yaml
scrape_configs:
  - job_name: "guildforge-api"
    scrape_interval: 15s
    static_configs:
      - targets: ["api:3001"]
    metrics_path: /metrics
```

### Available Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `http_requests_total` | counter | Total requests by method/route/status |
| `http_request_duration_seconds` | histogram | Request latency (P50/P90/P99) |
| `process_resident_memory_bytes` | gauge | RSS memory |
| `process_heap_used_bytes` | gauge | V8 heap usage |
| `process_uptime_seconds` | gauge | Process uptime |

### Health Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /health` | Full health check (DB connectivity, memory, uptime) |
| `GET /metrics` | Prometheus-compatible metrics |
| `GET /status` | Simple liveness probe |

---

## SSL / Reverse Proxy (Nginx)

```nginx
server {
    listen 443 ssl http2;
    server_name guildforge.app;

    ssl_certificate /etc/letsencrypt/live/guildforge.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/guildforge.app/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }
}
```

---

## Checklist

- [ ] PostgreSQL provisioned and `DATABASE_URL` set
- [ ] `npx prisma migrate deploy` run successfully
- [ ] All required environment variables set
- [ ] Discord OAuth redirect URI updated to production URL
- [ ] CORS origin (`WEB_URL`) matches actual frontend domain
- [ ] Health check passing (`/health` returns 200)
- [ ] Metrics endpoint accessible (`/metrics`)
- [ ] SSL/TLS configured for both web and API
- [ ] Rate limiting verified (120 req/min default)
- [ ] Error tracking configured (Sentry DSN or stderr)

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

# ── Dependencies ──────────────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY apps/api/package.json ./apps/api/
COPY apps/mcp-discord/package.json ./apps/mcp-discord/
COPY prisma/ ./prisma/

RUN pnpm install --frozen-lockfile --filter @guildforge/api... --filter @guildforge/plan-schema

# ── Build ─────────────────────────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /app

COPY tsconfig.base.json ./
COPY apps/api/ ./apps/api/
COPY apps/mcp-discord/ ./apps/mcp-discord/
COPY packages/ ./packages/

# Generate Prisma client and compile TypeScript
RUN cd apps/api && pnpm exec prisma generate && pnpm build

# ── Runtime ───────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Non-root user for security
RUN addgroup --system --gid 1001 guildforge && \
    adduser --system --uid 1001 guildforge

# Copy built artifacts and runtime deps
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

# Prisma schema needed for migrate at runtime
COPY prisma/ ./prisma/

# Set ownership
RUN chown -R guildforge:guildforge /app

USER guildforge

EXPOSE 3001

# Run migrations then start — DATABASE_URL must be provided at runtime
CMD ["sh", "-c", "npx prisma migrate deploy --schema=/app/prisma/schema.prisma && node apps/api/dist/index.js"]

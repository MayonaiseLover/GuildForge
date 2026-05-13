FROM node:20-alpine AS builder
WORKDIR /app

# Use corepack for pnpm (no npm install -g)
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/mcp-discord/package.json ./apps/mcp-discord/

# Install only mcp-discord deps
RUN pnpm install --filter @guildforge/mcp-discord --frozen-lockfile

# Copy source
COPY apps/mcp-discord ./apps/mcp-discord
COPY tsconfig.base.json ./

# Build
RUN pnpm --filter @guildforge/mcp-discord build

# ── Runtime ──────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Non-root user
RUN addgroup --system --gid 1001 mcp && \
    adduser --system --uid 1001 mcp

COPY --from=builder /app/apps/mcp-discord/dist ./dist
COPY --from=builder /app/apps/mcp-discord/package.json ./
COPY --from=builder /app/node_modules ./node_modules

RUN chown -R mcp:mcp /app

USER mcp

CMD ["node", "dist/index.js"]

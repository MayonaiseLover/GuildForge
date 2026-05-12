FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9

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
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/apps/mcp-discord/dist ./dist
COPY --from=builder /app/apps/mcp-discord/package.json ./
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]

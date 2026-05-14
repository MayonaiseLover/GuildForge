FROM node:22-slim AS base
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# ── Install dependencies ──────────────────────────────────────────────────────
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY packages/ packages/
RUN pnpm install --frozen-lockfile --filter @guildforge/api...

# ── Build ─────────────────────────────────────────────────────────────────────
FROM deps AS build
COPY tsconfig.base.json ./
COPY prisma/ prisma/
COPY packages/ packages/
COPY apps/api/ apps/api/
RUN pnpm --filter @guildforge/plan-schema build
RUN pnpm --filter @guildforge/shared-types build 2>/dev/null || true
RUN cd apps/api && npx prisma generate --schema=../../prisma/schema.prisma

# ── Production ────────────────────────────────────────────────────────────────
# Use tsx at runtime — tsc doesn't add .js extensions for ESM resolution.
# tsx handles TypeScript + ESM natively with near-zero overhead.
FROM base AS runner
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/apps/api/src ./apps/api/src
COPY --from=build /app/apps/api/package.json ./apps/api/
COPY --from=build /app/apps/api/tsconfig.json ./apps/api/
COPY --from=build /app/packages ./packages
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./
COPY --from=build /app/tsconfig.base.json ./

COPY apps/api/docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3001
ENTRYPOINT ["/entrypoint.sh"]

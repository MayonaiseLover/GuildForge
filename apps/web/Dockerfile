FROM node:20-alpine AS base
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY apps/web/package.json ./apps/web/

# Install deps
RUN pnpm install --frozen-lockfile --filter @guildforge/web... --filter @guildforge/plan-schema

# Copy source
COPY apps/web/ ./apps/web/

# Build Next.js
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN pnpm --filter @guildforge/web build

EXPOSE 3000

ENV NODE_ENV=production
CMD ["pnpm", "--filter", "@guildforge/web", "start"]

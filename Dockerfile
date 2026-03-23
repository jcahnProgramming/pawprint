FROM node:20-alpine AS base

# Install dependencies needed for texture extraction
RUN apk add --no-cache python3 curl unzip bash

WORKDIR /app

# ── Dependency stage ──────────────────────────────────────────────────────────
FROM base AS deps

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# ── Texture download stage ────────────────────────────────────────────────────
FROM base AS textures

WORKDIR /app
COPY scripts/download-textures.sh ./scripts/
RUN chmod +x ./scripts/download-textures.sh
RUN ./scripts/download-textures.sh

# ── Build stage ───────────────────────────────────────────────────────────────
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY --from=textures /app/public/textures ./public/textures

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Production stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3010

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3010

CMD ["node", "server.js"]
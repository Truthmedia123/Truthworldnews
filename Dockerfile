# Dockerfile for twn-nextjs (Next.js 16 standalone output)
#
# Multi-stage build:
#   Stage 1 (deps):    Install npm dependencies (cached layer)
#   Stage 2 (builder): Build Next.js with standalone output
#   Stage 3 (runner):  Minimal runtime image
#
# Target: linux/arm64 (Oracle Cloud A1, the user's host)
# Image size target: <200 MB
#
# References:
# - https://nextjs.org/docs/app/api-reference/next-config-js/output
# - v5.7 stack spec (TWN-FINAL-STACK-v5.md)

# ── Stage 1: Dependencies ──────────────────────────────────────────────────
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy lockfile + package.json first for cache
COPY package.json package-lock.json* ./
RUN npm ci --include=dev

# ── Stage 2: Builder ───────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars (no secrets — those are runtime)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build with standalone output
# Note: NEXT_PUBLIC_* vars can be passed here if needed for static optimization
RUN npm run build

# ── Stage 3: Runner ────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Install openssl (needed by jose for JWT) + tini (PID 1 / signal handling)
RUN apk add --no-cache openssl tini

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build (Next.js outputs to .next/standalone)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy the uuid-slug-map.json (built by the migration script, used by /article?id= redirect)
COPY --from=builder --chown=nextjs:nodejs /app/scripts/uuid-slug-map.json ./scripts/uuid-slug-map.json

# Switch to non-root
USER nextjs

# Expose port (matches docker-compose)
EXPOSE 3000

# Set port env var
ENV PORT=3000
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Use tini as PID 1 for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start Next.js standalone server
CMD ["node", "server.js"]

# ── Health check ───────────────────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

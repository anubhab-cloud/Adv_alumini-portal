# ──────────────────────────────────────────────────────────────────────────────
# Stage 1 — deps
# Install only production dependencies so they can be cached independently.
# ──────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine
# for why libc6-compat may be needed.
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy lock files first for better layer caching
COPY package.json package-lock.json ./

RUN npm ci --omit=dev


# ──────────────────────────────────────────────────────────────────────────────
# Stage 2 — builder
# Build the Next.js application in standalone mode.
# ──────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy all deps (including devDeps needed for build)
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source
COPY . .

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build — output: 'standalone' must be set in next.config.ts
RUN npm run build


# ──────────────────────────────────────────────────────────────────────────────
# Stage 3 — runner  (final slim image ~150 MB)
# ──────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copy only what Next.js standalone output needs
COPY --from=builder /app/public          ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static    ./.next/static

# Correct ownership so the non-root user can write cache
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use the standalone server entrypoint
CMD ["node", "server.js"]

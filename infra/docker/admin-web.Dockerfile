# Multi-stage build for admin-web (Next.js)
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Install dependencies only when needed
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm install --production --legacy-peer-deps && \
    npm cache clean --force

# Build dependencies
FROM base AS builder-deps
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
COPY --from=builder-deps /app/node_modules ./node_modules
COPY . .

# Build admin-web with standalone output
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npx nx build admin-web --prod

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3010
ENV HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir -p /app/.next && \
    chown -R nextjs:nodejs /app

# Copy necessary files
COPY --from=builder --chown=nextjs:nodejs /app/dist/apps/admin-web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/dist/apps/admin-web/.next/static ./apps/admin-web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin-web/public ./apps/admin-web/public

USER nextjs

EXPOSE 3010

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3010', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "apps/admin-web/server.js"]

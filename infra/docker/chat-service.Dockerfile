# Multi-stage build for chat-service
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat dumb-init

# Install production dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm install --production --legacy-peer-deps && \
    npm cache clean --force

# Install all dependencies for build
FROM base AS builder-deps
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Build stage
FROM base AS builder
COPY --from=builder-deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
RUN npx nx build chat-service --prod

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache dumb-init

ENV NODE_ENV=production
ENV PORT=3007

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 chatservice && \
    chown -R chatservice:nodejs /app

# Copy built application
COPY --from=builder --chown=chatservice:nodejs /app/apps/services/chat-service/dist ./dist
COPY --from=deps --chown=chatservice:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=chatservice:nodejs /app/package.json ./

USER chatservice

EXPOSE 3007

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3007/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["dumb-init", "node", "dist/main.js"]

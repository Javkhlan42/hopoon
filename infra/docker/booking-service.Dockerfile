# Multi-stage build for booking-service
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
RUN npx nx build booking-service --prod

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache dumb-init

ENV NODE_ENV=production
ENV PORT=3003

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 bookingservice && \
    chown -R bookingservice:nodejs /app

# Copy built application
COPY --from=builder --chown=bookingservice:nodejs /app/apps/services/booking-service/dist ./dist
COPY --from=deps --chown=bookingservice:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=bookingservice:nodejs /app/package.json ./

USER bookingservice

EXPOSE 3003

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3003/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["dumb-init", "node", "dist/main.js"]

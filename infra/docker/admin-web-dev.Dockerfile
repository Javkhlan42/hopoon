# Optimized admin-web build
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Install dependencies
FROM base AS deps
WORKDIR /app/apps/admin-web
COPY apps/admin-web/package*.json ./
RUN npm install --legacy-peer-deps --no-audit --no-fund --prefer-offline --progress=false

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/apps/admin-web/node_modules ./apps/admin-web/node_modules
COPY apps/admin-web ./apps/admin-web

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NODE_ENV=production

WORKDIR /app/apps/admin-web
RUN npm run build

# Run application
FROM base AS runner
WORKDIR /app/apps/admin-web
ENV NODE_ENV=production
ENV PORT=3100
ENV HOSTNAME="0.0.0.0"

COPY --from=builder /app/apps/admin-web/.next ./.next
COPY --from=builder /app/apps/admin-web/node_modules ./node_modules
COPY --from=builder /app/apps/admin-web/package.json ./package.json

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

EXPOSE 3100

CMD ["npm", "start"]

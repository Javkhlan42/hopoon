FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build -- hop-on

# Production
FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/dist/apps/hop-on/.next ./.next
COPY --from=builder /app/apps/hop-on/public ./public
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/apps/hop-on/package.json ./package.json
EXPOSE 4200
CMD ["npm", "start"]

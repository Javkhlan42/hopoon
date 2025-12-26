# Fast development build for admin-web
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Install dependencies
FROM base AS deps
COPY package.json package-lock.json nx.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/admin-web ./apps/admin-web
RUN --mount=type=cache,target=/root/.npm \
    npm install --legacy-peer-deps

# Development runtime
FROM base AS runner
WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NODE_ENV=development
ENV PORT=3010
ENV HOSTNAME="0.0.0.0"

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/nx.json ./nx.json
COPY --from=deps /app/tsconfig.base.json ./tsconfig.base.json
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/apps/admin-web ./apps/admin-web

EXPOSE 3010

# Run in dev mode (much faster)
CMD ["npx", "nx", "serve", "admin-web", "--host", "0.0.0.0", "--port", "3010"]

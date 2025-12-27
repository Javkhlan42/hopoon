# Fast development build for admin-web
FROM node:20-alpine AS base
WORKDIR /app/apps/admin-web
RUN apk add --no-cache libc6-compat

# Copy only admin-web files
COPY apps/admin-web/package.json apps/admin-web/package-lock.json* ./

# Install dependencies with cache
RUN --mount=type=cache,target=/root/.npm \
    npm ci --legacy-peer-deps --omit=optional 2>/dev/null || npm install --legacy-peer-deps --omit=optional

# Copy app source
COPY apps/admin-web .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NODE_ENV=development
ENV PORT=3100
ENV HOSTNAME="0.0.0.0"

EXPOSE 3100

CMD ["npm", "run", "dev"]

# Simple development build for admin-web
FROM node:20-alpine
WORKDIR /app/apps/admin-web
RUN apk add --no-cache libc6-compat

# Copy package files
COPY apps/admin-web/package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Copy application source
COPY apps/admin-web .

# Environment variables
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NODE_ENV=development
ENV PORT=3100
ENV HOSTNAME="0.0.0.0"

EXPOSE 3100

CMD ["npm", "run", "dev"]

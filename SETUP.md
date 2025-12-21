# HopOn Development Setup

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 13+ with PostGIS (or use Docker)
- Redis 6+ (or use Docker)

## Quick Start

### 1. Clone and Install

```bash
cd hop-on
npm install
```

### 2. Start Infrastructure (Docker)

```bash
cd infra/docker
docker-compose up -d
```

This starts:

- PostgreSQL with PostGIS (port 5432)
- Redis (port 6379)

### 3. Setup Database

```bash
cd infra/db
# On Windows
.\migrate.ps1

# On Linux/Mac
chmod +x migrate.sh
./migrate.sh
```

### 4. Configure Environment

Create `.env` file in project root:

```env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hopon
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key
MAPBOX_TOKEN=your-mapbox-token
```

### 5. Run Services

```bash
# Run all services
npm run dev

# Or run specific apps
npx nx serve hop-on          # Frontend (port 4200)
npx nx serve api-gateway      # API Gateway (port 3000)
npx nx serve auth-service     # Auth Service (port 3001)
npx nx serve ride-service     # Ride Service (port 3002)
```

## Project Structure

```
hop-on/
├── apps/
│   ├── hop-on/              # Next.js web app
│   ├── admin-web/           # Admin dashboard
│   └── services/            # Backend microservices
│       ├── api-gateway/
│       ├── auth-service/
│       ├── ride-service/
│       ├── booking-service/
│       ├── chat-service/
│       ├── payment-service/
│       └── notification-service/
├── packages/                # Shared packages
│   ├── types/              # TypeScript types
│   ├── ui-kit/             # UI components
│   ├── utils/              # Utility functions
│   ├── config/             # Configuration
│   ├── eslint-config/      # Shared ESLint config
│   └── tsconfig/           # Shared TypeScript config
├── infra/
│   ├── db/                 # Database schemas & migrations
│   ├── docker/             # Docker configs
│   └── k8s/                # Kubernetes manifests
└── doc/                    # Documentation
```

## Available Commands

```bash
# Development
npm run dev                  # Start all apps in dev mode
npx nx serve <app-name>     # Start specific app

# Build
npx nx build <app-name>     # Build specific app
npx nx run-many --target=build --all  # Build all apps

# Test
npx nx test <app-name>      # Test specific app
npx nx run-many --target=test --all   # Test all apps

# Lint
npx nx lint <app-name>      # Lint specific app
npx nx run-many --target=lint --all   # Lint all apps

# Database
cd infra/db
.\migrate.ps1               # Run migrations (Windows)
./migrate.sh                # Run migrations (Linux/Mac)
```

## URLs (Development)

- Web App: http://localhost:4200
- Admin Dashboard: http://localhost:3100
- API Gateway: http://localhost:3000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Technology Stack

### Frontend

- Next.js 16 (App Router)
- React 19
- TypeScript
- TailwindCSS
- Mapbox GL JS

### Backend

- NestJS
- TypeORM/Prisma
- GraphQL + REST
- WebSocket (Socket.io)

### Database

- PostgreSQL 13+
- PostGIS (geospatial)
- Redis (cache/sessions)

### DevOps

- Docker & Docker Compose
- Kubernetes
- GitHub Actions
- AWS/GCP

## Next Steps

1. ✅ Setup complete monorepo structure
2. 🔄 Implement authentication service
3. 🔄 Implement ride service with geospatial queries
4. 🔄 Build web UI components
5. 🔄 Setup real-time chat with WebSocket
6. 🔄 Integrate Mapbox for maps

## Documentation

- [SRS](doc/SRS.md) - Software Requirements Specification
- [Architecture](doc/Architecture_Overview.md) - System architecture
- [API Docs](doc/API_Documentation.md) - API documentation
- [Database Schema](doc/Database_Schema.sql) - Database design

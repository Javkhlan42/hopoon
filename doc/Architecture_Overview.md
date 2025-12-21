# Архитектурын тойм — HopOn (Web-first Monorepo)

**Огноо:** 2025-12-21  
**Хувилбар:** 1.0  
**Анхны зорилго:** HopOn төсөл эхний ээлжинд web application хэлбэрээр гарах бөгөөд дараа нь mobile клиентүүд (React Native) нэмэгдэнэ. Архитектур нь монорепо суурьтай, microservices-эд бэлэн бөгөөд MVP-г хурдан гаргахын зэрэгцээ өргөтгөх боломжтой бүтэцтэй байна.

---

## 1. High-level архитектур (Logical View)

- **Client (Web SPA/SSR):** Next.js (React) — Feed, Ride creation/search, Booking, Chat UI
- **API Gateway / BFF:** NestJS (GraphQL/REST) — auth, aggregation, rate limit, input validation
- **Services:**
  - **Auth Service:** JWT, session, social/phone login, verification state
  - **Ride Service:** пост, маршрут, гео-хайлт (PostGIS)
  - **Booking Service:** суудлын нөөц, төлөв (pending/approved/cancelled), суудал тооцоо
  - **Chat/RT Service:** WebSocket (Socket.io), message store
  - **Payment Service:** Wallet, transaction, settlement
  - **Notification Service:** Push/WebSocket, email/SMS fan-out
  - **Admin Service:** moderation, dashboards
- **Data:** PostgreSQL + PostGIS, Redis (cache, pub/sub), Object Storage (S3-compatible) зураг/attachment-д
- **Observability:** Prometheus, Grafana, ELK (logs), OpenTelemetry (traces)
- **Infra:** Docker, Kubernetes (dev→staging→prod), CI/CD (GitHub Actions)

---

## 2. Monorepo сангийн бүтэц (жишиг)

```
repo-root/
  apps/
    web/                 # Next.js (SSR/SPA) — customer UI
    admin-web/           # Admin dashboard (Next.js or Vite+React)
    api-gateway/         # NestJS BFF (REST/GraphQL, rate limit, auth)
    services/
      auth-service/      # Auth, verification
      ride-service/      # Ride + geospatial
      booking-service/   # Booking lifecycle
      payment-service/   # Wallet, transactions
      chat-service/      # WS gateway, chat persistence
      notification-service/ # Push/email/SMS fan-out
  packages/
    ui-kit/              # Нэгж UI компонентууд (design system)
    types/               # Shared TypeScript types (DTO, API schemas)
    eslint-config/       # Нэгдсэн lint дүрэм
    tsconfig/            # Base tsconfig extends
    config/              # Env/schema validation (zod/yup), shared configs
    utils/               # Common helpers (logging, tracing wrappers)
  infra/
    k8s/                 # Helm charts / manifests
    docker/              # Dockerfiles, compose for local dev
    db/                  # Migration scripts (Prisma/TypeORM/Knex), seed
    ci-cd/               # GitHub Actions workflows
  docs/
    SRS.md
    API_Documentation.md
    Database_Schema.sql
    Architecture_Overview.md
  .editorconfig
  package.json           # Monorepo root (pnpm/yarn workspaces)
  pnpm-workspace.yaml    # эсвэл yarn workspaces
  turbo.json             # эсвэл nx.json (build graph, caching)
```

**Workspace tooling сонголт:** Turborepo (эсвэл Nx). Шалтгаан: build/test cache, incremental deploy, share lint/test config.

---

## 3. Runtime topology (Deployment View)

- **Ingress / API Gateway:** NGINX/Cloud LB → api-gateway (NestJS)
- **Service mesh (optional):** Istio/Linkerd for mTLS, traffic policy
- **Services:** container бүр тусдаа масштабтай; stateless (12-factor)
- **Data layers:**
  - PostgreSQL + PostGIS (primary, read-replicas)
  - Redis (cache, session, pub/sub for chat/notifications)
  - S3-compatible storage (images, attachments)
- **Real-time:** WS endpoint (chat, notifications, driver location)
- **Async:** Message broker (Redis pub/sub; upgrade path: NATS/Kafka for scale)

---

## 4. Data flow (Key paths)

1. **Ride feed:** web → api-gateway → ride-service (geo query PostGIS) → cache → response
2. **Booking:** web → api-gateway → booking-service → update seats (ride-service) → notify driver (notification-service) → chat room open (chat-service)
3. **Live tracking:** driver WS → chat/RT service → broadcast to passengers; positions cached in Redis, flushed to Postgres (location_history)
4. **Payments:** booking completed → payment-service transfers wallet balances → transaction log → notification

---

## 5. Tech stack (proposed)

- **Frontend:** Next.js 15, React 19, TypeScript, TanStack Query, Tailwind (эсвэл CSS-in-JS), Mapbox GL JS
- **Backend:** Node.js 20, NestJS (REST/GraphQL), TypeORM/Prisma
- **DB:** PostgreSQL 13+ + PostGIS 3.0+
- **Cache/RT:** Redis 6+ (pub/sub, rate limit, session)
- **Messaging (option):** NATS/Kafka (scale stage)
- **CI/CD:** GitHub Actions, Docker, Helm/Kustomize, Kubernetes
- **Observability:** OpenTelemetry, Prometheus, Grafana, Loki/ELK
- **Auth:** JWT access/refresh, phone OTP, optional Keycloak/Auth0

---

## 6. Environment strategy

- **Local:** Docker Compose (db, redis, mailhog, minio), hot-reload for apps
- **Dev/Staging:** Shared cluster, feature flags, demo data, lower rate limits
- **Prod:** Multi-AZ Postgres, Redis cluster, autoscaling (HPA), WAF + TLS everywhere

---

## 7. Security & compliance (summary)

- TLS end-to-end; mTLS in mesh (if enabled)
- RBAC (driver, passenger, admin); ABAC for circles/groups
- Input validation at gateway + service level
- Rate limiting per IP/user/token
- Secrets via Vault/Secrets Manager; no secrets in repo
- PII minimization; phone masked; location only during active rides

---

## 8. Delivery workflow (CI/CD)

- PR → lint + unit tests + typecheck → build (Turborepo cache) → service image build → push to registry → deploy via Helm to dev → smoke tests → promote to staging → prod.
- DB migrations run per service deploy (with lock) — backward compatible first.

---

## 9. Эхний backlog (MVP web-first)

1. Monorepo scaffold (pnpm + Turborepo/Nx, root configs)
2. Shared packages: types, eslint/tsconfig, ui-kit
3. Services scaffold: auth-service, ride-service, booking-service, chat-service, payment-service, notification-service
4. Web app skeleton: auth flow, feed list, ride detail, booking request
5. Infra: docker-compose for local; GitHub Actions CI; Postgres+PostGIS, Redis
6. Observability: basic logs + Prometheus metrics endpoints

---

## 10. Ирээдүйн өргөтгөл

- Mobile clients (React Native) reuse packages/types
- Event-driven backbone (Kafka/NATS) when scale grows
- Feature flags (ConfigCat/LaunchDarkly/OSS) for safe rollout
- A/B testing on feed ranking and pricing models

---

**Баримт бичиг төгсөв.**

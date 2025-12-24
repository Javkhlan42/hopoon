# Hop-On Backend Services

Monorepo backend microservices for the Hop-On ride-sharing platform.

## 🏗️ Architecture

```
apps/services/
├── auth-service (Port 3001) - Authentication & User Management
├── api-gateway (Port 3000) - API Gateway & Routing
├── ride-service (Port 3003) - Ride Management
├── booking-service (Port 3004) - Booking Management
├── payment-service (Port 3005) - Payment Processing
├── chat-service (Port 3006) - Real-time Messaging
└── notification-service (Port 3007) - Notifications
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 13+ with PostGIS extension
- Redis (for caching)

### Installation

```bash
# Install dependencies
npm install

# Setup database
cd infra/db
psql -U postgres -f schema.sql

# Create .env files for each service
cp apps/services/auth-service/.env.example apps/services/auth-service/.env
# Repeat for other services
```

### Running Services

```bash
# Run all services
nx run-many -t serve

# Run specific service
nx serve auth-service
nx serve ride-service

# Development mode with watch
nx serve auth-service --watch
```

## 📦 Services Overview

### 1. Auth Service (Port 3001)

**Endpoints:**

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user

**Features:**

- JWT authentication
- Password hashing with bcrypt
- Refresh token rotation
- Role-based access control

**Example Request:**

```bash
# Register
curl -X POST http://localhost:3001/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "phone": "+97699887766",
    "password": "Password123",
    "name": "John Doe",
    "email": "john@example.com"
  }'

# Login
curl -X POST http://localhost:3001/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "phone": "+97699887766",
    "password": "Password123"
  }'
```

### 2. Ride Service (Port 3003)

**Endpoints:**

- `POST /rides` - Create ride
- `GET /rides` - List rides (with filters)
- `GET /rides/:id` - Get ride details
- `PATCH /rides/:id` - Update ride
- `DELETE /rides/:id` - Cancel ride
- `GET /rides/search` - Search rides by route

**Features:**

- PostGIS integration for geo queries
- Route matching algorithm
- Real-time ride status updates
- Available seats management

**Example Request:**

```bash
# Create ride
curl -X POST http://localhost:3003/rides \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "origin": {
      "lat": 47.9184,
      "lng": 106.9177,
      "address": "Sukhbaatar Square"
    },
    "destination": {
      "lat": 47.8864,
      "lng": 106.9057,
      "address": "Zaisan Memorial"
    },
    "departureTime": "2025-12-22T10:00:00Z",
    "availableSeats": 3,
    "pricePerSeat": 5000
  }'
```

### 3. Booking Service (Port 3004)

**Endpoints:**

- `POST /bookings` - Create booking
- `GET /bookings` - List user bookings
- `GET /bookings/:id` - Get booking details
- `PATCH /bookings/:id/approve` - Approve booking (driver)
- `PATCH /bookings/:id/reject` - Reject booking (driver)
- `DELETE /bookings/:id` - Cancel booking

### 4. Payment Service (Port 3005)

**Endpoints:**

- `POST /payments` - Process payment
- `GET /payments/:id` - Get payment details
- `GET /wallet` - Get wallet balance
- `POST /wallet/topup` - Top up wallet

### 5. Chat Service (Port 3006)

**WebSocket Events:**

- `connect` - Connect to chat
- `message` - Send message
- `typing` - Typing indicator

**REST Endpoints:**

- `GET /chats/:rideId` - Get chat history

### 6. Notification Service (Port 3007)

**Endpoints:**

- `GET /notifications` - List notifications
- `PATCH /notifications/:id/read` - Mark as read

**Notification Types:**

- Ride booked
- Booking approved/rejected
- Ride starting soon
- Payment received

## 🔧 Development

### Database Migrations

```bash
cd infra/db
./migrate.ps1  # Windows
./migrate.sh   # Linux/Mac
```

### Testing

```bash
# Unit tests
nx test auth-service

# E2E tests
nx e2e auth-service-e2e

# All tests
nx run-many -t test
```

### Linting

```bash
nx lint auth-service
nx run-many -t lint
```

## 📁 Project Structure

```
apps/services/auth-service/
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.dto.ts
│   │   ├── jwt.strategy.ts
│   │   └── local.strategy.ts
│   ├── users/
│   │   ├── user.entity.ts
│   │   └── users.service.ts
│   ├── app.module.ts
│   └── main.ts
├── .env.example
├── package.json
└── tsconfig.json
```

## 🔐 Authentication

All protected endpoints require JWT token:

```bash
curl -H "Authorization: Bearer <access_token>" \\
  http://localhost:3003/rides
```

## 🌍 Environment Variables

### Auth Service

```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hopon
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

### Ride Service

```env
PORT=3003
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hopon
DB_USER=postgres
DB_PASSWORD=postgres
AUTH_SERVICE_URL=http://localhost:3001
```

## 📊 Database Schema

See `infra/db/schema.sql` for complete database schema.

Key tables:

- `users` - User accounts
- `rides` - Ride listings
- `bookings` - Ride bookings
- `payments` - Payment transactions
- `notifications` - User notifications

## 🐳 Docker

```bash
# Build and run all services
cd infra/docker
docker-compose up

# Run specific service
docker-compose up auth-service
```

## 📝 API Documentation

Full API documentation: `doc/API_Documentation.md`

## 🤝 Contributing

See `doc/GITHUB_WORKFLOW.md` for collaboration guidelines.

## 📄 License

Private - Hop-On Project

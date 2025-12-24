# Hop-On API Endpoints Documentation

## Base Configuration

**Base URL:**

- Development: `http://localhost:3000/api/v1`

**Headers:**

- `Authorization: Bearer <JWT_TOKEN>` (for protected routes)
- `Content-Type: application/json`

**Response Format:**

```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

**Error Format:**

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

## API Gateway Routing

Hop-On системийн бүх REST API хүсэлтүүд API Gateway-ээр дамжина. Gateway нь `api/v1` global prefix-тэй ( `apps/services/api-gateway/src/main.ts` дээр `app.setGlobalPrefix('api/v1')` ).

### Route mapping

| Gateway Route             | Service                   | Direct URL (local)    |
| ------------------------- | ------------------------- | --------------------- |
| `/api/v1/auth/*`          | Auth Service              | http://localhost:3001 |
| `/api/v1/rides/*`         | Ride Service              | http://localhost:3003 |
| `/api/v1/bookings/*`      | Booking Service           | http://localhost:3004 |
| `/api/v1/payments/*`      | Payment Service           | http://localhost:3005 |
| `/api/v1/chat/*`          | Chat Service (REST proxy) | http://localhost:3006 |
| `/api/v1/notifications/*` | Notification Service      | http://localhost:3007 |

> Анхаарах зүйл: Chat-ийн WebSocket (Socket.IO) холболтыг одоогийн Gateway нь (Axios дээр суурилсан proxy тул) proxy хийхгүй. WebSocket нь шууд Chat Service руу холбогдоно.

---

## 1. Authentication Service

### 1.1 Register

| Method | Endpoint         | Auth | Description                             |
| ------ | ---------------- | ---- | --------------------------------------- |
| POST   | `/auth/register` | None | Register new user (driver or passenger) |

**Request Body:**

```json
{
  "phone": "+97699887766",
  "password": "Password123",
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "phone": "+97699887766",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

---

### 1.2 Login

| Method | Endpoint      | Auth | Description                   |
| ------ | ------------- | ---- | ----------------------------- |
| POST   | `/auth/login` | None | Login with phone and password |

**Request Body:**

```json
{
  "phone": "+97699887766",
  "password": "Password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "phone": "+97699887766",
      "name": "John Doe"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

---

### 1.3 Refresh Token

| Method | Endpoint        | Auth | Description                              |
| ------ | --------------- | ---- | ---------------------------------------- |
| POST   | `/auth/refresh` | None | Get new access token using refresh token |

**Request Body:**

```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

---

### 1.4 Get Current User

| Method | Endpoint   | Auth         | Description                         |
| ------ | ---------- | ------------ | ----------------------------------- |
| GET    | `/auth/me` | Bearer Token | Get current authenticated user info |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "phone": "+97699887766",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "passenger",
    "createdAt": "2025-12-24T10:00:00Z"
  }
}
```

---

### 1.5 Logout

| Method | Endpoint       | Auth         | Description                  |
| ------ | -------------- | ------------ | ---------------------------- |
| POST   | `/auth/logout` | Bearer Token | Logout and invalidate tokens |

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 2. Ride Service

### 2.1 Create Ride (Driver Only)

| Method | Endpoint | Auth                  | Description             |
| ------ | -------- | --------------------- | ----------------------- |
| POST   | `/rides` | Bearer Token (Driver) | Create a new ride offer |

**Request Body:**

```json
{
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
  "departureTime": "2025-12-25T10:00:00Z",
  "availableSeats": 3,
  "pricePerSeat": 5000
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "driverId": "uuid",
    "origin": { ... },
    "destination": { ... },
    "departureTime": "2025-12-25T10:00:00Z",
    "availableSeats": 3,
    "pricePerSeat": 5000,
    "status": "scheduled"
  }
}
```

---

### 2.2 List Rides

| Method | Endpoint | Auth         | Description                              |
| ------ | -------- | ------------ | ---------------------------------------- |
| GET    | `/rides` | Bearer Token | Get list of available rides with filters |

**Query Parameters:**

- `status` - Ride status (draft, active, full, in_progress, completed, cancelled)
- `driverId` - Filter by driver id
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Example:** `/rides?status=active&page=1&limit=20`

**Response:**

```json
{
  "success": true,
  "data": {
    "rides": [
      {
        "id": "uuid",
        "driver": {
          "id": "uuid",
          "name": "Driver Name",
          "rating": 4.5
        },
        "origin": { ... },
        "destination": { ... },
        "departureTime": "2025-12-25T10:00:00Z",
        "availableSeats": 3,
        "pricePerSeat": 5000,
        "distance": 5.2
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25
    }
  }
}
```

---

### 2.3 Get Ride Details

| Method | Endpoint     | Auth         | Description                                    |
| ------ | ------------ | ------------ | ---------------------------------------------- |
| GET    | `/rides/:id` | Bearer Token | Get detailed information about a specific ride |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "driver": {
      "id": "uuid",
      "name": "Driver Name",
      "phone": "+97699887766",
      "rating": 4.5,
      "totalRides": 120
    },
    "origin": { ... },
    "destination": { ... },
    "departureTime": "2025-12-25T10:00:00Z",
    "availableSeats": 3,
    "pricePerSeat": 5000,
    "vehicleType": "sedan",
    "vehicleNumber": "УБ 1234",
    "notes": "Air conditioning available",
    "status": "scheduled",
    "bookings": [
      {
        "passengerId": "uuid",
        "seats": 1,
        "status": "approved"
      }
    ]
  }
}
```

---

### 2.4 Update Ride (Driver Only)

| Method | Endpoint     | Auth                             | Description             |
| ------ | ------------ | -------------------------------- | ----------------------- |
| PATCH  | `/rides/:id` | Bearer Token (Driver - Own Ride) | Update ride information |

**Request Body:**

```json
{
  "departureTime": "2025-12-25T11:00:00Z",
  "availableSeats": 4,
  "pricePerSeat": 4500,
  "notes": "Updated notes"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "departureTime": "2025-12-25T11:00:00Z",
    "availableSeats": 4,
    "pricePerSeat": 4500
  }
}
```

---

### 2.5 Cancel Ride (Driver Only)

| Method | Endpoint     | Auth                             | Description   |
| ------ | ------------ | -------------------------------- | ------------- |
| DELETE | `/rides/:id` | Bearer Token (Driver - Own Ride) | Cancel a ride |

**Response:**

```json
{
  "success": true,
  "message": "Ride cancelled successfully"
}
```

---

### 2.6 Search Rides by Route

| Method | Endpoint        | Auth         | Description                         |
| ------ | --------------- | ------------ | ----------------------------------- |
| GET    | `/rides/search` | Bearer Token | Search rides along a specific route |

**Query Parameters:**

- `originLat` - Required
- `originLng` - Required
- `destinationLat` - Required
- `destinationLng` - Required
- `maxRadius` - Search radius in km (default: 5)
- `departureDate` - Optional ISO date string
- `seats` - Optional minimum seats
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response:**

```json
{
  "success": true,
  "data": {
    "rides": [ ... ],
    "matchQuality": "high"
  }
}
```

---

## 3. Booking Service

### 3.1 Create Booking (Passenger)

| Method | Endpoint    | Auth                     | Description          |
| ------ | ----------- | ------------------------ | -------------------- |
| POST   | `/bookings` | Bearer Token (Passenger) | Book seats on a ride |

**Request Body:**

```json
{
  "rideId": "uuid",
  "seats": 2
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "rideId": "uuid",
    "passengerId": "uuid",
    "seats": 2,
    "totalPrice": 10000,
    "status": "pending",
    "createdAt": "2025-12-24T10:00:00Z"
  }
}
```

---

### 3.2 List User Bookings

| Method | Endpoint    | Auth         | Description                       |
| ------ | ----------- | ------------ | --------------------------------- |
| GET    | `/bookings` | Bearer Token | Get all bookings for current user |

**Query Parameters:**

- `status` - Filter by status (pending, approved, rejected, cancelled, completed)
- `rideId` - Filter by ride id
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

> Driver талын bookings авах бол: `GET /bookings/driver`

**Response:**

```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "uuid",
        "ride": {
          "id": "uuid",
          "origin": { ... },
          "destination": { ... },
          "departureTime": "2025-12-25T10:00:00Z"
        },
        "driver": {
          "id": "uuid",
          "name": "Driver Name",
          "phone": "+97699887766"
        },
        "passenger": {
          "id": "uuid",
          "name": "Passenger Name"
        },
        "seats": 2,
        "totalPrice": 10000,
        "status": "approved",
        "createdAt": "2025-12-24T10:00:00Z"
      }
    ]
  }
}
```

---

### 3.3 Get Booking Details

| Method | Endpoint        | Auth         | Description                      |
| ------ | --------------- | ------------ | -------------------------------- |
| GET    | `/bookings/:id` | Bearer Token | Get detailed booking information |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "ride": { ... },
    "driver": { ... },
    "passenger": { ... },
    "seats": 2,
    "totalPrice": 10000,
    "pickupLocation": { ... },
    "dropoffLocation": { ... },
    "status": "approved",
    "payment": {
      "status": "completed",
      "method": "wallet"
    }
  }
}
```

---

### 3.4 Approve Booking (Driver)

| Method | Endpoint                | Auth                  | Description               |
| ------ | ----------------------- | --------------------- | ------------------------- |
| PATCH  | `/bookings/:id/approve` | Bearer Token (Driver) | Approve a booking request |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "approved"
  }
}
```

---

### 3.5 Reject Booking (Driver)

| Method | Endpoint               | Auth                  | Description              |
| ------ | ---------------------- | --------------------- | ------------------------ |
| PATCH  | `/bookings/:id/reject` | Bearer Token (Driver) | Reject a booking request |

**Request Body:**

```json
{
  "reason": "Ride is full"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "rejected"
  }
}
```

---

### 3.6 Cancel Booking (Passenger)

| Method | Endpoint        | Auth                                   | Description      |
| ------ | --------------- | -------------------------------------- | ---------------- |
| DELETE | `/bookings/:id` | Bearer Token (Passenger - Own Booking) | Cancel a booking |

**Response:**

```json
{
  "success": true,
  "message": "Booking cancelled successfully"
}
```

---

## 4. Payment Service

Payment Service нь Gateway дээр `/api/v1/payments/*` route-оор proxy хийгддэг.

> Анхаарах зүйл: Payment service дотор `payments` болон `wallet` гэсэн 2 controller байдаг тул Gateway дээр:
>
> - Payment endpoints: `/api/v1/payments/payments/*`
> - Wallet endpoints: `/api/v1/payments/wallet/*`

### 4.1 Process Ride Payment

| Method | Endpoint                  | Auth         | Description                         |
| ------ | ------------------------- | ------------ | ----------------------------------- |
| POST   | `/payments/payments/ride` | Bearer Token | Process ride payment (by bookingId) |

**Request Body:**

```json
{
  "bookingId": "uuid",
  "method": "wallet"
}
```

---

### 4.2 Refund Payment

| Method | Endpoint                    | Auth         | Description                |
| ------ | --------------------------- | ------------ | -------------------------- |
| POST   | `/payments/payments/refund` | Bearer Token | Refund an existing payment |

**Request Body:**

```json
{
  "paymentId": "uuid",
  "reason": "Passenger cancelled"
}
```

---

### 4.3 Get Payment History

| Method | Endpoint                     | Auth         | Description                        |
| ------ | ---------------------------- | ------------ | ---------------------------------- |
| GET    | `/payments/payments/history` | Bearer Token | Get current user's payment history |

**Query Parameters (optional):**

- `userId` - Testing/dev үед ашиглаж болно (token-оос user тодорхойлох боломжгүй үед)

---

### 4.4 Get Payment Details

| Method | Endpoint                 | Auth         | Description               |
| ------ | ------------------------ | ------------ | ------------------------- |
| GET    | `/payments/payments/:id` | Bearer Token | Get payment details by id |

**Query Parameters (optional):**

- `userId` - Testing/dev үед ашиглаж болно

---

### 4.5 Get Wallet Balance

| Method | Endpoint                   | Auth         | Description                |
| ------ | -------------------------- | ------------ | -------------------------- |
| GET    | `/payments/wallet/balance` | Bearer Token | Get current wallet balance |

---

### 4.6 Top Up Wallet

| Method | Endpoint                 | Auth         | Description   |
| ------ | ------------------------ | ------------ | ------------- |
| POST   | `/payments/wallet/topup` | Bearer Token | Top up wallet |

**Request Body:**

```json
{
  "amount": 100000,
  "paymentMethod": "bank_transfer"
}
```

---

## 5. Chat Service

Chat Service-ийн REST API нь Gateway дээр `/api/v1/chat/*` route-оор proxy хийгдэнэ.

### 5.1 Conversations (REST via Gateway)

| Method | Endpoint                               | Auth         | Description                       |
| ------ | -------------------------------------- | ------------ | --------------------------------- |
| POST   | `/chat/conversations`                  | Bearer Token | Create conversation               |
| GET    | `/chat/conversations`                  | Bearer Token | List current user's conversations |
| GET    | `/chat/conversations/:id`              | Bearer Token | Get conversation by id            |
| PATCH  | `/chat/conversations/:id/participants` | Bearer Token | Add participant                   |
| DELETE | `/chat/conversations/:id/participants` | Bearer Token | Remove participant                |
| DELETE | `/chat/conversations/:id`              | Bearer Token | Delete conversation               |

**Create Conversation Body:**

```json
{
  "participantIds": ["uuid1", "uuid2"],
  "rideId": "uuid",
  "title": "Ride chat"
}
```

---

### 5.2 Messages (REST via Gateway)

| Method | Endpoint                                      | Auth         | Description                                  |
| ------ | --------------------------------------------- | ------------ | -------------------------------------------- |
| POST   | `/chat/messages`                              | Bearer Token | Send message                                 |
| GET    | `/chat/messages/conversation/:conversationId` | Bearer Token | Get messages (supports `limit`, `offset`)    |
| PATCH  | `/chat/messages/mark-read`                    | Bearer Token | Mark conversation messages as read           |
| GET    | `/chat/messages/unread-count`                 | Bearer Token | Get unread count (optional `conversationId`) |
| DELETE | `/chat/messages/:id`                          | Bearer Token | Delete message                               |

**Send Message Body:**

```json
{
  "conversationId": "uuid",
  "content": "Hello!"
}
```

---

### 5.3 WebSocket (Socket.IO) — Direct to Chat Service

Одоогийн Gateway proxy нь HTTP (Axios) дээр тулгуурласан тул Socket.IO WebSocket Upgrade-ийг proxy хийхгүй. Тиймээс WebSocket нь шууд Chat Service руу холбогдоно.

**URL:** `http://localhost:3006` (Development)

**Connection:**

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3006');
```

**Common Events:**

```javascript
// 1) Authenticate
socket.emit('authenticate', { userId: 'uuid' });
socket.on('authenticated', (data) => console.log(data));

// 2) Join a conversation room
socket.emit('join_conversation', { conversationId: 'uuid' });

// 3) Join a ride room
socket.emit('join_ride', { rideId: 'uuid' });
socket.on('joined_ride', (data) => console.log(data));

// 4) Send message (conversation-based)
socket.emit('send_message', {
  userId: 'uuid',
  conversationId: 'uuid',
  content: 'Hello!',
  type: 'text',
});
socket.on('message_sent', (data) => console.log(data));
socket.on('new_message', (data) => console.log(data));

// 5) Typing indicator
socket.emit('typing', { userId: 'uuid', conversationId: 'uuid', isTyping: true });
socket.on('user_typing', (data) => console.log(data));

// 6) Mark read
socket.emit('mark_read', { userId: 'uuid', conversationId: 'uuid' });
socket.on('marked_read', (data) => console.log(data));
```

---

## 6. Notification Service

### 6.1 Get Notifications

| Method | Endpoint         | Auth         | Description              |
| ------ | ---------------- | ------------ | ------------------------ |
| GET    | `/notifications` | Bearer Token | Get user's notifications |

**Query Parameters:**

- `userId` - Required (одоогийн Notification service нь query-оор userId авдаг)
- `unreadOnly` - Filter unread only (true/false)

**Response:**

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "booking_approved",
        "title": "Booking Approved",
        "message": "Your booking has been approved by the driver",
        "data": {
          "bookingId": "uuid",
          "rideId": "uuid"
        },
        "read": false,
        "createdAt": "2025-12-24T10:00:00Z"
      }
    ],
    "unreadCount": 5
  }
}
```

---

### 6.2 Mark Notification as Read

| Method | Endpoint                   | Auth         | Description                       |
| ------ | -------------------------- | ------------ | --------------------------------- |
| PATCH  | `/notifications/mark-read` | Bearer Token | Mark notifications as read (bulk) |

**Request Body:**

```json
{
  "userId": "uuid",
  "notificationIds": ["uuid1", "uuid2"]
}
```

**Response:**

```json
{
  "message": "Notifications marked as read"
}
```

---

### 6.3 Unread Count

| Method | Endpoint                      | Auth         | Description                    |
| ------ | ----------------------------- | ------------ | ------------------------------ |
| GET    | `/notifications/unread-count` | Bearer Token | Get unread notifications count |

**Query Parameters:**

- `userId` - Required

---

## Notification Types

| Type                 | Description           | Triggered When              |
| -------------------- | --------------------- | --------------------------- |
| `booking_created`    | New booking request   | Passenger books a ride      |
| `booking_approved`   | Booking approved      | Driver approves booking     |
| `booking_rejected`   | Booking rejected      | Driver rejects booking      |
| `booking_cancelled`  | Booking cancelled     | Passenger cancels booking   |
| `ride_starting_soon` | Ride starts in 30 min | 30 minutes before departure |
| `payment_received`   | Payment successful    | Payment is completed        |
| `payment_failed`     | Payment failed        | Payment fails               |
| `ride_completed`     | Ride completed        | Driver completes the ride   |
| `new_message`        | New chat message      | Someone sends a message     |

---

## Status Codes

| Code | Description                              |
| ---- | ---------------------------------------- |
| 200  | Success                                  |
| 201  | Created                                  |
| 400  | Bad Request                              |
| 401  | Unauthorized (No token or invalid token) |
| 403  | Forbidden (No permission)                |
| 404  | Not Found                                |
| 409  | Conflict (e.g., duplicate booking)       |
| 422  | Validation Error                         |
| 500  | Internal Server Error                    |

---

## Rate Limiting

- **Default**: 100 requests per minute per user
- **Auth endpoints**: 5 login attempts per 15 minutes
- **Payment endpoints**: 20 requests per minute

**Rate Limit Headers:**

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640350800
```

---

## 7. Admin API

Admin панелд зориулсан backend API endpoints. Бүх admin endpoints JWT authentication болон admin role шаардлагатай.

### 7.1 Admin Authentication

#### Admin Login

| Method | Endpoint            | Auth | Description |
| ------ | ------------------- | ---- | ----------- |
| POST   | `/auth/admin/login` | None | Admin login |

**Request Body:**

```json
{
  "email": "admin@hopon.mn",
  "password": "admin123"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "admin-1",
    "email": "admin@hopon.mn",
    "name": "Admin",
    "role": "superadmin"
  }
}
```

---

### 7.2 Dashboard

#### Get Dashboard Stats

| Method | Endpoint                 | Auth                 | Description         |
| ------ | ------------------------ | -------------------- | ------------------- |
| GET    | `/admin/dashboard/stats` | Bearer Token (Admin) | Get dashboard stats |

**Response:**

```json
{
  "totalUsers": 245,
  "activeDrivers": 89,
  "totalRides": 1234,
  "totalRevenue": 12500000
}
```

#### Get Daily Stats

| Method | Endpoint                       | Auth                 | Description          |
| ------ | ------------------------------ | -------------------- | -------------------- |
| GET    | `/admin/dashboard/daily-stats` | Bearer Token (Admin) | Get daily statistics |

**Query Parameters:**

- `startDate` - Start date (YYYY-MM-DD)
- `endDate` - End date (YYYY-MM-DD)

**Response:**

```json
[
  {
    "date": "2025-12-23",
    "users": 45,
    "rides": 123,
    "revenue": 450000
  }
]
```

#### Get Active SOS Alerts

| Method | Endpoint                      | Auth                 | Description           |
| ------ | ----------------------------- | -------------------- | --------------------- |
| GET    | `/admin/dashboard/active-sos` | Bearer Token (Admin) | Get active SOS alerts |

---

### 7.3 Users Management

#### Get Users List

| Method | Endpoint       | Auth                 | Description                    |
| ------ | -------------- | -------------------- | ------------------------------ |
| GET    | `/admin/users` | Bearer Token (Admin) | Get users list with pagination |

**Query Parameters:**

- `search` - Хайлтын текст (нэр, утас, имэйл)
- `status` - Статус (all, active, blocked)
- `role` - Үүрэг (all, passenger, driver, both)
- `page` - Хуудас (default: 1)
- `limit` - Хязгаар (default: 20)

**Response:**

```json
{
  "users": [
    {
      "id": "uuid",
      "name": "Болдбаатар",
      "phone": "+97699123456",
      "email": "bold@example.com",
      "role": "driver",
      "status": "active",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 245,
    "totalPages": 13
  }
}
```

#### Get User Details

| Method | Endpoint           | Auth                 | Description      |
| ------ | ------------------ | -------------------- | ---------------- |
| GET    | `/admin/users/:id` | Bearer Token (Admin) | Get user details |

#### Block User

| Method | Endpoint                 | Auth                 | Description |
| ------ | ------------------------ | -------------------- | ----------- |
| POST   | `/admin/users/:id/block` | Bearer Token (Admin) | Block user  |

**Request Body:**

```json
{
  "reason": "Зөрчил гаргасан"
}
```

#### Unblock User

| Method | Endpoint                   | Auth                 | Description  |
| ------ | -------------------------- | -------------------- | ------------ |
| POST   | `/admin/users/:id/unblock` | Bearer Token (Admin) | Unblock user |

#### Delete User

| Method | Endpoint           | Auth                 | Description |
| ------ | ------------------ | -------------------- | ----------- |
| DELETE | `/admin/users/:id` | Bearer Token (Admin) | Delete user |

#### Verify User

| Method | Endpoint                  | Auth                 | Description |
| ------ | ------------------------- | -------------------- | ----------- |
| POST   | `/admin/users/:id/verify` | Bearer Token (Admin) | Verify user |

---

### 7.4 Rides Management

#### Get Rides List

| Method | Endpoint       | Auth                 | Description    |
| ------ | -------------- | -------------------- | -------------- |
| GET    | `/admin/rides` | Bearer Token (Admin) | Get rides list |

**Query Parameters:**

- `search` - Хайлтын текст
- `status` - Ride status
- `page` - Page number
- `limit` - Items per page

**Response:**

```json
{
  "rides": [
    {
      "id": "ride-uuid",
      "driverId": "driver-uuid",
      "driverName": "Болдбаатар",
      "from": "Сүхбаатарын талбай",
      "to": "Зайсан",
      "departureTime": "2025-12-25T14:00:00Z",
      "availableSeats": 2,
      "totalSeats": 4,
      "price": 5000,
      "status": "active"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

#### Get Ride Details

| Method | Endpoint           | Auth                 | Description      |
| ------ | ------------------ | -------------------- | ---------------- |
| GET    | `/admin/rides/:id` | Bearer Token (Admin) | Get ride details |

#### Cancel Ride

| Method | Endpoint                  | Auth                 | Description |
| ------ | ------------------------- | -------------------- | ----------- |
| POST   | `/admin/rides/:id/cancel` | Bearer Token (Admin) | Cancel ride |

**Request Body:**

```json
{
  "reason": "Техникийн шалтгаан"
}
```

#### Delete Ride

| Method | Endpoint           | Auth                 | Description |
| ------ | ------------------ | -------------------- | ----------- |
| DELETE | `/admin/rides/:id` | Bearer Token (Admin) | Delete ride |

---

### 7.5 SOS Management

#### Get SOS Alerts

| Method | Endpoint     | Auth                 | Description    |
| ------ | ------------ | -------------------- | -------------- |
| GET    | `/admin/sos` | Bearer Token (Admin) | Get SOS alerts |

**Query Parameters:**

- `status` - active, resolved

#### Resolve SOS Alert

| Method | Endpoint                 | Auth                 | Description       |
| ------ | ------------------------ | -------------------- | ----------------- |
| POST   | `/admin/sos/:id/resolve` | Bearer Token (Admin) | Resolve SOS alert |

**Request Body:**

```json
{
  "notes": "Цагдаад мэдэгдсэн, асуудал шийдэгдсэн"
}
```

#### Call User

| Method | Endpoint              | Auth                 | Description   |
| ------ | --------------------- | -------------------- | ------------- |
| POST   | `/admin/sos/:id/call` | Bearer Token (Admin) | Initiate call |

#### Get Navigation Link

| Method | Endpoint                    | Auth                 | Description         |
| ------ | --------------------------- | -------------------- | ------------------- |
| GET    | `/admin/sos/:id/navigation` | Bearer Token (Admin) | Get navigation link |

---

### 7.6 Moderation

#### Get Reports

| Method | Endpoint                    | Auth                 | Description      |
| ------ | --------------------------- | -------------------- | ---------------- |
| GET    | `/admin/moderation/reports` | Bearer Token (Admin) | Get reports list |

**Query Parameters:**

- `type` - Төрөл (all, user, ride)
- `status` - Статус (all, pending, approved, rejected)

#### Get Report Details

| Method | Endpoint                        | Auth                 | Description        |
| ------ | ------------------------------- | -------------------- | ------------------ |
| GET    | `/admin/moderation/reports/:id` | Bearer Token (Admin) | Get report details |

#### Approve Report

| Method | Endpoint                                | Auth                 | Description    |
| ------ | --------------------------------------- | -------------------- | -------------- |
| POST   | `/admin/moderation/reports/:id/approve` | Bearer Token (Admin) | Approve report |

**Request Body:**

```json
{
  "action": "block_user",
  "notes": "Зөрчил батлагдсан"
}
```

#### Reject Report

| Method | Endpoint                               | Auth                 | Description   |
| ------ | -------------------------------------- | -------------------- | ------------- |
| POST   | `/admin/moderation/reports/:id/reject` | Bearer Token (Admin) | Reject report |

**Request Body:**

```json
{
  "reason": "Нотлох баримт хангалтгүй"
}
```

---

### 7.7 Reports & Analytics

#### User Growth

| Method | Endpoint                     | Auth                 | Description           |
| ------ | ---------------------------- | -------------------- | --------------------- |
| GET    | `/admin/reports/user-growth` | Bearer Token (Admin) | Get user growth stats |

**Query Parameters:**

- `period` - week, month, year

**Response:**

```json
[
  {
    "date": "2025-12-23",
    "drivers": 45,
    "passengers": 78,
    "total": 123
  }
]
```

#### Ride Statistics

| Method | Endpoint                    | Auth                 | Description         |
| ------ | --------------------------- | -------------------- | ------------------- |
| GET    | `/admin/reports/ride-stats` | Bearer Token (Admin) | Get ride statistics |

**Response:**

```json
{
  "completed": 1250,
  "cancelled": 85,
  "ongoing": 23,
  "completionRate": 93.6
}
```

#### Revenue Report

| Method | Endpoint                 | Auth                 | Description        |
| ------ | ------------------------ | -------------------- | ------------------ |
| GET    | `/admin/reports/revenue` | Bearer Token (Admin) | Get revenue report |

**Query Parameters:**

- `period` - week, month, year

#### Popular Routes

| Method | Endpoint                        | Auth                 | Description        |
| ------ | ------------------------------- | -------------------- | ------------------ |
| GET    | `/admin/reports/popular-routes` | Bearer Token (Admin) | Get popular routes |

**Query Parameters:**

- `limit` - Number of routes (default: 10)

**Response:**

```json
[
  {
    "from": "Сүхбаатарын талбай",
    "to": "ШУТИС",
    "count": 245,
    "avgPrice": 3000
  }
]
```

#### Top Drivers

| Method | Endpoint                     | Auth                 | Description     |
| ------ | ---------------------------- | -------------------- | --------------- |
| GET    | `/admin/reports/top-drivers` | Bearer Token (Admin) | Get top drivers |

**Query Parameters:**

- `limit` - Number of drivers (default: 10)

**Response:**

```json
[
  {
    "id": "uuid",
    "name": "Болдбаатар",
    "rating": 4.9,
    "totalRides": 345,
    "revenue": 2450000
  }
]
```

---

### 7.8 System Management

#### System Status

| Method | Endpoint               | Auth                 | Description       |
| ------ | ---------------------- | -------------------- | ----------------- |
| GET    | `/admin/system/status` | Bearer Token (Admin) | Get system status |

**Response:**

```json
{
  "cpu": 35,
  "memory": {
    "used": 6.4,
    "total": 16,
    "percentage": 40
  },
  "disk": {
    "used": 45.2,
    "total": 100,
    "percentage": 45
  },
  "uptime": 345600
}
```

#### Services Health

| Method | Endpoint                 | Auth                 | Description         |
| ------ | ------------------------ | -------------------- | ------------------- |
| GET    | `/admin/system/services` | Bearer Token (Admin) | Get services health |

**Response:**

```json
[
  {
    "name": "Auth Service",
    "status": "healthy",
    "responseTime": 15,
    "lastChecked": "2025-12-24T10:30:00Z"
  }
]
```

#### System Logs

| Method | Endpoint             | Auth                 | Description     |
| ------ | -------------------- | -------------------- | --------------- |
| GET    | `/admin/system/logs` | Bearer Token (Admin) | Get system logs |

**Query Parameters:**

- `level` - error, warning, info
- `service` - Service name
- `page` - Page number
- `limit` - Items per page

#### Update Configuration

| Method | Endpoint               | Auth                 | Description                 |
| ------ | ---------------------- | -------------------- | --------------------------- |
| PUT    | `/admin/system/config` | Bearer Token (Admin) | Update system configuration |

**Request Body:**

```json
{
  "maintenanceMode": false,
  "allowRegistrations": true
}
```

---

## Testing

### Using cURL

```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+97699887766","password":"Password123"}'

# Admin login
curl -X POST http://localhost:3000/api/v1/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hopon.mn","password":"admin123"}'

# Create ride (with token)
curl -X POST http://localhost:3000/api/v1/rides \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": {"lat": 47.9184, "lng": 106.9177, "address": "Sukhbaatar Square"},
    "destination": {"lat": 47.8864, "lng": 106.9057, "address": "Zaisan"},
    "departureTime": "2025-12-25T10:00:00Z",
    "availableSeats": 3,
    "pricePerSeat": 5000
  }'

# Get users (admin)
curl -X GET http://localhost:3000/api/v1/admin/users \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Using Postman

Import the collection from: `test/postman/hop-on-api.postman_collection.json`

### Using Test Scripts

```powershell
# Test complete flow
.\test-complete-flow.ps1

# Test specific service
.\test-driver-new.ps1
.\test-passenger-booking.ps1
.\test-payment-service.ps1
.\test-admin-api.ps1
```

---

## Environment Variables

```env
# API Gateway
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/hopon

# Services URLs (Internal)
AUTH_SERVICE_URL=http://localhost:3001
RIDE_SERVICE_URL=http://localhost:3003
BOOKING_SERVICE_URL=http://localhost:3004
PAYMENT_SERVICE_URL=http://localhost:3005
CHAT_SERVICE_URL=http://localhost:3006
NOTIFICATION_SERVICE_URL=http://localhost:3007

# CORS
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3002

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

---

## Support

For API support or questions:

- Email: dev@hopon.mn
- Slack: #hop-on-api-support
- Documentation: [BACKEND_SERVICES.md](./BACKEND_SERVICES.md)

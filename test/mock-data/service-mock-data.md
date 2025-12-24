# Hop-On Services - Mock Test Data

Энэхүү файлд бүх сервисүүдийн туршилтын mock өгөгдөл байна.

---

## 1. Auth Service (Port 3001)

### Register (Бүртгүүлэх)
```bash
POST http://localhost:3001/auth/register
Content-Type: application/json

{
  "phone": "+97699887766",
  "password": "Password123",
  "name": "Дорж Батаа",
  "email": "dorj.bataa@email.com",
  "role": "passenger"
}
```

### Register Driver (Жолооч бүртгүүлэх)
```bash
POST http://localhost:3001/auth/register
Content-Type: application/json

{
  "phone": "+97688776655",
  "password": "Driver123",
  "name": "Бат Сарнай",
  "email": "bat.sarnai@email.com",
  "role": "driver"
}
```

### Login (Нэвтрэх)
```bash
POST http://localhost:3001/auth/login
Content-Type: application/json

{
  "phone": "+97699887766",
  "password": "Password123"
}
```

### Refresh Token (Token шинэчлэх)
```bash
POST http://localhost:3001/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Profile (Өөрийн мэдээлэл авах)
```bash
GET http://localhost:3001/auth/me
Authorization: Bearer <access_token>
```

### Logout (Гарах)
```bash
POST http://localhost:3001/auth/logout
Authorization: Bearer <access_token>
```

---

## 2. Ride Service (Port 3003)

### Create Ride (Аялал үүсгэх)
```bash
POST http://localhost:3003/rides
Authorization: Bearer <driver_token>
Content-Type: application/json

{
  "origin": {
    "lat": 47.9184,
    "lng": 106.9177,
    "address": "Сүхбаатарын талбай, Улаанбаатар"
  },
  "destination": {
    "lat": 47.9251,
    "lng": 106.9060,
    "address": "Зайсан толгой, Улаанбаатар"
  },
  "departureTime": "2025-12-25T14:00:00.000Z",
  "availableSeats": 3,
  "pricePerSeat": 5000
}
```

### Search Rides (Аялал хайх)
```bash
GET http://localhost:3003/rides/search?originLat=47.9184&originLng=106.9177&destLat=47.9251&destLng=106.9060&departureDate=2025-12-25&maxRadius=5000
Authorization: Bearer <token>
```

### Get All Rides (Бүх аялал авах)
```bash
GET http://localhost:3003/rides?page=1&limit=10
Authorization: Bearer <token>
```

### Get Ride by ID (Аялалын дэлгэрэнгүй)
```bash
GET http://localhost:3003/rides/{rideId}
Authorization: Bearer <token>
```

### Update Ride (Аялал засах)
```bash
PATCH http://localhost:3003/rides/{rideId}
Authorization: Bearer <driver_token>
Content-Type: application/json

{
  "availableSeats": 2,
  "pricePerSeat": 6000
}
```

### Cancel Ride (Аялал цуцлах)
```bash
DELETE http://localhost:3003/rides/{rideId}
Authorization: Bearer <driver_token>
```

---

## 3. Booking Service (Port 3004)

### Create Booking (Захиалга үүсгэх)
```bash
POST http://localhost:3004/bookings
Authorization: Bearer <passenger_token>
Content-Type: application/json

{
  "rideId": "550e8400-e29b-41d4-a716-446655440000",
  "seats": 2
}
```

### Get User Bookings (Хэрэглэгчийн захиалгууд)
```bash
GET http://localhost:3004/bookings?status=pending&page=1&limit=10
Authorization: Bearer <token>
```

### Get Driver Bookings (Жолоочийн захиалгууд)
```bash
GET http://localhost:3004/bookings/driver?status=pending
Authorization: Bearer <driver_token>
```

### Get Booking Details (Захиалгын дэлгэрэнгүй)
```bash
GET http://localhost:3004/bookings/{bookingId}
Authorization: Bearer <token>
```

### Approve Booking (Захиалга батлах - Жолооч)
```bash
PATCH http://localhost:3004/bookings/{bookingId}/approve
Authorization: Bearer <driver_token>
```

### Reject Booking (Захиалга татгалзах - Жолооч)
```bash
PATCH http://localhost:3004/bookings/{bookingId}/reject
Authorization: Bearer <driver_token>
Content-Type: application/json

{
  "reason": "Замаас хэт хол байна"
}
```

### Cancel Booking (Захиалга цуцлах - Зорчигч)
```bash
DELETE http://localhost:3004/bookings/{bookingId}
Authorization: Bearer <passenger_token>
```

---

## 4. Payment Service (Port 3005)

### Get Wallet Balance (Түрийвчийн үлдэгдэл)
```bash
GET http://localhost:3005/wallet/balance?userId={userId}
```

### Top Up Wallet (Түрийвч цэнэглэх)
```bash
POST http://localhost:3005/wallet/topup
Content-Type: application/json

{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 50000,
  "paymentMethod": "card"
}
```

### Create Payment (Төлбөр үүсгэх)
```bash
POST http://localhost:3005/payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookingId": "660e8400-e29b-41d4-a716-446655440000",
  "amount": 10000,
  "method": "wallet",
  "description": "Аяллын төлбөр"
}
```

### Process Ride Payment (Аяллын төлбөр төлөх)
```bash
POST http://localhost:3005/payments/ride
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookingId": "660e8400-e29b-41d4-a716-446655440000",
  "method": "wallet"
}
```

### Get Payment by ID (Төлбөрийн дэлгэрэнгүй)
```bash
GET http://localhost:3005/payments/{paymentId}
Authorization: Bearer <token>
```

### Get User Payments (Хэрэглэгчийн төлбөрүүд)
```bash
GET http://localhost:3005/payments/user/{userId}
Authorization: Bearer <token>
```

### Refund Payment (Төлбөр буцаах)
```bash
POST http://localhost:3005/payments/refund
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentId": "770e8400-e29b-41d4-a716-446655440000",
  "reason": "Аялал цуцлагдсан"
}
```

---

## 5. Chat Service (Port 3006)

### Create Conversation (Харилцан яриа үүсгэх)
```bash
POST http://localhost:3006/conversations
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "ride",
  "title": "Аялалын чат",
  "participantIds": [
    "550e8400-e29b-41d4-a716-446655440000",
    "660e8400-e29b-41d4-a716-446655440001"
  ],
  "rideId": "770e8400-e29b-41d4-a716-446655440002"
}
```

### Get User Conversations (Хэрэглэгчийн харилцан ярианууд)
```bash
GET http://localhost:3006/conversations
Authorization: Bearer <token>
```

### Get Conversation by ID (Харилцан ярианы дэлгэрэнгүй)
```bash
GET http://localhost:3006/conversations/{conversationId}
Authorization: Bearer <token>
```

### Send Message (Мессеж илгээх)
```bash
POST http://localhost:3006/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "conversationId": "880e8400-e29b-41d4-a716-446655440000",
  "type": "text",
  "content": "Сайн байна уу? Хаана уулзах вэ?"
}
```

### Get Messages (Мессежүүд авах)
```bash
GET http://localhost:3006/messages?conversationId={conversationId}&page=1&limit=50
Authorization: Bearer <token>
```

### Mark Messages as Read (Мессежүүдийг уншсан болгох)
```bash
PATCH http://localhost:3006/messages/read
Authorization: Bearer <token>
Content-Type: application/json

{
  "conversationId": "880e8400-e29b-41d4-a716-446655440000"
}
```

### Add Participant (Оролцогч нэмэх)
```bash
PATCH http://localhost:3006/conversations/{conversationId}/participants
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "990e8400-e29b-41d4-a716-446655440003"
}
```

---

## 6. Notification Service (Port 3007)

### Get User Notifications (Хэрэглэгчийн мэдэгдлүүд)
```bash
GET http://localhost:3007/notifications?userId={userId}&page=1&limit=20
```

### Send Notification (Мэдэгдэл илгээх)
```bash
POST http://localhost:3007/notifications
Content-Type: application/json

{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "type": "booking_confirmed",
  "channels": ["in_app", "push"],
  "title": "Захиалга батлагдлаа",
  "message": "Таны захиалга амжилттай батлагдлаа. Аялалын мэдээллийг харна уу.",
  "data": {
    "bookingId": "660e8400-e29b-41d4-a716-446655440000",
    "rideId": "770e8400-e29b-41d4-a716-446655440002"
  }
}
```

### Send Bulk Notifications (Олон хүнд мэдэгдэл илгээх)
```bash
POST http://localhost:3007/notifications/bulk
Content-Type: application/json

{
  "userIds": [
    "550e8400-e29b-41d4-a716-446655440000",
    "660e8400-e29b-41d4-a716-446655440001"
  ],
  "type": "ride_reminder",
  "channels": ["in_app", "push", "sms"],
  "title": "Аялал удахгүй эхэлнэ",
  "message": "Таны аялал 30 минутын дараа эхэлнэ. Бэлэн байгаарай!",
  "data": {
    "rideId": "770e8400-e29b-41d4-a716-446655440002"
  }
}
```

### Mark Notification as Read (Мэдэгдлийг уншсан болгох)
```bash
PATCH http://localhost:3007/notifications/{notificationId}/read
```

### Mark Multiple as Read (Олон мэдэгдлийг уншсан болгох)
```bash
PATCH http://localhost:3007/notifications/read-multiple
Content-Type: application/json

{
  "notificationIds": [
    "aa0e8400-e29b-41d4-a716-446655440000",
    "bb0e8400-e29b-41d4-a716-446655440001"
  ]
}
```

### Delete Notification (Мэдэгдэл устгах)
```bash
DELETE http://localhost:3007/notifications/{notificationId}
```

---

## 7. API Gateway (Port 3000)

Бүх API хүсэлтүүд API Gateway-р дамжина. Жишээ нь:

### Via Gateway - Auth
```bash
POST http://localhost:3000/api/v1/auth/register
POST http://localhost:3000/api/v1/auth/login
```

### Via Gateway - Rides
```bash
GET http://localhost:3000/api/v1/rides
POST http://localhost:3000/api/v1/rides
```

### Via Gateway - Bookings
```bash
GET http://localhost:3000/api/v1/bookings
POST http://localhost:3000/api/v1/bookings
```

### Via Gateway - Payments
```bash
GET http://localhost:3000/api/v1/payments/wallet/balance?userId={userId}
POST http://localhost:3000/api/v1/payments/wallet/topup
```

### Via Gateway - Notifications
```bash
GET http://localhost:3000/api/v1/notifications?userId={userId}
```

---

## Тест хийх жишээ UUID-үүд

```javascript
// Хэрэглэгчдийн ID-ууд
const passengerUserId = "55d833a7-6479-451f-b3f2-1382b9902b04";
const driverUserId = "66e944b8-7580-562g-c4g3-2493c0013c15";

// Аялалын ID
const rideId = "77f055c9-8691-673h-d5h4-3504d1124d26";

// Захиалгын ID
const bookingId = "88g166da-9702-784i-e6i5-4615e2235e37";

// Төлбөрийн ID
const paymentId = "99h277eb-a813-895j-f7j6-5726f3346f48";

// Харилцан ярианы ID
const conversationId = "aai388fc-b924-9a6k-g8k7-6837g4457g59";

// Мэдэгдлийн ID
const notificationId = "bbj499gd-ca35-ab7l-h9l8-7948h5568h6a";
```

---

## Enum утгууд

### User Roles
```typescript
type UserRole = 'passenger' | 'driver' | 'both';
```

### Ride Status
```typescript
enum RideStatus {
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}
```

### Booking Status
```typescript
enum BookingStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}
```

### Payment Method
```typescript
enum PaymentMethod {
  WALLET = 'wallet',
  CARD = 'card',
  CASH = 'cash',
  QPAY = 'qpay'
}
```

### Payment Type
```typescript
enum PaymentType {
  RIDE = 'ride',
  TOP_UP = 'top_up',
  REFUND = 'refund'
}
```

### Notification Type
```typescript
enum NotificationType {
  BOOKING_CREATED = 'booking_created',
  BOOKING_CONFIRMED = 'booking_confirmed',
  BOOKING_REJECTED = 'booking_rejected',
  RIDE_STARTING = 'ride_starting',
  RIDE_COMPLETED = 'ride_completed',
  PAYMENT_RECEIVED = 'payment_received',
  MESSAGE_RECEIVED = 'message_received'
}
```

### Notification Channel
```typescript
enum NotificationChannel {
  IN_APP = 'in_app',
  PUSH = 'push',
  EMAIL = 'email',
  SMS = 'sms'
}
```

### Message Type
```typescript
enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  LOCATION = 'location',
  SYSTEM = 'system'
}
```

### Conversation Type
```typescript
enum ConversationType {
  DIRECT = 'direct',
  RIDE = 'ride',
  GROUP = 'group'
}
```

---

## Бүрэн тест flow жишээ

### 1. Хэрэглэгч бүртгүүлэх ба нэвтрэх
```bash
# Зорчигч бүртгүүлэх
POST /api/v1/auth/register
{ "phone": "+97699887766", "password": "Pass123", "name": "Дорж", "role": "passenger" }

# Жолооч бүртгүүлэх
POST /api/v1/auth/register
{ "phone": "+97688776655", "password": "Driver123", "name": "Сарнай", "role": "driver" }

# Нэвтрэх
POST /api/v1/auth/login
{ "phone": "+97699887766", "password": "Pass123" }
# Response: { "accessToken": "...", "refreshToken": "..." }
```

### 2. Жолооч аялал үүсгэх
```bash
POST /api/v1/rides
Authorization: Bearer <driver_token>
{
  "origin": { "lat": 47.9184, "lng": 106.9177, "address": "Сүхбаатарын талбай" },
  "destination": { "lat": 47.9251, "lng": 106.9060, "address": "Зайсан" },
  "departureTime": "2025-12-25T14:00:00Z",
  "availableSeats": 3,
  "pricePerSeat": 5000
}
# Response: { "id": "ride-uuid", ... }
```

### 3. Зорчигч аялал хайж, захиалга үүсгэх
```bash
# Аялал хайх
GET /api/v1/rides/search?originLat=47.9184&originLng=106.9177...

# Захиалга үүсгэх
POST /api/v1/bookings
Authorization: Bearer <passenger_token>
{ "rideId": "ride-uuid", "seats": 2 }
# Response: { "id": "booking-uuid", "status": "pending", ... }
```

### 4. Жолооч захиалга батлах
```bash
PATCH /api/v1/bookings/{booking-uuid}/approve
Authorization: Bearer <driver_token>
# Response: { "status": "approved", ... }
```

### 5. Зорчигч түрийвч цэнэглэх ба төлбөр төлөх
```bash
# Түрийвч цэнэглэх
POST /api/v1/payments/wallet/topup
{ "userId": "passenger-uuid", "amount": 50000, "paymentMethod": "card" }

# Аяллын төлбөр төлөх
POST /api/v1/payments/ride
Authorization: Bearer <passenger_token>
{ "bookingId": "booking-uuid", "method": "wallet" }
```

### 6. Мэдэгдэл шалгах
```bash
GET /api/v1/notifications?userId=passenger-uuid
# Response: [{ "type": "booking_confirmed", "title": "Захиалга батлагдлаа", ... }]
```

### 7. Чат эхлүүлэх
```bash
# Харилцан яриа үүсгэх
POST /api/v1/chat/conversations
Authorization: Bearer <token>
{
  "type": "ride",
  "participantIds": ["passenger-uuid", "driver-uuid"],
  "rideId": "ride-uuid"
}

# Мессеж илгээх
POST /api/v1/chat/messages
Authorization: Bearer <token>
{
  "conversationId": "conversation-uuid",
  "type": "text",
  "content": "Сайн байна уу?"
}
```

---

## PowerShell тестийн скрипт

```powershell
# Хэрэглэгч бүртгүүлэх
$registerResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body (@{
    phone = "+97699887766"
    password = "Password123"
    name = "Тест Хэрэглэгч"
    email = "test@email.com"
    role = "passenger"
  } | ConvertTo-Json)

# Нэвтрэх
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body (@{
    phone = "+97699887766"
    password = "Password123"
  } | ConvertTo-Json)

$token = $loginResponse.accessToken

# Аялал хайх
$rides = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/rides" `
  -Method GET `
  -Headers @{ Authorization = "Bearer $token" }

Write-Host "Found $($rides.data.Count) rides"
```

---

## cURL тестийн жишээнүүд

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone":"+97699887766","password":"Pass123","name":"Test","role":"passenger"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+97699887766","password":"Pass123"}'

# Get Rides (with token)
curl -X GET http://localhost:3000/api/v1/rides \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

**Санамж:** 
- Бүх `{userId}`, `{rideId}`, `{bookingId}` гэх мэт placeholder-ууд нь жинхэнэ UUID-аар солигдох ёстой
- Token-ууд нь login хийсний дараа авагдах accessToken утгыг ашиглана
- Date/Time форматууд ISO 8601 стандартаар байна (жишээ: `2025-12-25T14:00:00Z`)
- Улаанбаатарын координатууд: lat ~47.92, lng ~106.91

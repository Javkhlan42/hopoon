# HopOn Ride Lifecycle Tests

Энэ фолдер нь sequence diagram-д үндэслэсэн бүрэн ride lifecycle-ийн integration тестүүдийг агуулна.

## 📋 Test Coverage

### 1. Complete Ride Lifecycle (`ride-lifecycle.integration.spec.ts`)

Бүрэн аяллын мөчлөгийг дараах 7 алхмаар шалгана:

#### ✅ АЛХАМ 1: Ride Post үүсгэх (Жолооч)

- Жолооч шинэ аялал үүсгэх
- Mapbox API-аас маршрут авах (polyline, distance, duration)
- PostGIS LINESTRING-ээр DB-д хадгалах
- Redis cache-д статус бичих
- 201 Created буцаах

#### ✅ АЛХАМ 2: Хайлт ба Илэрц (Зорчигч)

- Зорчигч очих газраар хайлт хийх
- PostGIS ST_DWithin geo search ашиглах
- Redis cache-с боломжтой суудлын тоо шалгах
- Аяллын жагсаалт буцаах
- 200 OK

#### ✅ АЛХАМ 3: Booking хүсэлт

- Зорчигч booking үүсгэх
- Transaction ашиглан суудал lock хийх (SELECT FOR UPDATE)
- Booking pending төлөвт INSERT хийх
- Ride-ийн суудлын тоог UPDATE хийх
- Redis cache DECR хийх
- Жолоочид мэдэгдэл илгээх
- 201 Created

#### ✅ АЛХАМ 4: Баталгаажуулалт & Chat

- Жолооч booking-ийг зөвшөөрөх
- Chat channel үүсгэх
- WebSocket холболт үүсгэх (join_ride)
- Зорчигчид мэдэгдэл илгээх
- Мессеж солилцох (send_message → DB INSERT → broadcast)

#### ✅ АЛХАМ 5: Аялал эхлэх & Live Tracking

- Жолооч аялал эхлүүлэх (status=in_progress)
- Redis-д tracking_enabled SET хийх
- Зорчигчдод мэдэгдэл илгээх
- Location update loop:
  - update_location emit
  - Redis GEOADD
  - location_update broadcast

#### ✅ АЛХАМ 6: SOS (Хэрэв шаардлагатай)

- Зорчигч/Жолооч SOS илгээх
- DB-д sos_alert INSERT
- Redis TTL-тэй SET
- Admin-д мэдэгдэл (🚨 SOS Alert)
- Emergency contacts-д SMS илгээх

#### ✅ АЛХАМ 7: Дуусгалт & Үнэлгээ

- Жолооч аялал дуусгах (status=completed)
- Payment Service-ээр төлбөр хийх (wallet transfer)
- Зорчигчдод дуусгалтын мэдэгдэл
- Харилцан үнэлгээ өгөх (ratings POST)
- User ratings UPDATE хийх

---

### 2. Chat & Real-time Tracking (`chat-realtime.integration.spec.ts`)

WebSocket болон real-time функцуудын тестүүд:

- **WebSocket Connections**
  - Driver, олон зорчигчийн холболт
  - Redis active_users SADD
  - Connection error handling

- **Chat Messaging**
  - Broadcast messages (driver → passengers)
  - P2P messaging (passenger → passenger)
  - Message persistence (DB INSERT)
  - Message history pagination
  - Authorization check

- **Live Location Tracking**
  - Location broadcast (driver → all passengers)
  - Redis GEOADD storage
  - Location history trail
  - ETA calculation
  - Throttling (max 1 update/sec)

- **Typing Indicators**
  - user_typing event
  - user_stop_typing event

- **Connection Management**
  - User disconnect notifications
  - Reconnection handling
  - Message order guarantee

- **Performance**
  - Concurrent message handling
  - Low latency verification (<500ms)

---

### 3. SOS & Safety Features (`sos-safety.integration.spec.ts`)

Аюулгүй байдал, SOS системийн тестүүд:

- **SOS Alert Creation**
  - Passenger/Driver SOS creation
  - Location tracking
  - Severity levels (low, medium, high, critical)
  - DB + Redis TTL storage

- **Admin Dashboard Notifications**
  - WebSocket admin channel
  - Real-time SOS alerts
  - Comprehensive alert details
  - Active alert count

- **Emergency Contact Notifications**
  - SMS to emergency contacts
  - Email notifications
  - Contact management

- **Location Tracking During Emergency**
  - Enhanced tracking (5sec intervals)
  - Location trail history
  - Public share link for responders

- **Alert Resolution**
  - Admin resolve
  - Passenger cancel (false alarm)
  - Follow-up notifications
  - Safety history recording

- **Prevention & Analytics**
  - Driver safety score
  - Safety insights per ride
  - High-risk user flagging
  - Monthly safety reports

---

### 4. Payment & Rating System (`payment-rating.integration.spec.ts`)

Төлбөр, үнэлгээний системийн тестүүд:

- **Wallet Management**
  - Balance check
  - Transaction history
  - Top-up
  - Withdrawal
  - Insufficient balance validation

- **Booking Payment Flow**
  - Funds hold on booking
  - Payment pending status
  - Payment completion on ride end
  - Driver wallet transfer
  - Platform fee deduction (10%)
  - Transaction recording

- **Refunds & Cancellations**
  - 100% refund (driver cancels)
  - Partial refund (passenger cancels late) - 80%
  - Full refund (booking rejected)
  - Payment rollback on failure

- **Mutual Rating System**
  - Passenger → Driver rating
  - Driver → Passenger rating
  - Prevent duplicate ratings
  - Rating validation (1-5)
  - Average rating calculation
  - Category breakdown
  - Review listing & filtering

- **Rating Analytics**
  - Performance reports
  - Rating trends
  - Platform comparison
  - Low-rated user flagging

---

## 🚀 Running Tests

### Prerequisites

Бүх сервисүүд ажиллаж байх ёстой:

```powershell
# Start all services
./start-all-services.ps1

# Or manually
npm run dev
```

### Run All Lifecycle Tests

```powershell
# Interactive menu
./test/scripts/run-lifecycle-tests.ps1

# Or directly
npm test test/integration/ride-lifecycle.integration.spec.ts
npm test test/integration/chat-realtime.integration.spec.ts
npm test test/integration/sos-safety.integration.spec.ts
npm test test/integration/payment-rating.integration.spec.ts
```

### Run Individual Test Suite

```powershell
# Complete lifecycle
npm test -- test/integration/ride-lifecycle.integration.spec.ts --verbose

# Chat & tracking
npm test -- test/integration/chat-realtime.integration.spec.ts --verbose

# SOS & safety
npm test -- test/integration/sos-safety.integration.spec.ts --verbose

# Payment & rating
npm test -- test/integration/payment-rating.integration.spec.ts --verbose
```

### Run Specific Test Case

```powershell
npm test -- test/integration/ride-lifecycle.integration.spec.ts -t "should create a ride"
npm test -- test/integration/chat-realtime.integration.spec.ts -t "WebSocket"
```

---

## 📊 Test Results

Тест амжилттай дуусмагц:

- Console-д дэлгэрэнгүй лог харагдана
- Coverage report үүснэ: `test/coverage/lcov-report/index.html`
- Алдаа гарвал stack trace харагдана

### Success Output Example

```
✓ АЛХАМ 1: Ride created: 550e8400-e29b-41d4-a716-446655440000
✓ АЛХАМ 2: Found 5 rides
✓ АЛХАМ 3: Booking created: abc123
✓ АЛХАМ 4: Booking approved
✓ АЛХАМ 4: Chat channel created: xyz789
✓ АЛХАМ 5: Ride started
✓ АЛХАМ 6: SOS alert created: sos_001
✓ АЛХАМ 7: Ride completed
✓ Payment completed: ₮50,000
✓ Passenger rated driver: ⭐⭐⭐⭐⭐
✓ Driver rated passenger: ⭐⭐⭐⭐⭐

=== RIDE LIFECYCLE SUMMARY ===
Ride ID: 550e8400-e29b-41d4-a716-446655440000
Booking ID: abc123
Route: Улаанбаатар → Дархан
Status: ✓ Completed
Ratings: ⭐⭐⭐⭐⭐
==============================
```

---

## 🔧 Environment Variables

Tests ашиглах environment variables:

```bash
# Service URLs
GATEWAY_URL=http://localhost:3000
AUTH_URL=http://localhost:3001
RIDE_URL=http://localhost:3003
BOOKING_URL=http://localhost:3004
CHAT_URL=http://localhost:3005
PAYMENT_URL=http://localhost:3006
NOTIFICATION_URL=http://localhost:3007

# WebSocket URLs
CHAT_WS_URL=http://localhost:3005
ADMIN_WS_URL=http://localhost:3008

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/hop-on-test

# Redis
REDIS_URL=redis://localhost:6379
```

---

## 🐛 Debugging Tests

### Enable Verbose Logging

```powershell
npm test -- test/integration/ride-lifecycle.integration.spec.ts --verbose --detectOpenHandles
```

### Run Single Test in Watch Mode

```powershell
npm test -- test/integration/ride-lifecycle.integration.spec.ts --watch
```

### Debug WebSocket Issues

```typescript
// Add to test file
driverSocket.onAny((event, ...args) => {
  console.log(`[DRIVER] ${event}:`, args);
});

passengerSocket.onAny((event, ...args) => {
  console.log(`[PASSENGER] ${event}:`, args);
});
```

### Check Service Health

```powershell
# Health check all services
curl http://localhost:3000/health  # Gateway
curl http://localhost:3001/health  # Auth
curl http://localhost:3003/health  # Ride
curl http://localhost:3004/health  # Booking
curl http://localhost:3005/health  # Chat
curl http://localhost:3006/health  # Payment
curl http://localhost:3007/health  # Notification
```

---

## 📝 Test Data

Тестүүд автоматаар дараах өгөгдөл үүсгэнэ:

**Test Users:**

- Driver: Болд (random phone)
- Passenger: Сараа (random phone)
- Admin: +97699999999

**Test Routes:**

- Улаанбаатар (47.9184, 106.9177) → Дархан (49.4863, 105.9714)
- Price: ₮20,000 - ₮30,000 per seat
- Duration: ~2-3 hours
- Distance: ~200km

**Test Wallets:**

- Initial balance: ₮100,000
- Platform fee: 10%

---

## 🎯 Coverage Goals

| Component          | Target | Current |
| ------------------ | ------ | ------- |
| Controllers        | 90%    | TBD     |
| Services           | 85%    | TBD     |
| WebSocket Handlers | 80%    | TBD     |
| Payment Logic      | 95%    | TBD     |
| Overall            | 85%    | TBD     |

---

## 🔄 CI/CD Integration

GitHub Actions workflow example:

```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgis/postgis:15-3.3
        env:
          POSTGRES_PASSWORD: test
      redis:
        image: redis:7-alpine

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run test:integration
      - uses: codecov/codecov-action@v3
```

---

## 📚 Related Documentation

- [Sequence Diagram](../../doc/sequence-diagram.puml)
- [API Documentation](../../doc/API_Documentation.md)
- [Architecture Overview](../../doc/Architecture_Overview.md)
- [Backend Services](../../doc/BACKEND_SERVICES.md)

---

## 🤝 Contributing

Шинэ тест нэмэх:

1. Test файл үүсгэх: `test/integration/feature-name.integration.spec.ts`
2. Describe blocks ашиглаж ангилах
3. BeforeAll/AfterAll-д setup/cleanup хийх
4. Expect assertions ашиглах
5. Console.log-ээр progress харуулах
6. README-д documentation нэмэх

---

## 📞 Support

Асуудал гарвал:

- Issue үүсгэх: [GitHub Issues](https://github.com/your-repo/issues)
- Slack channel: #hop-on-testing
- Email: dev@hop-on.mn

---

**Last Updated:** 2025-12-24  
**Version:** 1.0.0  
**Maintained by:** HopOn Dev Team

# API Gateway Тохиргоо

## Архитектур

Hop-On системд **API Gateway** pattern ашиглаж байгаа. Энэ нь бүх frontend хүсэлтүүд нэг entry point-оор дамжиж, дараа нь тохирох microservice руу чиглүүлэгдэнэ.

```
Frontend (Next.js)  →  API Gateway (:3000/api/v1)  →  Microservices
                            ↓
                    ┌───────┴────────┐
                    │   Routing      │
                    │  Auth Check    │
                    │  Rate Limiting │
                    └────────────────┘
                            ↓
        ┌──────────┬────────┴────────┬─────────┬─────────────┐
        ↓          ↓                 ↓         ↓             ↓
    Auth:3001  Ride:3003      Booking:3004  Payment:3005  Chat:3006
                                                          Notification:3007
```

## Давуу тал

### 1. Single Entry Point

- Frontend апп-ууд зөвхөн `http://localhost:3000/api/v1` хаяг ашиглана
- Microservice-үүдийн хаягууд (ports) өөрчлөгдсөн ч frontend өөрчлөх шаардлагагүй
- CORS тохиргоо нэг газарт төвлөрнө

### 2. Төвлөрсөн Authentication

- JWT token шалгалт Gateway дээр хийгдэнэ
- Microservice бүрт давхар auth шалгах шаардлагагүй
- Token refresh, logout гэх мэт auth логик нэг газарт

### 3. Rate Limiting & Throttling

- API хэрэглээг хязгаарлах
- DDoS халдлагаас хамгаалах
- Service бүрт өөрийн throttle limit

### 4. Logging & Monitoring

- Бүх API хүсэлтийн log төвлөрнө
- Error tracking хялбар болно
- Performance метрик цуглуулах

### 5. Load Balancing

- Service бүрийн олон instance байвал ачааллыг хуваана
- Health check хийж, сул instance руу чиглүүлнэ

## Routing Тохиргоо

### Одоогийн Routes

| Frontend URL              | Service                  | Direct URL            |
| ------------------------- | ------------------------ | --------------------- |
| `/api/v1/auth/*`          | Auth Service             | http://localhost:3001 |
| `/api/v1/rides/*`         | Ride Service             | http://localhost:3003 |
| `/api/v1/bookings/*`      | Booking Service          | http://localhost:3004 |
| `/api/v1/payments/*`      | Payment Service          | http://localhost:3005 |
| `/api/v1/chat/*`          | Chat Service (WebSocket) | ws://localhost:3006   |
| `/api/v1/notifications/*` | Notification Service     | http://localhost:3007 |

### Жишээ хүсэлтүүд

```javascript
// ❌ Буруу - шууд service руу
fetch('http://localhost:3001/auth/login', {...})
fetch('http://localhost:3003/rides', {...})

// ✅ Зөв - API Gateway-ээр дамжуулна
fetch('http://localhost:3000/api/v1/auth/login', {...})
fetch('http://localhost:3000/api/v1/rides', {...})
```

## Хэрэгжүүлэлт

### Controller-ууд

Gateway дээр service бүрт controller байна:

```typescript
// apps/services/api-gateway/src/auth/auth.controller.ts
@Controller('auth')
export class AuthController {
  // /api/v1/auth/* хүсэлтүүдийг Auth Service руу чиглүүлнэ
}

// apps/services/api-gateway/src/payments/payments.controller.ts
@Controller('payments')
export class PaymentsController {
  // /api/v1/payments/* хүсэлтүүдийг Payment Service руу proxy хийнэ
}
```

### ProxyService

`ProxyService` нь HTTP хүсэлтүүдийг microservice руу дамжуулна:

```typescript
async proxy(req: Request, res: Response, serviceUrl: string, controllerPrefix?: string) {
  // Path-ийг зөв бэлтгэнэ: /api/v1/payments/wallet -> /wallet
  // Headers дамжуулна (Authorization, гм)
  // Query params, Body forward хийнэ
  // Response буцаана
}
```

## Frontend Integration

### Next.js дээр хэрэглэх

```typescript
// lib/api-client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const apiClient = {
  async get(endpoint: string) {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return res.json();
  },

  async post(endpoint: string, data: any) {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};

// Usage
const rides = await apiClient.get('/rides');
const booking = await apiClient.post('/bookings', { rideId, seats });
```

### React/Vue дээр

```javascript
// Axios instance
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor - JWT token автоматаар нэмнэ
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Usage
const { data: rides } = await api.get('/rides');
const { data: booking } = await api.post('/bookings', { rideId, seats });
```

## WebSocket (Chat Service)

Chat service WebSocket ашигладаг тул Gateway-ээр бус шууд холбогдоно:

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3006', {
  auth: {
    token: getToken(), // JWT token
  },
});

socket.emit('join_ride', { rideId });
socket.on('new_message', (message) => {
  console.log('Received:', message);
});
```

> **Санамж**: WebSocket Gateway proxy хэрэгжүүлэх боломжтой боловч одоогоор шууд холбогдож байна.

## Тестлэх

### API Gateway тест

```powershell
# Бүх service-үүдийг Gateway-ээр дамжуулж тестлэх
.\test-api-gateway.ps1
```

### Шууд service тест (development)

```powershell
# Эдгээр нь Gateway-г алгасаж шууд service руу хандана
.\test-driver-new.ps1
.\test-payment-service.ps1
```

## Production Deployment

### Environment Variables

```env
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://api.hopon.mn/api/v1

# API Gateway
PORT=3000
AUTH_SERVICE_URL=http://auth:3001
RIDE_SERVICE_URL=http://ride:3003
BOOKING_SERVICE_URL=http://booking:3004
PAYMENT_SERVICE_URL=http://payment:3005
CHAT_SERVICE_URL=http://chat:3006
NOTIFICATION_SERVICE_URL=http://notification:3007

# CORS
ALLOWED_ORIGINS=https://hopon.mn,https://www.hopon.mn

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# JWT
JWT_SECRET=<production-secret>
```

### Nginx Reverse Proxy

Production дээр Nginx Gateway-ийн өмнө байж болно:

```nginx
upstream api_gateway {
    server gateway:3000;
}

server {
    listen 443 ssl http2;
    server_name api.hopon.mn;

    location /api/v1/ {
        proxy_pass http://api_gateway;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Алдаа засах (Troubleshooting)

### Gateway хүрэхгүй байна

```bash
# Gateway ажиллаж байгаа эсэх
curl http://localhost:3000/api/v1/auth/health

# Service-үүд ажиллаж байгаа эсэх
curl http://localhost:3001/auth/health  # Auth
curl http://localhost:3003/rides/health # Ride
```

### 401 Unauthorized

- JWT token зөв дамжиж байгаа эсэх шалгах
- Token expire болоогүй эсэх
- JWT_SECRET service бүрт ижил эсэх

### 404 Not Found

- Route зөв эсэх (`/api/v1` prefix оруулсан эсэх)
- Controller Gateway дээр бүртгэгдсэн эсэх (`app.module.ts`)

### 500 Internal Server Error

- Service асаалттай эсэх шалгах
- Gateway console log харах
- Service-ийн console log харах

## Дараагийн Алхмууд

- [ ] WebSocket Gateway proxy
- [ ] API versioning (v2, v3)
- [ ] GraphQL Gateway
- [ ] Circuit Breaker pattern
- [ ] Request/Response caching
- [ ] API documentation (Swagger)
- [ ] Metrics dashboard (Prometheus + Grafana)

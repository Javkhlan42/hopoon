# Admin API Documentation

Admin панелд зориулсан backend API endpoints.

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication

### Admin Login
```http
POST /api/v1/auth/admin/login
Content-Type: application/json

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

## Dashboard

### Get Dashboard Stats
```http
GET /api/v1/admin/dashboard/stats
Authorization: Bearer {token}
```

**Response:**
```json
{
  "totalUsers": 245,
  "activeDrivers": 89,
  "totalRides": 1234,
  "totalRevenue": 12500000
}
```

### Get Daily Stats
```http
GET /api/v1/admin/dashboard/daily-stats?startDate=2025-12-01&endDate=2025-12-24
Authorization: Bearer {token}
```

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

### Get Active SOS Alerts
```http
GET /api/v1/admin/dashboard/active-sos
Authorization: Bearer {token}
```

## Users Management

### Get Users List
```http
GET /api/v1/admin/users?search=bold&status=active&role=driver&page=1&limit=20
Authorization: Bearer {token}
```

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

### Get User Details
```http
GET /api/v1/admin/users/{userId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "Болдбаатар",
    "phone": "+97699123456",
    "email": "bold@example.com",
    "role": "driver",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "rides": [],
  "reviews": [],
  "sosHistory": []
}
```

### Block User
```http
POST /api/v1/admin/users/{userId}/block
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Зөрчил гаргасан"
}
```

### Unblock User
```http
POST /api/v1/admin/users/{userId}/unblock
Authorization: Bearer {token}
```

### Delete User
```http
DELETE /api/v1/admin/users/{userId}
Authorization: Bearer {token}
```

### Verify User
```http
POST /api/v1/admin/users/{userId}/verify
Authorization: Bearer {token}
```

## Rides Management

### Get Rides List
```http
GET /api/v1/admin/rides?search=Зайсан&status=active&page=1&limit=20
Authorization: Bearer {token}
```

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

### Get Ride Details
```http
GET /api/v1/admin/rides/{rideId}
Authorization: Bearer {token}
```

### Cancel Ride
```http
POST /api/v1/admin/rides/{rideId}/cancel
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Техникийн шалтгаан"
}
```

### Delete Ride
```http
DELETE /api/v1/admin/rides/{rideId}
Authorization: Bearer {token}
```

## SOS Management

### Get SOS Alerts
```http
GET /api/v1/admin/sos?status=active
Authorization: Bearer {token}
```

### Resolve SOS Alert
```http
POST /api/v1/admin/sos/{sosId}/resolve
Authorization: Bearer {token}
Content-Type: application/json

{
  "notes": "Цагдаад мэдэгдсэн, асуудал шийдэгдсэн"
}
```

### Call User
```http
POST /api/v1/admin/sos/{sosId}/call
Authorization: Bearer {token}
```

### Get Navigation Link
```http
GET /api/v1/admin/sos/{sosId}/navigation
Authorization: Bearer {token}
```

## Moderation

### Get Reports
```http
GET /api/v1/admin/moderation/reports?type=user&status=pending
Authorization: Bearer {token}
```

**Query Parameters:**
- `type` - Төрөл (all, user, ride)
- `status` - Статус (all, pending, approved, rejected)

### Get Report Details
```http
GET /api/v1/admin/moderation/reports/{reportId}
Authorization: Bearer {token}
```

### Approve Report
```http
POST /api/v1/admin/moderation/reports/{reportId}/approve
Authorization: Bearer {token}
Content-Type: application/json

{
  "action": "block_user",
  "notes": "Зөрчил батлагдсан"
}
```

### Reject Report
```http
POST /api/v1/admin/moderation/reports/{reportId}/reject
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Нотлох баримт хангалтгүй"
}
```

## Reports & Analytics

### User Growth
```http
GET /api/v1/admin/reports/user-growth?period=month
Authorization: Bearer {token}
```

**Query Parameters:**
- `period` - Хугацаа (week, month, year)

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

### Ride Statistics
```http
GET /api/v1/admin/reports/ride-stats
Authorization: Bearer {token}
```

**Response:**
```json
{
  "completed": 1250,
  "cancelled": 85,
  "ongoing": 23,
  "completionRate": 93.6
}
```

### Revenue Report
```http
GET /api/v1/admin/reports/revenue?period=month
Authorization: Bearer {token}
```

### Popular Routes
```http
GET /api/v1/admin/reports/popular-routes?limit=10
Authorization: Bearer {token}
```

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

### Top Drivers
```http
GET /api/v1/admin/reports/top-drivers?limit=10
Authorization: Bearer {token}
```

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

## System Management

### System Status
```http
GET /api/v1/admin/system/status
Authorization: Bearer {token}
```

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

### Services Health
```http
GET /api/v1/admin/system/services
Authorization: Bearer {token}
```

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

### System Logs
```http
GET /api/v1/admin/system/logs?level=error&service=auth&page=1&limit=50
Authorization: Bearer {token}
```

### Update Configuration
```http
PUT /api/v1/admin/system/config
Authorization: Bearer {token}
Content-Type: application/json

{
  "maintenanceMode": false,
  "allowRegistrations": true
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid admin credentials"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "User not found"
}
```

## Environment Variables

```env
# Admin credentials
ADMIN_EMAIL=admin@hopon.mn
ADMIN_PASSWORD=admin123

# JWT
JWT_SECRET=hopon-secret-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

## Testing

```powershell
# Test admin API
.\test-admin-api.ps1
```

```bash
# Admin login
curl -X POST http://localhost:3000/api/v1/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hopon.mn","password":"admin123"}'

# Get users (with token)
curl -X GET http://localhost:3000/api/v1/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Notes

- Бүх admin endpoints JWT authentication шаардана
- Admin role шалгах middleware нэмэх шаардлагатай (одоогоор token байх нь хангалттай)
- Production орчинд admin нууц үгийг заавал environment variable ашиглаж тохируулах
- Rate limiting: Admin endpoints-д 1000 requests/hour хязгаар тавих
- Audit logging: Бүх admin үйлдлүүдийг бүртгэх шаардлагатай

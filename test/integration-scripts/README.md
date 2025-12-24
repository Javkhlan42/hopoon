# Integration Test Scripts

Hop-On системийн REST API integration тестүүд.

## Folder Structure

```
integration-scripts/
├── auth/           # Authentication тестүүд
├── ride/           # Ride service тестүүд
├── booking/        # Booking service тестүүд
├── payment/        # Payment service тестүүд
├── chat/           # Chat service тестүүд
├── notification/   # Notification service тестүүд
├── admin/          # Admin API тестүүд
└── run-all.ps1     # Бүх тестүүдийг ажиллуулах
```

## Usage

### Тус бүрчлэн ажиллуулах

```powershell
# Auth тестүүд
.\auth\test-register.ps1
.\auth\test-login.ps1
.\auth\test-admin-login.ps1

# Driver тестүүд
.\ride\test-driver-flow.ps1
.\ride\test-create-ride.ps1

# Passenger тестүүд
.\booking\test-passenger-flow.ps1
.\booking\test-booking.ps1

# Payment тестүүд
.\payment\test-wallet.ps1
.\payment\test-payment-flow.ps1

# Admin тестүүд
.\admin\test-admin-dashboard.ps1
.\admin\test-user-management.ps1
```

### Бүх тестүүдийг ажиллуулах

```powershell
.\run-all.ps1
```

### Тодорхой категори дээр

```powershell
.\run-all.ps1 -Category auth
.\run-all.ps1 -Category ride
.\run-all.ps1 -Category admin
```

## Environment Variables

Тестүүд дараах environment variables ашигладаг:

```powershell
$env:AUTH_URL = "http://localhost:3001"
$env:GATEWAY_URL = "http://localhost:3000"
$env:RIDE_URL = "http://localhost:3003"
$env:BOOKING_URL = "http://localhost:3004"
$env:PAYMENT_URL = "http://localhost:3005"
$env:CHAT_URL = "http://localhost:3006"
$env:NOTIFICATION_URL = "http://localhost:3007"
```

## Test Output

Тест бүр дараах мэдээллийг харуулна:

- ✅ Success - Тест амжилттай
- ❌ Error - Тест амжилтгүй
- ⚠️ Warning - Анхааруулга
- 📋 Info - Мэдээлэл

## Prerequisites

1. Бүх services ажиллаж байх ёстой
2. Database migration хийгдсэн байх
3. PostgreSQL ажиллаж байх

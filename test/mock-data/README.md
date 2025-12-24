# Mock Data & Test Scripts

Энэ директорт бүх сервисүүдийн туршилтын өгөгдөл болон тестийн скриптүүд байна.

## 📁 Файлууд

- **`mock-data.json`** - JSON форматтай бүх тестийн өгөгдөл
- **`service-mock-data.md`** - Дэлгэрэнгүй тестийн өгөгдөл, API жишээнүүд
- **`test-all-services.ps1`** - Автомат тестийн PowerShell скрипт

## 🚀 Хэрхэн ашиглах

### 1. Бүх сервисүүдийг эхлүүлэх

```powershell
# Hop-on үндсэн директорт
.\start-all-services.ps1
```

### 2. Автомат тест ажиллуулах

```powershell
# test/mock-data директорт
.\test-all-services.ps1
```

Энэ скрипт дараах зүйлсийг хийнэ:
- ✅ Бүх сервисүүдийн байдлыг шалгана
- ✅ Хэрэглэгч бүртгүүлнэ (зорчигч, жолооч)
- ✅ Нэвтрэнэ
- ✅ Аялал үүсгэнэ
- ✅ Захиалга үүсгэж батална
- ✅ Түрийвч цэнэглэж төлбөр төлнө
- ✅ Мэдэгдэл шалгана
- ✅ Чат эхлүүлнэ

### 3. Гараар тест хийх

#### PowerShell ашиглах:

```powershell
# Register
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body (@{
    phone = "+97699887766"
    password = "Password123"
    name = "Test User"
    role = "passenger"
  } | ConvertTo-Json)

# Login
$login = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body (@{
    phone = "+97699887766"
    password = "Password123"
  } | ConvertTo-Json)

$token = $login.accessToken

# Get rides
$rides = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/rides" `
  -Headers @{ Authorization = "Bearer $token" }
```

#### cURL ашиглах:

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone":"+97699887766","password":"Pass123","name":"Test","role":"passenger"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+97699887766","password":"Pass123"}'

# Get rides
curl -X GET http://localhost:3000/api/v1/rides \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 Сервисүүдийн портууд

| Сервис | Порт | URL |
|--------|------|-----|
| API Gateway | 3000 | http://localhost:3000 |
| Auth Service | 3001 | http://localhost:3001 |
| Ride Service | 3003 | http://localhost:3003 |
| Booking Service | 3004 | http://localhost:3004 |
| Payment Service | 3005 | http://localhost:3005 |
| Chat Service | 3006 | http://localhost:3006 |
| Notification Service | 3007 | http://localhost:3007 |

## 🔑 Тестийн хэрэглэгчид

### Зорчигч
- **Утас:** +97699887766
- **Нууц үг:** Password123
- **Нэр:** Тест Зорчигч

### Жолооч
- **Утас:** +97688776655
- **Нууц үг:** Driver123
- **Нэр:** Тест Жолооч

## 📍 Тестийн байршлууд

| Байршил | Latitude | Longitude | Хаяг |
|---------|----------|-----------|------|
| Сүхбаатарын талбай | 47.9184 | 106.9177 | Улаанбаатар төв |
| Зайсан | 47.9251 | 106.9060 | Зайсан толгой |
| Дархан | 49.0331 | 106.2757 | Дархан хот |

## 🎯 Туршилтын сценари

### Сценари 1: Энгийн аялал
1. Жолооч бүртгүүлж нэвтрэнэ
2. Аялал үүсгэнэ (УБ төв → Зайсан)
3. Зорчигч бүртгүүлж нэвтрэнэ
4. Аялал хайна
5. Захиалга үүсгэнэ
6. Жолооч батална
7. Зорчигч түрийвч цэнэглэнэ
8. Төлбөр төлнө
9. Мэдэгдэл ирнэ

### Сценари 2: Хотын аялал
1. Аялал үүсгэх (УБ → Дархан)
2. Олон зорчигчийн захиалга
3. Чат эхлүүлэх
4. Байршил илгээх
5. Төлбөр төлөх

## 📝 Тэмдэглэл

- Бүх UUID-ууд үлгэрчилсэн байна
- Token-ууд login хийсний дараа авагдана
- Date/Time форматууд ISO 8601 стандарт (YYYY-MM-DDTHH:mm:ss.sssZ)
- Улаанбаатарын координатууд: ~47.92°N, ~106.91°E

## 🐛 Алдаа гарвал

1. Бүх сервисүүд ажиллаж байгаа эсэхийг шалгах:
```powershell
.\start-all-services.ps1
```

2. Health check:
```powershell
curl http://localhost:3000/health
curl http://localhost:3001/health
```

3. Database холболт шалгах:
```powershell
psql $env:DATABASE_URL
```

## 📚 Дэлгэрэнгүй

Дэлгэрэнгүй API баримт бичгүүд:
- [service-mock-data.md](./service-mock-data.md) - API endpoints & examples
- [../API_Documentation.md](../../doc/API_Documentation.md) - Full API docs
- [../BACKEND_SERVICES.md](../../doc/BACKEND_SERVICES.md) - Services overview

# Hope-On Test Guide - Хурдан эхлэх заавар

Энэ заавар нь Hope-On платформын тестийг хэрхэн хурдан ажиллуулах талаар товч мэдээлэл өгнө.

## 📋 Шаардлагатай зүйлс

1. **Node.js** (v18+) суусан байх
2. **PostgreSQL database** ажиллаж байх (Neon эсвэл локал)
3. **Микросервисүүд** ажиллаж байх

## 🚀 Хурдан эхлэх (5 минут)

### 1-р алхам: Dependencies суулгах

```powershell
cd test
npm install
```

### 2-р алхам: Микросервисүүд эхлүүлэх

```powershell
# Repository root folder-оос
cd ..
.\start-all-services.ps1
```

⏱️ **Хүлээх хугацаа:** 10-15 секунд

### 3-р алхам: Тестүүд ажиллуулах

```powershell
cd test
.\scripts\run-all-tests.ps1
```

**Эсвэл npm ашиглан:**

```powershell
npm test
```

## 📊 Одоогийн статус

- ✅ **Auth Tests:** 19/19 (100%)
- ⚠️ **Ride Tests:** Validation засварлаж байна
- ⚠️ **Booking Tests:** Validation засварлаж байна
- ⚠️ **Security Tests:** 2 алдаа засварлаж байна
- **Нийт:** 89/129 тест амжилттай (69%)

## 🎯 Тестийн төрлүүд

### Unit Tests (Хурдан, 2 сек)

```powershell
npm run test:unit
```

Service логикийг шалгана (mock data ашиглан)

### Integration Tests (Дунд, 5-8 сек)

```powershell
npm run test:integration
```

API endpoints-ийг live services-тай шалгана

### Security Tests (Дунд, 5-8 сек)

```powershell
npm run test:security
```

Аюулгүй байдлын зөрчлүүдийг илрүүлнэ

### Бүгд (Бүтэн, 15-20 сек)

```powershell
npm test
```

## ⚙️ Тохиргоо

### Environment Variables

Тестүүд ямар ч тусгай environment variable шаардахгүй. Тест бүр өөрийн default утгуудтай.

**Хэрвээ өөрчлөх шаардлагатай бол:**

```powershell
# Бүү хий! Tests өөрөө тохируулна
# $env:API_URL = "http://localhost:3000"
```

### Database

Тестүүд production database ашиглах тул test data үүснэ. Test өгөгдөл автоматаар цэвэрлэгддэггүй.

**Өгөгдөл цэвэрлэх:**

```powershell
cd ..\infra\db
.\migrate.ps1  # Database reset хийнэ
```

## 🔧 Troubleshooting

### ❌ Алдаа: "Cannot find module"

**Шийдэл:**

```powershell
cd test
npm install
```

### ❌ Алдаа: "ECONNREFUSED" эсвэл 404

**Шалтгаан:** Services ажиллахгүй байна

**Шийдэл:**

```powershell
# Services шалгах
netstat -ano | Select-String "3001|3003|3004"

# Services эхлүүлэх
cd ..
.\start-all-services.ps1
```

### ❌ Алдаа: 401 Unauthorized

**Шалтгаан:** JWT_SECRET тохиргоо буруу

**Шийдэл:**

```powershell
# Бүх service-ийн .env файлыг шалгах
Get-Content ..\apps\services\*\.env | Select-String JWT_SECRET

# Бүгд ижил байх ёстой:
# JWT_SECRET=your-secret-key-change-in-production
```

### ❌ Алдаа: 400 Bad Request (Validation)

**Шалтгаан:** Test data DTO-той таарахгүй байна

**Шийдэл:** Энэ засварлагдаж байна - одоогоор тестүүд update хийгдэж байна

### ❌ Алдаа: Test timeout

**Шалтгаан:** Services удаан хариулж байна

**Шийдэл:**

```powershell
# Database холболт шалгах
psql $env:DATABASE_URL -c "SELECT 1"

# Service logs-г харах (terminal дээр)
```

## 📈 Тестийн үр дүн ойлгох

### Амжилттай тест

```
 PASS  integration/auth.integration.spec.ts
  ● Console
    console.log
      🚀 Starting test suite...

  ✓ Auth API Integration Tests (2345 ms)
    ✓ should register a new user (245 ms)
    ✓ should login successfully (123 ms)
```

### Алдаатай тест

```
 FAIL  integration/ride.integration.spec.ts
  ● Ride API › POST /rides › should create ride

    expected 201 "Created", got 400 "Bad Request"
```

**Алдааны төрөл:**

- `404 Not Found` → Service ажиллахгүй байна
- `401 Unauthorized` → JWT_SECRET буруу эсвэл token дууссан
- `400 Bad Request` → Validation алдаа (test data буруу)
- `500 Internal Server Error` → Backend код алдаатай

## 🎨 Output ойлгох

Тестийн дүн:

```
Test Suites: 5 failed, 2 skipped, 2 passed, 7 of 9 total
Tests:       66 failed, 10 skipped, 53 passed, 129 total
```

**Тайлбар:**

- **Test Suites:** Тестийн файлууд (spec.ts файл бүр = 1 suite)
- **Tests:** Нийт тестийн тоо (it() block бүр = 1 test)
- **Skipped:** Алгассан тестүүд (it.skip() эсвэл describe.skip())

## 📚 Дэлгэрэнгүй мэдээлэл

Илүү дэлгэрэнгүй мэдээлэл авах бол [README.md](../README.md) уншаарай.

## 🆘 Тусламж

1. **Алдааны мэдээлэл:** Test output-ыг анхааралтай уншаарай
2. **Logs:** Service terminal дээрх error logs-г шалгаарай
3. **Documentation:** [README.md](../README.md) эсвэл [test docs](../doc/)
4. **GitHub Issues:** https://github.com/Bagee1/hop-on/issues

---

## ✅ Checklist - Тест ажиллуулахын өмнө

- [ ] Node.js суусан (`node --version`)
- [ ] Dependencies суусан (`npm install`)
- [ ] Database ажиллаж байна
- [ ] Микросервисүүд ажиллаж байна (ports 3001, 3003, 3004)
- [ ] JWT_SECRET бүх service-д ижил
- [ ] Test directory-д байна (`cd test`)

**Бүгд бэлэн бол:**

```powershell
npm test
```

🎉 **Амжилт хүсье!**

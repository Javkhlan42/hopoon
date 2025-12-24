# Hope-On Platform Test Suite

Энэхүү баримт бичиг нь Hope-On системийн бүрэн автомат тестийн талаар дэлгэрэнгүй мэдээлэл өгнө.

**Тестийн хамрах хүрээ:** Unit, Integration, E2E, Security болон Performance тестүүд.

**Одоогийн статус:** 96/129 тест амжилттай (74.4% - 2025-12-23)

---

## 📚 Баримт бичгүүд

Тестийн бүрэн мэдээлэл авахын тулд дараах баримтуудыг уншаарай:

### 🚀 Хурдан эхлэх

- **[QUICK_START.md](QUICK_START.md)** - 5 минутанд тест ажиллуулах (ЭХЛЭЭРЭЙ ЭНДЭЭС!)

### 📊 Тестийн дүн

- **[TEST_SUMMARY.md](TEST_SUMMARY.md)** - Одоогийн тестийн статус, алдаанууд, ахиц

### 🔧 Backend засвар

- **[BACKEND_FIX_CHECKLIST.md](BACKEND_FIX_CHECKLIST.md)** - Backend developer-үүдэд зориулсан засварын жагсаалт

### 📖 Дэлгэрэнгүй заавар

- **Энэ файл (README.md)** - Бүрэн техникийн мэдээлэл

## 📁 Folder Бүтэц

```
test/
├── unit/                    # Unit тестүүд (Service logic)
│   ├── auth.service.spec.ts
│   ├── ride.service.spec.ts
│   └── booking.service.spec.ts
├── integration/             # Integration тестүүд (API endpoints)
│   ├── auth.integration.spec.ts
│   ├── ride.integration.spec.ts
│   └── booking.integration.spec.ts
├── e2e/                     # End-to-end тестүүд (Playwright)
│   └── user-journey.e2e.spec.ts
├── security/                # Security тестүүд
│   └── security.integration.spec.ts
├── performance/             # Performance тестүүд (k6)
│   ├── load-test.js
│   ├── stress-test.js
│   ├── spike-test.js
│   ├── soak-test.js
│   └── README.md
├── scripts/                 # Автомат скриптүүд
│   ├── check-api.js
│   ├── run-tests.ps1       # PowerShell script (Windows)
│   └── run-tests.sh        # Bash script (Linux/Mac)
├── package.json            # Test dependencies & scripts
├── playwright.config.ts    # Playwright тохиргоо
├── tsconfig.json          # TypeScript тохиргоо
├── setup.ts               # Jest global setup
└── README.md              # Энэ файл
```

## 🚀 Ажиллуулах

### Бүх тестүүд

```bash
# PowerShell (Windows)
cd test
.\scripts\run-tests.ps1 all

# Bash (Linux/Mac)
cd test
./scripts/run-tests.sh all

# Эсвэл npm script ашиглах
npm test
```

### Тусад нь ажиллуулах

#### Unit Tests

```bash
npm run test:unit

# Coverage-тэй
npm run test:unit -- --coverage

# Watch mode
npm run test:watch
```

#### Integration Tests

```bash
# ⚠️ Эхлээд microservices-үүдийг асаах хэрэгтэй:
# Terminal 1: nx serve auth-service    (Port 3001)
# Terminal 2: nx serve ride-service    (Port 3003)
# Terminal 3: nx serve booking-service (Port 3004)

npm run test:integration
```

#### E2E Tests (Playwright)

```bash
# Frontend болон API ажиллаж байх ёстой
npm run test:e2e

# UI mode (interactive)
npm run test:e2e:ui

# Headed mode (browser харагдана)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug
```

#### Security Tests

```bash
# API ажиллаж байх ёстой
npm run test:security
```

#### Performance Tests

```bash
# k6 суулгасан байх ёстой
# API ажиллаж байх ёстой

# Бүх performance тестүүд
npm run test:performance

# Тусад нь
npm run test:performance:load
npm run test:performance:stress
npm run test:performance:spike
npm run test:performance:soak
```

## 📊 Test Types

### 1. Unit Tests (test/unit/)

**Зорилго:** Service logic-ийг тусад нь шалгах

**Тестүүд:**

- Auth Service: Register, login, token validation
- Ride Service: Create, search, update, cancel rides
- Booking Service: Create, confirm, cancel bookings

**Ажиллуулах:**

```bash
npm run test:unit
```

**Давуу тал:**

- ✅ Хурдан (dependencies байхгүй)
- ✅ Isolated тестүүд
- ✅ Mock objects ашиглана

### 2. Integration Tests (test/integration/)

**Зорилго:** API endpoints-ийн бүрэн ажиллагааг шалгах

**Тестүүд:**

- Auth API: `/auth/register`, `/auth/login`, `/auth/me`
- Ride API: `/rides`, `/rides/search`, `/rides/:id`
- Booking API: `/bookings`, `/bookings/:id`, `/bookings/confirm`

**Ажиллуулах:**

```bash
# Microservices эхлүүлэх (root folder-оос)
# Auth Service (port 3001)
nx serve auth-service

# Ride Service (port 3003)
nx serve ride-service

# Booking Service (port 3004)
nx serve booking-service

# Тест ажиллуулах
npm run test:integration
```

**Шаардлага:**

- ✅ Auth Service ажиллаж байх (http://localhost:3001)
- ✅ Ride Service ажиллаж байх (http://localhost:3003)
- ✅ Booking Service ажиллаж байх (http://localhost:3004)
- ✅ Database холбогдсон байх

### 3. E2E Tests (test/e2e/)

**Зорилго:** Бүрэн хэрэглэгчийн аялалыг шалгах

**Тестүүд:**

- User registration & login
- Driver: Ride creation
- Passenger: Ride search & booking
- Complete carpooling flow

**Ажиллуулах:**

```bash
# Frontend эхлүүлэх (root folder-оос)
nx serve hop-on

# API эхлүүлэх
nx serve api-gateway

# Тест ажиллуулах
npm run test:e2e
```

**Шаардлага:**

- ✅ Frontend ажиллаж байх (http://localhost:3001)
- ✅ API ажиллаж байх (http://localhost:3000)

### 4. Security Tests (test/security/)

**Зорилго:** Security vulnerabilities шалгах

**Тестүүд:**

- Authentication bypass attempts
- SQL injection prevention
- XSS prevention
- CSRF protection
- Authorization enforcement
- Rate limiting
- Password security

**Ажиллуулах:**

```bash
npm run test:security
```

### 5. Performance Tests (test/performance/)

**Зорилго:** System performance-ийг бодит ачааллын дор шалгах

**Тестүүд:**

- **Load Test:** Normal ачаалал (50 users, 5 min)
- **Stress Test:** Maximum ачаалал (200 users, 10 min)
- **Spike Test:** Гэнэтийн ачаалал (0→200 users)
- **Soak Test:** Удаан хугацааны ачаалал (50 users, 30 min)

**Ажиллуулах:**

```bash
# k6 суулгах
# Windows (chocolatey)
choco install k6

# Linux
sudo apt install k6

# Mac
brew install k6

# Тест ажиллуулах
npm run test:performance
```

## 🔧 Тохиргоо

### Environment Variables

```bash
# .env файл үүсгэх (test folder-т)
API_URL=http://localhost:3000
BASE_URL=http://localhost:3001
NODE_ENV=test
```

### API URL өөрчлөх

```bash
# PowerShell
$env:API_URL="http://localhost:3000"
npm run test:integration

# Bash
export API_URL=http://localhost:3000
npm run test:integration
```

## 📈 Coverage Report

```bash
# Coverage үүсгэх
npm run test:coverage

# Report харах
npm run report:coverage
```

## 🔍 Debugging

### Jest тестүүд

```bash
# Тодорхой тест файл ажиллуулах
npm run test:unit -- auth.service.spec.ts

# Pattern-аар шүүх
npm run test:unit -- --testNamePattern="should login"

# Verbose mode
npm run test:unit -- --verbose
```

### Playwright тестүүд

```bash
# Debug mode
npm run test:e2e:debug

# UI mode (interactive)
npm run test:e2e:ui

# Тодорхой тест ажиллуулах
npx playwright test user-journey.e2e.spec.ts
```

## 🤖 CI/CD Integration

```bash
# CI mode (retry=2, sequential)
npm run test:ci
```

**GitHub Actions example:**

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          npm install
          cd test && npm install

      - name: Start services
        run: |
          npm run dev &
          sleep 10

      - name: Run tests
        run: cd test && npm run test:ci

      - name: Upload test results
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test/coverage
```

## 📝 Тест бичих

### Unit Test жишээ

```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('MyService', () => {
  let service: any;

  beforeEach(() => {
    service = {
      myMethod: jest.fn(),
    };
  });

  it('should do something', async () => {
    service.myMethod.mockResolvedValue({ success: true });

    const result = await service.myMethod();

    expect(service.myMethod).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });
});
```

### Integration Test жишээ

```typescript
import request from 'supertest';

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

describe('API Endpoint', () => {
  it('should return 200', async () => {
    const response = await request(BASE_URL).get('/health').expect(200);

    expect(response.body).toHaveProperty('status', 'ok');
  });
});
```

### E2E Test жишээ

```typescript
import { test, expect } from '@playwright/test';

test('user flow', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="phone"]', '+97699887766');
  await page.fill('input[name="password"]', 'Test123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/\/dashboard/);
});
```

## ⚠️ Common Issues

### Issue 1: API ажиллахгүй байна

```bash
# Check if API is running
curl http://localhost:3000/health

# Start API
nx serve api-gateway
```

### Issue 2: k6 олдохгүй байна

```bash
# Install k6
# Windows
choco install k6

# Linux
sudo apt install k6

# Mac
brew install k6
```

### Issue 3: Port busy

```bash
# Check what's using port 3000
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /PID <PID> /F

# Kill process (Linux/Mac)
kill -9 <PID>
```

### Issue 4: Module олдохгүй

```bash
# Reinstall dependencies
cd test
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

**Асуудал гарвал:**

1. Log файлуудыг шалгах
2. API болон Frontend ажиллаж байгааг шалгах
3. Dependencies бүрэн суусан эсэхийг шалгах
4. GitHub Issues дээр асуулт тавих

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [k6 Documentation](https://k6.io/docs/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

---

**Бүх тестүүд амжилттай ажиллаж байгаа эсэхийг шалгаарай!** ✅

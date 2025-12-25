# Frontend-Backend Integration - Холболт хийгдсэн

## Хийгдсэн өөрчлөлтүүд

### 1. Authentication Context үүсгэсэн

**File:** `apps/hop-on/src/context/AuthContext.tsx`

- Хэрэглэгчийн authentication state удирдах context
- Login, register, logout функцүүд
- Автоматаар token шалгаад хэрэглэгчийн мэдээлэл авах
- localStorage-д token хадгалах

### 2. AuthScreen шинэчилсэн

**File:** `apps/hop-on/src/app/components/AuthScreen.tsx`

- AuthContext ашиглах болгосон
- Backend API руу бодит login/register хүсэлт явуулах
- Token-уудыг context удирддаг болсон

### 3. App.tsx шинэчилсэн

**File:** `apps/hop-on/src/app/App.tsx`

- AuthProvider-ээр wrap хийсэн
- Хэрэглэгчийн мэдээлэл context-оос авах
- Authentication state-д үндэслэн screen солих
- Logout хийхэд home screen руу буцах

### 4. RideFeedScreen - Backend өгөгдөл авах

**File:** `apps/hop-on/src/app/components/RideFeedScreen.tsx`

- useEffect ашиглаж backend-аас зорчилтуудыг татах
- `apiClient.rides.list()` дуудах
- API өгөгдлийг component format руу хөрвүүлэх
- Loading state болон error handling

### 5. ProfileScreen - Хэрэглэгчийн өгөгдөл

**File:** `apps/hop-on/src/app/components/ProfileScreen.tsx`

- AuthContext-оос хэрэглэгчийн мэдээлэл авах
- Backend-аас bookings татах
- Logout товч нэмсэн
- Бодит хэрэглэгчийн мэдээлэл харуулах (нэр, утас, rating гэх мэт)

### 6. API Client аль хэдийн бэлэн байсан

**File:** `apps/hop-on/src/lib/api.ts`

- Бүх endpoint-үүд тодорхойлогдсон
- Auth, Rides, Bookings, Payments, Chat, Notifications
- Token authentication
- Алдааны засварлалт

### 7. CreateRideScreen болон BookingScreen

- Аль хэдийн backend API ашиглаж байсан
- Зорчилт үүсгэх, захиалга үүсгэх функцүүд бэлэн

## Backend Endpoints

API Gateway: `http://localhost:3000/api/v1`

### Auth Endpoints

- POST `/auth/register` - Бүртгүүлэх
- POST `/auth/login` - Нэвтрэх
- GET `/auth/me` - Одоогийн хэрэглэгч
- POST `/auth/logout` - Гарах

### Rides Endpoints

- GET `/rides` - Зорчилтын жагсаалт
- GET `/rides/:id` - Зорчилтын дэлгэрэнгүй
- POST `/rides` - Зорчилт үүсгэх
- PATCH `/rides/:id` - Зорчилт шинэчлэх

### Bookings Endpoints

- GET `/bookings/my-bookings` - Миний захиалгууд
- POST `/bookings` - Захиалга үүсгэх
- GET `/bookings/:id` - Захиалгын дэлгэрэнгүй

## Ажиллуулах заавар

### 1. Backend-ийг эхлүүлэх

```powershell
# Root directory дээр
./start-all-services.ps1
```

Эсвэл тус тусад нь:

```powershell
cd apps/services/api-gateway
npm run dev

cd apps/services/auth-service
npm run dev

cd apps/services/ride-service
npm run dev

cd apps/services/booking-service
npm run dev
```

### 2. Frontend-ийг эхлүүлэх

```powershell
cd apps/hop-on
npm run dev
```

### 3. Туршилт хийх

1. **Бүртгүүлэх**
   - Home screen дээр "Sign up" дарах
   - Утас, нууц үг, нэр оруулах
   - "Бүртгүүлэх" дарах
   - Backend руу `POST /auth/register` хүсэлт явна

2. **Нэвтрэх**
   - "Бүртгэлтэй юу? Нэвтрэх" дарах
   - Утас болон нууц үг оруулах
   - "Нэвтрэх" дарах
   - Backend руу `POST /auth/login` хүсэлт явна
   - Token хадгалагдаж, Onboarding screen гарна

3. **Зорчилтууд харах**
   - Onboarding дуусаад Feed screen гарна
   - Backend-аас бодит зорчилтууд татагдана (`GET /rides`)
   - Зорчилтын жагсаалт харагдана

4. **Зорчилт үүсгэх (Жолооч)**
   - Onboarding дээр "Driver" сонгоно
   - Feed screen дээр "Publish a ride" дарах
   - Мэдээлэл оруулах
   - Backend руу `POST /rides` хүсэлт явна

5. **Захиалга үүсгэх (Зорчигч)**
   - Зорчилт дээр "Request to join" дарах
   - Суудлын тоо сонгох
   - "Confirm booking" дарах
   - Backend руу `POST /bookings` хүсэлт явна

6. **Profile харах**
   - Profile icon дарах
   - Хэрэглэгчийн бодит мэдээлэл харагдана
   - Bookings татагдана
   - "Logout" дарж гарч болно

## Анхаарах зүйлүүд

### Environment Variables

Frontend `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_CHAT_URL=http://localhost:3006
```

### CORS Settings

API Gateway дээр CORS идэвхжүүлсэн байх ёстой:

```typescript
app.enableCors({
  origin: 'http://localhost:4200', // Frontend URL
  credentials: true,
});
```

### Token Storage

- Access token: `localStorage.getItem('accessToken')`
- Refresh token: `localStorage.getItem('refreshToken')`
- Автоматаар header-т нэмэгдэнэ

### Error Handling

- Network errors → Toast notification
- 401 Unauthorized → Token refresh эсвэл logout
- 500 Server errors → Error message

## Цаашид хийх зүйлүүд

1. **Token Refresh Logic**
   - Access token дуусахад автоматаар refresh хийх
   - Interceptor нэмэх

2. **Real-time Updates**
   - Socket.IO integration for live ride updates
   - Notification service холбох

3. **Geocoding**
   - Хаягуудаас координат олох
   - Google Maps Integration

4. **Payment Integration**
   - Төлбөр төлөх функц
   - Wallet balance харах

5. **Optimization**
   - React Query эсвэл SWR ашиглах
   - Caching хийх
   - Loading states сайжруулах

## Алдаа гарвал шалгах зүйлүүд

1. Backend ажиллаж байгаа эсэх: `http://localhost:3000/api/v1/health`
2. CORS тохиргоо зөв эсэх
3. Environment variables зөв эсэх
4. Browser console дээр алдаа байгаа эсэх
5. Network tab дээр хүсэлтүүд очиж байгаа эсэх

## Туслах командууд

```powershell
# Backend logs харах
cd apps/services/api-gateway
npm run dev

# Frontend logs
cd apps/hop-on
npm run dev

# Database reset (хэрэв хэрэгтэй бол)
cd infra/db
node neon-reseed.js
```

---

**Summary:** Frontend нь одоо backend-тай бүрэн холбогдсон. Login, register, rides fetch, booking create гэх мэт бүх үндсэн функцүүд backend API ашиглаж ажиллана. AuthContext нь хэрэглэгчийн state-ийг удирдаж, бүх компонентууд бодит өгөгдөл ашиглана.

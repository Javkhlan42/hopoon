# Backend Fix Checklist - Hope-On Platform

Backend developer нарт зориулсан - тестүүдийг бүрэн амжилттай болгох засварын жагсаалт.

## 🎯 Зорилго

23 алдаатай тестийг засаж, 100% амжилттай болгох.

## ✅ Хийх ёстой засвар

### 1. Ride Service - Validation (12 тест)

#### Issue: Origin/Destination validation

**Файл:** `apps/services/ride-service/src/rides/rides.dto.ts`

**Одоогийн асуудал:**

```typescript
// Test илгээж байгаа:
{
  origin: {
    address: "Ulaanbaatar, Mongolia",
    lat: 47.9186,
    lng: 106.9177
  },
  destination: {
    address: "Darkhan, Mongolia",
    lat: 49.4865,
    lng: 105.9722
  }
}

// Алдаа: "origin.address should not be empty"
```

**Шийдэл:**

```typescript
// CreateRideDto.ts-д нэмэх
import { IsString, IsNotEmpty, IsNumber, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class LocationDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @IsNumber()
  @IsNotEmpty()
  lng: number;
}

export class CreateRideDto {
  @ValidateNested()
  @Type(() => LocationDto)
  @IsObject()
  @IsNotEmpty()
  origin: LocationDto;

  @ValidateNested()
  @Type(() => LocationDto)
  @IsObject()
  @IsNotEmpty()
  destination: LocationDto;

  // ... бусад fields
}
```

#### Issue: 500 Internal Server Error

**Файл:** `apps/services/ride-service/src/rides/rides.controller.ts`

**Алдаа:** GET/PATCH/DELETE `/rides/:id` endpoint-үүд 500 буцаана

**Шийдэл:**

```typescript
// rides.controller.ts
@Get(':id')
async getRide(@Param('id', ParseUUIDPipe) id: string) {
  try {
    const ride = await this.ridesService.findOne(id);
    if (!ride) {
      throw new NotFoundException(`Ride with ID ${id} not found`);
    }
    return ride;
  } catch (error) {
    if (error instanceof NotFoundException) {
      throw error;
    }
    throw new InternalServerErrorException('Failed to fetch ride');
  }
}

// PATCH, DELETE endpoint-үүд дээр мөн адилхан
```

**Шалгах:**

```powershell
npm run test:integration -- ride.integration.spec.ts
```

---

### 2. Booking Service - Validation & Error Handling (11 тест)

#### Issue: Booking creation failing

**Файл:** `apps/services/booking-service/src/bookings/bookings.service.ts`

**Асуудал:** Ride байгаа эсэхийг шалгахгүй байна

**Шийдэл:**

```typescript
async create(createBookingDto: CreateBookingDto, userId: string) {
  // 1. Ride байгаа эсэхийг шалгах
  const ride = await this.ridesService.findOne(createBookingDto.rideId);
  if (!ride) {
    throw new NotFoundException(`Ride with ID ${createBookingDto.rideId} not found`);
  }

  // 2. Driver өөрийн ride-г booking хийж байгаа эсэхийг шалгах
  if (ride.driverId === userId) {
    throw new ForbiddenException('Driver cannot book their own ride');
  }

  // 3. Available seats шалгах
  if (ride.availableSeats < createBookingDto.seats) {
    throw new BadRequestException('Not enough available seats');
  }

  // 4. Booking үүсгэх
  return this.bookingsRepository.create({
    ...createBookingDto,
    passengerId: userId,
    totalPrice: ride.pricePerSeat * createBookingDto.seats,
    status: 'pending'
  });
}
```

#### Issue: Response format inconsistency

**Файл:** `apps/services/booking-service/src/bookings/bookings.service.ts`

**Асуудал:**

```typescript
// Одоо:
return { data: bookings, total: count };

// Тест хүлээж байгаа:
return {
  data: bookings,
  meta: {
    page: query.page || 1,
    limit: query.limit || 10,
    total: count,
  },
};
```

**Шийдэл:**

```typescript
async findAll(query: BookingQueryDto, userId: string) {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  const [bookings, total] = await this.bookingsRepository.findAndCount({
    where: { passengerId: userId },
    skip,
    take: limit,
  });

  return {
    data: bookings,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}
```

#### Issue: Driver role check

**Файл:** `apps/services/booking-service/src/bookings/bookings.controller.ts`

**Асуудал:** `/bookings/driver` endpoint passenger хандаж байна

**Шийдэл:**

```typescript
@Get('driver')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('driver')  // RoleGuard нэмэх
async getDriverBookings(@Request() req) {
  return this.bookingsService.findDriverBookings(req.user.userId);
}
```

**Шалгах:**

```powershell
npm run test:integration -- booking.integration.spec.ts
```

---

### 3. Auth Service - Password Complexity (1 тест)

#### Issue: Weak password хүлээн авч байна

**Файл:** `apps/services/auth-service/src/auth/auth.dto.ts`

**Одоо:**

```typescript
export class RegisterDto {
  @IsString()
  @MinLength(6)
  password: string;
}
```

**Шийдэл:**

```typescript
import { Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;
}
```

**Шалгах:**

```powershell
npm run test:security
```

---

## 🔍 Засвар хийх дараалал

### Phase 1: Auth Service (5 мин)

1. ✅ Password complexity нэмэх
2. ✅ Тест ажиллуулах: `npm run test:security`
3. ✅ Expected: 1 more test passing (12/14 → 13/14)

### Phase 2: Ride Service (30 мин)

1. ✅ LocationDto class үүсгэх
2. ✅ CreateRideDto validation засах
3. ✅ Error handling нэмэх (try-catch)
4. ✅ UUID validation нэмэх
5. ✅ Тест ажиллуулах: `npm run test:integration -- ride`
6. ✅ Expected: 12 more tests passing (7/19 → 19/19)

### Phase 3: Booking Service (30 мин)

1. ✅ Ride existence check нэмэх
2. ✅ Driver self-booking check нэмэх
3. ✅ Available seats check нэмэх
4. ✅ Response format засах (meta field)
5. ✅ Role guard нэмэх
6. ✅ Error handling сайжруулах
7. ✅ Тест ажиллуулах: `npm run test:integration -- booking`
8. ✅ Expected: 11 more tests passing (8/21 → 19/21, 2 implementation dependent)

---

## 📋 Засварын checklist

### Auth Service

- [ ] Password regex validation нэмсэн
- [ ] Error messages тодорхой
- [ ] Tests passing: `npm run test:security`

### Ride Service

- [ ] LocationDto class үүсгэсэн
- [ ] CreateRideDto ValidateNested ашиглаж байна
- [ ] GET /rides/:id error handling
- [ ] PATCH /rides/:id error handling
- [ ] DELETE /rides/:id error handling
- [ ] UUID validation ParseUUIDPipe ашиглаж байна
- [ ] Tests passing: `npm run test:integration -- ride`

### Booking Service

- [ ] Ride existence check
- [ ] Driver self-booking prevention
- [ ] Available seats validation
- [ ] Response format standardized (meta field)
- [ ] Role guard implemented
- [ ] GET /bookings/:id error handling
- [ ] PATCH /bookings/:id/approve error handling
- [ ] DELETE /bookings/:id error handling
- [ ] Tests passing: `npm run test:integration -- booking`

---

## 🧪 Бүх тестийг шалгах

Засвар бүрийн дараа:

```powershell
cd test
npm test
```

**Target:** 129/129 tests passing (100%)

---

## 📊 Progress Tracking

| Service  | Tests | Status     | Priority |
| -------- | ----- | ---------- | -------- |
| Auth     | 19/19 | ✅ DONE    | -        |
| Unit     | 17/17 | ✅ DONE    | -        |
| Security | 11/14 | ⚠️ 1 fail  | HIGH     |
| Ride     | 7/19  | ⚠️ 12 fail | HIGH     |
| Booking  | 8/21  | ⚠️ 11 fail | MEDIUM   |

---

## 💡 Tips

1. **Error Handling Pattern:**

   ```typescript
   try {
     // operation
   } catch (error) {
     if (error instanceof NotFoundException) {
       throw error;
     }
     this.logger.error('Operation failed', error);
     throw new InternalServerErrorException('Operation failed');
   }
   ```

2. **UUID Validation:**

   ```typescript
   @Get(':id')
   async getRide(@Param('id', ParseUUIDPipe) id: string) {
     // автоматаар UUID validate хийнэ
   }
   ```

3. **Test Running:**

   ```powershell
   # Тодорхой файл
   npm test -- ride.integration.spec.ts

   # Watch mode
   npm run test:watch

   # Verbose
   npm test -- --verbose
   ```

---

## 🆘 Тусламж

**Алдаа гарвал:**

1. Test output-ыг анхааралтай уншаарай
2. Expected vs Received-г харьцуулаарай
3. Backend service logs шалгаарай
4. [TEST_SUMMARY.md](TEST_SUMMARY.md) уншаарай

**Асуулт байвал:**

- GitHub Issues: https://github.com/Bagee1/hop-on/issues
- Test documentation: [README.md](README.md)

---

✅ **Бүх засвар хийгдсэний дараа: 129/129 tests passing!** 🎉

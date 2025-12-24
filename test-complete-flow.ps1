# Complete test - Driver creates ride, Passenger books it
$AUTH_URL = "http://localhost:3001"
$RIDE_URL = "http://localhost:3003"
$BOOKING_URL = "http://localhost:3004"

Write-Host "=== Complete Ride Lifecycle Test ===" -ForegroundColor Cyan
Write-Host "Driver creates ride -> Passenger books it`n" -ForegroundColor Gray

# ========== PART 1: DRIVER ==========
Write-Host "==== PART 1: DRIVER ====" -ForegroundColor Magenta

# 1. Register Driver
$driverPhone = "+976" + (Get-Random -Minimum 80000000 -Maximum 99999999)
Write-Host "`n[1] Registering driver..." -ForegroundColor Yellow
Write-Host "  Phone: $driverPhone" -ForegroundColor Gray

$driverRegister = @{
    phone = $driverPhone
    password = "Driver123!@#"
    name = "Test Driver"
    role = "driver"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$AUTH_URL/auth/register" -Method POST -Body $driverRegister -ContentType "application/json" | Out-Null
    Write-Host "[OK] Driver registered!" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Driver registration failed: $_" -ForegroundColor Red
    exit 1
}

# 2. Driver Login
Write-Host "`n[2] Driver logging in..." -ForegroundColor Yellow

$driverLogin = @{
    phone = $driverPhone
    password = "Driver123!@#"
} | ConvertTo-Json

try {
    $driverAuth = Invoke-RestMethod -Uri "$AUTH_URL/auth/login" -Method POST -Body $driverLogin -ContentType "application/json"
    $driverToken = $driverAuth.accessToken
    $driverId = $driverAuth.user.id
    Write-Host "[OK] Driver logged in!" -ForegroundColor Green
    Write-Host "  Driver ID: $driverId" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] Driver login failed: $_" -ForegroundColor Red
    exit 1
}

# 3. Create Ride
Write-Host "`n[3] Driver creating ride..." -ForegroundColor Yellow

$departureTime = (Get-Date).AddHours(3)
$rideData = @{
    origin = @{
        lat = 47.9184
        lng = 106.9177
        address = "Ulaanbaatar, Sukhbaatar Square"
    }
    destination = @{
        lat = 49.4863
        lng = 105.9714
        address = "Darkhan city"
    }
    departureTime = $departureTime.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    availableSeats = 3
    pricePerSeat = 25000
} | ConvertTo-Json -Depth 10

try {
    $ride = Invoke-RestMethod -Uri "$RIDE_URL/rides" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $driverToken"
            "Content-Type" = "application/json"
        } `
        -Body $rideData
    
    $rideId = $ride.id
    Write-Host "[OK] Ride created!" -ForegroundColor Green
    Write-Host "  Ride ID: $rideId" -ForegroundColor Cyan
    Write-Host "  Route: $($ride.origin_address) -> $($ride.destination_address)" -ForegroundColor Gray
    Write-Host "  Price: $($ride.price_per_seat) MNT/seat" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] Ride creation failed: $_" -ForegroundColor Red
    exit 1
}

# ========== PART 2: PASSENGER ==========
Write-Host "`n==== PART 2: PASSENGER ====" -ForegroundColor Magenta

# 4. Register Passenger
$passengerPhone = "+976" + (Get-Random -Minimum 80000000 -Maximum 99999999)
Write-Host "`n[4] Registering passenger..." -ForegroundColor Yellow
Write-Host "  Phone: $passengerPhone" -ForegroundColor Gray

$passengerRegister = @{
    phone = $passengerPhone
    password = "Passenger123!@#"
    name = "Test Passenger"
    role = "passenger"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$AUTH_URL/auth/register" -Method POST -Body $passengerRegister -ContentType "application/json" | Out-Null
    Write-Host "[OK] Passenger registered!" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Passenger registration failed: $_" -ForegroundColor Red
    exit 1
}

# 5. Passenger Login
Write-Host "`n[5] Passenger logging in..." -ForegroundColor Yellow

$passengerLogin = @{
    phone = $passengerPhone
    password = "Passenger123!@#"
} | ConvertTo-Json

try {
    $passengerAuth = Invoke-RestMethod -Uri "$AUTH_URL/auth/login" -Method POST -Body $passengerLogin -ContentType "application/json"
    $passengerToken = $passengerAuth.accessToken
    $passengerId = $passengerAuth.user.id
    Write-Host "[OK] Passenger logged in!" -ForegroundColor Green
    Write-Host "  Passenger ID: $passengerId" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] Passenger login failed: $_" -ForegroundColor Red
    exit 1
}

# 6. Create Booking
Write-Host "`n[6] Passenger booking ride..." -ForegroundColor Yellow
Write-Host "  Ride ID: $rideId" -ForegroundColor Gray

$bookingData = @{
    rideId = $rideId
    seats = 2
} | ConvertTo-Json

try {
    $booking = Invoke-RestMethod -Uri "$BOOKING_URL/bookings" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $passengerToken"
            "Content-Type" = "application/json"
        } `
        -Body $bookingData
    
    $bookingId = $booking.id
    Write-Host "[OK] Booking created!" -ForegroundColor Green
    Write-Host "  Booking ID: $bookingId" -ForegroundColor Cyan
    Write-Host "  Status: $($booking.status)" -ForegroundColor Gray
    Write-Host "  Seats: $($booking.seats)" -ForegroundColor Gray
    Write-Host "  Total Price: $($booking.price) MNT" -ForegroundColor Gray
} catch {
    $errorMsg = $_.Exception.Message
    $errorResponse = $_.ErrorDetails.Message
    Write-Host "[ERROR] Booking creation failed!" -ForegroundColor Red
    Write-Host "  Error: $errorMsg" -ForegroundColor Red
    if ($errorResponse) {
        Write-Host "  Details: $errorResponse" -ForegroundColor Red
    }
    exit 1
}

# 7. Verify booking
Write-Host "`n[7] Verifying booking..." -ForegroundColor Yellow

try {
    $bookingDetails = Invoke-RestMethod -Uri "$BOOKING_URL/bookings/$bookingId" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $passengerToken"
        }
    
    Write-Host "[OK] Booking verified!" -ForegroundColor Green
    Write-Host "  Booking ID: $($bookingDetails.id)" -ForegroundColor Gray
    Write-Host "  Ride ID: $($bookingDetails.ride_id)" -ForegroundColor Gray
    Write-Host "  Passenger ID: $($bookingDetails.passenger_id)" -ForegroundColor Gray
    Write-Host "  Status: $($bookingDetails.status)" -ForegroundColor Gray
} catch {
    Write-Host "[WARN] Could not verify booking: $_" -ForegroundColor Yellow
}

Write-Host "`n=== Test Completed Successfully! ===" -ForegroundColor Green
Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "  Driver Phone: $driverPhone (ID: $driverId)" -ForegroundColor White
Write-Host "  Passenger Phone: $passengerPhone (ID: $passengerId)" -ForegroundColor White
Write-Host "  Ride ID: $rideId" -ForegroundColor White
Write-Host "  Booking ID: $bookingId" -ForegroundColor White

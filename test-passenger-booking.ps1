# Passenger test script - Register and create booking
$AUTH_URL = "http://localhost:3001"
$RIDE_URL = "http://localhost:3003"
$BOOKING_URL = "http://localhost:3004"

Write-Host "=== Passenger Test - Register and Create Booking ===" -ForegroundColor Cyan

# Generate unique phone number
$phone = "+976" + (Get-Random -Minimum 80000000 -Maximum 99999999)

# 1. Register new passenger
Write-Host "`n[1] Registering new passenger..." -ForegroundColor Yellow
Write-Host "  Phone: $phone" -ForegroundColor Gray

$registerData = @{
    phone = $phone
    password = "Passenger123!@#"
    name = "Test Passenger User"
    role = "passenger"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$AUTH_URL/auth/register" `
        -Method POST `
        -Body $registerData `
        -ContentType "application/json"
    
    Write-Host "[OK] Passenger registered!" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Registration failed: $_" -ForegroundColor Red
    exit 1
}

# 2. Login
Write-Host "`n[2] Logging in..." -ForegroundColor Yellow

$loginData = @{
    phone = $phone
    password = "Passenger123!@#"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$AUTH_URL/auth/login" `
        -Method POST `
        -Body $loginData `
        -ContentType "application/json"
    
    $token = $loginResponse.accessToken
    $passengerId = $loginResponse.user.id
    
    Write-Host "[OK] Login successful!" -ForegroundColor Green
    Write-Host "  Passenger ID: $passengerId" -ForegroundColor Gray
    Write-Host "  Token: $($token.Substring(0,30))..." -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] Login failed: $_" -ForegroundColor Red
    exit 1
}

# 3. Find available rides
Write-Host "`n[3] Finding available rides..." -ForegroundColor Yellow

try {
    $ridesResponse = Invoke-RestMethod -Uri "$RIDE_URL/rides?status=active" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $token"
        }
    
    # Response is { data: [...], total: n }
    $availableRides = $ridesResponse.data
    $rideCount = $ridesResponse.total
    
    Write-Host "[OK] Found $rideCount active ride(s)" -ForegroundColor Green
    
    if ($rideCount -eq 0) {
        Write-Host "[WARN] No active rides available. Please create a ride first using test-driver-new.ps1" -ForegroundColor Yellow
        exit 0
    }
    
    # Select most recent ride (likely the test ride we created earlier)
    $selectedRide = $availableRides | Sort-Object -Property created_at -Descending | Select-Object -First 1
    $rideId = $selectedRide.id
    
    Write-Host "  Selected Ride ID: $rideId" -ForegroundColor Cyan
    Write-Host "  Route: $($selectedRide.origin_address) -> $($selectedRide.destination_address)" -ForegroundColor Gray
    Write-Host "  Available Seats: $($selectedRide.available_seats)" -ForegroundColor Gray
    Write-Host "  Price per Seat: $($selectedRide.price_per_seat) MNT" -ForegroundColor Gray
    
} catch {
    Write-Host "[ERROR] Failed to get rides: $_" -ForegroundColor Red
    exit 1
}

# 4. Create a booking (POST request)
Write-Host "`n[4] Creating booking..." -ForegroundColor Yellow
Write-Host "  Ride ID to book: $rideId" -ForegroundColor Gray

$bookingData = @{
    rideId = $rideId
    seats = 1
}

Write-Host "  Booking data: $(ConvertTo-Json $bookingData -Compress)" -ForegroundColor DarkGray

$bookingDataJson = ConvertTo-Json $bookingData -Depth 10

try {
    $bookingResponse = Invoke-RestMethod -Uri "$BOOKING_URL/bookings" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        } `
        -Body $bookingDataJson
    
    $bookingId = $bookingResponse.id
    
    Write-Host "[OK] Booking created successfully!" -ForegroundColor Green
    Write-Host "" -ForegroundColor Gray
    Write-Host "  Booking ID: $bookingId" -ForegroundColor Cyan
    Write-Host "  Status: $($bookingResponse.status)" -ForegroundColor Gray
    Write-Host "  Seats: $($bookingResponse.seats)" -ForegroundColor Gray
    Write-Host "  Total Price: $($bookingResponse.price) MNT" -ForegroundColor Gray
    
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

# 5. Get my bookings
Write-Host "`n[5] Getting my bookings..." -ForegroundColor Yellow

try {
    $myBookings = Invoke-RestMethod -Uri "$BOOKING_URL/bookings?passengerId=$passengerId" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $token"
        }
    
    if ($myBookings -is [array]) {
        $count = $myBookings.Count
    } else {
        $count = if ($myBookings) { 1 } else { 0 }
    }
    
    Write-Host "[OK] Total bookings: $count" -ForegroundColor Green
    
    if ($count -gt 0) {
        $bookingsToShow = if ($myBookings -is [array]) { $myBookings | Select-Object -First 3 } else { @($myBookings) }
        foreach ($booking in $bookingsToShow) {
            Write-Host "  - Booking ID: $($booking.id)" -ForegroundColor Gray
            Write-Host "    Status: $($booking.status), Seats: $($booking.seats), Price: $($booking.price) MNT" -ForegroundColor DarkGray
        }
    }
} catch {
    Write-Host "[WARN] Failed to get bookings: $_" -ForegroundColor Yellow
}

Write-Host "`n=== Test Completed Successfully ===" -ForegroundColor Green
Write-Host "`nCreated Resources:" -ForegroundColor Cyan
Write-Host "  Passenger Phone: $phone" -ForegroundColor White
Write-Host "  Passenger ID: $passengerId" -ForegroundColor White
Write-Host "  Booking ID: $bookingId" -ForegroundColor White
Write-Host "  Ride ID: $rideId" -ForegroundColor White
Write-Host "`nNext Actions:" -ForegroundColor Cyan
Write-Host "  - Cancel booking: DELETE $BOOKING_URL/bookings/$bookingId" -ForegroundColor Gray
Write-Host "  - Get booking details: GET $BOOKING_URL/bookings/$bookingId" -ForegroundColor Gray

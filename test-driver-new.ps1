# Driver test script - Register new driver and create ride
$AUTH_URL = "http://localhost:3001"
$GATEWAY_URL = "http://localhost:3000"
$RIDE_URL = "http://localhost:3003"

Write-Host "=== Driver Test - Register and Create Ride ===" -ForegroundColor Cyan

# Generate unique phone number
$phone = "+976" + (Get-Random -Minimum 80000000 -Maximum 99999999)

# 1. Register new driver
Write-Host "`n[1] Registering new driver..." -ForegroundColor Yellow
Write-Host "  Phone: $phone" -ForegroundColor Gray

$registerData = @{
    phone = $phone
    password = "Driver123!@#"
    name = "Test Driver Sarnai"
    role = "driver"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$AUTH_URL/auth/register" `
        -Method POST `
        -Body $registerData `
        -ContentType "application/json"
    
    Write-Host "[OK] Driver registered!" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Registration failed: $_" -ForegroundColor Red
    exit 1
}

# 2. Login
Write-Host "`n[2] Logging in..." -ForegroundColor Yellow

$loginData = @{
    phone = $phone
    password = "Driver123!@#"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$AUTH_URL/auth/login" `
        -Method POST `
        -Body $loginData `
        -ContentType "application/json"
    
    $token = $loginResponse.accessToken
    $driverId = $loginResponse.user.id
    
    Write-Host "[OK] Login successful!" -ForegroundColor Green
    Write-Host "  Driver ID: $driverId" -ForegroundColor Gray
    Write-Host "  Token: $($token.Substring(0,30))..." -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] Login failed: $_" -ForegroundColor Red
    exit 1
}

# 3. Create a new ride (POST request)
Write-Host "`n[3] Creating new ride POST..." -ForegroundColor Yellow

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
    $rideResponse = Invoke-RestMethod -Uri "$RIDE_URL/rides" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        } `
        -Body $rideData
    
    $rideId = $rideResponse.id
    
    Write-Host "[OK] Ride created successfully!" -ForegroundColor Green
    Write-Host "" -ForegroundColor Gray
    Write-Host "  Ride ID: $rideId" -ForegroundColor Cyan
    Write-Host "  Status: $($rideResponse.status)" -ForegroundColor Gray
    Write-Host "  Available Seats: $($rideResponse.availableSeats)" -ForegroundColor Gray
    Write-Host "  Price per Seat: $($rideResponse.pricePerSeat) MNT" -ForegroundColor Gray
    Write-Host "  Departure: $($departureTime.ToString('yyyy-MM-dd HH:mm'))" -ForegroundColor Gray
    
    if ($rideResponse.route) {
        $distanceKm = [math]::Round($rideResponse.route.distance / 1000, 2)
        $durationMin = [math]::Round($rideResponse.route.duration / 60, 0)
        Write-Host "  Distance: $distanceKm km" -ForegroundColor Gray
        Write-Host "  Duration: $durationMin min" -ForegroundColor Gray
    }
} catch {
    $errorMsg = $_.Exception.Message
    $errorResponse = $_.ErrorDetails.Message
    Write-Host "[ERROR] Ride creation failed!" -ForegroundColor Red
    Write-Host "  Error: $errorMsg" -ForegroundColor Red
    if ($errorResponse) {
        Write-Host "  Details: $errorResponse" -ForegroundColor Red
    }
    exit 1
}

# 4. Get my rides
Write-Host "`n[4] Getting my rides..." -ForegroundColor Yellow

try {
    $myRides = Invoke-RestMethod -Uri "$RIDE_URL/rides?driverId=$driverId" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $token"
        }
    
    if ($myRides -is [array]) {
        $count = $myRides.Count
    } else {
        $count = 1
    }
    
    Write-Host "[OK] Total rides: $count" -ForegroundColor Green
    
    if ($count -gt 0) {
        $ridesToShow = if ($myRides -is [array]) { $myRides | Select-Object -First 3 } else { @($myRides) }
        foreach ($ride in $ridesToShow) {
            Write-Host "  - $($ride.origin.address) -> $($ride.destination.address)" -ForegroundColor Gray
            Write-Host "    Status: $($ride.status), Seats: $($ride.availableSeats)" -ForegroundColor DarkGray
        }
    }
} catch {
    Write-Host "[WARN] Failed to get rides: $_" -ForegroundColor Yellow
}

Write-Host "`n=== Test Completed Successfully ===" -ForegroundColor Green
Write-Host "`nCreated Resources:" -ForegroundColor Cyan
Write-Host "  Driver Phone: $phone" -ForegroundColor White
Write-Host "  Driver ID: $driverId" -ForegroundColor White
Write-Host "  Ride ID: $rideId" -ForegroundColor White
Write-Host "`nNext Actions:" -ForegroundColor Cyan
Write-Host "  - Update ride: PATCH $RIDE_URL/rides/$rideId" -ForegroundColor Gray
Write-Host "  - Start ride: POST $RIDE_URL/rides/$rideId/start" -ForegroundColor Gray
Write-Host "  - Cancel ride: DELETE $RIDE_URL/rides/$rideId" -ForegroundColor Gray

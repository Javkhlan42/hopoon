# Driver Sarnai test script
# Phone: +97699123458
# Password: password123

$AUTH_URL = "http://localhost:3001"
$GATEWAY_URL = "http://localhost:3000"

Write-Host "=== Driver Sarnai Login Test ===" -ForegroundColor Cyan

# 1. Login as Sarnai (driver)
$loginData = @{
    phone = "+97699123458"
    password = "password123"
} | ConvertTo-Json

Write-Host "`n[1] Logging in..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-RestMethod -Uri "$AUTH_URL/auth/login" `
        -Method POST `
        -Body $loginData `
        -ContentType "application/json"
    
    $token = $loginResponse.accessToken
    $driverId = $loginResponse.user.id
    
    Write-Host "[OK] Login successful!" -ForegroundColor Green
    Write-Host "  Driver ID: $driverId" -ForegroundColor Gray
    Write-Host "  Token: $($token.Substring(0,20))..." -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] Login failed: $_" -ForegroundColor Red
    exit 1
}

# 2. Create a new ride (POST request)
Write-Host "`n[2] Creating new ride..." -ForegroundColor Yellow

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
    departureTime = (Get-Date).AddHours(3).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    availableSeats = 3
    pricePerSeat = 25000
    notes = "Trip to Darkhan. Comfortable ride!"
} | ConvertTo-Json -Depth 10

try {
    $rideResponse = Invoke-RestMethod -Uri "$GATEWAY_URL/rides" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        } `
        -Body $rideData
    
    $rideId = $rideResponse.id
    
    Write-Host "[OK] Ride created successfully!" -ForegroundColor Green
    Write-Host "  Ride ID: $rideId" -ForegroundColor Gray
    Write-Host "  Status: $($rideResponse.status)" -ForegroundColor Gray
    Write-Host "  Available Seats: $($rideResponse.availableSeats)" -ForegroundColor Gray
    Write-Host "  Price per Seat: $($rideResponse.pricePerSeat) MNT" -ForegroundColor Gray
    
    if ($rideResponse.route) {
        Write-Host "  Distance: $([math]::Round($rideResponse.route.distance / 1000, 2)) km" -ForegroundColor Gray
        Write-Host "  Duration: $([math]::Round($rideResponse.route.duration / 60, 0)) min" -ForegroundColor Gray
    }
} catch {
    Write-Host "[ERROR] Ride creation failed: $_" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
    exit 1
}

# 3. Get my rides
Write-Host "`n[3] Getting my rides..." -ForegroundColor Yellow

try {
    $myRides = Invoke-RestMethod -Uri "$GATEWAY_URL/rides?driverId=$driverId" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $token"
        }
    
    Write-Host "[OK] Total rides: $($myRides.Count)" -ForegroundColor Green
    
    foreach ($ride in $myRides | Select-Object -First 3) {
        Write-Host "  - $($ride.origin.address) -> $($ride.destination.address)" -ForegroundColor Gray
        Write-Host "    Status: $($ride.status), Seats: $($ride.availableSeats)" -ForegroundColor DarkGray
    }
} catch {
    Write-Host "[ERROR] Failed to get rides: $_" -ForegroundColor Red
}

Write-Host "`n=== Test Completed ===" -ForegroundColor Green
Write-Host "`nNext actions available:" -ForegroundColor Cyan
Write-Host "  - Update ride: PATCH $GATEWAY_URL/rides/$rideId" -ForegroundColor Gray
Write-Host "  - Start ride: POST $GATEWAY_URL/rides/$rideId/start" -ForegroundColor Gray
Write-Host "  - Cancel ride: DELETE $GATEWAY_URL/rides/$rideId" -ForegroundColor Gray

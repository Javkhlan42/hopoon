# Test: Complete Driver Flow (Register -> Login -> Create Ride)
param(
    [string]$AuthUrl = "http://localhost:3001",
    [string]$RideUrl = "http://localhost:3003"
)

Write-Host "`n=== Ride Test: Complete Driver Flow ===" -ForegroundColor Cyan

# 1. Register driver
Write-Host "`n[STEP 1/3] Registering driver..." -ForegroundColor Yellow
$registerResult = & "$PSScriptRoot\..\auth\test-register.ps1" -AuthUrl $AuthUrl -Role "driver"

if (-not $registerResult.Success) {
    Write-Host "`n❌ [FAILED] Driver registration failed!" -ForegroundColor Red
    exit 1
}

$token = $registerResult.Token
$driverId = $registerResult.UserId

# 2. Create ride
Write-Host "`n[STEP 2/3] Creating ride..." -ForegroundColor Yellow

$departureTime = (Get-Date).AddHours(3).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")

$rideData = @{
    origin = @{
        lat = 47.9184
        lng = 106.9177
        address = "Sukhbaatar Square, Ulaanbaatar"
    }
    destination = @{
        lat = 49.4863
        lng = 105.9714
        address = "Darkhan City"
    }
    departureTime = $departureTime
    availableSeats = 3
    pricePerSeat = 25000
} | ConvertTo-Json -Depth 10

try {
    $rideResponse = Invoke-RestMethod -Uri "$RideUrl/rides" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        } `
        -Body $rideData
    
    Write-Host "✅ Ride created successfully!" -ForegroundColor Green
    Write-Host "  Ride ID: $($rideResponse.id)" -ForegroundColor Gray
    Write-Host "  Status: $($rideResponse.status)" -ForegroundColor Gray
    Write-Host "  Seats: $($rideResponse.availableSeats)" -ForegroundColor Gray
    Write-Host "  Price: $($rideResponse.pricePerSeat) MNT" -ForegroundColor Gray
    
    $rideId = $rideResponse.id
} catch {
    Write-Host "❌ Ride creation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. Get driver's rides
Write-Host "`n[STEP 3/3] Getting driver's rides..." -ForegroundColor Yellow

try {
    $myRides = Invoke-RestMethod -Uri "$RideUrl/rides?driverId=$driverId" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $token" }
    
    $count = if ($myRides -is [array]) { $myRides.Count } else { 1 }
    Write-Host "✅ Found $count ride(s)" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Failed to get rides: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n=== Driver Flow Test Complete ===" -ForegroundColor Green
Write-Host "`nCreated Resources:" -ForegroundColor Cyan
Write-Host "  Driver ID: $driverId" -ForegroundColor White
Write-Host "  Ride ID: $rideId" -ForegroundColor White
Write-Host "  Token: $($token.Substring(0,30))..." -ForegroundColor White

return @{
    Success = $true
    DriverId = $driverId
    RideId = $rideId
    Token = $token
}

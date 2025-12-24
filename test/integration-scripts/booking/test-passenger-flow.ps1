# Test: Complete Passenger Flow (Register -> Find Ride -> Book)
param(
    [string]$AuthUrl = "http://localhost:3001",
    [string]$RideUrl = "http://localhost:3003",
    [string]$BookingUrl = "http://localhost:3004",
    [string]$RideId = ""
)

Write-Host "`n=== Booking Test: Complete Passenger Flow ===" -ForegroundColor Cyan

# 1. Register passenger
Write-Host "`n[STEP 1/4] Registering passenger..." -ForegroundColor Yellow
$registerResult = & "$PSScriptRoot\..\auth\test-register.ps1" -AuthUrl $AuthUrl -Role "passenger"

if (-not $registerResult.Success) {
    Write-Host "`n❌ [FAILED] Passenger registration failed!" -ForegroundColor Red
    exit 1
}

$token = $registerResult.Token
$passengerId = $registerResult.UserId

# 2. Create a ride if not provided (for testing)
if (-not $RideId) {
    Write-Host "`n[STEP 2/4] Creating test ride..." -ForegroundColor Yellow
    $driverResult = & "$PSScriptRoot\..\ride\test-driver-flow.ps1" -AuthUrl $AuthUrl -RideUrl $RideUrl
    if (-not $driverResult.Success) {
        Write-Host "❌ Failed to create test ride!" -ForegroundColor Red
        exit 1
    }
    $RideId = $driverResult.RideId
} else {
    Write-Host "`n[STEP 2/4] Using existing ride: $RideId" -ForegroundColor Yellow
}

# 3. Search/Get available rides
Write-Host "`n[STEP 3/4] Searching for available rides..." -ForegroundColor Yellow

try {
    $rides = Invoke-RestMethod -Uri "$RideUrl/rides?status=active" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $token" }
    
    $count = if ($rides.rides) { $rides.rides.Count } else { 0 }
    Write-Host "✅ Found $count available ride(s)" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Failed to search rides: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 4. Create booking
Write-Host "`n[STEP 4/4] Creating booking..." -ForegroundColor Yellow

$bookingData = @{
    rideId = $RideId
    seats = 2
} | ConvertTo-Json

try {
    $bookingResponse = Invoke-RestMethod -Uri "$BookingUrl/bookings" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        } `
        -Body $bookingData
    
    Write-Host "✅ Booking created successfully!" -ForegroundColor Green
    Write-Host "  Booking ID: $($bookingResponse.id)" -ForegroundColor Gray
    Write-Host "  Ride ID: $($bookingResponse.rideId)" -ForegroundColor Gray
    Write-Host "  Seats: $($bookingResponse.seats)" -ForegroundColor Gray
    Write-Host "  Total Price: $($bookingResponse.totalPrice) MNT" -ForegroundColor Gray
    Write-Host "  Status: $($bookingResponse.status)" -ForegroundColor Gray
    
    $bookingId = $bookingResponse.id
} catch {
    Write-Host "❌ Booking creation failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

Write-Host "`n=== Passenger Flow Test Complete ===" -ForegroundColor Green
Write-Host "`nCreated Resources:" -ForegroundColor Cyan
Write-Host "  Passenger ID: $passengerId" -ForegroundColor White
Write-Host "  Booking ID: $bookingId" -ForegroundColor White
Write-Host "  Ride ID: $RideId" -ForegroundColor White

return @{
    Success = $true
    PassengerId = $passengerId
    BookingId = $bookingId
    RideId = $RideId
    Token = $token
}

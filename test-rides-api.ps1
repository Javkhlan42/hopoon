# Test Rides API
# Энэ скрипт rides API-г туршина

$API_URL = "http://localhost:3000/api/v1"

Write-Host "=== Hop-On Rides API Test ===" -ForegroundColor Cyan
Write-Host ""

# 1. Register a test driver
Write-Host "1. Creating test driver account..." -ForegroundColor Yellow
$registerBody = @{
    phone = "+97699999001"
    password = "Test123!"
    name = "Test Driver"
    email = "driver@test.mn"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$API_URL/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    $token = $registerResponse.data.accessToken
    Write-Host "✓ Driver registered successfully" -ForegroundColor Green
    Write-Host "  Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "✗ Registration failed (user might already exist)" -ForegroundColor Red
    Write-Host "  Trying to login instead..." -ForegroundColor Yellow
    
    $loginBody = @{
        phone = "+97699999001"
        password = "Test123!"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "$API_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.data.accessToken
    Write-Host "✓ Logged in successfully" -ForegroundColor Green
}

Write-Host ""

# 2. Create a ride
Write-Host "2. Creating a new ride..." -ForegroundColor Yellow
$rideBody = @{
    origin = @{
        lat = 47.9184
        lng = 106.9177
        address = "Улаанбаатар, Сүхбаатарын талбай"
    }
    destination = @{
        lat = 49.4871
        lng = 105.9057
        address = "Дархан хот"
    }
    departureTime = (Get-Date).AddHours(2).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    availableSeats = 3
    pricePerSeat = 15000
    notes = "Тав тухтай машин, цаг баримталдаг"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $createResponse = Invoke-RestMethod -Uri "$API_URL/rides" -Method POST -Body $rideBody -Headers $headers
    Write-Host "✓ Ride created successfully!" -ForegroundColor Green
    Write-Host "  Ride ID: $($createResponse.id)" -ForegroundColor Gray
    $rideId = $createResponse.id
} catch {
    Write-Host "✗ Failed to create ride" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 3. Get all rides
Write-Host "3. Fetching all rides..." -ForegroundColor Yellow
try {
    $ridesResponse = Invoke-RestMethod -Uri "$API_URL/rides?status=active" -Method GET
    Write-Host "✓ Rides fetched successfully!" -ForegroundColor Green
    Write-Host "  Total rides: $($ridesResponse.data.Count)" -ForegroundColor Gray
    
    if ($ridesResponse.data.Count -gt 0) {
        Write-Host ""
        Write-Host "  Recent rides:" -ForegroundColor Cyan
        $ridesResponse.data | Select-Object -First 3 | ForEach-Object {
            Write-Host "    • $($_.origin_address) → $($_.destination_address)" -ForegroundColor White
            Write-Host "      Price: ₮$($_.price_per_seat) | Seats: $($_.available_seats) | Status: $($_.status)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "✗ Failed to fetch rides" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 4. Get specific ride
if ($rideId) {
    Write-Host "4. Fetching ride details..." -ForegroundColor Yellow
    try {
        $rideDetail = Invoke-RestMethod -Uri "$API_URL/rides/$rideId" -Method GET
        Write-Host "✓ Ride details fetched!" -ForegroundColor Green
        Write-Host "  From: $($rideDetail.origin_address)" -ForegroundColor Gray
        Write-Host "  To: $($rideDetail.destination_address)" -ForegroundColor Gray
        Write-Host "  Departure: $($rideDetail.departure_time)" -ForegroundColor Gray
        Write-Host "  Price: ₮$($rideDetail.price_per_seat) per seat" -ForegroundColor Gray
    } catch {
        Write-Host "✗ Failed to fetch ride details" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Test completed ===" -ForegroundColor Cyan

# API Gateway Test Script
# Tests all microservices through API Gateway

$ErrorActionPreference = "Continue"

# API Gateway URL
$GATEWAY_URL = "http://localhost:3000/api/v1"

Write-Host "=== API Gateway Test ===" -ForegroundColor Cyan
Write-Host "Gateway: $GATEWAY_URL" -ForegroundColor Gray

# Generate random phone
$phone = "+976" + (Get-Random -Minimum 80000000 -Maximum 99999999)

# 1. Test Auth Service through Gateway
Write-Host "`n[1] Testing Auth Service (Registration)..." -ForegroundColor Yellow

try {
    $registerResponse = Invoke-RestMethod -Uri "$GATEWAY_URL/auth/register" `
        -Method POST `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body (@{
            phone = $phone
            password = "Test123!@#"
            name = "Gateway Test User"
            role = "passenger"
        } | ConvertTo-Json)
    
    Write-Host "[OK] Auth Service working!" -ForegroundColor Green
    Write-Host "  User registered: $phone" -ForegroundColor Cyan
} catch {
    Write-Host "[ERROR] Auth Service failed: $($_.ErrorDetails.Message)" -ForegroundColor Red
    exit 1
}

# 2. Test Auth Login
Write-Host "`n[2] Testing Auth Service (Login)..." -ForegroundColor Yellow

try {
    $loginResponse = Invoke-RestMethod -Uri "$GATEWAY_URL/auth/login" `
        -Method POST `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body (@{
            phone = $phone
            password = "Test123!@#"
        } | ConvertTo-Json)
    
    $token = $loginResponse.accessToken
    $userId = $loginResponse.user.id
    
    Write-Host "[OK] Login successful!" -ForegroundColor Green
    Write-Host "  User ID: $userId" -ForegroundColor Cyan
    Write-Host "  Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] Login failed: $($_.ErrorDetails.Message)" -ForegroundColor Red
    exit 1
}

# 3. Test Ride Service
Write-Host "`n[3] Testing Ride Service..." -ForegroundColor Yellow

$rideData = @{
    origin = @{
        address = "Ulaanbaatar"
        lat = 47.9189
        lng = 106.9175
    }
    destination = @{
        address = "Darkhan"
        lat = 49.4667
        lng = 105.9667
    }
    departureTime = (Get-Date).AddHours(3).ToString("yyyy-MM-ddTHH:mm:ss")
    availableSeats = 3
    pricePerSeat = 20000
} | ConvertTo-Json -Depth 10

try {
    $ride = Invoke-RestMethod -Uri "$GATEWAY_URL/rides" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        } `
        -Body $rideData
    
    $rideId = $ride.id
    Write-Host "[OK] Ride Service working!" -ForegroundColor Green
    Write-Host "  Ride ID: $rideId" -ForegroundColor Cyan
} catch {
    Write-Host "[WARN] Ride Service failed: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
}

# 4. Test Payment Service - Wallet Balance
Write-Host "`n[4] Testing Payment Service (Wallet)..." -ForegroundColor Yellow

try {
    $balance = Invoke-RestMethod -Uri "$GATEWAY_URL/payments/wallet/balance?userId=$userId" `
        -Method GET
    
    Write-Host "[OK] Payment Service working!" -ForegroundColor Green
    Write-Host "  Wallet balance: $($balance.balance)₮" -ForegroundColor Cyan
} catch {
    Write-Host "[WARN] Payment Service failed: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
}

# 5. Test Notification Service
Write-Host "`n[5] Testing Notification Service..." -ForegroundColor Yellow

try {
    $notifications = Invoke-RestMethod -Uri "$GATEWAY_URL/notifications?userId=$userId" `
        -Method GET
    
    $count = if ($notifications -is [array]) { $notifications.Count } else { if ($notifications) { 1 } else { 0 } }
    Write-Host "[OK] Notification Service working!" -ForegroundColor Green
    Write-Host "  Notifications: $count" -ForegroundColor Cyan
} catch {
    Write-Host "[WARN] Notification Service failed: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
}

# 6. Test Ride Service - Get All Rides
Write-Host "`n[6] Testing Ride Service (Get Rides)..." -ForegroundColor Yellow

try {
    $rides = Invoke-RestMethod -Uri "$GATEWAY_URL/rides" -Method GET
    
    $count = if ($rides -is [array]) { $rides.Count } else { if ($rides) { 1 } else { 0 } }
    Write-Host "[OK] Get Rides working!" -ForegroundColor Green
    Write-Host "  Available rides: $count" -ForegroundColor Cyan
} catch {
    Write-Host "[WARN] Get Rides failed: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
}

Write-Host "`n=== Gateway Test Completed ===" -ForegroundColor Cyan

Write-Host "`nSummary:" -ForegroundColor White
Write-Host "  Gateway URL: $GATEWAY_URL" -ForegroundColor Gray
Write-Host "  Test User: $phone" -ForegroundColor Gray
Write-Host "  User ID: $userId" -ForegroundColor Gray

Write-Host "`nServices Tested:" -ForegroundColor White
Write-Host "  - Auth Service (register, login)" -ForegroundColor Green
Write-Host "  - Ride Service (create, get)" -ForegroundColor Green
Write-Host "  - Payment Service (wallet)" -ForegroundColor Green
Write-Host "  - Notification Service (get)" -ForegroundColor Green

Write-Host "`nNote: All requests went through API Gateway at port 3000" -ForegroundColor Yellow

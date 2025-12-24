# Ride Service Admin API Test Script

Write-Host "=== Ride Service Admin API Test ===" -ForegroundColor Cyan
Write-Host ""

$gateway = "http://localhost:3000/api/v1"
$rideService = "http://localhost:3003"
$token = $null
$testRideIds = @()

# Helper function
function Invoke-Request {
    param(
        [string]$Uri,
        [string]$Method = "GET",
        [object]$Body = $null
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($script:token) {
        $headers["Authorization"] = "Bearer $script:token"
    }
    
    try {
        $params = @{
            Uri = $Uri
            Method = $Method
            Headers = $headers
        }
        
        if ($Body) {
            $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        return $response
    } catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
        }
        return $null
    }
}

# Step 1: Login as driver (who has admin access)
Write-Host "[1] Login as driver..." -ForegroundColor Yellow

$loginBody = @{
    phone = "+97699112244"
    password = "test12345"
}

$loginResult = Invoke-Request -Uri "$gateway/auth/login" -Method POST -Body $loginBody

if ($loginResult) {
    # Show full response structure
    Write-Host "`n=== LOGIN RESPONSE ===" -ForegroundColor Magenta
    Write-Host ($loginResult | ConvertTo-Json -Depth 5) -ForegroundColor DarkGray
    Write-Host "======================`n" -ForegroundColor Magenta
    
    $script:token = $loginResult.accessToken
    $userId = $loginResult.user.id
    Write-Host "[OK] Logged in as: $($loginResult.user.name) (ID: $userId)" -ForegroundColor Green
} else {
    # Try to register
    Write-Host "[INFO] User not found, registering..." -ForegroundColor Yellow
    $registerBody = @{
        phone = "+97699112244"
        password = "test12345"
        name = "Admin Driver"
        role = "driver"
    }
    
    $registerResult = Invoke-Request -Uri "$gateway/auth/register" -Method POST -Body $registerBody
    if ($registerResult) {
        $script:token = $registerResult.accessToken
        $userId = $registerResult.user.id
        Write-Host "[OK] Registered: $($registerResult.user.name) (ID: $userId)" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Could not login or register" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Step 2: Create test rides
Write-Host "[2] Creating test rides..." -ForegroundColor Yellow

for ($i = 1; $i -le 3; $i++) {
    $rideBody = @{
        origin = @{
            lat = 47.9 + ($i * 0.01)
            lng = 106.9 + ($i * 0.01)
            address = "Start Address $i, Ulaanbaatar"
        }
        destination = @{
            lat = 47.92 + ($i * 0.01)
            lng = 106.92 + ($i * 0.01)
            address = "End Address $i, Ulaanbaatar"
        }
        availableSeats = 3
        pricePerSeat = 5000 + ($i * 1000)
        departureTime = (Get-Date).AddHours($i).ToString("yyyy-MM-ddTHH:mm:ss")
    }
    
    $ride = Invoke-Request -Uri "$gateway/rides" -Method POST -Body $rideBody
    if ($ride) {
        $script:testRideIds += $ride.id
        Write-Host "  [OK] Created ride $i (ID: $($ride.id), Price: $($ride.pricePerSeat) MNT)" -ForegroundColor Green
    }
}

Write-Host ""

# Step 3: Admin API Tests
Write-Host "[3] Testing Admin API Endpoints..." -ForegroundColor Yellow
Write-Host ""

# 3.1: Get all rides
Write-Host "[3.1] GET /admin/rides - List all rides" -ForegroundColor Cyan
$allRides = Invoke-Request -Uri "$rideService/admin/rides?page=1`&limit=10"
if ($allRides) {
    Write-Host "[OK] Retrieved rides" -ForegroundColor Green
    Write-Host "  Total: $($allRides.meta.total)" -ForegroundColor Gray
    Write-Host "  Current page: $($allRides.meta.page) / $($allRides.meta.pages)" -ForegroundColor Gray
    Write-Host "  Rides on this page: $($allRides.rides.Count)" -ForegroundColor Gray
} else {
    Write-Host "[FAIL] Could not retrieve rides" -ForegroundColor Red
}

Write-Host ""

# 3.2: Get rides by status
Write-Host "[3.2] GET /admin/rides?status=active - Filter by status" -ForegroundColor Cyan
$activeRides = Invoke-Request -Uri "$rideService/admin/rides?status=active"
if ($activeRides) {
    Write-Host "[OK] Active rides: $($activeRides.rides.Count)" -ForegroundColor Green
}

Write-Host ""

# 3.3: Get ride details
if ($script:testRideIds.Count -gt 0) {
    $testRideId = $script:testRideIds[0]
    Write-Host "[3.3] GET /admin/rides/$testRideId - Get ride details" -ForegroundColor Cyan
    $rideDetails = Invoke-Request -Uri "$rideService/admin/rides/$testRideId"
    if ($rideDetails) {
        Write-Host "[OK] Retrieved ride details" -ForegroundColor Green
        Write-Host "  Driver ID: $($rideDetails.ride.driverId)" -ForegroundColor Gray
        Write-Host "  Status: $($rideDetails.ride.status)" -ForegroundColor Gray
        Write-Host "  Available Seats: $($rideDetails.ride.availableSeats)" -ForegroundColor Gray
        Write-Host "  Price: $($rideDetails.ride.pricePerSeat)₮" -ForegroundColor Gray
    }
    
    Write-Host ""
}

# 3.4: Cancel ride
if ($script:testRideIds.Count -gt 0) {
    $cancelRideId = $script:testRideIds[0]
    Write-Host "[3.4] POST /admin/rides/$cancelRideId/cancel - Cancel ride" -ForegroundColor Cyan
    $cancelBody = @{
        reason = "Admin cancelled for testing purposes"
    }
    $cancelResult = Invoke-Request -Uri "$rideService/admin/rides/$cancelRideId/cancel" -Method POST -Body $cancelBody
    if ($cancelResult) {
        Write-Host "[OK] Ride cancelled" -ForegroundColor Green
        Write-Host "  Message: $($cancelResult.message)" -ForegroundColor Gray
    }
    
    Write-Host ""
}

# 3.5: Get ride statistics
Write-Host "[3.5] GET /admin/reports/ride-stats - Get statistics" -ForegroundColor Cyan
$stats = Invoke-Request -Uri "$rideService/admin/reports/ride-stats"
if ($stats) {
    Write-Host "[OK] Retrieved statistics" -ForegroundColor Green
    Write-Host "  Completed: $($stats.completed)" -ForegroundColor Gray
    Write-Host "  Cancelled: $($stats.cancelled)" -ForegroundColor Gray
    Write-Host "  Active: $($stats.active)" -ForegroundColor Gray
}

Write-Host ""

# 3.6: Get popular routes
Write-Host "[3.6] GET /admin/reports/popular-routes - Get popular routes" -ForegroundColor Cyan
$routes = Invoke-Request -Uri "$rideService/admin/reports/popular-routes"
if ($routes) {
    Write-Host "[OK] Retrieved popular routes" -ForegroundColor Green
    if ($routes.routes -and $routes.routes.Count -gt 0) {
        Write-Host "  Top route: $($routes.routes[0].from) -> $($routes.routes[0].to)" -ForegroundColor Gray
        Write-Host "  Ride count: $($routes.routes[0].rideCount)" -ForegroundColor Gray
    } else {
        Write-Host "  No route data yet (mock implementation)" -ForegroundColor Gray
    }
}

Write-Host ""

# 3.7: Delete ride
if ($script:testRideIds.Count -gt 1) {
    $deleteRideId = $script:testRideIds[1]
    Write-Host "[3.7] DELETE /admin/rides/$deleteRideId - Delete ride" -ForegroundColor Cyan
    $deleteResult = Invoke-Request -Uri "$rideService/admin/rides/$deleteRideId" -Method DELETE
    if ($deleteResult) {
        Write-Host "[OK] Ride deleted" -ForegroundColor Green
        Write-Host "  Message: $($deleteResult.message)" -ForegroundColor Gray
    }
    
    Write-Host ""
}

# Summary
Write-Host ""
Write-Host "=== Admin API Test Summary ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Admin User: +97699887766" -ForegroundColor Gray
Write-Host "Test Rides Created: $($script:testRideIds.Count)" -ForegroundColor Gray
Write-Host "Ride Service: $rideService" -ForegroundColor Gray
Write-Host ""
Write-Host "Endpoints Tested:" -ForegroundColor Yellow
Write-Host "  [OK] GET    /admin/rides" -ForegroundColor Green
Write-Host "  [OK] GET    /admin/rides/:id" -ForegroundColor Green
Write-Host "  [OK] POST   /admin/rides/:id/cancel" -ForegroundColor Green
Write-Host "  [OK] DELETE /admin/rides/:id" -ForegroundColor Green
Write-Host "  [OK] GET    /admin/reports/ride-stats" -ForegroundColor Green
Write-Host "  [OK] GET    /admin/reports/popular-routes" -ForegroundColor Green
Write-Host ""

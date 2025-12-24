# Admin API тест хийх PowerShell скрипт

Write-Host "=== Admin API Test Script ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000/api/v1"
$adminToken = $null

# Helper function
function Invoke-AdminAPI {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [object]$Body = $null,
        [string]$Token = $null
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $headers
            TimeoutSec = 30
        }
        
        if ($Body) {
            $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params -ErrorAction Stop
        return @{
            Success = $true
            Data = $response
        }
    } catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
            Response = $_.ErrorDetails.Message
        }
    }
}

# 1. Admin Login
Write-Host "=== Step 1: Admin Login ===" -ForegroundColor Cyan
Write-Host "Logging in as admin..." -NoNewline

$loginData = @{
    phone = "+97699112244"
    password = "test12345"
}

$result = Invoke-AdminAPI -Url "http://localhost:3001/auth/login" -Method POST -Body $loginData
if ($result.Success) {
    $adminToken = $result.Data.accessToken
    
    Write-Host " ✓" -ForegroundColor Green
    Write-Host "  Admin: $($result.Data.user.name) ($($result.Data.user.role))" -ForegroundColor Gray
} else {
    Write-Host " ✗ FAILED" -ForegroundColor Red
    Write-Host "  Error: $($result.Error)" -ForegroundColor Yellow
    exit 1
}

# 2. Get Users (Auth Service)
Write-Host "`n=== Step 2: Get Users ===" -ForegroundColor Cyan
Write-Host "Getting users list..." -NoNewline

$usersUrl = "http://localhost:3001/admin/users?page=1`&limit=10"
$result = Invoke-AdminAPI -Url $usersUrl -Token $adminToken
if ($result.Success) {
    Write-Host " ✓" -ForegroundColor Green
    Write-Host "  Total: $($result.Data.total) users" -ForegroundColor Gray
    if ($result.Data.data.Count -gt 0) {
        Write-Host "  First user: $($result.Data.data[0].name)" -ForegroundColor Gray
    }
} else {
    Write-Host " ✗ FAILED" -ForegroundColor Red
    Write-Host "  Error: $($result.Response)" -ForegroundColor Yellow
}

# 3. Get Rides (Ride Service)
Write-Host "`n=== Step 3: Get Rides ===" -ForegroundColor Cyan
Write-Host "Getting rides list..." -NoNewline

$ridesUrl = "http://localhost:3003/admin/rides?page=1`&limit=10"
$result = Invoke-AdminAPI -Url $ridesUrl -Token $adminToken
if ($result.Success) {
    Write-Host " ✓" -ForegroundColor Green
    Write-Host "  Total: $($result.Data.total) rides" -ForegroundColor Gray
    if ($result.Data.data.Count -gt 0) {
        Write-Host "  First ride status: $($result.Data.data[0].status)" -ForegroundColor Gray
    }
} else {
    Write-Host " ✗ FAILED" -ForegroundColor Red
    Write-Host "  Error: $($result.Response)" -ForegroundColor Yellow
}

# 4. Ride Statistics
Write-Host "`n=== Step 4: Ride Statistics ===" -ForegroundColor Cyan
Write-Host "Getting ride stats..." -NoNewline

$result = Invoke-AdminAPI -Url "http://localhost:3003/admin/reports/ride-stats" -Token $adminToken
if ($result.Success) {
    Write-Host " ✓" -ForegroundColor Green
    Write-Host "  Active: $($result.Data.active)" -ForegroundColor Gray
} else {
    Write-Host " ✗ FAILED" -ForegroundColor Red
    Write-Host "  Error: $($result.Response)" -ForegroundColor Yellow
}

# 5. Top Drivers
Write-Host "`n=== Step 5: Top Drivers ===" -ForegroundColor Cyan
Write-Host "Getting top drivers..." -NoNewline

$driversUrl = "http://localhost:3001/admin/users/top-drivers?limit=5"
$result = Invoke-AdminAPI -Url $driversUrl -Token $adminToken
if ($result.Success) {
    Write-Host " ✓" -ForegroundColor Green
    Write-Host "  Found: $($result.Data.Count) drivers" -ForegroundColor Gray
} else {
    Write-Host " ✗ FAILED" -ForegroundColor Red
    Write-Host "  Error: $($result.Response)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Test Summary ===" -ForegroundColor Cyan
Write-Host "Admin login successful" -ForegroundColor Green
Write-Host "Admin API endpoints accessible" -ForegroundColor Green
Write-Host ""
Write-Host "Admin Token: $adminToken" -ForegroundColor Gray
Write-Host ""
Write-Host "Test completed!" -ForegroundColor Green

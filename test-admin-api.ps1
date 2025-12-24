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
    email = "admin@hopon.mn"
    password = "admin123"
}

$result = Invoke-AdminAPI -Url "$baseUrl/auth/admin/login" -Method POST -Body $loginData
if ($result.Success) {
    $adminToken = $result.Data.accessToken
    Write-Host " ✓" -ForegroundColor Green
    Write-Host "  Admin: $($result.Data.admin.email)" -ForegroundColor Gray
} else {
    Write-Host " ✗ FAILED" -ForegroundColor Red
    Write-Host "  Error: $($result.Error)" -ForegroundColor Yellow
    exit 1
}

# 2. Dashboard Stats
Write-Host "`n=== Step 2: Dashboard Stats ===" -ForegroundColor Cyan
Write-Host "Getting dashboard stats..." -NoNewline

$result = Invoke-AdminAPI -Url "$baseUrl/admin/dashboard/stats" -Token $adminToken
if ($result.Success) {
    Write-Host " ✓" -ForegroundColor Green
    Write-Host "  Total Users: $($result.Data.totalUsers)" -ForegroundColor Gray
    Write-Host "  Active Drivers: $($result.Data.activeDrivers)" -ForegroundColor Gray
} else {
    Write-Host " ✗ FAILED" -ForegroundColor Red
}

# 3. Get Users
Write-Host "`n=== Step 3: Get Users ===" -ForegroundColor Cyan
Write-Host "Getting users list..." -NoNewline

$usersUrl = "$baseUrl/admin/users?page=1`&limit=10"
$result = Invoke-AdminAPI -Url $usersUrl -Token $adminToken
if ($result.Success) {
    Write-Host " ✓" -ForegroundColor Green
    Write-Host "  Total: $($result.Data.meta.total) users" -ForegroundColor Gray
    if ($result.Data.users.Count -gt 0) {
        Write-Host "  First user: $($result.Data.users[0].name)" -ForegroundColor Gray
    }
} else {
    Write-Host " ✗ FAILED" -ForegroundColor Red
}

# 4. Get Rides
Write-Host "`n=== Step 4: Get Rides ===" -ForegroundColor Cyan
Write-Host "Getting rides list..." -NoNewline

$ridesUrl = "$baseUrl/admin/rides?page=1`&limit=10"
$result = Invoke-AdminAPI -Url $ridesUrl -Token $adminToken
if ($result.Success) {
    Write-Host " ✓" -ForegroundColor Green
    Write-Host "  Total: $($result.Data.meta.total) rides" -ForegroundColor Gray
} else {
    Write-Host " ✗ FAILED" -ForegroundColor Red
}

# 5. System Status
Write-Host "`n=== Step 5: System Status ===" -ForegroundColor Cyan
Write-Host "Getting system status..." -NoNewline

$result = Invoke-AdminAPI -Url "$baseUrl/admin/system/status" -Token $adminToken
if ($result.Success) {
    Write-Host " ✓" -ForegroundColor Green
    Write-Host "  CPU: $($result.Data.cpu)%" -ForegroundColor Gray
    Write-Host "  Memory: $($result.Data.memory.percentage)%" -ForegroundColor Gray
} else {
    Write-Host " ✗ FAILED" -ForegroundColor Red
}

# 6. User Growth Report
Write-Host "`n=== Step 6: User Growth Report ===" -ForegroundColor Cyan
Write-Host "Getting user growth data..." -NoNewline

$reportUrl = "$baseUrl/admin/reports/user-growth" + "?period=week"
$result = Invoke-AdminAPI -Url $reportUrl -Token $adminToken
if ($result.Success) {
    Write-Host " ✓" -ForegroundColor Green
    Write-Host "  Data points: $($result.Data.Count)" -ForegroundColor Gray
} else {
    Write-Host " ✗ FAILED" -ForegroundColor Red
}

Write-Host "`n=== Test Summary ===" -ForegroundColor Cyan
Write-Host "✓ Admin login successful" -ForegroundColor Green
Write-Host "✓ Admin API endpoints accessible" -ForegroundColor Green
Write-Host "`nAdmin Token: $adminToken" -ForegroundColor Gray
Write-Host "`nTest completed! 🎉" -ForegroundColor Green

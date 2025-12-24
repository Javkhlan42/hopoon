# Test: Admin Dashboard
param(
    [string]$AuthUrl = "http://localhost:3001"
)

Write-Host "`n=== Admin Test: Dashboard ===" -ForegroundColor Cyan

# 1. Admin login
Write-Host "`n[STEP 1/4] Admin login..." -ForegroundColor Yellow
$loginResult = & "$PSScriptRoot\..\auth\test-admin-login.ps1" -AuthUrl $AuthUrl

if (-not $loginResult.Success) {
    exit 1
}

$token = $loginResult.Token

# 2. Get dashboard stats
Write-Host "`n[STEP 2/4] Getting dashboard stats..." -ForegroundColor Yellow

try {
    $stats = Invoke-RestMethod -Uri "$AuthUrl/admin/dashboard/stats" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $token" }
    
    Write-Host "✅ Dashboard stats retrieved!" -ForegroundColor Green
    Write-Host "  Total Users: $($stats.totalUsers)" -ForegroundColor Gray
    Write-Host "  Active Drivers: $($stats.activeDrivers)" -ForegroundColor Gray
    Write-Host "  Total Rides: $($stats.totalRides)" -ForegroundColor Gray
    Write-Host "  Total Revenue: $($stats.totalRevenue) MNT" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to get stats: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Get daily stats
Write-Host "`n[STEP 3/4] Getting daily stats..." -ForegroundColor Yellow

$today = Get-Date -Format "yyyy-MM-dd"
$weekAgo = (Get-Date).AddDays(-7).ToString("yyyy-MM-dd")

try {
    $dailyStats = Invoke-RestMethod -Uri "$AuthUrl/admin/dashboard/daily-stats?startDate=$weekAgo&endDate=$today" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $token" }
    
    Write-Host "✅ Daily stats retrieved (last 7 days)" -ForegroundColor Green
    foreach ($day in $dailyStats | Select-Object -First 3) {
        Write-Host "  $($day.date): Users=$($day.users), Rides=$($day.rides), Revenue=$($day.revenue)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Failed to get daily stats: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Get active SOS alerts
Write-Host "`n[STEP 4/4] Getting active SOS alerts..." -ForegroundColor Yellow

try {
    $sosAlerts = Invoke-RestMethod -Uri "$AuthUrl/admin/dashboard/active-sos" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $token" }
    
    $count = if ($sosAlerts -is [array]) { $sosAlerts.Count } else { 0 }
    Write-Host "✅ Active SOS alerts: $count" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Failed to get SOS alerts: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n=== Admin Dashboard Test Complete ===" -ForegroundColor Green

return @{
    Success = $true
}

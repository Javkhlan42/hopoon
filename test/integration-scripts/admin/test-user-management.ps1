# Test: Admin User Management
param(
    [string]$AuthUrl = "http://localhost:3001"
)

Write-Host "`n=== Admin Test: User Management ===" -ForegroundColor Cyan

# 1. Admin login
Write-Host "`n[STEP 1/4] Admin login..." -ForegroundColor Yellow
$loginResult = & "$PSScriptRoot\..\auth\test-admin-login.ps1" -AuthUrl $AuthUrl

if (-not $loginResult.Success) {
    exit 1
}

$adminToken = $loginResult.Token

# 2. Create a test user
Write-Host "`n[STEP 2/4] Creating test user..." -ForegroundColor Yellow
$userResult = & "$PSScriptRoot\..\auth\test-register.ps1" -AuthUrl $AuthUrl

if (-not $userResult.Success) {
    exit 1
}

$userId = $userResult.UserId

# 3. Get users list
Write-Host "`n[STEP 3/4] Getting users list..." -ForegroundColor Yellow

try {
    $users = Invoke-RestMethod -Uri "$AuthUrl/admin/users?page=1&limit=10" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $adminToken" }
    
    Write-Host "✅ Users list retrieved!" -ForegroundColor Green
    Write-Host "  Total Users: $($users.meta.total)" -ForegroundColor Gray
    Write-Host "  Page: $($users.meta.page)/$($users.meta.totalPages)" -ForegroundColor Gray
    Write-Host "  Showing first 3 users:" -ForegroundColor Gray
    foreach ($user in $users.users | Select-Object -First 3) {
        Write-Host "    - $($user.name) ($($user.phone)) - $($user.role)" -ForegroundColor DarkGray
    }
} catch {
    Write-Host "❌ Failed to get users: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Get user details
Write-Host "`n[STEP 4/4] Getting user details..." -ForegroundColor Yellow

try {
    $userDetails = Invoke-RestMethod -Uri "$AuthUrl/admin/users/$userId" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $adminToken" }
    
    Write-Host "✅ User details retrieved!" -ForegroundColor Green
    Write-Host "  ID: $($userDetails.id)" -ForegroundColor Gray
    Write-Host "  Name: $($userDetails.name)" -ForegroundColor Gray
    Write-Host "  Phone: $($userDetails.phone)" -ForegroundColor Gray
    Write-Host "  Role: $($userDetails.role)" -ForegroundColor Gray
    Write-Host "  Status: $($userDetails.verification_status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to get user details: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== User Management Test Complete ===" -ForegroundColor Green

return @{
    Success = $true
    UserId = $userId
}

# Test: User Login
param(
    [string]$AuthUrl = "http://localhost:3001",
    [string]$Phone = "",
    [string]$Password = "Test123!@#"
)

Write-Host "`n=== Auth Test: User Login ===" -ForegroundColor Cyan

# If no phone provided, register first
if (-not $Phone) {
    Write-Host "`n[INFO] No phone provided, registering new user..." -ForegroundColor Yellow
    $registerResult = & "$PSScriptRoot\test-register.ps1" -AuthUrl $AuthUrl
    if (-not $registerResult.Success) {
        exit 1
    }
    $Phone = $registerResult.Phone
}

Write-Host "`n[TEST] Logging in..." -ForegroundColor Yellow
Write-Host "  Phone: $Phone" -ForegroundColor Gray

$loginData = @{
    phone = $Phone
    password = $Password
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$AuthUrl/auth/login" `
        -Method POST `
        -Body $loginData `
        -ContentType "application/json"
    
    Write-Host "`n✅ [SUCCESS] Login successful!" -ForegroundColor Green
    Write-Host "  User ID: $($response.user.id)" -ForegroundColor Gray
    Write-Host "  Phone: $($response.user.phone)" -ForegroundColor Gray
    Write-Host "  Access Token: $($response.accessToken.Substring(0,30))..." -ForegroundColor Gray
    Write-Host "  Refresh Token: $($response.refreshToken.Substring(0,30))..." -ForegroundColor Gray
    
    return @{
        Success = $true
        UserId = $response.user.id
        Token = $response.accessToken
        RefreshToken = $response.refreshToken
    }
} catch {
    Write-Host "`n❌ [ERROR] Login failed!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    return @{ Success = $false }
}

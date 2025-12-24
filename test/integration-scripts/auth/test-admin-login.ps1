# Test: Admin Login
param(
    [string]$AuthUrl = "http://localhost:3001",
    [string]$Email = "admin@hopon.mn",
    [string]$Password = "admin123"
)

Write-Host "`n=== Auth Test: Admin Login ===" -ForegroundColor Cyan

Write-Host "`n[TEST] Admin logging in..." -ForegroundColor Yellow
Write-Host "  Email: $Email" -ForegroundColor Gray

$loginData = @{
    email = $Email
    password = $Password
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$AuthUrl/auth/admin/login" `
        -Method POST `
        -Body $loginData `
        -ContentType "application/json"
    
    Write-Host "`n✅ [SUCCESS] Admin login successful!" -ForegroundColor Green
    Write-Host "  Admin ID: $($response.admin.id)" -ForegroundColor Gray
    Write-Host "  Email: $($response.admin.email)" -ForegroundColor Gray
    Write-Host "  Role: $($response.admin.role)" -ForegroundColor Gray
    Write-Host "  Access Token: $($response.accessToken.Substring(0,30))..." -ForegroundColor Gray
    
    return @{
        Success = $true
        AdminId = $response.admin.id
        Token = $response.accessToken
        Role = $response.admin.role
    }
} catch {
    Write-Host "`n❌ [ERROR] Admin login failed!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    return @{ Success = $false }
}

# Test: User Registration
param(
    [string]$AuthUrl = "http://localhost:3001",
    [string]$Role = "passenger"
)

Write-Host "`n=== Auth Test: User Registration ===" -ForegroundColor Cyan

# Generate unique phone
$phone = "+976" + (Get-Random -Minimum 80000000 -Maximum 99999999)

Write-Host "`n[TEST] Registering new $Role..." -ForegroundColor Yellow
Write-Host "  Phone: $phone" -ForegroundColor Gray

$registerData = @{
    phone = $phone
    password = "Test123!@#"
    name = "Test User $(Get-Random -Minimum 1000 -Maximum 9999)"
    email = "test$(Get-Random)@example.com"
    role = $Role
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$AuthUrl/auth/register" `
        -Method POST `
        -Body $registerData `
        -ContentType "application/json"
    
    Write-Host "`n✅ [SUCCESS] Registration successful!" -ForegroundColor Green
    Write-Host "  User ID: $($response.user.id)" -ForegroundColor Gray
    Write-Host "  Phone: $($response.user.phone)" -ForegroundColor Gray
    Write-Host "  Name: $($response.user.name)" -ForegroundColor Gray
    Write-Host "  Token: $($response.accessToken.Substring(0,30))..." -ForegroundColor Gray
    
    # Return data for chaining
    return @{
        Success = $true
        UserId = $response.user.id
        Phone = $phone
        Token = $response.accessToken
    }
} catch {
    Write-Host "`n❌ [ERROR] Registration failed!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    return @{ Success = $false }
}

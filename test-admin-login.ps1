# Simple Admin Login Test - Show Response Only

Write-Host "=== Admin Login Response Test ===" -ForegroundColor Cyan
Write-Host ""

$gateway = "http://localhost:3000/api/v1"

# Test 1: Login with existing user
Write-Host "[1] Testing Login (existing driver user)..." -ForegroundColor Yellow
Write-Host ""

$loginBody = @{
    phone = "+97699112244"
    password = "test12345"
}

Write-Host "Request:" -ForegroundColor Cyan
Write-Host ($loginBody | ConvertTo-Json) -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod `
        -Uri "$gateway/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body ($loginBody | ConvertTo-Json)
    
    Write-Host "=== RESPONSE ===" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor White
    Write-Host ""
    
    Write-Host "=== TOKEN ===" -ForegroundColor Yellow
    Write-Host $response.data.accessToken -ForegroundColor Cyan
    Write-Host ""
    
} catch {
    Write-Host "=== ERROR ===" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
    
    if ($_.ErrorDetails.Message) {
        Write-Host "Error Details:" -ForegroundColor Red
        Write-Host $_.ErrorDetails.Message -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan

# Test: Wallet Operations (Get Balance, Top Up)
param(
    [string]$AuthUrl = "http://localhost:3001",
    [string]$PaymentUrl = "http://localhost:3005"
)

Write-Host "`n=== Payment Test: Wallet Operations ===" -ForegroundColor Cyan

# 1. Register user
Write-Host "`n[STEP 1/3] Registering user..." -ForegroundColor Yellow
$registerResult = & "$PSScriptRoot\..\auth\test-register.ps1" -AuthUrl $AuthUrl

if (-not $registerResult.Success) {
    exit 1
}

$token = $registerResult.Token
$userId = $registerResult.UserId

# 2. Get initial balance
Write-Host "`n[STEP 2/3] Getting wallet balance..." -ForegroundColor Yellow

try {
    $balanceResponse = Invoke-RestMethod -Uri "$PaymentUrl/wallet/balance?userId=$userId" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $token" }
    
    Write-Host "✅ Current balance: $($balanceResponse.balance) MNT" -ForegroundColor Green
    $initialBalance = $balanceResponse.balance
} catch {
    Write-Host "❌ Failed to get balance: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. Top up wallet
Write-Host "`n[STEP 3/3] Topping up wallet..." -ForegroundColor Yellow

$topUpData = @{
    userId = $userId
    amount = 100000
    paymentMethod = "card"
} | ConvertTo-Json

try {
    $topUpResponse = Invoke-RestMethod -Uri "$PaymentUrl/wallet/topup" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        } `
        -Body $topUpData
    
    Write-Host "✅ Wallet topped up successfully!" -ForegroundColor Green
    Write-Host "  Previous Balance: $initialBalance MNT" -ForegroundColor Gray
    Write-Host "  New Balance: $($topUpResponse.balance) MNT" -ForegroundColor Gray
    Write-Host "  Transaction ID: $($topUpResponse.transactionId)" -ForegroundColor Gray
    Write-Host "  Status: $($topUpResponse.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Top up failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Wallet Test Complete ===" -ForegroundColor Green

return @{
    Success = $true
    UserId = $userId
    Balance = $topUpResponse.balance
}

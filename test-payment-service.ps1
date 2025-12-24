# Payment Service Test Script
# Tests wallet operations and payment transactions

$ErrorActionPreference = "Continue"

# Service URLs
$AUTH_URL = "http://localhost:3001"
$RIDE_URL = "http://localhost:3003"
$BOOKING_URL = "http://localhost:3004"
$PAYMENT_URL = "http://localhost:3005"

Write-Host "=== Payment Service Test ===" -ForegroundColor Cyan

# Generate random phone numbers
$passengerPhone = "+976" + (Get-Random -Minimum 80000000 -Maximum 99999999)
$driverPhone = "+976" + (Get-Random -Minimum 80000000 -Maximum 99999999)

# 1. Register and login passenger
Write-Host "`n[1] Registering Passenger: $passengerPhone" -ForegroundColor Yellow

try {
    Invoke-RestMethod -Uri "$AUTH_URL/auth/register" -Method POST -Body (@{
        phone = $passengerPhone
        password = "Passenger123!@#"
        name = "Test Passenger"
        role = "passenger"
    } | ConvertTo-Json) -ContentType "application/json" | Out-Null
    
    $passengerLogin = Invoke-RestMethod -Uri "$AUTH_URL/auth/login" -Method POST -Body (@{
        phone = $passengerPhone
        password = "Passenger123!@#"
    } | ConvertTo-Json) -ContentType "application/json"
    
    $passengerId = $passengerLogin.user.id
    $passengerToken = $passengerLogin.accessToken
    
    Write-Host "[OK] Passenger registered!" -ForegroundColor Green
    Write-Host "  Passenger ID: $passengerId" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] Failed to register passenger: $_" -ForegroundColor Red
    exit 1
}

# 2. Register and login driver
Write-Host "`n[2] Registering Driver: $driverPhone" -ForegroundColor Yellow

try {
    Invoke-RestMethod -Uri "$AUTH_URL/auth/register" -Method POST -Body (@{
        phone = $driverPhone
        password = "Driver123!@#"
        name = "Test Driver"
        role = "driver"
    } | ConvertTo-Json) -ContentType "application/json" | Out-Null
    
    $driverLogin = Invoke-RestMethod -Uri "$AUTH_URL/auth/login" -Method POST -Body (@{
        phone = $driverPhone
        password = "Driver123!@#"
    } | ConvertTo-Json) -ContentType "application/json"
    
    $driverId = $driverLogin.user.id
    $driverToken = $driverLogin.accessToken
    
    Write-Host "[OK] Driver registered!" -ForegroundColor Green
    Write-Host "  Driver ID: $driverId" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] Failed to register driver: $_" -ForegroundColor Red
    exit 1
}

# 3. Check passenger wallet balance
Write-Host "`n[3] Checking passenger wallet balance..." -ForegroundColor Yellow

try {
    $balance = Invoke-RestMethod -Uri "$PAYMENT_URL/wallet/balance?userId=$passengerId" `
        -Method GET
    
    Write-Host "[OK] Wallet balance: $($balance.balance) ₮" -ForegroundColor Green
    $initialBalance = $balance.balance
} catch {
    Write-Host "[WARN] Failed to get balance: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    $initialBalance = 0
}

# 4. Top up passenger wallet
Write-Host "`n[4] Topping up passenger wallet (50,000₮)..." -ForegroundColor Yellow

$topUpData = @{
    userId = $passengerId
    amount = 50000
    paymentMethod = "cash"
} | ConvertTo-Json

try {
    $topUpResult = Invoke-RestMethod -Uri "$PAYMENT_URL/wallet/topup" `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
        } `
        -Body $topUpData
    
    Write-Host "[OK] Wallet topped up!" -ForegroundColor Green
    Write-Host "  New balance: $($topUpResult.balance) ₮" -ForegroundColor Cyan
    Write-Host "  Transaction ID: $($topUpResult.transactionId)" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] Failed to top up wallet: $($_.ErrorDetails.Message)" -ForegroundColor Red
    exit 1
}

# 5. Create a ride (driver)
Write-Host "`n[5] Driver creating a ride to Darkhan..." -ForegroundColor Yellow

$rideData = @{
    origin = @{
        address = "Ulaanbaatar"
        lat = 47.9189
        lng = 106.9175
    }
    destination = @{
        address = "Darkhan"
        lat = 49.4667
        lng = 105.9667
    }
    departureTime = (Get-Date).AddHours(2).ToString("yyyy-MM-ddTHH:mm:ss")
    availableSeats = 3
    pricePerSeat = 25000
} | ConvertTo-Json -Depth 10

try {
    $ride = Invoke-RestMethod -Uri "$RIDE_URL/rides" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $driverToken"
            "Content-Type" = "application/json"
        } `
        -Body $rideData
    
    $rideId = $ride.id
    Write-Host "[OK] Ride created!" -ForegroundColor Green
    Write-Host "  Ride ID: $rideId" -ForegroundColor Gray
    Write-Host "  Price: $($ride.pricePerSeat)₮ per seat" -ForegroundColor Cyan
} catch {
    Write-Host "[ERROR] Failed to create ride: $($_.ErrorDetails.Message)" -ForegroundColor Red
    exit 1
}

# 6. Create a booking (passenger)
Write-Host "`n[6] Passenger booking the ride..." -ForegroundColor Yellow

$bookingData = @{
    rideId = $rideId
    seats = 2
} | ConvertTo-Json

try {
    $booking = Invoke-RestMethod -Uri "$BOOKING_URL/bookings" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $passengerToken"
            "Content-Type" = "application/json"
        } `
        -Body $bookingData
    
    $bookingId = $booking.id
    Write-Host "[OK] Booking created!" -ForegroundColor Green
    Write-Host "  Booking ID: $bookingId" -ForegroundColor Gray
    Write-Host "  Total price: $($booking.totalPrice)₮" -ForegroundColor Cyan
} catch {
    Write-Host "[ERROR] Failed to create booking: $($_.ErrorDetails.Message)" -ForegroundColor Red
    exit 1
}

# 7. Process payment for the ride
Write-Host "`n[7] Processing payment for the ride..." -ForegroundColor Yellow

$paymentData = @{
    userId = $passengerId
    bookingId = $bookingId
    method = "wallet"
} | ConvertTo-Json

try {
    $payment = Invoke-RestMethod -Uri "$PAYMENT_URL/payments/ride" `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
        } `
        -Body $paymentData
    
    $paymentId = $payment.id
    Write-Host "[OK] Payment processed!" -ForegroundColor Green
    Write-Host "  Payment ID: $paymentId" -ForegroundColor Gray
    Write-Host "  Amount: $($payment.amount)₮" -ForegroundColor Cyan
    Write-Host "  Status: $($payment.status)" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] Payment failed: $($_.ErrorDetails.Message)" -ForegroundColor Red
    # Continue anyway to test other endpoints
}

# 8. Check updated wallet balance
Write-Host "`n[8] Checking updated wallet balance..." -ForegroundColor Yellow

try {
    $newBalance = Invoke-RestMethod -Uri "$PAYMENT_URL/wallet/balance?userId=$passengerId" `
        -Method GET
    
    Write-Host "[OK] Updated balance: $($newBalance.balance) ₮" -ForegroundColor Green
    Write-Host "  Amount spent: $(50000 - $newBalance.balance) ₮" -ForegroundColor Cyan
} catch {
    Write-Host "[WARN] Failed to get balance: $_" -ForegroundColor Yellow
}

# 9. Get payment history
Write-Host "`n[9] Getting payment history..." -ForegroundColor Yellow

try {
    $history = Invoke-RestMethod -Uri "$PAYMENT_URL/payments/history?userId=$passengerId" `
        -Method GET
    
    $count = if ($history -is [array]) { $history.Count } else { 1 }
    Write-Host "[OK] Payment history retrieved: $count transaction(s)" -ForegroundColor Green
    
    if ($count -gt 0) {
        $transactions = if ($history -is [array]) { $history } else { @($history) }
        foreach ($tx in $transactions | Select-Object -First 3) {
            Write-Host "  - $($tx.type): $($tx.amount)₮ ($($tx.status))" -ForegroundColor Cyan
        }
    }
} catch {
    Write-Host "[WARN] Failed to get history: $_" -ForegroundColor Yellow
}

# 10. Test refund (if payment was successful)
if ($paymentId) {
    Write-Host "`n[10] Testing payment refund..." -ForegroundColor Yellow
    
    $refundData = @{
        userId = $passengerId
        paymentId = $paymentId
        reason = "Test refund - ride cancelled"
    } | ConvertTo-Json
    
    try {
        $refund = Invoke-RestMethod -Uri "$PAYMENT_URL/payments/refund" `
            -Method POST `
            -Headers @{
                "Content-Type" = "application/json"
            } `
            -Body $refundData
        
        Write-Host "[OK] Refund processed!" -ForegroundColor Green
        Write-Host "  Refund ID: $($refund.id)" -ForegroundColor Gray
        Write-Host "  Amount refunded: $($refund.amount)₮" -ForegroundColor Cyan
    } catch {
        Write-Host "[WARN] Refund failed: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}

# 11. Final wallet balance
Write-Host "`n[11] Final wallet balance check..." -ForegroundColor Yellow

try {
    $finalBalance = Invoke-RestMethod -Uri "$PAYMENT_URL/wallet/balance?userId=$passengerId" `
        -Method GET
    
    Write-Host "[OK] Final balance: $($finalBalance.balance) ₮" -ForegroundColor Green
} catch {
    Write-Host "[WARN] Failed to get balance: $_" -ForegroundColor Yellow
}

Write-Host "`n=== Test Completed ===" -ForegroundColor Cyan
Write-Host "`nSummary:" -ForegroundColor White
Write-Host "  Passenger: $passengerPhone (ID: $passengerId)" -ForegroundColor Gray
Write-Host "  Driver: $driverPhone (ID: $driverId)" -ForegroundColor Gray
Write-Host "  Ride ID: $rideId" -ForegroundColor Gray
if ($bookingId) { Write-Host "  Booking ID: $bookingId" -ForegroundColor Gray }
if ($paymentId) { Write-Host "  Payment ID: $paymentId" -ForegroundColor Gray }

Write-Host "`nFeatures Tested:" -ForegroundColor White
Write-Host "  - Wallet balance check" -ForegroundColor Gray
Write-Host "  - Wallet top-up (cash)" -ForegroundColor Gray
Write-Host "  - Ride payment processing (wallet)" -ForegroundColor Gray
Write-Host "  - Payment history retrieval" -ForegroundColor Gray
Write-Host "  - Payment refund" -ForegroundColor Gray

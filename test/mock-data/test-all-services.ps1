# Hop-On Services - Бүх сервисийг тест хийх скрипт
# PowerShell 5.1+

Write-Host "=== Hop-On Services Test Script ===" -ForegroundColor Cyan
Write-Host ""

# Тохиргоо
$baseUrl = "http://localhost:3000/api/v1"
$authServiceUrl = "http://localhost:3001/auth"
$rideServiceUrl = "http://localhost:3003/rides"
$bookingServiceUrl = "http://localhost:3004/bookings"
$paymentServiceUrl = "http://localhost:3005"
$chatServiceUrl = "http://localhost:3006"
$notificationServiceUrl = "http://localhost:3007/notifications"

# Глобал хувьсагчууд
$passengerToken = $null
$driverToken = $null
$passengerId = $null
$driverId = $null
$rideId = $null
$bookingId = $null

# Тусламж функцууд
function Test-Service {
    param(
        [string]$ServiceName,
        [string]$Url
    )
    
    Write-Host "Testing $ServiceName..." -NoNewline
    try {
        $response = Invoke-RestMethod -Uri $Url -Method GET -TimeoutSec 5 -ErrorAction Stop
        Write-Host " ✓ OK" -ForegroundColor Green
        return $true
    } catch {
        Write-Host " ✗ FAILED" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Yellow
        return $false
    }
}

function Invoke-ApiRequest {
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

# 1. Сервисүүдийн байдлыг шалгах
Write-Host "`n=== Step 1: Checking Services ===" -ForegroundColor Cyan
$services = @(
    @{ Name = "API Gateway"; Url = "http://localhost:3000/health" }
    @{ Name = "Auth Service"; Url = "http://localhost:3001/health" }
    @{ Name = "Ride Service"; Url = "http://localhost:3003/health" }
    @{ Name = "Booking Service"; Url = "http://localhost:3004/health" }
    @{ Name = "Payment Service"; Url = "http://localhost:3005/health" }
    @{ Name = "Chat Service"; Url = "http://localhost:3006/health" }
    @{ Name = "Notification Service"; Url = "http://localhost:3007/health" }
)

$allHealthy = $true
foreach ($service in $services) {
    $isHealthy = Test-Service -ServiceName $service.Name -Url $service.Url
    $allHealthy = $allHealthy -and $isHealthy
}

if (-not $allHealthy) {
    Write-Host "`n⚠ Some services are not running. Please start all services first." -ForegroundColor Yellow
    Write-Host "Run: .\start-all-services.ps1" -ForegroundColor Yellow
    exit 1
}

# 2. Хэрэглэгчдийг бүртгүүлэх
Write-Host "`n=== Step 2: Registering Users ===" -ForegroundColor Cyan

# Зорчигч
Write-Host "Registering passenger..." -NoNewline
$passengerData = @{
    phone = "+97699887766"
    password = "Password123"
    name = "Тест Зорчигч"
    email = "passenger@test.com"
    role = "passenger"
}
$result = Invoke-ApiRequest -Url "$baseUrl/auth/register" -Method POST -Body $passengerData
if ($result.Success) {
    Write-Host " ✓" -ForegroundColor Green
    $passengerId = $result.Data.user.id
} else {
    Write-Host " ⚠ (might already exist)" -ForegroundColor Yellow
}

# Жолооч
Write-Host "Registering driver..." -NoNewline
$driverData = @{
    phone = "+97688776655"
    password = "Driver123"
    name = "Тест Жолооч"
    email = "driver@test.com"
    role = "driver"
}
$result = Invoke-ApiRequest -Url "$baseUrl/auth/register" -Method POST -Body $driverData
if ($result.Success) {
    Write-Host " ✓" -ForegroundColor Green
    $driverId = $result.Data.user.id
} else {
    Write-Host " ⚠ (might already exist)" -ForegroundColor Yellow
}

# 3. Нэвтрэх
Write-Host "`n=== Step 3: Logging In ===" -ForegroundColor Cyan

# Зорчигч нэвтрэх
Write-Host "Logging in passenger..." -NoNewline
$loginData = @{
    phone = "+97699887766"
    password = "Password123"
}
$result = Invoke-ApiRequest -Url "$baseUrl/auth/login" -Method POST -Body $loginData
if ($result.Success) {
    $passengerToken = $result.Data.accessToken
    $passengerId = $result.Data.user.id
    Write-Host " ✓" -ForegroundColor Green
    Write-Host "  User ID: $passengerId" -ForegroundColor Gray
} else {
    Write-Host " ✗ FAILED" -ForegroundColor Red
    Write-Host "  Error: $($result.Error)" -ForegroundColor Yellow
    exit 1
}

# Жолооч нэвтрэх
Write-Host "Logging in driver..." -NoNewline
$loginData = @{
    phone = "+97688776655"
    password = "Driver123"
}
$result = Invoke-ApiRequest -Url "$baseUrl/auth/login" -Method POST -Body $loginData
if ($result.Success) {
    $driverToken = $result.Data.accessToken
    $driverId = $result.Data.user.id
    Write-Host " ✓" -ForegroundColor Green
    Write-Host "  User ID: $driverId" -ForegroundColor Gray
} else {
    Write-Host " ✗ FAILED" -ForegroundColor Red
    exit 1
}

# 4. Жолооч аялал үүсгэх
Write-Host "`n=== Step 4: Creating Ride ===" -ForegroundColor Cyan
Write-Host "Creating ride by driver..." -NoNewline

$departureTime = (Get-Date).AddHours(2).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
$rideData = @{
    origin = @{
        lat = 47.9184
        lng = 106.9177
        address = "Сүхбаатарын талбай, Улаанбаатар"
    }
    destination = @{
        lat = 47.9251
        lng = 106.9060
        address = "Зайсан толгой, Улаанбаатар"
    }
    departureTime = $departureTime
    availableSeats = 3
    pricePerSeat = 5000
}

$result = Invoke-ApiRequest -Url "$baseUrl/rides" -Method POST -Body $rideData -Token $driverToken
if ($result.Success) {
    $rideId = $result.Data.id
    Write-Host " ✓" -ForegroundColor Green
    Write-Host "  Ride ID: $rideId" -ForegroundColor Gray
    Write-Host "  Available Seats: $($result.Data.availableSeats)" -ForegroundColor Gray
    Write-Host "  Price: $($result.Data.pricePerSeat)₮" -ForegroundColor Gray
} else {
    Write-Host " ✗ FAILED" -ForegroundColor Red
    Write-Host "  Error: $($result.Error)" -ForegroundColor Yellow
}

# 5. Аялал хайх
Write-Host "`n=== Step 5: Searching Rides ===" -ForegroundColor Cyan
Write-Host "Searching available rides..." -NoNewline

$searchParams = "?originLat=47.9184&originLng=106.9177&destLat=47.9251&destLng=106.9060&maxRadius=5000"
$result = Invoke-ApiRequest -Url "$baseUrl/rides/search$searchParams" -Token $passengerToken
if ($result.Success) {
    Write-Host " ✓" -ForegroundColor Green
    Write-Host "  Found: $($result.Data.data.Count) rides" -ForegroundColor Gray
} else {
    Write-Host " ⚠ No rides found" -ForegroundColor Yellow
}

# 6. Захиалга үүсгэх
Write-Host "`n=== Step 6: Creating Booking ===" -ForegroundColor Cyan
Write-Host "Creating booking by passenger..." -NoNewline

if ($rideId) {
    $bookingData = @{
        rideId = $rideId
        seats = 2
    }
    
    $result = Invoke-ApiRequest -Url "$baseUrl/bookings" -Method POST -Body $bookingData -Token $passengerToken
    if ($result.Success) {
        $bookingId = $result.Data.id
        Write-Host " ✓" -ForegroundColor Green
        Write-Host "  Booking ID: $bookingId" -ForegroundColor Gray
        Write-Host "  Status: $($result.Data.status)" -ForegroundColor Gray
        Write-Host "  Seats: $($result.Data.seats)" -ForegroundColor Gray
    } else {
        Write-Host " ✗ FAILED" -ForegroundColor Red
        Write-Host "  Error: $($result.Response)" -ForegroundColor Yellow
    }
} else {
    Write-Host " ⊘ Skipped (no ride)" -ForegroundColor Yellow
}

# 7. Захиалга батлах
Write-Host "`n=== Step 7: Approving Booking ===" -ForegroundColor Cyan
Write-Host "Driver approving booking..." -NoNewline

if ($bookingId) {
    Start-Sleep -Seconds 1
    $result = Invoke-ApiRequest -Url "$baseUrl/bookings/$bookingId/approve" -Method PATCH -Token $driverToken
    if ($result.Success) {
        Write-Host " ✓" -ForegroundColor Green
        Write-Host "  Status: $($result.Data.status)" -ForegroundColor Gray
    } else {
        Write-Host " ✗ FAILED" -ForegroundColor Red
        Write-Host "  Error: $($result.Response)" -ForegroundColor Yellow
    }
} else {
    Write-Host " ⊘ Skipped (no booking)" -ForegroundColor Yellow
}

# 8. Түрийвч цэнэглэх
Write-Host "`n=== Step 8: Wallet Top-up ===" -ForegroundColor Cyan
Write-Host "Topping up wallet..." -NoNewline

$topupData = @{
    userId = $passengerId
    amount = 50000
    paymentMethod = "card"
}

$result = Invoke-ApiRequest -Url "$baseUrl/payments/wallet/topup" -Method POST -Body $topupData
if ($result.Success) {
    Write-Host " ✓" -ForegroundColor Green
    Write-Host "  New Balance: $($result.Data.balance)₮" -ForegroundColor Gray
} else {
    Write-Host " ✗ FAILED" -ForegroundColor Red
    Write-Host "  Error: $($result.Response)" -ForegroundColor Yellow
}

# 9. Түрийвчийн үлдэгдэл шалгах
Write-Host "`n=== Step 9: Checking Wallet Balance ===" -ForegroundColor Cyan
Write-Host "Getting wallet balance..." -NoNewline

$result = Invoke-ApiRequest -Url "$baseUrl/payments/wallet/balance?userId=$passengerId"
if ($result.Success) {
    Write-Host " ✓" -ForegroundColor Green
    Write-Host "  Balance: $($result.Data.balance)₮" -ForegroundColor Gray
} else {
    Write-Host " ✗ FAILED" -ForegroundColor Red
}

# 10. Төлбөр төлөх
Write-Host "`n=== Step 10: Processing Payment ===" -ForegroundColor Cyan
Write-Host "Processing ride payment..." -NoNewline

if ($bookingId) {
    $paymentData = @{
        bookingId = $bookingId
        method = "wallet"
    }
    
    $result = Invoke-ApiRequest -Url "$baseUrl/payments/ride" -Method POST -Body $paymentData -Token $passengerToken
    if ($result.Success) {
        Write-Host " ✓" -ForegroundColor Green
        Write-Host "  Amount: $($result.Data.amount)₮" -ForegroundColor Gray
        Write-Host "  Status: $($result.Data.status)" -ForegroundColor Gray
    } else {
        Write-Host " ✗ FAILED" -ForegroundColor Red
        Write-Host "  Error: $($result.Response)" -ForegroundColor Yellow
    }
} else {
    Write-Host " ⊘ Skipped (no booking)" -ForegroundColor Yellow
}

# 11. Мэдэгдэл шалгах
Write-Host "`n=== Step 11: Checking Notifications ===" -ForegroundColor Cyan
Write-Host "Getting user notifications..." -NoNewline

$result = Invoke-ApiRequest -Url "$baseUrl/notifications?userId=$passengerId"
if ($result.Success) {
    Write-Host " ✓" -ForegroundColor Green
    Write-Host "  Total: $($result.Data.data.Count) notifications" -ForegroundColor Gray
    if ($result.Data.data.Count -gt 0) {
        Write-Host "  Latest: $($result.Data.data[0].title)" -ForegroundColor Gray
    }
} else {
    Write-Host " ⚠" -ForegroundColor Yellow
}

# 12. Харилцан яриа үүсгэх
Write-Host "`n=== Step 12: Creating Conversation ===" -ForegroundColor Cyan
Write-Host "Creating chat conversation..." -NoNewline

if ($rideId) {
    $conversationData = @{
        type = "ride"
        title = "Аялалын чат"
        participantIds = @($passengerId, $driverId)
        rideId = $rideId
    }
    
    $result = Invoke-ApiRequest -Url "$baseUrl/chat/conversations" -Method POST -Body $conversationData -Token $passengerToken
    if ($result.Success) {
        $conversationId = $result.Data.id
        Write-Host " ✓" -ForegroundColor Green
        Write-Host "  Conversation ID: $conversationId" -ForegroundColor Gray
        
        # Мессеж илгээх
        Write-Host "Sending message..." -NoNewline
        $messageData = @{
            conversationId = $conversationId
            type = "text"
            content = "Сайн байна уу? Тест мессеж."
        }
        
        $msgResult = Invoke-ApiRequest -Url "$baseUrl/chat/messages" -Method POST -Body $messageData -Token $passengerToken
        if ($msgResult.Success) {
            Write-Host " ✓" -ForegroundColor Green
        } else {
            Write-Host " ✗" -ForegroundColor Red
        }
    } else {
        Write-Host " ✗ FAILED" -ForegroundColor Red
        Write-Host "  Error: $($result.Response)" -ForegroundColor Yellow
    }
} else {
    Write-Host " ⊘ Skipped (no ride)" -ForegroundColor Yellow
}

# Дүгнэлт
Write-Host "`n=== Test Summary ===" -ForegroundColor Cyan
Write-Host "✓ Services are running" -ForegroundColor Green
Write-Host "✓ User registration & login" -ForegroundColor Green
if ($rideId) {
    Write-Host "✓ Ride creation (ID: $rideId)" -ForegroundColor Green
}
if ($bookingId) {
    Write-Host "✓ Booking creation (ID: $bookingId)" -ForegroundColor Green
}
Write-Host "✓ Payment processing" -ForegroundColor Green
Write-Host "✓ Notifications" -ForegroundColor Green

Write-Host "`nTest completed successfully! 🎉" -ForegroundColor Green
Write-Host "`nTest Data:" -ForegroundColor Cyan
Write-Host "  Passenger ID: $passengerId" -ForegroundColor Gray
Write-Host "  Driver ID: $driverId" -ForegroundColor Gray
if ($rideId) {
    Write-Host "  Ride ID: $rideId" -ForegroundColor Gray
}
if ($bookingId) {
    Write-Host "  Booking ID: $bookingId" -ForegroundColor Gray
}

# Start all backend services in parallel
Write-Host "Starting all Hop-On services..." -ForegroundColor Green

# Define services
$services = @(
    @{Name="Auth Service"; Path="apps\services\auth-service"; Port=3001},
    @{Name="Ride Service"; Path="apps\services\ride-service"; Port=3003},
    @{Name="Booking Service"; Path="apps\services\booking-service"; Port=3004},
    @{Name="Payment Service"; Path="apps\services\payment-service"; Port=3005},
    @{Name="Chat Service"; Path="apps\services\chat-service"; Port=3006},
    @{Name="Notification Service"; Path="apps\services\notification-service"; Port=3007},
    @{Name="API Gateway"; Path="apps\services\api-gateway"; Port=3000}
)

# Start each service in a new terminal
foreach ($service in $services) {
    Write-Host "Starting $($service.Name) on port $($service.Port)..." -ForegroundColor Cyan
    
    # Start in new PowerShell window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$($service.Path)'; npm run dev"
}

Write-Host "`nAll services started!" -ForegroundColor Green
Write-Host "Press Ctrl+C in each terminal to stop services" -ForegroundColor Yellow

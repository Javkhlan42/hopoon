# HopOn Ride Lifecycle Test Runner
# Runs all integration tests for complete ride lifecycle

Write-Host "🚀 HopOn Ride Lifecycle Tests" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# Check if services are running
Write-Host "📡 Checking services..." -ForegroundColor Yellow

$services = @(
    @{ Name = "API Gateway"; Port = 3000 },
    @{ Name = "Auth Service"; Port = 3001 },
    @{ Name = "Ride Service"; Port = 3003 },
    @{ Name = "Booking Service"; Port = 3004 },
    @{ Name = "Chat Service"; Port = 3005 },
    @{ Name = "Payment Service"; Port = 3006 },
    @{ Name = "Notification Service"; Port = 3007 }
)

$allRunning = $true
foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($service.Port)/health" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
        Write-Host "  ✓ $($service.Name) (Port $($service.Port))" -ForegroundColor Green
    }
    catch {
        Write-Host "  ✗ $($service.Name) (Port $($service.Port)) - NOT RUNNING" -ForegroundColor Red
        $allRunning = $false
    }
}

Write-Host ""

if (-not $allRunning) {
    Write-Host "⚠️  Some services are not running!" -ForegroundColor Yellow
    Write-Host "Run 'npm run dev' or './start-all-services.ps1' first" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

# Test suites
$testSuites = @(
    @{ 
        Name = "Complete Ride Lifecycle"
        File = "integration/ride-lifecycle.integration.spec.ts"
        Description = "Tests all 7 steps: Create → Search → Book → Chat → Track → SOS → Complete"
    },
    @{
        Name = "Chat & Real-time Tracking"
        File = "integration/chat-realtime.integration.spec.ts"
        Description = "WebSocket messaging, location updates, typing indicators"
    },
    @{
        Name = "SOS & Safety Features"
        File = "integration/sos-safety.integration.spec.ts"
        Description = "Emergency alerts, admin notifications, safety analytics"
    },
    @{
        Name = "Payment & Rating System"
        File = "integration/payment-rating.integration.spec.ts"
        Description = "Wallet payments, refunds, mutual rating, analytics"
    }
)

Write-Host "🧪 Test Suites:" -ForegroundColor Cyan
foreach ($suite in $testSuites) {
    Write-Host "  • $($suite.Name)" -ForegroundColor White
    Write-Host "    $($suite.Description)" -ForegroundColor Gray
}
Write-Host ""

# Ask which tests to run
Write-Host "Select tests to run:" -ForegroundColor Yellow
Write-Host "  1. Complete Ride Lifecycle" -ForegroundColor White
Write-Host "  2. Chat & Real-time Tracking" -ForegroundColor White
Write-Host "  3. SOS & Safety Features" -ForegroundColor White
Write-Host "  4. Payment & Rating System" -ForegroundColor White
Write-Host "  5. All Integration Tests" -ForegroundColor Green
Write-Host "  0. Exit" -ForegroundColor Red
Write-Host ""

$choice = Read-Host "Enter your choice (0-5)"

$testFiles = @()

switch ($choice) {
    "1" { $testFiles = @($testSuites[0].File) }
    "2" { $testFiles = @($testSuites[1].File) }
    "3" { $testFiles = @($testSuites[2].File) }
    "4" { $testFiles = @($testSuites[3].File) }
    "5" { $testFiles = $testSuites | ForEach-Object { $_.File } }
    "0" { 
        Write-Host "Exiting..." -ForegroundColor Yellow
        exit 0 
    }
    default {
        Write-Host "Invalid choice!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🏃 Running tests..." -ForegroundColor Cyan
Write-Host ""

# Run tests
$startTime = Get-Date

foreach ($testFile in $testFiles) {
    Write-Host "▶️  Running: $testFile" -ForegroundColor Blue
    Write-Host "─────────────────────────────────────────────" -ForegroundColor Gray
    
    # Run Jest with the specific test file
    & npm test -- "test/$testFile" --verbose --runInBand
    
    $exitCode = $LASTEXITCODE
    
    Write-Host ""
    if ($exitCode -eq 0) {
        Write-Host "✅ PASSED: $testFile" -ForegroundColor Green
    } else {
        Write-Host "❌ FAILED: $testFile" -ForegroundColor Red
    }
    Write-Host ""
}

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "⏱️  Total time: $($duration.ToString('mm\:ss'))" -ForegroundColor White
Write-Host ""
Write-Host "📊 Coverage report available at:" -ForegroundColor Yellow
Write-Host "   test/coverage/lcov-report/index.html" -ForegroundColor Gray
Write-Host ""
Write-Host "✨ Test run complete!" -ForegroundColor Green

# Run All Integration Tests
param(
    [string]$Category = "all",
    [switch]$StopOnError = $false
)

$ErrorActionPreference = "Continue"

# Service URLs
$AUTH_URL = "http://localhost:3001"
$GATEWAY_URL = "http://localhost:3000"
$RIDE_URL = "http://localhost:3003"
$BOOKING_URL = "http://localhost:3004"
$PAYMENT_URL = "http://localhost:3005"

$results = @{
    Total = 0
    Passed = 0
    Failed = 0
    Skipped = 0
}

function Run-Test {
    param(
        [string]$Name,
        [string]$Script,
        [hashtable]$Params = @{}
    )
    
    $results.Total++
    
    Write-Host "`n" -NoNewline
    Write-Host "=" * 80 -ForegroundColor DarkGray
    Write-Host "[TEST $($results.Total)] $Name" -ForegroundColor Cyan
    Write-Host "=" * 80 -ForegroundColor DarkGray
    
    try {
        $result = & $Script @Params
        
        if ($result.Success) {
            $results.Passed++
            Write-Host "`n✅ [PASSED] $Name" -ForegroundColor Green
        } else {
            $results.Failed++
            Write-Host "`n❌ [FAILED] $Name" -ForegroundColor Red
            if ($StopOnError) {
                throw "Test failed: $Name"
            }
        }
    } catch {
        $results.Failed++
        Write-Host "`n❌ [ERROR] $Name" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($StopOnError) {
            throw
        }
    }
}

Write-Host @"
╔════════════════════════════════════════════════════════════════════════════╗
║                   HOP-ON INTEGRATION TEST SUITE                            ║
║                                                                            ║
║  Category: $Category                                                       
║  Stop on Error: $StopOnError                                               
╚════════════════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

$startTime = Get-Date

# Auth Tests
if ($Category -eq "all" -or $Category -eq "auth") {
    Write-Host "`n### AUTHENTICATION TESTS ###" -ForegroundColor Yellow
    
    Run-Test "User Registration" `
        "$PSScriptRoot\auth\test-register.ps1" `
        @{ AuthUrl = $AUTH_URL }
    
    Run-Test "User Login" `
        "$PSScriptRoot\auth\test-login.ps1" `
        @{ AuthUrl = $AUTH_URL }
    
    Run-Test "Admin Login" `
        "$PSScriptRoot\auth\test-admin-login.ps1" `
        @{ AuthUrl = $AUTH_URL }
}

# Ride Tests
if ($Category -eq "all" -or $Category -eq "ride") {
    Write-Host "`n### RIDE TESTS ###" -ForegroundColor Yellow
    
    Run-Test "Driver Flow (Register -> Create Ride)" `
        "$PSScriptRoot\ride\test-driver-flow.ps1" `
        @{ AuthUrl = $AUTH_URL; RideUrl = $RIDE_URL }
}

# Booking Tests
if ($Category -eq "all" -or $Category -eq "booking") {
    Write-Host "`n### BOOKING TESTS ###" -ForegroundColor Yellow
    
    Run-Test "Passenger Flow (Register -> Book Ride)" `
        "$PSScriptRoot\booking\test-passenger-flow.ps1" `
        @{ AuthUrl = $AUTH_URL; RideUrl = $RIDE_URL; BookingUrl = $BOOKING_URL }
}

# Payment Tests
if ($Category -eq "all" -or $Category -eq "payment") {
    Write-Host "`n### PAYMENT TESTS ###" -ForegroundColor Yellow
    
    Run-Test "Wallet Operations (Get Balance -> Top Up)" `
        "$PSScriptRoot\payment\test-wallet.ps1" `
        @{ AuthUrl = $AUTH_URL; PaymentUrl = $PAYMENT_URL }
}

# Admin Tests
if ($Category -eq "all" -or $Category -eq "admin") {
    Write-Host "`n### ADMIN TESTS ###" -ForegroundColor Yellow
    
    Run-Test "Admin Dashboard" `
        "$PSScriptRoot\admin\test-admin-dashboard.ps1" `
        @{ AuthUrl = $AUTH_URL }
    
    Run-Test "Admin User Management" `
        "$PSScriptRoot\admin\test-user-management.ps1" `
        @{ AuthUrl = $AUTH_URL }
}

$endTime = Get-Date
$duration = $endTime - $startTime

# Summary
Write-Host "`n" -NoNewline
Write-Host "=" * 80 -ForegroundColor DarkGray
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor DarkGray

Write-Host "`nResults:" -ForegroundColor White
Write-Host "  Total Tests:   $($results.Total)" -ForegroundColor Gray
Write-Host "  ✅ Passed:      $($results.Passed)" -ForegroundColor Green
Write-Host "  ❌ Failed:      $($results.Failed)" -ForegroundColor Red
Write-Host "  ⏭️  Skipped:     $($results.Skipped)" -ForegroundColor Yellow

$passRate = if ($results.Total -gt 0) { 
    [math]::Round(($results.Passed / $results.Total) * 100, 2) 
} else { 0 }

Write-Host "`nPass Rate: $passRate%" -ForegroundColor $(if ($passRate -eq 100) { "Green" } elseif ($passRate -ge 70) { "Yellow" } else { "Red" })
Write-Host "Duration: $($duration.TotalSeconds) seconds" -ForegroundColor Gray

if ($results.Failed -eq 0) {
    Write-Host "`n🎉 All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n⚠️ Some tests failed. Check the output above for details." -ForegroundColor Yellow
    exit 1
}

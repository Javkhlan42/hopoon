#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Automated Test Suite - Hope-On Platform
.DESCRIPTION
    Runs Unit, Integration, Security tests automatically.
    Checks services and runs tests in sequence.
.PARAMETER TestType
    Test type: all, unit, integration, security
.PARAMETER SkipServiceCheck
    Skip service check
.PARAMETER Verbose
    Show detailed information
.EXAMPLE
    .\run-all-tests.ps1
.EXAMPLE
    .\run-all-tests.ps1 -TestType integration
.EXAMPLE
    .\run-all-tests.ps1 -SkipServiceCheck
#>

param(
    [Parameter(Position = 0)]
    [ValidateSet('all', 'unit', 'integration', 'security')]
    [string]$TestType = 'all',
    
    [Parameter()]
    [switch]$SkipServiceCheck,
    
    [Parameter()]
    [switch]$ShowDetails
)

$ErrorActionPreference = 'Continue'

# Output functions
function Write-Success($message) {
    Write-Host "[OK] $message" -ForegroundColor Green
}

function Write-Fail($message) {
    Write-Host "[ERROR] $message" -ForegroundColor Red
}

function Write-Info($message) {
    Write-Host "[INFO] $message" -ForegroundColor Cyan
}

function Write-Header($message) {
    Write-Host "`n========================================" -ForegroundColor Yellow
    Write-Host "$message" -ForegroundColor Yellow
    Write-Host "========================================`n" -ForegroundColor Yellow
}

function Show-TestDocumentation {
    param(
        [int]$PassedTests,
        [int]$TotalTests,
        [timespan]$Duration
    )
    
    $percentage = [math]::Round(($PassedTests / $TotalTests) * 100, 1)
    $failedTests = $TotalTests - $PassedTests
    
    # Test report tailbar beldeh
    $report = @"

========================================
     TESTIIN TAILGAN - TEST REPORT
========================================

Ognooo: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Hugatsaa: $([math]::Round($Duration.TotalSeconds, 2)) sekund

TEST-IIN DUN:
  Niit Test:        $TotalTests
  Amjilttai:        $PassedTests ($percentage%)
  Aldaatai:         $failedTests

========================================
"@

    Write-Host $report -ForegroundColor Cyan
    
    # Windows notification
    $title = "Test duussan - $percentage% amjilttai"
    $message = "Amjilttai: $PassedTests/$TotalTests`nHugatsaa: $([math]::Round($Duration.TotalSeconds, 1))s"
    
    Add-Type -AssemblyName System.Windows.Forms
    $notification = New-Object System.Windows.Forms.NotifyIcon
    $notification.Icon = [System.Drawing.SystemIcons]::Information
    $notification.BalloonTipTitle = $title
    $notification.BalloonTipText = $message
    $notification.Visible = $true
    $notification.ShowBalloonTip(5000)
    
    # Delgerehgui medeelel
    Write-Host "DELGEREHGUI MEDEELEL:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  1. QUICK_START.md           - Hurdan ehleh (5 minut)" -ForegroundColor White
    Write-Host "  2. TEST_SUMMARY.md          - Test-iin dun, aldaanuud" -ForegroundColor White
    Write-Host "  3. BACKEND_FIX_CHECKLIST.md - Backend zaswar" -ForegroundColor White
    Write-Host "  4. README.md                - Delgerehgui zaawar" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Barimtat neeh uu? (1-4 songoh, Enter=algasah)"
    
    $docDir = Split-Path -Parent $PSScriptRoot
    switch ($choice) {
        "1" { 
            Write-Success "QUICK_START.md neej baina..."
            Start-Process "$docDir\QUICK_START.md" 
        }
        "2" { 
            Write-Success "TEST_SUMMARY.md neej baina..."
            Start-Process "$docDir\TEST_SUMMARY.md" 
        }
        "3" { 
            Write-Success "BACKEND_FIX_CHECKLIST.md neej baina..."
            Start-Process "$docDir\BACKEND_FIX_CHECKLIST.md" 
        }
        "4" { 
            Write-Success "README.md neej baina..."
            Start-Process "$docDir\README.md" 
        }
        default { Write-Info "Barimtat algasav" }
    }
    
    # Cleanup
    Start-Sleep -Seconds 1
    $notification.Dispose()
}

# Navigate to test directory
$testDir = Split-Path -Parent $PSScriptRoot
Set-Location $testDir

Write-Header "Hope-On Platform - Automated Test Suite"
Write-Info "Test Directory: $testDir"
Write-Info "Test Type: $TestType"
Write-Info "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

# Service check function
function Test-Services {
    Write-Info "Checking required services..."
    
    $requiredPorts = @{
        3001 = "Auth Service"
        3003 = "Ride Service"
        3004 = "Booking Service"
    }
    
    $allRunning = $true
    
    foreach ($port in $requiredPorts.Keys) {
        $serviceName = $requiredPorts[$port]
        
        try {
            $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue -InformationLevel Quiet
            
            if ($connection) {
                Write-Success "$serviceName (port $port) is running"
            } else {
                Write-Fail "$serviceName (port $port) is NOT running"
                $allRunning = $false
            }
        }
        catch {
            Write-Fail "$serviceName (port $port) check failed"
            $allRunning = $false
        }
    }
    
    if (-not $allRunning) {
        Write-Fail "Some services are not running!"
        Write-Info "Please start services: .\start-all-services.ps1"
        return $false
    }
    
    Write-Success "All required services are running"
    return $true
}

# Dependencies check
function Test-Dependencies {
    Write-Info "Checking dependencies..."
    
    if (-not (Test-Path "node_modules")) {
        Write-Fail "node_modules not found!"
        Write-Info "Installing dependencies..."
        npm install
        
        if ($LASTEXITCODE -ne 0) {
            Write-Fail "Failed to install dependencies"
            return $false
        }
    }
    
    Write-Success "Dependencies OK"
    return $true
}

# Run unit tests
function Invoke-UnitTests {
    Write-Header "Running Unit Tests"
    
    npm run test:unit
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Unit tests passed"
        return $true
    } else {
        Write-Fail "Unit tests failed"
        return $false
    }
}

# Run integration tests
function Invoke-IntegrationTests {
    Write-Header "Running Integration Tests"
    
    npm run test:integration
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Integration tests passed"
        return $true
    } else {
        Write-Fail "Integration tests failed"
        return $false
    }
}

# Run security tests
function Invoke-SecurityTests {
    Write-Header "Running Security Tests"
    
    npm run test:security
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Security tests passed"
        return $true
    } else {
        Write-Fail "Security tests failed"
        return $false
    }
}

# Run all tests in sequence
function Invoke-AllTests {
    $results = @{
        "Unit" = $false
        "Integration" = $false
        "Security" = $false
    }
    
    # Unit tests
    if ($TestType -eq 'all' -or $TestType -eq 'unit') {
        $results["Unit"] = Invoke-UnitTests
    }
    
    # Integration tests
    if ($TestType -eq 'all' -or $TestType -eq 'integration') {
        if (-not $SkipServiceCheck) {
            $servicesOK = Test-Services
            if (-not $servicesOK) {
                Write-Fail "Cannot run integration tests without services"
                $results["Integration"] = $false
            } else {
                $results["Integration"] = Invoke-IntegrationTests
            }
        } else {
            $results["Integration"] = Invoke-IntegrationTests
        }
    }
    
    # Security tests
    if ($TestType -eq 'all' -or $TestType -eq 'security') {
        if (-not $SkipServiceCheck) {
            $servicesOK = Test-Services
            if (-not $servicesOK) {
                Write-Fail "Cannot run security tests without services"
                $results["Security"] = $false
            } else {
                $results["Security"] = Invoke-SecurityTests
            }
        } else {
            $results["Security"] = Invoke-SecurityTests
        }
    }
    
    return $results
}

# Main execution
try {
    # Check dependencies
    if (-not (Test-Dependencies)) {
        exit 1
    }
    
    # Remove API_URL environment variable (tests configure themselves)
    if ($env:API_URL) {
        Write-Info "Removing API_URL environment variable"
        Remove-Item Env:\API_URL -ErrorAction SilentlyContinue
    }
    
    # Run tests
    $startTime = Get-Date
    $results = Invoke-AllTests
    $endTime = Get-Date
    $duration = $endTime - $startTime
    
    # Show summary
    Write-Header "Test Summary"
    Write-Info "Total Duration: $($duration.TotalSeconds) seconds"
    Write-Host ""
    
    $totalTests = 0
    $passedTests = 0
    
    foreach ($testType in $results.Keys) {
        if ($TestType -eq 'all' -or $TestType -eq $testType.ToLower()) {
            $totalTests++
            if ($results[$testType]) {
                $passedTests++
                Write-Success "$testType Tests: PASSED"
            } else {
                Write-Fail "$testType Tests: FAILED"
            }
        }
    }
    
    Write-Host ""
    Write-Info "Tests Passed: $passedTests / $totalTests"
    
    # Show documentation popup
    Show-TestDocumentation -PassedTests $passedTests -TotalTests $totalTests -Duration $duration
    
    if ($passedTests -eq $totalTests -and $totalTests -gt 0) {
        Write-Header "All Tests PASSED!"
        exit 0
    } else {
        Write-Header "Some Tests FAILED"
        exit 1
    }
}
catch {
    Write-Fail "Unexpected error occurred"
    Write-Fail $_.Exception.Message
    
    if ($ShowDetails) {
        Write-Host "`nStack Trace:" -ForegroundColor Red
        Write-Host $_.ScriptStackTrace -ForegroundColor Red
    }
    
    exit 1
}

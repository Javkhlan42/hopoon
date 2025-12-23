#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Бүрэн автомат тестийн скрипт - Hope-On Platform
.DESCRIPTION
    Unit, Integration, Security тестүүдийг автоматаар ажиллуулна.
    Service-үүд ажиллаж байгааг шалгаад, тестүүдийг дарааллаар ажиллуулна.
.PARAMETER TestType
    Тестийн төрөл: all, unit, integration, security
.PARAMETER SkipServiceCheck
    Service шалгалтыг алгасах
.PARAMETER Verbose
    Дэлгэрэнгүй мэдээлэл харуулах
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
    [switch]$Verbose
)

$ErrorActionPreference = 'Continue'

# Өнгөтэй output функцүүд
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

# Test directory руу шилжих
$testDir = Split-Path -Parent $PSScriptRoot
Set-Location $testDir

Write-Header "Hope-On Platform - Automated Test Suite"
Write-Info "Test Directory: $testDir"
Write-Info "Test Type: $TestType"
Write-Info "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

# Service шалгах функц
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

# Dependencies шалгах
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

# Unit tests ажиллуулах
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

# Integration tests ажиллуулах
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

# Security tests ажиллуулах
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

# Тестүүдийг дарааллаар ажиллуулах
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
    # Dependencies шалгах
    if (-not (Test-Dependencies)) {
        exit 1
    }
    
    # API_URL environment variable устгах (tests өөрөө тохируулна)
    if ($env:API_URL) {
        Write-Info "Removing API_URL environment variable"
        Remove-Item Env:\API_URL -ErrorAction SilentlyContinue
    }
    
    # Тестүүдийг ажиллуулах
    $startTime = Get-Date
    $results = Invoke-AllTests
    $endTime = Get-Date
    $duration = $endTime - $startTime
    
    # Дүнг харуулах
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
    
    if ($passedTests -eq $totalTests -and $totalTests -gt 0) {
        Write-Header "All Tests PASSED! ✓"
        exit 0
    } else {
        Write-Header "Some Tests FAILED ✗"
        exit 1
    }
}
catch {
    Write-Fail "Unexpected error occurred"
    Write-Fail $_.Exception.Message
    
    if ($Verbose) {
        Write-Host "`nStack Trace:" -ForegroundColor Red
        Write-Host $_.ScriptStackTrace -ForegroundColor Red
    }
    
    exit 1
}

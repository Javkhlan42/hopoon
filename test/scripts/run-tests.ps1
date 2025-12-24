#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Run all tests for HopOn platform
.DESCRIPTION
    Executes unit tests, integration tests, E2E tests, security tests, and performance tests
.PARAMETER TestType
    Type of test to run: all, unit, integration, e2e, security, performance
.PARAMETER Coverage
    Generate coverage report
.PARAMETER Watch
    Run tests in watch mode
.EXAMPLE
    .\run-tests.ps1 -TestType all
.EXAMPLE
    .\run-tests.ps1 -TestType unit -Coverage
#>

param(
    [Parameter(Position = 0)]
    [ValidateSet('all', 'unit', 'integration', 'e2e', 'security', 'performance', 'ci')]
    [string]$TestType = 'all',
    
    [Parameter()]
    [switch]$Coverage,
    
    [Parameter()]
    [switch]$Watch,
    
    [Parameter()]
    [string]$ApiUrl = 'http://localhost:3000'
)

# Set error action preference
$ErrorActionPreference = 'Stop'

# Colors for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success($message) {
    Write-ColorOutput Green "[OK] $message"
}

function Write-Error($message) {
    Write-ColorOutput Red "[ERROR] $message"
}

function Write-Info($message) {
    Write-ColorOutput Cyan "[INFO] $message"
}

function Write-Header($message) {
    Write-ColorOutput Yellow "`n========================================`n$message`n========================================"
}

# Change to test directory
$testDir = Split-Path -Parent $PSScriptRoot
Set-Location $testDir

# Check if API is running (only for integration and e2e tests)
function Test-API {
    Write-Info "Checking if API is running at $ApiUrl..."
    
    try {
        $response = Invoke-WebRequest -Uri "$ApiUrl/health" -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Success "API is running and healthy"
            return $true
        }
    }
    catch {
        Write-Error "API is not running at $ApiUrl"
        Write-Info "Please start the API before running integration/e2e tests"
        return $false
    }
    return $false
}

# Run unit tests
function Invoke-UnitTests {
    Write-Header "Running Unit Tests"
    
    if ($Coverage) {
        npm run test:unit -- --coverage
    }
    elseif ($Watch) {
        npm run test:watch -- --testPathPattern=test/unit
    }
    else {
        npm run test:unit
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Unit tests passed"
        return $true
    }
    else {
        Write-Error "Unit tests failed"
        return $false
    }
}

# Run integration tests
function Invoke-IntegrationTests {
    Write-Header "Running Integration Tests"
    
    if (!(Test-API)) {
        Write-Error "Cannot run integration tests without API"
        return $false
    }
    
    $env:API_URL = $ApiUrl
    npm run test:integration
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Integration tests passed"
        return $true
    }
    else {
        Write-Error "Integration tests failed"
        return $false
    }
}

# Run E2E tests
function Invoke-E2ETests {
    Write-Header "Running E2E Tests"
    
    if (!(Test-API)) {
        Write-Error "Cannot run E2E tests without API"
        return $false
    }
    
    $env:BASE_URL = $ApiUrl
    npm run test:e2e
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "E2E tests passed"
        return $true
    }
    else {
        Write-Error "E2E tests failed"
        return $false
    }
}

# Run security tests
function Invoke-SecurityTests {
    Write-Header "Running Security Tests"
    
    if (!(Test-API)) {
        Write-Error "Cannot run security tests without API"
        return $false
    }
    
    $env:API_URL = $ApiUrl
    npm run test:security
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Security tests passed"
        return $true
    }
    else {
        Write-Error "Security tests failed"
        return $false
    }
}

# Run performance tests
function Invoke-PerformanceTests {
    Write-Header "Running Performance Tests"
    
    # Check if k6 is installed
    if (!(Get-Command k6 -ErrorAction SilentlyContinue)) {
        Write-Error "k6 is not installed. Please install k6 from https://k6.io/docs/getting-started/installation/"
        return $false
    }
    
    if (!(Test-API)) {
        Write-Error "Cannot run performance tests without API"
        return $false
    }
    
    $env:BASE_URL = $ApiUrl
    
    Write-Info "Running load test..."
    npm run test:performance:load
    
    Write-Info "Running stress test..."
    npm run test:performance:stress
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Performance tests completed"
        return $true
    }
    else {
        Write-Error "Performance tests failed"
        return $false
    }
}

# Main execution
Write-Header "HopOn Platform Test Suite"
Write-Info "Test Type: $TestType"
Write-Info "API URL: $ApiUrl"

$results = @()

switch ($TestType) {
    'unit' {
        $results += Invoke-UnitTests
    }
    'integration' {
        $results += Invoke-IntegrationTests
    }
    'e2e' {
        $results += Invoke-E2ETests
    }
    'security' {
        $results += Invoke-SecurityTests
    }
    'performance' {
        $results += Invoke-PerformanceTests
    }
    'ci' {
        $results += Invoke-UnitTests
        $results += Invoke-IntegrationTests
        $results += Invoke-E2ETests
        $results += Invoke-SecurityTests
    }
    'all' {
        $results += Invoke-UnitTests
        $results += Invoke-IntegrationTests
        $results += Invoke-E2ETests
        $results += Invoke-SecurityTests
        $results += Invoke-PerformanceTests
    }
}

# Summary
Write-Header "Test Summary"

$passed = ($results | Where-Object { $_ -eq $true }).Count
$failed = ($results | Where-Object { $_ -eq $false }).Count
$total = $results.Count

Write-Info "Total: $total | Passed: $passed | Failed: $failed"

if ($failed -eq 0) {
    Write-Success "`nAll tests passed!"
    exit 0
}
else {
    Write-Error "`nSome tests failed!"
    exit 1
}

# AWS Deployment Script for Hop-On Services (PowerShell)
# This script builds and pushes Docker images to AWS ECR

param(
    [string]$AwsRegion = "us-east-1",
    [string]$AwsAccountId = $env:AWS_ACCOUNT_ID
)

# Configuration
$ErrorActionPreference = "Stop"
$EcrRegistry = "$AwsAccountId.dkr.ecr.$AwsRegion.amazonaws.com"

# Services to deploy
$Services = @(
    "api-gateway",
    "auth-service",
    "booking-service",
    "ride-service",
    "payment-service",
    "notification-service",
    "chat-service",
    "admin-web",
    "web"
)

Write-Host "=== Hop-On AWS Deployment Script ===" -ForegroundColor Green

# Check if AWS Account ID is set
if ([string]::IsNullOrEmpty($AwsAccountId)) {
    Write-Host "Error: AWS_ACCOUNT_ID is not set" -ForegroundColor Red
    Write-Host "Please set it using: `$env:AWS_ACCOUNT_ID = '<your-account-id>'" -ForegroundColor Yellow
    exit 1
}

# Login to ECR
Write-Host "Logging in to AWS ECR..." -ForegroundColor Yellow
$LoginCommand = aws ecr get-login-password --region $AwsRegion
$LoginCommand | docker login --username AWS --password-stdin $EcrRegistry

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to login to ECR" -ForegroundColor Red
    exit 1
}

# Navigate to project root
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $ProjectRoot

# Build and push each service
foreach ($Service in $Services) {
    Write-Host "Building and pushing $Service..." -ForegroundColor Green
    
    # Build the Docker image
    docker build -f "infra/docker/$Service.Dockerfile" -t "hopon/$Service:latest" .
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to build $Service" -ForegroundColor Red
        exit 1
    }
    
    # Tag the image
    docker tag "hopon/$Service:latest" "$EcrRegistry/hopon/$Service:latest"
    
    # Push to ECR
    docker push "$EcrRegistry/hopon/$Service:latest"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to push $Service" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✓ $Service deployed successfully" -ForegroundColor Green
}

Write-Host "=== All services deployed successfully! ===" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update ECS task definitions with the new image URIs"
Write-Host "2. Update ECS services to use the new task definitions"
Write-Host "3. Monitor the deployment in AWS ECS console"

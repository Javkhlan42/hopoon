# PowerShell Script to create all necessary ECR repositories

param(
    [string]$AwsRegion = "us-east-1"
)

Write-Host "Creating ECR repositories in region: $AwsRegion" -ForegroundColor Green

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

foreach ($Service in $Services) {
    Write-Host "Creating repository: hopon/$Service" -ForegroundColor Yellow
    
    try {
        aws ecr create-repository `
            --repository-name "hopon/$Service" `
            --region $AwsRegion `
            --image-scanning-configuration scanOnPush=true `
            --encryption-configuration encryptionType=AES256
        
        Write-Host "✓ Repository hopon/$Service created" -ForegroundColor Green
    }
    catch {
        Write-Host "Repository hopon/$Service might already exist" -ForegroundColor Yellow
    }
}

Write-Host "All ECR repositories processed!" -ForegroundColor Green

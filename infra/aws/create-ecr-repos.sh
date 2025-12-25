#!/bin/bash

# Script to create all necessary ECR repositories

set -e

AWS_REGION=${AWS_REGION:-"us-east-1"}

echo "Creating ECR repositories in region: ${AWS_REGION}"

SERVICES=(
  "api-gateway"
  "auth-service"
  "booking-service"
  "ride-service"
  "payment-service"
  "notification-service"
  "chat-service"
  "admin-web"
  "web"
)

for SERVICE in "${SERVICES[@]}"; do
  echo "Creating repository: hopon/${SERVICE}"
  aws ecr create-repository \
    --repository-name hopon/${SERVICE} \
    --region ${AWS_REGION} \
    --image-scanning-configuration scanOnPush=true \
    --encryption-configuration encryptionType=AES256 \
    || echo "Repository hopon/${SERVICE} might already exist"
done

echo "All ECR repositories created successfully!"

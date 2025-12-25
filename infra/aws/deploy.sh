#!/bin/bash

# AWS Deployment Script for Hop-On Services
# This script builds and pushes Docker images to AWS ECR

set -e

# Configuration
AWS_REGION=${AWS_REGION:-"us-east-1"}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:-""}
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Services to deploy
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

echo -e "${GREEN}=== Hop-On AWS Deployment Script ===${NC}"

# Check if AWS Account ID is set
if [ -z "$AWS_ACCOUNT_ID" ]; then
  echo -e "${RED}Error: AWS_ACCOUNT_ID is not set${NC}"
  echo "Please set it using: export AWS_ACCOUNT_ID=<your-account-id>"
  exit 1
fi

# Login to ECR
echo -e "${YELLOW}Logging in to AWS ECR...${NC}"
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}

# Build and push each service
for SERVICE in "${SERVICES[@]}"; do
  echo -e "${GREEN}Building and pushing ${SERVICE}...${NC}"
  
  # Build the Docker image
  docker build -f infra/docker/${SERVICE}.Dockerfile -t hopon/${SERVICE}:latest .
  
  # Tag the image
  docker tag hopon/${SERVICE}:latest ${ECR_REGISTRY}/hopon/${SERVICE}:latest
  
  # Push to ECR
  docker push ${ECR_REGISTRY}/hopon/${SERVICE}:latest
  
  echo -e "${GREEN}✓ ${SERVICE} deployed successfully${NC}"
done

echo -e "${GREEN}=== All services deployed successfully! ===${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update ECS task definitions with the new image URIs"
echo "2. Update ECS services to use the new task definitions"
echo "3. Monitor the deployment in AWS ECS console"

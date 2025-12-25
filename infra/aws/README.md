# AWS Deployment Guide for Hop-On

## Overview

This guide covers deploying the Hop-On application to AWS using ECS (Elastic Container Service) with ECR (Elastic Container Registry).

## Prerequisites

- AWS CLI installed and configured
- Docker installed
- AWS account with appropriate permissions
- ECR repositories created for each service

## Architecture

- **Compute**: AWS ECS Fargate
- **Container Registry**: AWS ECR
- **Database**: AWS RDS (PostgreSQL with PostGIS)
- **Cache**: AWS ElastiCache (Redis)
- **Load Balancer**: Application Load Balancer
- **Networking**: VPC with public and private subnets

## Step 1: Create ECR Repositories

```bash
# Create ECR repositories for each service
aws ecr create-repository --repository-name hopon/api-gateway --region us-east-1
aws ecr create-repository --repository-name hopon/auth-service --region us-east-1
aws ecr create-repository --repository-name hopon/booking-service --region us-east-1
aws ecr create-repository --repository-name hopon/ride-service --region us-east-1
aws ecr create-repository --repository-name hopon/payment-service --region us-east-1
aws ecr create-repository --repository-name hopon/notification-service --region us-east-1
aws ecr create-repository --repository-name hopon/chat-service --region us-east-1
aws ecr create-repository --repository-name hopon/admin-web --region us-east-1
aws ecr create-repository --repository-name hopon/web --region us-east-1
```

## Step 2: Build and Push Docker Images

```bash
# Set your AWS account ID and region
export AWS_ACCOUNT_ID=<your-account-id>
export AWS_REGION=us-east-1
export ECR_REGISTRY=${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Login to ECR
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}

# Build and push each service
docker build -f infra/docker/api-gateway.Dockerfile -t hopon/api-gateway .
docker tag hopon/api-gateway:latest ${ECR_REGISTRY}/hopon/api-gateway:latest
docker push ${ECR_REGISTRY}/hopon/api-gateway:latest

docker build -f infra/docker/auth-service.Dockerfile -t hopon/auth-service .
docker tag hopon/auth-service:latest ${ECR_REGISTRY}/hopon/auth-service:latest
docker push ${ECR_REGISTRY}/hopon/auth-service:latest

docker build -f infra/docker/booking-service.Dockerfile -t hopon/booking-service .
docker tag hopon/booking-service:latest ${ECR_REGISTRY}/hopon/booking-service:latest
docker push ${ECR_REGISTRY}/hopon/booking-service:latest

docker build -f infra/docker/ride-service.Dockerfile -t hopon/ride-service .
docker tag hopon/ride-service:latest ${ECR_REGISTRY}/hopon/ride-service:latest
docker push ${ECR_REGISTRY}/hopon/ride-service:latest

docker build -f infra/docker/payment-service.Dockerfile -t hopon/payment-service .
docker tag hopon/payment-service:latest ${ECR_REGISTRY}/hopon/payment-service:latest
docker push ${ECR_REGISTRY}/hopon/payment-service:latest

docker build -f infra/docker/notification-service.Dockerfile -t hopon/notification-service .
docker tag hopon/notification-service:latest ${ECR_REGISTRY}/hopon/notification-service:latest
docker push ${ECR_REGISTRY}/hopon/notification-service:latest

docker build -f infra/docker/chat-service.Dockerfile -t hopon/chat-service .
docker tag hopon/chat-service:latest ${ECR_REGISTRY}/hopon/chat-service:latest
docker push ${ECR_REGISTRY}/hopon/chat-service:latest

docker build -f infra/docker/admin-web.Dockerfile -t hopon/admin-web .
docker tag hopon/admin-web:latest ${ECR_REGISTRY}/hopon/admin-web:latest
docker push ${ECR_REGISTRY}/hopon/admin-web:latest

docker build -f infra/docker/web.Dockerfile -t hopon/web .
docker tag hopon/web:latest ${ECR_REGISTRY}/hopon/web:latest
docker push ${ECR_REGISTRY}/hopon/web:latest
```

## Step 3: Create RDS PostgreSQL Instance with PostGIS

```bash
aws rds create-db-instance \
  --db-instance-identifier hopon-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 13.7 \
  --master-username postgres \
  --master-user-password <your-password> \
  --allocated-storage 20 \
  --vpc-security-group-ids <your-security-group> \
  --db-subnet-group-name <your-subnet-group> \
  --publicly-accessible false \
  --region ${AWS_REGION}
```

## Step 4: Create ElastiCache Redis Cluster

```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id hopon-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1 \
  --region ${AWS_REGION}
```

## Step 5: Create ECS Cluster

```bash
aws ecs create-cluster \
  --cluster-name hopon-cluster \
  --region ${AWS_REGION}
```

## Step 6: Deploy with ECS Task Definitions

See the `infra/aws/` directory for:

- `task-definitions/` - ECS task definitions for each service
- `ecs-services.sh` - Script to create ECS services
- `alb-setup.sh` - Script to configure Application Load Balancer

## Environment Variables

Create a `.env.production` file with:

```env
# Database
DB_HOST=<rds-endpoint>
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=<your-password>
DB_NAME=hopon

# Redis
REDIS_HOST=<elasticache-endpoint>
REDIS_PORT=6379

# JWT
JWT_SECRET=<your-jwt-secret>

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret-key>
```

## Monitoring and Logging

- CloudWatch Logs are automatically enabled for all ECS services
- Set up CloudWatch Alarms for critical metrics
- Enable AWS X-Ray for distributed tracing

## CI/CD Pipeline

Consider setting up GitHub Actions or AWS CodePipeline for automated deployments:

- Trigger on push to main branch
- Build Docker images
- Push to ECR
- Update ECS services

## Cost Optimization

- Use AWS Fargate Spot for non-critical services
- Set up auto-scaling based on CPU/Memory metrics
- Use AWS Cost Explorer to monitor spending
- Consider using NAT Gateway alternatives for cost savings

## Security Best Practices

- Use AWS Secrets Manager for sensitive data
- Enable VPC Flow Logs
- Implement IAM roles with least privilege
- Use Security Groups to restrict access
- Enable encryption at rest and in transit

## Scaling

ECS Services can auto-scale based on:

- CPU utilization
- Memory utilization
- Request count
- Custom CloudWatch metrics

## Backup and Recovery

- Enable automated RDS backups
- Configure Redis backup policies
- Use AWS Backup for centralized backup management

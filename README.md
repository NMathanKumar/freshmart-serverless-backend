# FreshMart Serverless Backend

FreshMart is a serverless backend deployed in AWS account `769044546162` and region `ap-southeast-1`.

## Active Deployment

- Terraform source of truth: `terraform/environments/dev`
- Deployment region: `ap-southeast-1`
- Lambda packaging target: `services/<service>/lambda.zip`
- API Gateway stage: `v1`

## Live Service Suite

- Authentication Service
- User Service
- Product Service
- Menu Service
- Inventory Service
- Cart Service
- Order Service
- Payment Service
- Notification Service
- Analytics Service
- Admin Service

## Core AWS Components

- AWS Lambda
- API Gateway HTTP API
- Cognito User Pool and Identity Pool
- DynamoDB
- SNS
- SQS
- EventBridge
- CloudWatch
- IAM
- S3

## Common Commands

```bash
npm install
npm run build
npm run package
npm run verify:deployment
terraform -chdir=terraform/environments/dev init
terraform -chdir=terraform/environments/dev validate
terraform -chdir=terraform/environments/dev plan
```

## Packaging

`npm run package` generates deployable ZIPs directly in the live service folders:

- `services/auth-service/lambda.zip`
- `services/product-service/lambda.zip`
- `services/menu-service/lambda.zip`
- `services/inventory-service/lambda.zip`
- `services/cart-service/lambda.zip`
- `services/order-service/lambda.zip`
- `services/payment-service/lambda.zip`
- `services/admin-service/lambda.zip`
- `services/user-service/lambda.zip`
- `services/notification-service/lambda.zip`
- `services/analytics-service/lambda.zip`

## Experimental Stack

`terraform/stacks/freshmart-platform` is retained for future work only. It is not the active deployment path and is not used by the default CI/CD workflows.

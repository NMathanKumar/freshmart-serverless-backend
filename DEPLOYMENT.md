# FreshMart Deployment Guide

## Active AWS Environment

- AWS Account: `769044546162`
- Region: `ap-southeast-1`
- Terraform root: `terraform/environments/dev`

The deployed AWS environment is the source of truth for this repository.

## Deployment Flow

1. Confirm the AWS account and region.
2. Install dependencies with `npm install`.
3. Build the repository with `npm run build`.
4. Package the live Lambda services with `npm run package`.
5. Run Terraform from `terraform/environments/dev`.

```bash
aws sts get-caller-identity
npm install
npm run build
npm run package
terraform -chdir=terraform/environments/dev init
terraform -chdir=terraform/environments/dev validate
terraform -chdir=terraform/environments/dev plan
terraform -chdir=terraform/environments/dev apply
```

## Lambda Packages

Terraform consumes ZIPs directly from the service directories:

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

The packaging script does not use `dist/*.zip` or `artifacts/*.zip`.

## Verification

```bash
npm run verify:deployment
aws lambda list-functions --region ap-southeast-1
aws dynamodb list-tables --region ap-southeast-1
aws apigatewayv2 get-apis --region ap-southeast-1
aws events list-event-buses --region ap-southeast-1
aws sns list-topics --region ap-southeast-1
aws sqs list-queues --region ap-southeast-1
aws cloudwatch describe-alarms --region ap-southeast-1
aws s3api head-bucket --bucket freshmart-dev-assets-769044546162
```

## Notes

- `terraform/stacks/freshmart-platform` is experimental and not part of the active deployment workflow.
- API clients should target the deployed stage URL and use the live route set under `/auth`, `/products`, `/menu`, `/inventory`, `/cart`, `/orders`, `/payments`, and `/admin`.
- `TF_VAR_internal_service_token` must be supplied by the deployment environment for Terraform plan and apply.

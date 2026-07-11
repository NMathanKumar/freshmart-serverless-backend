# FreshMart Serverless Backend Deployment Guide

## Project Overview

FreshMart Serverless Backend is a serverless microservices backend deployed to AWS using Terraform. The platform is organized around independent Lambda-powered services and shared infrastructure, with Terraform managing the full lifecycle of the deployment.

Technologies used in this project:

- Terraform
- AWS Lambda
- API Gateway
- DynamoDB
- SNS
- SQS
- EventBridge
- CloudWatch
- IAM
- S3
- Node.js

## AWS Environment

Current AWS Account:

`769044546162`

Current Region:

`ap-southeast-1`

Terraform dynamically derives the active account ID using `data.aws_caller_identity.current.account_id`. Hardcoding AWS account IDs in deployment code is not allowed and should never be added back into the repository.

## Repository Structure

The repository is organized into the following key folders:

- `services/` - Individual application services and their Lambda code, dependencies, and service-local deployment artifacts.
- `terraform/` - Terraform configuration, shared modules, and environment-specific definitions such as `dev`, `qa`, and `prod`.
- `scripts/` - Build and packaging utilities used to prepare Lambda deployment ZIP files.
- `src/` - Shared application source, including common utilities, configuration, and local test helpers.
- `dist/` - Convenience output directory for packaged artifacts created during the build process.

## Lambda Packaging

Lambda deployment ZIP files are generated inside each service directory.

Expected location:

`services/<service>/lambda.zip`

The project no longer uses an `artifacts/` directory for Lambda deployment packages.

Package all services:

```bash
npm run package
```

Package a single service:

```bash
npm run package:auth
npm run package:product
npm run package:inventory
npm run package:cart
npm run package:order
npm run package:payment
npm run package:notification
npm run package:analytics
npm run package:admin
npm run package:user
```

The packaging script rebuilds each service ZIP and writes the deployable bundle to the corresponding `services/<service>/lambda.zip` path.

## Terraform Deployment

Use the following workflow for deployments:

```bash
aws sts get-caller-identity
terraform init -reconfigure
terraform validate
terraform plan -out tfplan
terraform apply tfplan
```

What each command does:

- `aws sts get-caller-identity` - Confirms the AWS account and caller identity currently in use.
- `terraform init -reconfigure` - Reinitializes the working directory and refreshes backend and provider setup.
- `terraform validate` - Checks that the Terraform configuration is syntactically valid.
- `terraform plan -out tfplan` - Generates an execution plan and saves it to a file for review and repeatable application.
- `terraform apply tfplan` - Applies the reviewed plan exactly as generated.

Always rebuild Lambda packages before running Terraform so the `filename` and `source_code_hash` values match the latest code.

## Verification Checklist

After deployment, verify the infrastructure with the following commands:

```bash
terraform state list
terraform plan
aws lambda list-functions
aws dynamodb list-tables
aws s3api head-bucket
aws sns list-topics
aws sqs list-queues
aws events list-event-buses
aws apigatewayv2 get-apis
aws cloudwatch describe-alarms
```

Expected results:

- `terraform state list` should show the expected modules and resources without missing or orphaned infrastructure.
- `terraform plan` should report no changes when the deployment is in sync.
- `aws lambda list-functions` should show the FreshMart Lambda functions in the current account and region.
- `aws dynamodb list-tables` should show the FreshMart tables with the `freshmart-dev-*` naming pattern.
- `aws s3api head-bucket` should confirm the environment asset bucket exists.
- `aws sns list-topics` should list the FreshMart SNS topics.
- `aws sqs list-queues` should list the FreshMart queues and dead-letter queues.
- `aws events list-event-buses` should show the custom FreshMart EventBridge bus.
- `aws apigatewayv2 get-apis` should show the FreshMart API Gateway HTTP API.
- `aws cloudwatch describe-alarms` should show the deployed alarms and monitoring rules.

## Infrastructure Components

FreshMart resources follow the `freshmart-dev-*` naming convention in the development environment.

Deployed infrastructure includes:

- S3 - Stores environment assets and shared deployment artifacts.
- Lambda - Hosts the service-level business logic.
- IAM - Provides execution roles and policy boundaries for AWS service access.
- API Gateway - Exposes the backend API to clients.
- DynamoDB - Stores application data and service state.
- SNS - Delivers event notifications and cross-service messages.
- SQS - Buffers asynchronous workloads and dead-letter handling.
- CloudWatch - Captures logs, metrics, and alarms.
- EventBridge - Routes domain events between services and AWS targets.

## Troubleshooting

| Problem | Cause | Solution |
|---|---|---|
| Terraform plan shows hundreds of resources | The state is being refreshed against a fully managed environment, or the plan is detecting real infrastructure drift | Inspect the plan carefully, confirm the AWS account and region, and verify whether a package rebuild or state refresh is required |
| Lambda package missing | The service ZIP was not generated before Terraform ran | Run `npm run package` or the service-specific package command before `terraform plan` |
| Reserved `AWS_REGION` environment variable | Terraform attempted to set `AWS_REGION` as a custom Lambda environment variable | Remove the explicit `AWS_REGION` variable from Lambda environment configuration and rely on the AWS runtime |
| Wrong EventBridge bus | EventBridge targets were attached to the default bus instead of the custom FreshMart bus | Ensure the target configuration uses the intended bus name and reapply Terraform |
| Old AWS account references | Stale hardcoded values from a previous account remain in code or example files | Replace old account IDs with dynamic references or current-account values and rerun validation |
| Large Lambda ZIP | The bundle includes unnecessary dependencies, stale ZIP files, or oversized assets | Rebuild the package, remove nested ZIP files, and keep only the required runtime dependencies |
| Missing Terraform module | A module directory or module reference is incomplete | Restore the missing module files and verify the module source path in Terraform |
| State mismatch | Local state, remote state, or deployed infrastructure does not match the current code | Run `terraform state list`, inspect drift, and reconcile before applying changes |
| Wrong AWS profile | The AWS CLI is pointed at a different account | Run `aws sts get-caller-identity` and switch to the correct profile before deploying |
| Wrong AWS region | Commands are targeting a different region | Set `AWS_REGION` or the CLI profile region to `ap-southeast-1` |
| Bucket already exists | The S3 bucket name is globally unique and may be reserved in another account | Use the account-aware bucket naming convention driven by `data.aws_caller_identity.current.account_id` |

## Best Practices

- Never hardcode AWS account IDs.
- Never hardcode bucket names.
- Always use `data.aws_caller_identity.current.account_id` for account-aware Terraform resources.
- Always run `terraform plan` before `terraform apply`.
- Always rebuild Lambda packages before deployment.
- Commit Terraform modules and keep them in sync with the environment definitions.
- Keep example environment files updated when infrastructure values change.
- Do not use the old AWS account.

## Deployment Validation Checklist

- [ ] AWS credentials verified
- [ ] Correct AWS account
- [ ] Correct AWS region
- [ ] Lambda packages generated
- [ ] Terraform validated
- [ ] Terraform plan clean
- [ ] Terraform apply successful
- [ ] Lambda functions exist
- [ ] DynamoDB tables exist
- [ ] SQS queues exist
- [ ] SNS topics exist
- [ ] EventBridge exists
- [ ] API Gateway exists
- [ ] CloudWatch alarms exist
- [ ] S3 bucket exists

## Common Commands

```bash
aws sts get-caller-identity
npm run package
npm run package:auth
npm run package:product
npm run package:inventory
npm run package:cart
npm run package:order
npm run package:payment
npm run package:notification
npm run package:analytics
npm run package:admin
npm run package:user
terraform init -reconfigure
terraform validate
terraform state list
terraform plan -out tfplan
terraform apply tfplan
terraform plan
aws lambda list-functions
aws dynamodb list-tables
aws s3api head-bucket --bucket freshmart-dev-assets-769044546162
aws sns list-topics
aws sqs list-queues --queue-name-prefix freshmart-dev-
aws events list-event-buses
aws apigatewayv2 get-apis
aws cloudwatch describe-alarms --alarm-name-prefix freshmart-dev-
```

## Notes

The infrastructure for this project is fully managed by Terraform. Deployment is account-aware through `data.aws_caller_identity.current.account_id`, and the active deployment target is:

- AWS Account: `769044546162`
- Region: `ap-southeast-1`

There should be no remaining deployment-code references to `726101441380` or `ap-south-1`. If either value appears in deployment logic, it should be treated as a defect and corrected immediately.

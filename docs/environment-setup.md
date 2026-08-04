# Environment Setup

## Prerequisites

- Node.js 22 or newer
- npm
- Terraform 1.8 or newer
- AWS CLI authenticated to account `769044546162`

## Terraform Environment

The active Terraform root is `terraform/environments/dev`.

Required deployment environment values:

- `AWS_REGION=ap-southeast-1`
- `TF_VAR_internal_service_token`

## Runtime Environment Shape

Terraform injects the live Lambda environment variables, including:

- `COGNITO_*`
- `AWS_EVENT_BUS_NAME`
- `AWS_EVENT_SOURCE`
- `DDB_TABLE_*`
- `AWS_SNS_*`
- `AWS_SQS_*`
- `AWS_S3_BUCKET`
- `INTERNAL_SERVICE_TOKEN`
- `MENU_SERVICE_BASE_URL`

## Experimental Stack

If you are exploring `terraform/stacks/freshmart-platform`, treat it as experimental and separate from the active deployment path.

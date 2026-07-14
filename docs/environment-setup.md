# Environment Setup

## Prerequisites

- Node.js 18 or newer
- npm
- Terraform
- AWS CLI

## Local Variables

Set the following before running startup checks or service code locally:

- `AWS_REGION`
- `AWS_DEFAULT_REGION`
- `NODE_ENV`
- `STAGE`
- `ENVIRONMENT`
- `INTERNAL_SERVICE_TOKEN`

Service-specific tables and parameters are injected by Terraform and should not be hardcoded into source files.

## AWS Setup

- Confirm AWS credentials with `aws sts get-caller-identity`.
- Use the intended account and region before running Terraform.
- Ensure required SSM parameters and Secrets Manager values exist for the target environment.

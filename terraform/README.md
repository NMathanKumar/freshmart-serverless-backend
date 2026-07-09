# Terraform Foundation

This directory contains the Terraform scaffold for FreshMart.

## Layout

- `environments/dev`, `environments/qa`, `environments/prod`: environment-specific entrypoints
- `modules/lambda`: Lambda packaging and function wiring
- `modules/dynamodb`: DynamoDB tables and indexes
- `modules/apigateway`: HTTP API Gateway and routes
- `modules/iam`: service roles and policies
- `modules/cloudwatch`: log groups, alarms, dashboards
- `modules/eventbridge`: buses, rules, and targets
- `modules/cognito`: future authentication foundation
- `modules/sns`: future notifications foundation
- `modules/sqs`: future queue foundation
- `providers.tf`: shared provider configuration
- `versions.tf`: Terraform and provider version constraints
- `variables.tf`: root inputs
- `locals.tf`: shared naming and tags
- `outputs.tf`: root outputs
- `backend.tf.example`: sample remote state backend

## Notes

- No AWS resources are defined yet.
- Use the environment folders to compose modules per stage.
- Apply shared tags everywhere through `local.common_tags`.

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
- `modules/network`: VPC, subnets, routing, NAT, and endpoint foundation
- `modules/cognito`: Cognito user pool, client, domain, groups, and identity pool
- `modules/secrets`: Secrets Manager and Parameter Store foundations
- `modules/sns`: SNS topics and subscriptions
- `modules/sqs`: SQS queues, DLQs, and SNS fan-in
- `providers.tf`: shared provider configuration
- `versions.tf`: Terraform and provider version constraints
- `variables.tf`: root inputs
- `locals.tf`: shared naming and tags
- `outputs.tf`: root outputs
- `backend.tf.example`: sample remote state backend

## Notes

- Use the environment folders to compose modules per stage.
- Apply shared tags everywhere through `local.common_tags`.
- Keep all environment-specific wiring in the environment entrypoints so the reusable modules stay portable.

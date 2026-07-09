# IAM Module

Reusable IAM module for FreshMart Lambda execution roles.

## Features

- Lambda trust policy only
- Managed policy per service
- Least-privilege DynamoDB table access
- Optional EventBridge PutEvents support
- Optional EventBridge read-style permissions
- CloudWatch Logs permissions
- X-Ray permissions
- Standard tags

## Inputs

Key inputs include:

- `project_name`
- `environment`
- `aws_region`
- `service_name`
- `dynamodb_table_permissions`
- `allow_eventbridge_put_events`
- `eventbridge_bus_names`
- `allow_eventbridge_read`
- `eventbridge_rule_name_prefixes`
- `tags`

## Outputs

- `role_arn`
- `role_name`
- `policy_arn`

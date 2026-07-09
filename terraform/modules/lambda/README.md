# Lambda Module

Reusable Lambda module for FreshMart service functions.

## Features

- Node.js 22 runtime
- ZIP deployment support
- Configurable handler, timeout, memory, architecture, and role
- Environment variables as `map(string)`
- Optional dead letter queue
- Optional reserved concurrency
- Optional layers
- Optional invoke permissions
- Tracing configuration
- Standard CloudWatch log group with retention
- Tags

## Inputs

Key inputs include:

- `function_name`
- `filename`
- `source_code_hash`
- `handler`
- `role_arn`
- `environment_variables`
- `architecture`
- `timeout`
- `memory_size`
- `publish`
- `tracing_mode`
- `dead_letter_config`
- `reserved_concurrent_executions`
- `ephemeral_storage`
- `layers`
- `permissions`
- `log_retention_in_days`

## Outputs

- `function_name`
- `function_arn`
- `invoke_arn`
- `qualified_arn`
- `log_group_name`
- `role_arn`

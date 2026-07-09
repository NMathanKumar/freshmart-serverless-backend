# EventBridge Module

Reusable EventBridge module for FreshMart domain events.

## Features

- Custom `freshmart-events` bus
- Prefix-based rules for product, inventory, cart, order, and payment events
- Notification and Analytics Lambda targets
- Retry policy on targets
- Optional module-managed DLQ
- Optional archive

## Inputs

- `project_name`
- `environment`
- `aws_region`
- `bus_name`
- `rules`
- `lambda_targets`
- `retry_policy`
- `create_dlq`
- `dlq_name`
- `dlq_arn`
- `archive_enabled`
- `archive_name`
- `archive_description`
- `archive_event_pattern`
- `archive_retention_days`
- `tags`

## Outputs

- `bus_arn`
- `bus_name`
- `rule_arns`
- `dlq_arn`

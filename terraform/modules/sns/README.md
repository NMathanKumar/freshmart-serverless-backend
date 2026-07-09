# SNS Module

Reusable SNS module for FreshMart notifications and operational alerts.

## Features

- Multiple SNS topics from a single module
- Optional email subscriptions, disabled by default
- Environment-aware naming and tagging
- Outputs for topic names and ARNs

## Inputs

- `project_name`
- `environment`
- `aws_region`
- `topics`
- `tags`

## Outputs

- `topic_arns`
- `topic_names`

## Notes

- CloudWatch alarms can publish directly to the `system-alerts` topic ARN.
- Subscription endpoints remain caller-managed so they can be enabled only when needed.

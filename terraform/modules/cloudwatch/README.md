# CloudWatch Module

Reusable CloudWatch observability module for FreshMart.

## Features

- Standard dashboard for Lambda, API Gateway, and DynamoDB
- Lambda error, duration, and throttle alarms
- API Gateway 5XX and latency alarms
- DynamoDB read and write throttle alarms
- Configurable retention input for Lambda log groups

## Inputs

- `project_name`
- `environment`
- `aws_region`
- `lambda_functions`
- `api_id`
- `api_stage_name`
- `dynamodb_tables`
- `dashboard_name`
- `metric_period_seconds`
- `log_retention_in_days`
- `evaluation_periods`
- `datapoints_to_alarm`
- `lambda_error_threshold`
- `lambda_duration_threshold_ms`
- `lambda_throttle_threshold`
- `api_5xx_threshold`
- `api_latency_threshold_ms`
- `dynamodb_read_throttle_threshold`
- `dynamodb_write_throttle_threshold`
- `alarm_actions`
- `ok_actions`
- `tags`

## Outputs

- `dashboard_name`
- `alarm_arns`
- `log_group_names`

## Notes

- Lambda log groups are already created by the Lambda module in this repository.
- This module consumes the existing log group names to keep observability wiring centralized without duplicating resource ownership.

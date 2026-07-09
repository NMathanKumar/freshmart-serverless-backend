# SQS Module

Reusable SQS module for FreshMart domain and workflow queues.

## Features

- Standard or FIFO queues
- Per-queue DLQs
- Redrive policy support
- Long polling and configurable retention
- Optional SNS fan-in subscriptions
- Server-side encryption
- Tags

## Inputs

- `project_name`
- `environment`
- `aws_region`
- `queues`
- `sns_topic_arns`
- `tags`

## Outputs

- `queue_name`
- `queue_url`
- `queue_arn`
- `dlq_name`
- `dlq_arn`

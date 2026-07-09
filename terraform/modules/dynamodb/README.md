# DynamoDB Module

Reusable DynamoDB module for FreshMart tables.

## Features

- PAY_PER_REQUEST billing mode
- Server-side encryption enabled
- Point-in-time recovery support
- Configurable deletion protection
- Optional TTL
- Optional DynamoDB Streams
- Optional global secondary indexes
- Standardized tagging

## Inputs

Key inputs include:

- `project_name`
- `environment`
- `aws_region`
- `table_name`
- `partition_key`
- `sort_key`
- `ttl_enabled`
- `ttl_attribute`
- `point_in_time_recovery`
- `deletion_protection`
- `stream_enabled`
- `stream_view_type`
- `tags`
- `global_secondary_indexes`

## Outputs

- `table_name`
- `table_arn`
- `table_id`
- `stream_arn`

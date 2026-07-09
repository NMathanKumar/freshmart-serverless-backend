# API Gateway Module

Reusable HTTP API Gateway module for FreshMart.

## Features

- HTTP API
- `/v1` stage
- CORS configuration
- Lambda proxy integrations
- Per-route Lambda invoke permissions
- Optional JWT authorizer placeholder

## Inputs

- `project_name`
- `environment`
- `aws_region`
- `api_name`
- `stage_name`
- `lambdas`
- `routes`
- `cors_allow_origins`
- `cors_allow_methods`
- `cors_allow_headers`
- `cors_allow_credentials`
- `jwt_authorizer_enabled`
- `jwt_authorizer_name`
- `jwt_issuer`
- `jwt_audience`
- `jwt_identity_sources`
- `tags`

## Outputs

- `api_id`
- `api_endpoint`
- `stage_url`

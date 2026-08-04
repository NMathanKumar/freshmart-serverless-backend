# FreshMart Platform Terraform Stack

Experimental stack only.

This directory does not represent the currently deployed AWS environment in account `769044546162`.
The active deployment source of truth is `terraform/environments/dev`.

This stack provisions the production-grade FreshMart TypeScript service suite on AWS Serverless with:

- Dedicated Lambda functions per microservice
- One DynamoDB table per service
- Shared Cognito, S3, EventBridge, SNS, SQS, CloudWatch, IAM, and API Gateway resources
- Event-driven projections for analytics and admin dashboards

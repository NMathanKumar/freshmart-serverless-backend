# FreshMart Architecture Overview

FreshMart is a serverless backend composed of Lambda-based services behind a single HTTP API in `ap-southeast-1`.

## Active Infrastructure Definition

- Terraform root: `terraform/environments/dev`
- AWS account: `769044546162`
- Region: `ap-southeast-1`

## Service Boundaries

- Authentication Service: registration, login, refresh, logout, and current user identity.
- User Service: user profile persistence.
- Product Service: product catalog CRUD.
- Menu Service: menu browsing, search, and availability management.
- Inventory Service: stock tracking and updates.
- Cart Service: cart reads and writes.
- Order Service: order creation, lookup, and cancellation.
- Payment Service: payment creation and lookup.
- Notification Service: event-driven notification workflows.
- Analytics Service: event-driven reporting workflows.
- Admin Service: admin configuration, audit, health, and dashboard endpoints.

## Shared AWS Components

- Cognito for authentication and JWT validation
- DynamoDB for service data
- EventBridge for domain events
- SNS and SQS for asynchronous workflows
- S3 for shared asset storage
- CloudWatch for logs, dashboard, and alarms

## Experimental Platform Stack

`terraform/stacks/freshmart-platform` remains in the repository for future work. It is not the active architecture and should not be used for default deployment or validation.

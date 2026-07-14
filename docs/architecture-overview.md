# Architecture Overview

FreshMart is organized as independent AWS Lambda microservices with a shared runtime package for common configuration, logging, request handling, and AWS client setup.

## Service Boundaries

- `auth-service` handles authentication workflows and application user profile synchronization.
- `user-service` manages customer profile data.
- `product-service` and `menu-service` manage catalog data.
- `inventory-service` manages stock state.
- `cart-service` manages shopping carts.
- `order-service` manages order lifecycle state.
- `payment-service` manages payment processing state.
- `notification-service` handles user-facing notifications.
- `analytics-service` aggregates operational and business events.
- `admin-service` handles administrative workflows and read models.

## Shared Platform Layers

- `packages/shared` provides common AWS clients, runtime helpers, middleware, logging, and validation primitives.
- `terraform/` contains the deployed AWS infrastructure for `dev`, `qa`, and `prod`.
- `scripts/` contains packaging and deployment verification helpers.

## Runtime Model

- API Gateway invokes Lambda handlers.
- Lambda handlers use the shared runtime wrapper to standardize health checks, request logging, error handling, and structured responses.
- Services publish domain events to EventBridge and consume events through service-specific handlers.

## Data Model

- Each service owns its DynamoDB table.
- Cross-service state is synchronized through events instead of direct table access.
- Infrastructure-managed secrets and parameters are externalized through AWS Secrets Manager and Systems Manager Parameter Store.

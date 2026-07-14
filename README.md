# FreshMart - Grocery & Daily Essentials Platform

Production-ready backend for a grocery and daily essentials e-commerce platform built as independent AWS-ready microservices.

## Documentation

- [Architecture Overview](docs/architecture-overview.md)
- [Deployment Order](docs/deployment-order.md)
- [Environment Setup](docs/environment-setup.md)
- [Production Checklist](docs/production-checklist.md)
- [Rollback Checklist](docs/rollback-checklist.md)
- [Deployment Guide](DEPLOYMENT.md)

The repository now keeps release documentation under `docs/` so deployment, rollback, and environment setup guidance stays aligned with the production architecture.

## Getting Started

Before deploying the infrastructure, please read [DEPLOYMENT.md](DEPLOYMENT.md).

## Business Domain

FreshMart is a Grocery & Daily Essentials E-Commerce Platform covering:

- Fruits & Vegetables
- Rice & Grocery
- Snacks & Beverages
- Dairy Products
- Household Items
- Personal Care

## Current Architecture

- `services/auth-service`
- `services/user-service`
- `services/product-service`
- `services/cart-service`
- `services/order-service`
- `services/payment-service`
- `services/inventory-service`
- `services/notification-service`
- `services/analytics-service`
- `services/admin-service`

Shared runtime and infrastructure helpers live in:

- `packages/shared`
- `services/_shared`
- `src/integrations`
- `src/events`
- `src/lambda`
- `terraform/modules/network`
- `terraform/modules/cognito`
- `terraform/modules/secrets`

## Service Layout

Each service follows the same internal structure:

- application bootstrap
- Lambda entrypoint
- controllers
- services
- repositories
- validators
- routes
- events where needed

## Cross-Service Flow

- Business services publish domain events through the shared event publisher layer.
- EventBridge is the primary event transport.
- Lambda consumers process EventBridge events for workflows, notifications, analytics, and admin read models.
- S3, SNS, and SQS are accessed through service abstractions and AWS SDK v3 integrations.

## Data Ownership

- Each business service owns its own DynamoDB table.
- Services do not read or write another service's table directly.
- Shared read models are updated by events, not by cross-service database access.

## Authentication

- Authentication is handled by Cognito-backed JWT flows with the auth service managing application-specific user profile and role data.
- Cognito owns password storage, token issuance, MFA, refresh tokens, and JWT signing.
- The auth service owns onboarding, profile synchronization, RBAC mapping, audit events, and application validation.

## Local Development

- Each service can be loaded independently.
- The event simulator can replay sample EventBridge events locally.
- API contracts remain stable across the migration.

## API Versioning

All routes are versioned under `/v1`:

- `/v1/products`
- `/v1/cart`
- `/v1/orders`
- `/v1/payments`
- `/v1/inventory`
- `/v1/auth`
- `/v1/notifications`
- `/v1/analytics`
- `/v1/admin`

## Repository Goal

This repository serves as the production microservices foundation for FreshMart AWS deployment and release operations.

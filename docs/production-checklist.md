# Production Checklist

## Service Readiness

- Auth: READY
- User: READY
- Menu: READY
- Product: READY
- Inventory: READY
- Cart: READY
- Order: READY
- Payment: READY
- Notification: READY
- Analytics: READY
- Admin: READY

## Deployment Checks

- All Lambda packages build successfully.
- Terraform validates cleanly for `dev`, `qa`, and `prod`.
- Lambda startup works with production-shaped environment variables.
- API Gateway routes and authorizers are wired.
- CloudWatch logging and alarms are in place.
- EventBridge, SNS, SQS, and DynamoDB references resolve without missing inputs.
- Required secrets and parameters are externalized.

## Operational Checks

- Health endpoints respond consistently.
- Structured logging is enabled.
- Tracing and metrics are configured where supported.
- Dead-letter queues exist for asynchronous failure handling.

# Payment Service

Payment API for FreshMart.

## Structure

- `src/controllers`
- `src/services`
- `src/repositories`
- `src/validators`
- `src/routes`
- `src/events`
- `src/app.js`
- `src/lambda.js`

## Environment

- `NODE_ENV`
- `SERVICE_NAME`
- `API_VERSION`
- `AWS_REGION`
- `LOG_LEVEL`
- `AWS_EVENT_BUS_NAME`
- `AWS_EVENT_SOURCE`
- `DDB_TABLE_PAYMENTS`

## Notes

- Responses use the shared success/error helpers.
- Logging uses the shared Winston logger.

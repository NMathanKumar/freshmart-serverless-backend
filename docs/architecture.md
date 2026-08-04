# Architecture

## Frontend
- React SPAs (Customer & Admin) hosted on S3 and distributed via CloudFront.

## Backend
- AWS API Gateway routing to 11 Lambda Microservices.
- Amazon Cognito for Identity.
- Amazon DynamoDB for persistence.
- EventBridge & SNS/SQS for async events.
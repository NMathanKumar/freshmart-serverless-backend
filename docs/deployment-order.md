# Deployment Order

Use this order for the active FreshMart deployment:

1. Confirm AWS account `769044546162` and region `ap-southeast-1`.
2. Install dependencies with `npm install`.
3. Build the repository with `npm run build`.
4. Package the live Lambda services with `npm run package`.
5. Run `terraform init` in `terraform/environments/dev`.
6. Run `terraform validate` in `terraform/environments/dev`.
7. Review `terraform plan` in `terraform/environments/dev`.
8. Apply the reviewed plan in `terraform/environments/dev`.
9. Verify Lambda, API Gateway, Cognito, DynamoDB, SNS, SQS, EventBridge, CloudWatch, IAM, and S3 in `ap-southeast-1`.

## Release Rule

Do not deploy from `terraform/stacks/freshmart-platform` as part of the default FreshMart workflow.

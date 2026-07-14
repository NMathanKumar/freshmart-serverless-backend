# Deployment Order

Use this order when deploying or rebuilding the platform:

1. Validate the working tree and confirm the correct AWS account and region.
2. Install dependencies with `npm install`.
3. Package all Lambdas with `node scripts/package.js all`.
4. Run `terraform validate` in each environment directory.
5. Review `terraform plan` for `dev`, then `qa`, then `prod`.
6. Apply infrastructure changes in the intended environment order.
7. Verify Lambda startup and service health endpoints.
8. Confirm API Gateway routes, Cognito settings, IAM permissions, and event targets.

## Deployment Inputs

- AWS credentials with access to the target account
- Terraform backend configuration
- Environment-specific variables for `dev`, `qa`, and `prod`
- Required Secrets Manager and Parameter Store entries

## Release Rule

Never apply a plan that has not been reviewed after packaging has been regenerated from the current source tree.

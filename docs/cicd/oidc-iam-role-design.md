# FreshMart AWS OIDC IAM Role Scoping & Permission Matrix

## Executive Summary

To eliminate long-lived AWS static credentials (`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`), the FreshMart CI/CD platform authenticates with AWS exclusively via OpenID Connect (OIDC) federated identity. Each GitHub Environment is bound to a dedicated AWS IAM role with strict subject claim (`sub`) scoping and least-privilege policies.

---

## 1. Environment OIDC Role Mapping

| Environment | AWS IAM Role Name | Subject Claim (`sub`) Filter | Max Session Duration | Allowed Branch |
| :--- | :--- | :--- | :--- | :--- |
| **Development** | `freshmart-github-ci-dev-role` | `repo:NMathanKumar/freshmart-serverless-backend:environment:dev` | 3600s (1 hour) | `develop` |
| **QA** | `freshmart-github-ci-qa-role` | `repo:NMathanKumar/freshmart-serverless-backend:environment:qa` | 3600s (1 hour) | `develop` |
| **Staging** | `freshmart-github-ci-staging-role` | `repo:NMathanKumar/freshmart-serverless-backend:environment:staging` | 3600s (1 hour) | `staging` |
| **Production** | `freshmart-github-ci-prod-role` | `repo:NMathanKumar/freshmart-serverless-backend:environment:production` | 3600s (1 hour) | `main` |

---

## 2. IAM Trust Policy Specification

The following trust policy structure is deployed for each IAM role (example for `freshmart-github-ci-prod-role`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::769044546162:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:NMathanKumar/freshmart-serverless-backend:environment:production"
        }
      }
    }
  ]
}
```

---

## 3. Least-Privilege Permission Matrix

Each OIDC role is granted strictly bounded permissions isolated to resources tagged or prefixed with the environment identifier:

| AWS Service / Boundary | Permitted Actions | Resource ARN Constraint | Environment Scope |
| :--- | :--- | :--- | :--- |
| **Terraform State Storage (S3)** | `s3:GetObject`, `s3:PutObject`, `s3:ListBucket` | `arn:aws:s3:::freshmart-tf-state-769044546162/environments/*` | Shared Terraform state bucket |
| **Terraform Lock Table (DynamoDB)** | `dynamodb:GetItem`, `dynamodb:PutItem`, `dynamodb:DeleteItem` | `arn:aws:dynamodb:ap-southeast-1:769044546162:table/freshmart-tf-locks` | Shared state lock table |
| **AWS Lambda Microservices** | `lambda:UpdateFunctionCode`, `lambda:PublishVersion`, `lambda:UpdateAlias`, `lambda:GetFunction` | `arn:aws:lambda:ap-southeast-1:769044546162:function:freshmart-<env>-*` | Environment namespace |
| **Frontend Static Hosting (S3)** | `s3:GetObject`, `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket` | `arn:aws:s3:::freshmart-<env>-web-*/*` | Environment Web buckets |
| **CloudFront Invalidation** | `cloudfront:CreateInvalidation`, `cloudfront:GetDistribution` | `arn:aws:cloudfront::769044546162:distribution/*` | Bound to distribution IDs |
| **SSM Parameter Store** | `ssm:GetParameter`, `ssm:GetParameters`, `ssm:PutParameter` | `arn:aws:ssm:ap-southeast-1:769044546162:parameter/freshmart/<env>/*` | Environment parameters |
| **CloudWatch Monitoring** | `cloudwatch:PutMetricData`, `cloudwatch:DescribeAlarms` | `arn:aws:cloudwatch:ap-southeast-1:769044546162:alarm:freshmart-<env>-*` | Environment metrics/alarms |

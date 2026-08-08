# FreshMart IAM Permission Boundaries & Role Matrix

## Executive Summary

FreshMart enforces strict permission boundaries across workflow execution steps. Rather than using wildcard administrator access (`*:*`), roles are scoped to explicit service boundaries.

---

## 1. Permission Set Taxonomy

| Permission Set | AWS Action Scope | Target Resources | Consuming Job / Step |
| :--- | :--- | :--- | :--- |
| **CI Read** | `s3:GetObject`, `kms:Decrypt`, `ecr:GetAuthorizationToken` | Artifact buckets, public registries | PR Validation, Code Analysis |
| **Deploy Web** | `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`, `cloudfront:CreateInvalidation` | Web static S3 buckets (`freshmart-*-assets-*`), CloudFront distributions | Frontend Deployment (`deploy-web.js`) |
| **Deploy Backend** | `lambda:UpdateFunctionCode`, `lambda:PublishVersion`, `lambda:UpdateAlias`, `apigateway:GET` | Microservice Lambdas (`arn:aws:lambda:...:function:freshmart-*`) | Backend Service Deployment |
| **Terraform IaC** | `s3:GetObject`, `s3:PutObject`, `dynamodb:GetItem`, `dynamodb:PutItem`, `dynamodb:DeleteItem` | State bucket (`freshmart-tf-state-*`), lock table (`freshmart-tf-locks`) | Infrastructure Automation (`terraform apply`) |
| **Observability** | `cloudwatch:DescribeAlarms`, `cloudwatch:GetMetricData`, `synthetics:DescribeCanaries` | CloudWatch alarms, Synthetics Canaries | Synthetic & Health Check Validation |
| **Release** | GitHub API permissions (`contents: write`) | GitHub Repository Releases & Tagging | Tag-based GitHub Release Automation |

---

## 2. Cross-Environment Access Restriction Matrix

```
                      DEV ROLE      QA ROLE     STAGING ROLE    PROD ROLE
                      ────────     ────────     ────────────    ─────────
Dev S3 Buckets           ALLOW       DENY           DENY           DENY
Prod S3 Buckets          DENY        DENY           DENY           ALLOW
Prod Lambda Functions    DENY        DENY           DENY           ALLOW
Dev State Backend        ALLOW       DENY           DENY           DENY
Prod State Backend       DENY        DENY           DENY           ALLOW
```

# FreshMart Secrets & Variables Matrix Specification

## Executive Overview

This matrix specifies the classification, scoping, and storage mechanism for every secret and configuration variable used across the FreshMart CI/CD platform.

> [!IMPORTANT]
> **Zero Plaintext Secrets**: No raw credentials, access keys, private tokens, or database connection strings are stored in documentation or workflow code. All sensitive values are stored in GitHub Secrets or AWS SSM Parameter Store and resolved dynamically at runtime.

---

## 1. Complete Inventory Matrix

| Identifier | Type Classification | Location / Scope | Description | Sensitive? |
| :--- | :--- | :--- | :--- | :--- |
| `AWS_REGION` | **Repository Variable** | GitHub Repository Variables | Primary AWS region (`ap-southeast-1`). | No |
| `AWS_OIDC_ROLE_ARN` | **Environment Secret** | GitHub Environment Secrets (`dev`, `qa`, `staging`, `production`) | AWS IAM Role ARN for keyless OIDC authentication per environment. | Yes |
| `TF_BACKEND_BUCKET` | **Repository Variable** | GitHub Repository Variables | S3 bucket name for Terraform remote state storing (`freshmart-tf-state-769044546162`). | No |
| `TF_BACKEND_DYNAMODB_TABLE` | **Repository Variable** | GitHub Repository Variables | DynamoDB lock table for Terraform state locking (`freshmart-tf-locks`). | No |
| `TF_VAR_internal_service_token` | **Environment Secret** | GitHub Environment Secrets | High-entropy HMAC/JWT key for inter-service Lambda authentication. | Yes |
| `COGNITO_USER_POOL_ID` | **Environment Variable** | GitHub Environment Variables | Amazon Cognito User Pool ID per environment. | No |
| `COGNITO_CLIENT_ID` | **Environment Variable** | GitHub Environment Variables | Amazon Cognito App Client ID for authentication. | No |
| `COGNITO_CLIENT_SECRET` | **Environment Secret** | GitHub Environment Secrets / AWS Secrets Manager | Cognito App Client Secret key. | Yes |
| `CUSTOMER_WEB_API_URL` | **Environment Variable** | GitHub Environment Variables | Public API Gateway endpoint for Customer Web (`https://dev-api.freshmart.app`). | No |
| `ADMIN_WEB_API_URL` | **Environment Variable** | GitHub Environment Variables | Public API Gateway endpoint for Admin Web (`https://dev-admin-api.freshmart.app`). | No |
| `CLOUDFRONT_CUSTOMER_DIST_ID` | **Environment Variable** | GitHub Environment Variables | CloudFront distribution ID for Customer Web CDN invalidations. | No |
| `CLOUDFRONT_ADMIN_DIST_ID` | **Environment Variable** | GitHub Environment Variables | CloudFront distribution ID for Admin Web CDN invalidations. | No |
| `S3_CUSTOMER_WEB_BUCKET` | **Environment Variable** | GitHub Environment Variables | Target S3 bucket for Customer Web static hosting. | No |
| `S3_ADMIN_WEB_BUCKET` | **Environment Variable** | GitHub Environment Variables | Target S3 bucket for Admin Web static hosting. | No |
| `MONITORING_SLACK_WEBHOOK` | **Repository Secret** | GitHub Repository Secrets | Webhook URL for deployment status notifications. | Yes |
| `DATADOG_API_KEY` / `CW_ALARM_ARN` | **Environment Secret** | GitHub Environment Secrets | Monitoring alert ingested ARN or metric key. | Yes |
| `FEATURE_FLAG_PAYMENTS_V2` | **Environment Variable** | GitHub Environment Variables | Feature toggle flag (`true`/`false`) passed to build environment. | No |
| `FEATURE_FLAG_ANALYTICS` | **Environment Variable** | GitHub Environment Variables | Feature toggle flag (`true`/`false`) passed to build environment. | No |

---

## 2. Inheritance Rules & Scope Hierarchy

```
+-------------------------------------------------------------------------+
|                        GitHub Repository Level                          |
|  Secrets: MONITORING_SLACK_WEBHOOK                                      |
|  Variables: AWS_REGION, TF_BACKEND_BUCKET, TF_BACKEND_DYNAMODB_TABLE    |
+------------------------------------+------------------------------------+
                                     |
                                     v (Inherited & Overridden by)
+------------------------------------+------------------------------------+
|                       GitHub Environment Level                          |
|  Secrets: AWS_OIDC_ROLE_ARN, TF_VAR_internal_service_token, ...         |
|  Variables: COGNITO_USER_POOL_ID, CUSTOMER_WEB_API_URL, S3_BUCKET, ...  |
+-------------------------------------------------------------------------+
```

1. **Repository Variables/Secrets**: Apply across all pipeline runs unless explicitly overridden by an environment.
2. **Environment Variables/Secrets**: Take precedence when a job declares `environment: <env_name>`. Secret values from other environments are completely inaccessible to jobs targeting a different environment.
3. **Runtime Ingestion**: Secrets needed by backend microservices are fetched at execution time from AWS SSM Parameter Store (`/freshmart/<env>/*`) using short-lived OIDC STS credentials.

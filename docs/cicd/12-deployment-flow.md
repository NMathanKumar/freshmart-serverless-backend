# 12 - End-to-End Deployment Lifecycle Flow

## Overview

This document details the step-by-step execution sequence of a complete deployment lifecycle—from developer commit to live production monitoring.

---

## 1. End-to-End Execution Sequence

```
1. Developer Pushes Code / Opens PR to `develop`
   └─► Workflow: `ci-pull-request.yml`
        ├─ Lint & Format Validation
        ├─ TypeScript Typecheck
        ├─ Unit, Integration & Contract Tests
        ├─ CodeQL & Dependency Security Scans
        └─ Terraform Format, Validate & Plan

2. PR Approved & Merged to `develop`
   └─► Workflow: `cd-development.yml` (Target Env: `dev`)
        ├─ OIDC Assume Role (`freshmart-github-ci-dev-role`)
        ├─ Package 25+ Lambda Services (`services/*/lambda.zip`)
        ├─ Build Frontend Distributables (`apps/*/dist`)
        ├─ Run `terraform apply` on `terraform/environments/dev`
        ├─ Deploy Web Assets (`node scripts/deploy-web.js`)
        ├─ Invalidate CloudFront Caches
        ├─ Execute Smoke Verification (`node scripts/verify-web.js`)
        └─ Execute Live Synthetic Checks (`npm run test:smoke:deployment`)

3. Integration Validated & Promoted to `staging`
   └─► Workflow: `cd-staging.yml` (Target Env: `staging`)
        ├─ Requires Manual Gate Approval (1 Reviewer)
        ├─ OIDC Assume Role (`freshmart-github-ci-staging-role`)
        ├─ Run `terraform apply` on `terraform/environments/staging`
        ├─ Deploy Web Assets to Staging Bucket
        └─ Run Artillery Load Tests & Playwright E2E Suites

4. Staging Signed Off & Promoted to `main`
   └─► Workflow: `cd-production.yml` (Target Env: `production`)
        ├─ Requires 2 Senior Approvals (Wait Timer: 10 mins)
        ├─ OIDC Assume Role (`freshmart-github-ci-prod-role`)
        ├─ Run Destroy Guard & Infrastructure Safety Locks
        ├─ Run `terraform apply` on `terraform/environments/prod`
        ├─ Zero-downtime Web Sync & Cache Invalidation
        ├─ Post-Deploy CloudWatch Canary Verification
        └─ If Failure: Trigger Automatic Rollback (`rollback-web.js`)
```

---

## 2. Infrastructure vs Code Deployment Dependencies

1. **Phase 1: Infrastructure First**: Database tables, SQS queues, SNS topics, IAM roles, and CloudWatch metrics must be created or updated via Terraform prior to routing code traffic.
2. **Phase 2: Backend Lambdas**: Lambda function code zips are updated in tandem with Terraform apply (`filename = "../../../services/auth-service/lambda.zip"`).
3. **Phase 3: Frontend Deployment**: Web origins are uploaded to S3 after backend APIs are verified healthy.
4. **Phase 4: Smoke & Canary**: Synthetic traffic validates API Gateway -> Lambda -> DynamoDB path before declaring pipeline success.

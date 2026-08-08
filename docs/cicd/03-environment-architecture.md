# 03 - FreshMart Environment Architecture & Evolution Specification

## Executive Overview

FreshMart defines four distinct deployment environments: **Development (`dev`)**, **Quality Assurance (`qa`)**, **Staging (`staging`)**, and **Production (`production`)**. This document specifies the environment inventory, boundary controls, GitHub Environment configurations, secret/variable inheritance models, and evolution path from current single-account deployment to an enterprise multi-account AWS Organization landing zone.

---

## 1. Environment Inventory Matrix

| Environment | Purpose | AWS Account | Terraform Path / Workspace | Approval Policy | Auto Deploy | Deployment Concurrency |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Development** | Developer feature testing & continuous integration | Single Account (`769044546162`) | `terraform/environments/dev` (`dev`) | None (Automated) | Yes (on `develop` push) | `development` (Cancel in-flight) |
| **QA** | Automated integration, E2E & contract testing | Single Account (`769044546162`) | `terraform/environments/qa` (`qa`) | Optional QA Sign-off | Yes (on `develop` pass) | `qa` (Queue sequentially) |
| **Staging** | UAT, performance testing & release validation | Single Account (`769044546162`) | `terraform/environments/staging` (Target)* | 1 Approver required | Manual Trigger (`staging` branch) | `staging` (Queue sequentially) |
| **Production** | Live customer-facing production environment | Single Account (`769044546162`) | `terraform/environments/prod` (`prod`) | 2 Approvers required | Manual Trigger (`main` tag) | `production` (Queue sequentially) |

> [!NOTE]
> `*` `terraform/environments/staging` does not currently exist in the repository. Its mapping strategy is detailed in `docs/cicd/terraform-environment-mapping.md`.

---

## 2. Single-Account Isolation & Multi-Account Evolution Path

### Current Baseline Architecture (Single-Account Namespace Isolation)
Currently, all FreshMart environments reside within a single AWS Account (`769044546162`). Strict logical boundary separation is achieved via:
- **IAM Scoping**: OIDC roles locked to specific GitHub Environment claims (`repo:org/repo:environment:<env>`).
- **Resource Namespaces**: Prefixing all AWS resources (`freshmart-dev-*`, `freshmart-qa-*`, `freshmart-staging-*`, `freshmart-prod-*`).
- **Data Isolation**: Dedicated S3 buckets, DynamoDB tables, and Parameter Store paths (`/freshmart/dev/*`, `/freshmart/prod/*`).

### Enterprise Evolution Path (AWS Organizations Landing Zone)
To align with enterprise AWS Landing Zone standards, FreshMart can evolve seamlessly to multi-account isolation without workflow redesign:

```
                                  +-------------------------------+
                                  |    AWS Organizations Root     |
                                  +---------------+---------------+
                                                  |
                +---------------------------------+---------------------------------+
                |                                                                   |
                v                                                                   v
        +-------+-------+                                                   +-------+-------+
        | Security OU   |                                                   | Workloads OU  |
        +-------+-------+                                                   +-------+-------+
                |                                                                   |
     +----------+----------+                             +--------------------------+--------------------------+
     |                     |                             |                          |                          |
     v                     v                             v                          v                          v
+----+----+           +----+----+                   +----+----+                +----+----+                +----+----+
| Security|           | CI/CD   |                   | Dev     |                | QA/Staging|               | Prod    |
| Account |           | Account |                   | Account |                | Account |                | Account |
+---------+           +---------+                   +---------+                +---------+                +---------+
```

When separate AWS accounts are provisioned, only the `AWS_OIDC_ROLE_ARN` in each GitHub Environment needs updating; workflow logic remains unchanged.

---

## 3. GitHub Environment Specifications

Each GitHub Environment defines boundary parameters controlling code flow and credential exposure:

### Environment: `dev`
- **Purpose**: Continuous integration & developer testing.
- **Required Reviewers**: None (Automatic deployment upon merge).
- **Wait Timer**: 0 minutes.
- **Deployment Concurrency Group**: `development`.
- **Environment URL**: `https://dev-api.freshmart.internal` / `https://dev.freshmart.app`
- **Protected Branches**: `develop`
- **Secret Inheritance**: Environment Secrets override Repository defaults.
- **Variable Inheritance**: Environment Variables override Repository defaults.

### Environment: `qa`
- **Purpose**: Automated E2E & integration verification.
- **Required Reviewers**: Optional (QA Lead sign-off for release candidates).
- **Wait Timer**: 0 minutes.
- **Deployment Concurrency Group**: `qa`.
- **Environment URL**: `https://qa-api.freshmart.internal` / `https://qa.freshmart.app`
- **Protected Branches**: `develop`
- **Secret Inheritance**: Strict environment-level secret scoping.
- **Variable Inheritance**: QA-specific API & database targets.

### Environment: `staging`
- **Purpose**: User Acceptance Testing (UAT) & pre-release validation.
- **Required Reviewers**: 1 Required Reviewer (Tech Lead or QA Lead).
- **Wait Timer**: 5 minutes (enforces pre-deployment check window).
- **Deployment Concurrency Group**: `staging`.
- **Environment URL**: `https://staging-api.freshmart.app` / `https://staging.freshmart.app`
- **Protected Branches**: `staging`
- **Secret Inheritance**: Enforced environment-isolated secrets.
- **Variable Inheritance**: Staging environment variables.

### Environment: `production`
- **Purpose**: Production customer workloads.
- **Required Reviewers**: 2 Required Reviewers (Principal DevOps + Lead Architect / Product Owner).
- **Wait Timer**: 10 minutes (allows maintenance window validation).
- **Deployment Concurrency Group**: `production`.
- **Environment URL**: `https://api.freshmart.app` / `https://freshmart.app`
- **Protected Branches**: `main` (Release tags `v*.*.*`)
- **Secret Inheritance**: Highly restricted access; environment-scoped OIDC role.
- **Variable Inheritance**: Production endpoint configuration.

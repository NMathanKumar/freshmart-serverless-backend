# 03 - FreshMart GitHub Environments Design

## Overview

GitHub Environments allow strict isolation of secrets, variables, approval policies, and execution locks across deployment targets. FreshMart defines four formal environments matching AWS infrastructure targets.

---

## 1. Environment Topology

```
+---------------------------------------------------------------------------------+
|                              GitHub Repository                                  |
|                                                                                 |
|  +------------------+  +------------------+  +----------------+  +-------------+  |
|  |   dev          |  |   qa             |  |  staging       |  | production  |  |
|  |                  |  |                  |  |                |  |             |  |
|  | Auto-deploy      |  | Automated E2E    |  | Manual Gate    |  | 2-Person    |  |
|  | Branch: develop  |  | Branch: develop  |  | Branch: staging|  | Approval    |  |
|  +--------+---------+  +--------+---------+  +-------+--------+  +------+------+  |
+-----------|---------------------|--------------------|------------------|-------+
            |                     |                    |                  |
            v                     v                    v                  v
+------------------+     +------------------+  +---------------+  +---------------+
| AWS Dev Account  |     | AWS QA Account   |  | AWS Staging   |  | AWS Prod      |
| Region: ap-se-1  |     | Region: ap-se-1  |  | Region: ap-se1|  | Account       |
+------------------+     +------------------+  +---------------+  +---------------+
```

---

## 2. GitHub Environment Configuration Specifications

### Environment: `dev`
- **Deployment Branch Constraint**: `develop` branch only.
- **Required Reviewers**: None (Automated post-merge deployment).
- **Wait Timer**: 0 minutes.
- **Concurrency Limit**: 1 concurrent deployment (cancel in-progress runs).

### Environment: `qa`
- **Deployment Branch Constraint**: `develop` branch only.
- **Required Reviewers**: QA Lead / Automation Engineer (optional gate for test suites).
- **Wait Timer**: 0 minutes.
- **Concurrency Limit**: 1 concurrent deployment.

### Environment: `staging`
- **Deployment Branch Constraint**: `staging` branch only.
- **Required Reviewers**: 1 Reviewer (Platform Engineer or Tech Lead).
- **Wait Timer**: 5 minutes (allows pre-deployment state sync check).
- **Concurrency Limit**: 1 concurrent deployment.

### Environment: `production`
- **Deployment Branch Constraint**: `main` branch only.
- **Required Reviewers**: 2 Reviewers (Principal DevOps Engineer + Solutions Architect / Engineering Lead).
- **Wait Timer**: 10 minutes.
- **Concurrency Limit**: 1 concurrent deployment.
- **Protected Environment Secrets**: Enforced secret inheritance and restricted environment-level variable modification.

---

## 3. Concurrency Control

To prevent race conditions during continuous integration and deployment, job-level concurrency locks are applied:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

For deployment workflows targeting stateful infrastructure (`terraform apply`), `cancel-in-progress` is set to `false` to avoid corrupting Terraform state locks.

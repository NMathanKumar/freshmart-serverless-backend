# 01 - FreshMart CI/CD System Architecture

## Executive Overview

This document defines the high-level architecture of the FreshMart Enterprise CI/CD Platform. Built upon AWS Serverless, GitHub Actions, and Terraform, this platform enforces automated quality gates, zero-downtime deployment strategies, strict least-privilege OIDC authentication, and multi-tier environment isolation.

---

## 1. Monorepo Topology & Dependency Graph

FreshMart is structured as an enterprise monorepo using standard `npm` workspaces. Changes to foundational packages automatically trigger downstream service builds and tests.

```
                           +----------------------------+
                           |   packages/platform-core   |
                           +--------------+-------------+
                                          |
                                          v
+------------------------+   +------------+------------+   +-----------------------+
|  packages/design-system|   |     packages/shared     |   |   packages/api-sdk    |
+-----------+------------+   +------------+------------+   +-----------+-----------+
            |                             |                            |
            +---------------+             |            +---------------+
                            |             |            |
                            v             v            v
                     +------+-------------+------------+------+
                     |    apps/customer-web & admin-web       |
                     +----------------------------------------+

                     +----------------------------------------+
                     |  services/* (25+ AWS Lambda services)  |
                     +----------------------------------------+
```

### Dependency Propagation Rules
1. **`packages/platform-core` / `packages/shared`**: Rebuild and re-test **all** microservices and frontend applications.
2. **`packages/design-system`**: Trigger typecheck, lint, and build for `apps/customer-web` and `apps/admin-web`.
3. **`packages/api-sdk`**: Trigger API contract tests and frontend builds.
4. **`services/<service-name>`**: Target only the affected microservice for packaging, unit/integration testing, and deployment.
5. **`terraform/`**: Trigger Terraform lint, validate, security scanning, and plan generation for the specific target environment (`dev`, `qa`, `staging`, `prod`).

---

## 2. Microservice Change Detection Mechanism

To optimize workflow runtimes and lower GitHub Actions billable minutes, the CI/CD pipeline employs path filtering (`dorny/paths-filter` or native `git diff` matrix generation):

```yaml
# Conceptual Change Matrix Detection
frontend_changed:
  - 'apps/customer-web/**'
  - 'apps/admin-web/**'
  - 'packages/design-system/**'

services_changed:
  - 'services/**'
  - 'packages/shared/**'

terraform_changed:
  - 'terraform/**'
```

If only `services/cart-service/**` is modified:
- Only `cart-service` unit tests & packaging tasks are executed.
- Terraform plans are constrained to infrastructure affected by `cart-service`.
- Frontend build steps are safely skipped.

---

## 3. Modular Workflow Hierarchy

The CI/CD platform is decomposed into discrete, reusable workflow files under `.github/workflows/`:

```
                       +-------------------------+
                       |    ci-orchestrator.yml   |
                       +------------+------------+
                                    |
          +-------------------------+-------------------------+
          |                         |                         |
          v                         v                         v
+---------+---------+     +---------+---------+     +---------+---------+
| reusable-lint.yml |     | reusable-test.yml |     | reusable-sec.yml|
+-------------------+     +-------------------+     +-------------------+
          |                         |                         |
          +-------------------------+-------------------------+
                                    |
                                    v
                       +------------+------------+
                       | reusable-build-pack.yml |
                       +------------+------------+
                                    |
                                    v
                       +------------+------------+
                       | reusable-tf-plan.yml    |
                       +------------+------------+
                                    |
                                    v
                       +------------+------------+
                       |   deploy-orchestrator   |
                       +------------+------------+
                                    |
          +-------------------------+-------------------------+
          |                         |                         |
          v                         v                         v
+---------+---------+     +---------+---------+     +---------+---------+
| deploy-dev.yml    |     | deploy-staging.yml|     | deploy-prod.yml   |
+-------------------+     +-------------------+     +-------------------+
```

---

## 4. Architectural Principles

1. **Zero Direct Production Pushes**: All production code changes must originate from pull requests passing strict quality gates.
2. **Immutable Build Artifacts**: Build once in CI, register digests, and deploy the identical tested artifact across environments.
3. **No Key Persistence**: Rely exclusively on AWS OpenID Connect (OIDC) federated roles.
4. **Failure Isolation**: Circuit breakers, automated health verification, and zero-downtime rollback hooks ensure production resilience.

# FreshMart Serverless Backend

FreshMart is a production-grade serverless e-commerce platform deployed on AWS (Account `769044546162`, Region `ap-southeast-1`). It is built entirely with Infrastructure as Code using Terraform and implements a comprehensive enterprise observability, reliability, security, and financial governance platform.

---

## Platform Overview

| Area | Components |
|---|---|
| **Compute** | 11 AWS Lambda functions (Auth, User, Product, Menu, Inventory, Cart, Order, Payment, Notification, Analytics, Admin) |
| **API** | API Gateway HTTP API (v1 stage) with Cognito JWT authorizer |
| **Database** | 11 DynamoDB tables (one per service) |
| **Messaging** | SQS queues + DLQs, EventBridge event bus, SNS topics |
| **CDN** | CloudFront distributions (Customer Web, Admin Web frontends) |
| **Auth** | Cognito User Pool + Identity Pool |

---

## Enterprise Observability Stack

### 11-Dashboard Portfolio

| Dashboard | Audience |
|---|---|
| `FreshMart-prod-Executive` | Leadership, Evaluators |
| `FreshMart-prod-Operations` | SRE, On-Call Engineers |
| `FreshMart-prod-SLA` | SRE, Architects (99.9% SLO, Error Budget) |
| `FreshMart-prod-Security` | Security Team |
| `FreshMart-prod-FinOps` | FinOps, Engineering Lead |
| `FreshMart-prod-Synthetics` | QA, SRE |
| `FreshMart-prod-Business` | Product, Management |
| `FreshMart-prod-API` | Backend Engineers |
| `FreshMart-prod-Lambda` | Backend Engineers |
| `FreshMart-prod-Database` | Data Engineers |
| `FreshMart-prod-Messaging` | Integration Engineers |

### Observability Modules

```text
terraform/modules/
├── cloudwatch/     # Dashboards, alarms, composite alarms, metric filters,
│                   # Logs Insights, Contributor Insights, Lambda Insights, X-Ray
├── synthetics/     # 7 staged Puppeteer/Node.js canaries (Stages A–D)
├── finops/         # AWS Budgets, Cost Anomaly Detection, FinOps Dashboard
└── security/       # Security metric filters, threat alarms, Security Dashboard
```

---

## Common Commands

### Build & Package
```bash
npm install
npm run build
npm run package
```

### Terraform (Production)
```bash
cd terraform/environments/prod
terraform init
terraform validate
terraform plan -var="internal_service_token=<token>"
terraform apply "tfplan.ci"
```

### CI/CD Quality Gate (run before every apply)
```powershell
.\scripts\tf-validate.ps1 -Environment prod -Token "<internal_service_token>"
```

Enforces: `fmt` → `validate` → `plan` → destroy safety check (0 dangerous destroys).

### Publish Deployment Marker to CloudWatch
```powershell
.\scripts\publish-deploy-event.ps1 -Environment prod -ServiceName "order" -Version "v1.2.3"
```

---

## Service Lambda Packages

| Service | Lambda ZIP |
|---|---|
| Auth | `services/auth-service/lambda.zip` |
| Product | `services/product-service/lambda.zip` |
| Menu | `services/menu-service/lambda.zip` |
| Inventory | `services/inventory-service/lambda.zip` |
| Cart | `services/cart-service/lambda.zip` |
| Order | `services/order-service/lambda.zip` |
| Payment | `services/payment-service/lambda.zip` |
| Admin | `services/admin-service/lambda.zip` |
| User | `services/user-service/lambda.zip` |
| Notification | `services/notification-service/lambda.zip` |
| Analytics | `services/analytics-service/lambda.zip` |

---

## Operations Documentation

| Document | Path |
|---|---|
| Incident Response Guide | [`docs/operations/incident-response-guide.md`](docs/operations/incident-response-guide.md) |
| Alarm Ownership Matrix | [`docs/operations/alarm-ownership-matrix.md`](docs/operations/alarm-ownership-matrix.md) |
| Dashboard Navigation Hub | [`docs/operations/dashboard-navigation-hub.md`](docs/operations/dashboard-navigation-hub.md) |
| Post-Incident Review Template | [`docs/operations/post-incident-review-template.md`](docs/operations/post-incident-review-template.md) |
| Production Validation Checklist | [`docs/operations/production-validation-checklist.md`](docs/operations/production-validation-checklist.md) |
| Service Dependency Map & DR | [`docs/architecture/service-dependency-map.md`](docs/architecture/service-dependency-map.md) |
| Terraform Module Docs | [`docs/architecture/terraform-module-docs.md`](docs/architecture/terraform-module-docs.md) |
| **Observability Architecture** | [`docs/architecture/observability-architecture.md`](docs/architecture/observability-architecture.md) |

## Architecture Decision Records (ADRs)

| ADR | Decision |
|---|---|
| [ADR-0001](docs/adr/0001-dashboard-structure.md) | Multi-Audience Dashboard Architecture |
| [ADR-0002](docs/adr/0002-composite-alarms.md) | Composite Alarms for Platform-Level Alerting |
| [ADR-0003](docs/adr/0003-xray-sampling-strategy.md) | Tiered X-Ray Sampling Strategy |
| [ADR-0004](docs/adr/0004-finops-module-separation.md) | Dedicated FinOps Terraform Module |
| [ADR-0005](docs/adr/0005-staged-canary-strategy.md) | Staged Rollout for CloudWatch Synthetics Canaries |


## Operational Runbooks

| Runbook | Trigger |
|---|---|
| [`api-5xx.md`](docs/runbooks/api-5xx.md) | API Gateway 5XX error rate alarm |
| [`lambda-errors.md`](docs/runbooks/lambda-errors.md) | Lambda function error alarm |
| [`dynamodb-throttles.md`](docs/runbooks/dynamodb-throttles.md) | DynamoDB throttle alarm |
| [`sqs-dlq.md`](docs/runbooks/sqs-dlq.md) | SQS DLQ accumulation alarm |
| [`platform-down.md`](docs/runbooks/platform-down.md) | Composite platform failure alarm |
| [`auth-brute-force.md`](docs/runbooks/auth-brute-force.md) | Authentication brute force alarm |
| [`iam-tampering.md`](docs/runbooks/iam-tampering.md) | Admin privilege elevation alarm |
| [`finops-budget-exceeded.md`](docs/runbooks/finops-budget-exceeded.md) | Budget exceeded / cost anomaly |

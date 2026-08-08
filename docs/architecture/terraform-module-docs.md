# FreshMart – Terraform Module Documentation

> **Version:** 1.0  
> **Owner:** Platform Engineering

---

## Module Registry

```text
terraform/modules/
├── cloudwatch/     # Core observability platform
├── synthetics/     # Synthetic monitoring (CloudWatch Canaries)
├── finops/         # Financial governance & cost observability
└── security/       # Security monitoring & threat detection
```

---

## `module "cloudwatch"`

**Source:** `../../modules/cloudwatch`

Provisions the core observability infrastructure for the FreshMart platform.

| Resource | Count | Description |
|---|---|---|
| `aws_cloudwatch_dashboard` | 8 | Operations, Lambda, API, Database, Messaging, SLA, Executive, Business |
| `aws_cloudwatch_metric_alarm` | 141 | Lambda errors/duration/throttle, DDB throttle, API 5XX/latency, SQS DLQ |
| `aws_cloudwatch_composite_alarm` | 4 | Platform, API, Database, Messaging composite failure alarms |
| `aws_cloudwatch_log_metric_filter` | 36 | Auth, Payments, Orders, API, Lambda custom namespace filters |
| `aws_cloudwatch_query_definition` | 16 | Saved Logs Insights queries for ErrorRate, Tracing, Cold Starts, etc. |
| `aws_cloudwatch_contributor_insight_rule` | 36 | Hot partitions, throttles, top status codes, top callers |
| `aws_xray_sampling_rule` | 2 | Default 5% sampling + 100% payment flow trace |
| `aws_iam_role_policy_attachment` | 1 | Lambda Insights managed policy attachment |
| `aws_cloudwatch_log_group` | 11 | Per-service Lambda log groups with 30-day retention |

### Key Variables

| Variable | Description | Default |
|---|---|---|
| `project_name` | Resource name prefix | Required |
| `environment` | Deployment environment | Required |
| `api_id` | API Gateway REST API ID | Required |
| `lambda_functions` | Map of Lambda function configs | Required |
| `dynamodb_tables` | Map of DynamoDB table names | Required |
| `alarm_sns_topics` | Map of SNS topic ARNs by severity | Required |
| `metric_period_seconds` | Default CloudWatch metric period | `300` |

---

## `module "synthetics"`

**Source:** `../../modules/synthetics`

Provisions 7 staged Puppeteer/Node.js CloudWatch Synthetics canaries.

| Resource | Count | Description |
|---|---|---|
| `aws_synthetics_canary` | 7 | api-health, customer-ui, admin-ui, login-flow, cart-flow, dependency, payment-sandbox |
| `aws_cloudwatch_metric_alarm` | 14 | Per-canary success and duration alarms |
| `aws_cloudwatch_composite_alarm` | 1 | Composite Customer Journey failure alarm |
| `aws_cloudwatch_dashboard` | 1 | `FreshMart-prod-Synthetics` |
| `aws_s3_bucket` | 1 | Canary artifact storage (HAR files, screenshots) |
| `aws_secretsmanager_secret` | 1 | Test user credentials for login canary |
| `aws_iam_role` | 1 | Least-privilege canary execution role |

### Staged Deployment Strategy

```
Stage A (read-only)   →  api-health, customer-ui, admin-ui
Stage B (auth)        →  login-flow
Stage C (cart)        →  cart-flow (non-polluting)
Stage D (external)    →  dependency, payment-sandbox
```

---

## `module "finops"`

**Source:** `../../modules/finops`

Provisions AWS Budgets, Cost Anomaly Detection, and FinOps dashboard.

| Resource | Count | Description |
|---|---|---|
| `aws_budgets_budget` | 5 | Overall, Lambda, DynamoDB, API Gateway, CloudFront |
| `aws_ce_anomaly_monitor` | 1 | Dimensional service cost anomaly monitor |
| `aws_ce_anomaly_subscription` | 1 | Immediate SNS alert on >20% cost anomaly |
| `aws_cloudwatch_dashboard` | 1 | `FreshMart-prod-FinOps` |

### Budget Defaults

| Budget | Limit | Thresholds |
|---|---|---|
| Overall Monthly | `$100` | 50% (info), 80% (warn), 100% (crit), 120% forecast |
| Lambda | `$30` | 80% (warn), 100% (crit) |
| DynamoDB | `$25` | 80% (warn), 100% (crit) |
| API Gateway | `$20` | 80% (warn), 100% (crit) |
| CloudFront | `$15` | 80% (warn), 100% (crit) |

---

## `module "security"`

**Source:** `../../modules/security`

Provisions security monitoring, metric filters, threat detection alarms, and the Security dashboard.

| Resource | Count | Description |
|---|---|---|
| `aws_cloudwatch_log_metric_filter` | 3 | Failed logins, Unauthorized 401/403, Admin privilege elevation |
| `aws_cloudwatch_metric_alarm` | 3 | BruteForce-Critical, UnauthorizedAccess-Warning, PrivilegeElevation-Critical |
| `aws_cloudwatch_composite_alarm` | 1 | Composite Security Threat alarm |
| `aws_cloudwatch_dashboard` | 1 | `FreshMart-prod-Security` |

---

## Wiring into Production (`terraform/environments/prod/main.tf`)

```hcl
module "cloudwatch"  { source = "../../modules/cloudwatch"  ... }
module "synthetics"  { source = "../../modules/synthetics"  ... }
module "finops"      { source = "../../modules/finops"      ... }
module "security"    { source = "../../modules/security"    ... }
```

All modules consume outputs from the application modules (`apigateway`, `lambda`, `dynamodb`, `sqs`, `sns`, `eventbridge`) to establish cross-module dependencies without hardcoded resource names.

---

## CI/CD Quality Gate (`scripts/tf-validate.ps1`)

Run before every pull request merge and before every `terraform apply`:

```powershell
.\scripts\tf-validate.ps1 -Environment prod -Token "<internal_service_token>"
```

Enforces:
1. `terraform fmt` — all `.tf` files are formatted
2. `terraform validate` — configuration is syntactically valid
3. `terraform plan` — plan succeeds with no errors
4. Destroy safety check — zero Lambda, DynamoDB, API Gateway, SQS, SNS, IAM, Cognito, or EventBridge destroys

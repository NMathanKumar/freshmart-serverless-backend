# FreshMart – Production Validation Checklist

> Run this checklist **after `terraform apply` completes** to verify every component is functioning in AWS.  
> Region: `ap-southeast-1`

---

## Terraform State Verification

- [x] `terraform apply "tfplan.final"` completed with exit code 0
- [x] `terraform plan` re-run reports **"No changes. Your infrastructure matches the configuration."**
- [x] No error outputs in the apply log

---

## CloudWatch Dashboards (11 total)

- [x] `FreshMart-prod-Executive` — opens, all widgets render
- [x] `FreshMart-prod-Operations` — opens, all widgets render, nav bar links work
- [x] `FreshMart-prod-SLA` — SLO availability and Error Budget widgets populate
- [x] `FreshMart-prod-Security` — failed auth and 401/403 metrics show (even if 0)
- [x] `FreshMart-prod-FinOps` — API request volume and Lambda invocation widgets render
- [x] `FreshMart-prod-Synthetics` — canary success % shown
- [x] `FreshMart-prod-Business` — order/cart conversion widgets show (0 baseline okay)
- [x] `FreshMart-prod-API` — 4XX/5XX rate and latency percentile graphs load
- [x] `FreshMart-prod-Lambda` — function error rate and duration graphs load
- [x] `FreshMart-prod-Database` — DynamoDB throttle and capacity widgets load
- [x] `FreshMart-prod-Messaging` — SQS queue depth and DLQ widgets load

---

## CloudWatch Alarms

- [x] Total alarm count ≥ 200 (CloudWatch → Alarms → All Alarms)
- [x] Composite alarms: `Composite-Platform-Failure-Critical` visible
- [x] Composite alarms: `Composite-API-Failure-Critical` visible
- [x] Composite alarms: `Composite-Database-Failure-Critical` visible
- [x] Composite alarms: `Composite-Security-Threat-Critical` visible
- [x] Anomaly detection alarms show training bands (may take 15 min after first invocations)
- [x] All alarm descriptions contain runbook links

---

## Logs Insights Saved Queries (16 total)

CloudWatch → Logs Insights → Saved Queries:
- [x] `ErrorRateByService` — visible and executes
- [x] `TopErroringFunctions` — visible and executes
- [x] `TopSlowestFunctions` — visible and executes
- [x] `CorrelationIdTracing` — visible and executes
- [x] `RecentDeploymentErrors` — visible and executes
- [x] `DLQPoisonMessages` — visible and executes
- [x] `ColdStartAnalysis` — visible and executes
- [x] Total count: 16 saved queries across all log groups

---

## Metric Filters (36 total)

CloudWatch → Log Groups → Select any Lambda log group → Metric Filters:
- [x] Auth log group has filters: `FailedLoginCount`, `UnauthorizedAccessCount`, `PrivilegeElevationAttemptCount`
- [x] Payment log group has filters for payment success/failure metrics
- [x] Order log group has filters for order completion metrics

---

## Lambda Insights

- [x] CloudWatch → Lambda Insights → All Functions — at least one function listed
- [x] Memory utilization and CPU metrics visible after invoking a function

---

## X-Ray Tracing

- [x] CloudWatch → X-Ray → Service Map — shows API → Lambda → DynamoDB connections
- [x] A trace exists end-to-end for at least one recent API request
- [x] Payment sampling rule visible in X-Ray → Sampling Rules

---

## Contributor Insights (36 rules)

CloudWatch → Contributor Insights:
- [x] Rules appear and show "Enabled" status
- [x] Data starts populating after initial Lambda invocations

---

## CloudWatch Synthetics Canaries (7 total)

CloudWatch → Synthetics → Canaries:
- [x] `freshmart-prod-api-health` — Status: Running, Last Run: Passed
- [x] `freshmart-prod-customer-ui` — Status: Running, Last Run: Passed
- [x] `freshmart-prod-admin-ui` — Status: Running, Last Run: Passed
- [x] `freshmart-prod-login-flow` — Status: Running (Stage B)
- [x] `freshmart-prod-cart-flow` — Status: Running (Stage C)
- [x] `freshmart-prod-dependency` — Status: Running (Stage D)
- [x] `freshmart-prod-payment-sandbox` — Status: Running (Stage D)
- [x] S3 bucket `freshmart-prod-canary-artifacts` contains screenshots/HAR files

---

## AWS Budgets (5 total)

AWS Console → Billing → Budgets:
- [x] `freshmart-prod-monthly-overall` — $100 limit, SNS alerts configured
- [x] `freshmart-prod-service-lambda` — $30 limit
- [x] `freshmart-prod-service-dynamodb` — $25 limit
- [x] `freshmart-prod-service-apigateway` — $20 limit
- [x] `freshmart-prod-service-cloudfront` — $15 limit

---

## Cost Anomaly Detection

AWS Console → Billing → Cost Anomaly Detection:
- [x] Monitor `freshmart-prod-cost-anomaly-monitor` — Status: Active
- [x] Subscription `freshmart-prod-cost-anomaly-subscription` — Active, linked to Warning SNS

---

## SNS Topics (3 total)

SNS → Topics:
- [x] `freshmart-prod-alerts-critical` — has at least one active subscription (email or PagerDuty)
- [x] `freshmart-prod-alerts-warning` — has at least one active subscription
- [x] `freshmart-prod-alerts-info` — has at least one active subscription

---

## End-to-End Demonstration Flow (for mentor review)

Run through this sequence to demonstrate the full platform live:

1. **Open Executive Dashboard** → explain availability SLO, error budget, canary status
2. **Invoke a Lambda function** with a forced error → show alarm firing in Operations Dashboard
3. **Open Logs Insights** → run `ErrorRateByService` → identify the failing function
4. **Open X-Ray Service Map** → trace the failing request from API → Lambda → DynamoDB
5. **Open Synthetics** → show a canary run, its screenshot, and HAR trace
6. **Open FinOps Dashboard** → explain Lambda cost proxy and budget thresholds
7. **Open Security Dashboard** → explain metric filters and brute-force alarm logic
8. **Show Terraform module structure** → explain `cloudwatch/`, `synthetics/`, `finops/`, `security/`
9. **Run `terraform plan`** → show "No changes" — infrastructure matches state

---

## Sign-Off

| Check | Status | Date |
|---|---|---|
| `terraform apply` completed | ☑ | 2026-08-07 |
| All dashboards validated | ☑ | 2026-08-07 |
| All alarms verified | ☑ | 2026-08-07 |
| Synthetics all passing | ☑ | 2026-08-07 |
| Budgets active | ☑ | 2026-08-07 |
| SNS subscriptions confirmed | ☑ | 2026-08-07 |
| End-to-end demo rehearsed | ☑ | 2026-08-07 |

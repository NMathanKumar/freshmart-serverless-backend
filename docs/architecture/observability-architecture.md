# FreshMart – Observability Platform Operational Architecture

> **Version:** 1.1 | **Owner:** Platform Engineering

---

## Full End-to-End Operational Architecture

```text
                      ┌──────────────────────────────────┐
                      │           USERS                  │
                      │  Customer Browser · Mobile App   │
                      └──────────────┬───────────────────┘
                                     │ HTTPS
                      ┌──────────────▼───────────────────┐
                      │         Amazon CloudFront         │
                      │  Customer Web · Admin Web (S3)    │
                      └──────────────┬───────────────────┘
                                     │
                      ┌──────────────▼───────────────────┐
                      │         API Gateway               │
                      │  REST API · v1 stage              │
                      │  Cognito JWT Authorizer           │
                      └──────────────┬───────────────────┘
                                     │
              ┌──────────────────────┼─────────────────────────┐
              │                      │                          │
  ┌───────────▼──────┐   ┌──────────▼──────┐   ┌─────────────▼──────┐
  │   Auth Lambda    │   │ Product Lambda  │   │   Order Lambda     │
  │   User Lambda    │   │ Menu Lambda     │   │   Payment Lambda   │
  │                  │   │ Inventory Lambda│   │   Cart Lambda      │
  │                  │   │                 │   │   Notification Λ   │
  │                  │   │                 │   │   Analytics Lambda │
  │                  │   │                 │   │   Admin Lambda     │
  └──────────────────┘   └─────────────────┘   └────────────────────┘
          │                       │                        │
    ┌─────▼─────┐          ┌──────▼─────┐         ┌──────▼──────┐
    │ DynamoDB  │          │ DynamoDB   │         │   SQS       │
    │ auth_users│          │ catalog    │         │   + DLQ     │
    │ user_prof.│          │ inventory  │         └──────┬──────┘
    └───────────┘          └────────────┘                │
                                                  ┌──────▼──────┐
                                                  │ EventBridge │
                                                  │   Bus       │
                                                  └──────┬──────┘
                                                         │
                                                  ┌──────▼──────┐
                                                  │     SNS     │
                                                  │  11 topics  │
                                                  └─────────────┘

─────────────────────────────────────────────────────────────────────
OBSERVABILITY LAYER (all services instrumented via the modules below)
─────────────────────────────────────────────────────────────────────

  Lambda → CloudWatch Logs (JSON structured)
              │
              ├── Metric Filters (36)          → Custom CloudWatch Metrics
              │   FreshMart/prod/Auth           (FailedLoginCount, etc.)
              │   FreshMart/prod/Payments
              │   FreshMart/prod/Orders
              │   FreshMart/prod/API
              │   FreshMart/prod/Lambda
              │
              ├── Logs Insights (16 queries)   → Saved for incident triage
              │   ErrorRateByService
              │   CorrelationIdTracing
              │   TopSlowestFunctions
              │   ColdStartAnalysis ...
              │
              └── Contributor Insights (36)    → Top-N analysis
                  Hot DDB partitions
                  Top error callers
                  Top status codes ...

  Lambda → AWS X-Ray (via active tracing)
              API Gateway → Lambda → DynamoDB → SNS → SQS
              Default: 5% sampling
              Payment flow: 100% fixed-rate sampling

  Lambda → Lambda Insights (via extension layer v38)
              Memory utilization, CPU, init duration, spans

─────────────────────────────────────────────────────────────────────
ALERTING PIPELINE
─────────────────────────────────────────────────────────────────────

  CloudWatch Metrics
       │
       ├── Standard Metric Alarms (210)
       │   Lambda errors/duration/throttles
       │   DynamoDB read/write throttles
       │   API 5XX rate, P99 latency
       │   SQS DLQ depth, queue age
       │   Security: BruteForce, PrivEsc, Unauth
       │
       ├── Anomaly Detection Alarms
       │   Statistical baseline ± 2σ auto-detection
       │
       └── Composite Alarms (6)
           Composite-Platform-Failure-Critical
           Composite-API-Failure-Critical
           Composite-Database-Failure-Critical
           Composite-Messaging-Failure-Critical
           Composite-Security-Threat-Critical
           Composite-CustomerJourney-Failure
                │
                ▼
           SNS Topics (severity-routed)
           ├── alerts_critical  → P1 on-call (PagerDuty / Email)
           ├── alerts_warning   → P2 investigation (Email / Slack)
           └── alerts_info      → OK resolutions (audit trail)
                │
                ▼
           Incident Response
           ├── Open dashboard for affected domain
           ├── Run Logs Insights triage query
           ├── Trace request in X-Ray
           ├── Follow operational runbook
           └── Complete Post-Incident Review

─────────────────────────────────────────────────────────────────────
SYNTHETIC MONITORING (proactive, before users are affected)
─────────────────────────────────────────────────────────────────────

  CloudWatch Synthetics Canaries (7)
  Stage A:  api-health (1 min)    → GET /health /products /categories
            customer-ui (5 min)  → DOM assertion, zero console errors
            admin-ui (5 min)     → Login redirect, layout validation
  Stage B:  login-flow (15 min)  → Cognito auth via Secrets Manager
  Stage C:  cart-flow (15 min)   → Add → verify → remove (non-polluting)
  Stage D:  dependency (10 min)  → DNS, SSL, CloudFront, Cognito reachability
            payment-sandbox (30m)→ Payment gateway token (no real charges)
       │
       ├── S3 Artifacts: screenshots, HAR traces, execution logs
       ├── Canary Alarms (14): per-canary success and duration alarms
       └── Composite-CustomerJourney-Failure → SNS Critical

─────────────────────────────────────────────────────────────────────
FINOPS & GOVERNANCE
─────────────────────────────────────────────────────────────────────

  AWS Budgets (5):
  $100 Overall · $30 Lambda · $25 DDB · $20 API · $15 CloudFront
       │ 50%/80%/100%/120% thresholds → SNS alerts
       │
  AWS Cost Anomaly Detection:
  Dimensional Service Monitor → >20% spend anomaly → SNS Warning
       │
  Cost Allocation Tags:
  Project · Environment · Owner · CostCenter · Category (enforced)
```

---

## Post-Deployment Known Gaps & Timeline

| Item | State After `terraform apply` | Resolution Timeline |
|---|---|---|
| Metric Filters | No data until Lambda invocations emit JSON logs | Immediate on first Lambda call |
| Lambda Insights | No data until functions invoked | Immediate on first invocation |
| X-Ray Service Map | Empty until traced requests flow | Immediate on first traced request |
| Contributor Insights | ~15 min warm-up after first data | 15–30 min |
| Anomaly Detection Training | 15-minute training period | 15 min after alarm creation |
| Cost Anomaly Detection | Requires 2+ weeks of billing history | 2 weeks |
| Budget Forecasted Alerts | Requires billing data to project | End of first billing cycle |

These are **expected AWS service behaviours**, not implementation gaps. They are documented so the evaluation team understands the timeline.

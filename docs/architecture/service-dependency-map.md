# FreshMart – Service Dependency Map & RTO/RPO Documentation

> **Version:** 1.0  
> **Owner:** Platform Engineering

---

## Service Dependency Map

```
                     [Customer Browser / Mobile]
                              │
                     [Amazon CloudFront CDN]
                    /                   \
        [Customer Web Frontend]     [Admin Web Frontend]
          (Static S3 + CDN)           (Static S3 + CDN)
                    \                   /
                        [API Gateway]
                             │
                    [Cognito Auth Authorizer]
                             │
          ┌──────────────────┼───────────────────┐
          │                  │                   │
     [Auth Lambda]   [Product Lambda]    [Order Lambda]
          │                  │                   │
     [auth_users DDB] [catalog_items DDB] [orders DDB]
                             │
                     [Cart Lambda]
                          │      │
                    [carts DDB]  [SQS Order Queue]
                                      │
                              [EventBridge Bus]
                             /         |          \
               [Payment Lambda] [Inventory Lambda] [Notification Lambda]
                      │               │                    │
               [payments DDB]  [inventory DDB]     [notifications DDB]
                      │                                     │
               [Payment Gateway]                    [SES / SNS]
                   (External)

Supporting Services (all services):
  ├── AWS X-Ray (Distributed Tracing)
  ├── AWS CloudWatch (Metrics, Logs, Alarms, Dashboards)
  ├── AWS CloudWatch Synthetics (Continuous Canary Monitoring)
  ├── AWS Secrets Manager (Credentials & API Keys)
  └── AWS S3 (Canary Artifacts, Deployment Assets)
```

---

## Service Criticality Classification

| Service | Criticality | Impact if Down |
|---|---|---|
| API Gateway | **Critical** | Full platform inaccessible |
| Cognito Authorizer | **Critical** | No authenticated requests |
| Order Lambda + DynamoDB | **Critical** | No new orders |
| Payment Lambda | **Critical** | Revenue loss |
| Cart Lambda + DynamoDB | **High** | Cart abandonments |
| Product Lambda + DynamoDB | **High** | Product browsing degraded |
| Notification Lambda | **Medium** | Delayed order status updates |
| Inventory Lambda | **Medium** | Stale stock data |
| Analytics Lambda | **Low** | Reporting lag |

---

## RTO / RPO Targets

| Service | RTO (Recovery Time Objective) | RPO (Recovery Point Objective) | Strategy |
|---|---|---|---|
| API Gateway | **5 min** | N/A (stateless) | Auto-recovery via AWS managed service |
| Lambda (all functions) | **5 min** | N/A (stateless) | Re-deploy via CI/CD or manual Terraform apply |
| DynamoDB (orders) | **15 min** | **0 min** | PITR enabled; restore from point-in-time |
| DynamoDB (carts) | **15 min** | **5 min** | PITR enabled |
| DynamoDB (payments) | **15 min** | **0 min** | PITR enabled; payment audit log always preserved |
| DynamoDB (catalog) | **30 min** | **60 min** | Daily backup; catalog can be restored from source |
| Cognito User Pool | **30 min** | **0 min** | AWS managed; full replication; no manual action needed |
| CloudFront | **5 min** | N/A | AWS managed; origin fallback configured |
| SQS Queues | **5 min** | **0 min** | All messages persist until consumed; DLQ preserves failed |
| EventBridge | **10 min** | **0 min** | Messages replay from SQS DLQ if EventBridge unavailable |

---

## Disaster Recovery Playbook

### Scenario 1: Full Region Failure

**Current status**: Single-region (`ap-southeast-1`). DR via manual failover.

**Steps:**
1. Declare incident → notify Engineering Manager.
2. Monitor AWS Health Dashboard for region restoration ETA.
3. If ETA > 4 hours: begin cross-region recovery procedure.
4. Restore DynamoDB tables from PITR in failover region.
5. Re-run `terraform apply` against failover region environment.
6. Update CloudFront origin to new API Gateway endpoint.
7. Validate via Synthetics canaries against new endpoints.

### Scenario 2: DynamoDB Table Corruption

```bash
# Identify last clean PITR restore point
aws dynamodb describe-continuous-backups --table-name freshmart-prod-orders

# Restore to clean state
aws dynamodb restore-table-to-point-in-time \
  --source-table-name freshmart-prod-orders \
  --target-table-name freshmart-prod-orders-restored \
  --restore-date-time "2026-08-06T18:00:00Z"
```

### Scenario 3: Lambda Deployment Rollback

```bash
# Identify last good version
aws lambda list-versions-by-function --function-name freshmart-prod-order

# Rollback alias to previous version
aws lambda update-alias \
  --function-name freshmart-prod-order \
  --name prod \
  --function-version <PREV_VERSION>
```

---

## Monitoring Standards

### Naming Conventions
- **Log groups**: `/aws/lambda/{project_name}-{environment}-{service}`
- **Alarms**: `{project_name}-{environment}-{service}-{metric}-{severity}`
- **Composite Alarms**: `{project_name}-{environment}-Composite-{Scope}-{Severity}`
- **Dashboards**: `FreshMart-{environment}-{Audience}`
- **SNS Topics**: `{project_name}-{environment}-alerts-{severity}`

### Dashboard Widget Standards
- All dashboards must include navigation bar at `y=0, height=1`.
- All time-series widgets use 5-minute periods (300s) unless explicitly documented.
- Composite alarm widgets bind all relevant child alarms.
- All dashboards must link to relevant runbooks in alarm descriptions.

### Alarm Standards
- All alarms must have `alarm_description` with: explanation, runbook link, severity level.
- All critical alarms must route to `alerts_critical` SNS topic.
- All alarms must have `ok_actions` pointing to `alerts_info` for auto-resolution.
- All composite alarms use OR logic for failure scenarios.

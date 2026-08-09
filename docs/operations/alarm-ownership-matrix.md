# FreshMart – Alarm Ownership & Governance Matrix

> **Version:** 1.0  
> **Owner:** Platform Engineering

---

## Alarm Ownership

| Alarm Category | Alarm Name Pattern | Owner Team | SNS Topic | Severity |
|---|---|---|---|---|
| Platform | `Composite-Platform-Failure-Critical` | Platform / SRE | `alerts_critical` | P1 |
| API | `Composite-API-Failure-Critical` | Backend | `alerts_critical` | P1 |
| Database | `Composite-Database-Failure-Critical` | Backend / Data | `alerts_critical` | P1 |
| Messaging | `Composite-Messaging-Failure-Critical` | Backend | `alerts_critical` | P1 |
| Security | `Composite-Security-Threat-Critical` | Security | `alerts_critical` | P1 |
| Synthetics | `Composite-CustomerJourney-Failure` | SRE / QA | `alerts_critical` | P1 |
| Lambda Errors | `freshmart-prod-*-lambda-errors` | Backend | `alerts_warning` | P2 |
| Lambda Duration | `freshmart-prod-*-lambda-duration` | Backend | `alerts_warning` | P2 |
| DynamoDB Throttle | `freshmart-prod-*-ddb-*-throttle` | Backend / Data | `alerts_warning` | P2 |
| SQS DLQ | `freshmart-prod-*-dlq-depth` | Backend | `alerts_warning` | P2 |
| API 5XX | `freshmart-prod-api-5xx-rate` | Backend | `alerts_warning` | P2 |
| API Latency | `freshmart-prod-api-p99-latency` | Backend | `alerts_warning` | P2 |
| Auth BruteForce | `freshmart-prod-Auth-BruteForce-Critical` | Security | `alerts_critical` | P1 |
| Privilege Elevation | `freshmart-prod-Security-AdminPrivilegeElevation-Critical` | Security | `alerts_critical` | P1 |
| Budget 80% | `freshmart-prod-service-*` | FinOps | `alerts_warning` | P3 |
| Budget 100% | `freshmart-prod-monthly-overall` | FinOps / Eng Mgr | `alerts_critical` | P2 |
| Cost Anomaly | AWS CE (direct) | FinOps | `alerts_warning` | P2 |

---

## Alarm Naming Conventions

All CloudWatch alarms follow the pattern:

```
{project_name}-{environment}-{service}-{metric}-{severity}
```

Examples:
- `freshmart-prod-auth-lambda-errors`
- `freshmart-prod-orders-ddb-read-throttle`
- `freshmart-prod-api-p99-latency`

Composite alarms use:
```
{project_name}-{environment}-Composite-{Scope}-{Severity}
```

---

## Alarm Lifecycle

```
Design → Implement → Validate → Active Monitoring → Review (monthly) → Tune or Retire
```

### Review cadence
- **Monthly**: Review alarm false-positive rate. Tune thresholds if > 5% false positives.
- **Quarterly**: Review alarm ownership. Confirm SNS subscribers are active.
- **Annually**: Audit alarm list against active services. Remove orphaned alarms.

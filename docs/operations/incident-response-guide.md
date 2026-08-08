# FreshMart – Incident Response Guide

> **Version:** 1.0  
> **Owner:** Platform Engineering  
> **Last Updated:** 2026-08

---

## 1. Incident Severity Definitions

| Severity | Response SLA | Examples | On-Call Action |
|---|---|---|---|
| **P1 – CRITICAL** | 15 min acknowledgement | Platform down, >5% error rate, payment failures, security breach | Page primary + secondary on-call |
| **P2 – HIGH** | 30 min acknowledgement | Single service degraded, latency SLO breach, DLQ accumulation | Page primary on-call |
| **P3 – MEDIUM** | 2 hours | Non-critical alarm, Synthetics flapping, budget at 80% | Notify team Slack channel |
| **P4 – LOW** | Next business day | Cost optimization opportunity, advisory, documentation gap | Create Jira ticket |

---

## 2. Incident Response Lifecycle

```
ALARM FIRES (SNS → Email / PagerDuty / Slack)
       ↓
  ACKNOWLEDGE (<15 min for P1)
       ↓
  OPEN INCIDENT (Slack #incidents channel, Jira ticket)
       ↓
  INVESTIGATE (CloudWatch Dashboards → Logs Insights → X-Ray)
       ↓
  DIAGNOSE ROOT CAUSE
       ↓
  MITIGATE (rollback / scale / circuit break)
       ↓
  RESOLVE & VERIFY (all alarms return to OK)
       ↓
  POST-INCIDENT REVIEW (within 48 hours for P1)
```

---

## 3. Alarm → Dashboard → Runbook Navigation

| CloudWatch Alarm | Dashboard | Runbook |
|---|---|---|
| `Composite-Platform-Failure-Critical` | [Executive](https://console.aws.amazon.com/cloudwatch/home#dashboards:name=FreshMart-prod-Executive) | [platform-down.md](../runbooks/platform-down.md) |
| `Composite-API-Failure-Critical` | [API](https://console.aws.amazon.com/cloudwatch/home#dashboards:name=FreshMart-prod-API) | [api-5xx.md](../runbooks/api-5xx.md) |
| `Composite-Database-Failure-Critical` | [Database](https://console.aws.amazon.com/cloudwatch/home#dashboards:name=FreshMart-prod-Database) | [dynamodb-throttles.md](../runbooks/dynamodb-throttles.md) |
| `Composite-Messaging-Failure-Critical` | [Operations](https://console.aws.amazon.com/cloudwatch/home#dashboards:name=FreshMart-prod-Operations) | [sqs-dlq.md](../runbooks/sqs-dlq.md) |
| `Composite-Security-Threat-Critical` | [Security](https://console.aws.amazon.com/cloudwatch/home#dashboards:name=FreshMart-prod-Security) | [auth-brute-force.md](../runbooks/auth-brute-force.md) |
| `Composite-CustomerJourney-Failure` | [Synthetics](https://console.aws.amazon.com/cloudwatch/home#dashboards:name=FreshMart-prod-Synthetics) | [platform-down.md](../runbooks/platform-down.md) |

---

## 4. Escalation Matrix

| Level | Role | Contact Method | Escalation Trigger |
|---|---|---|---|
| **L1** | On-call Engineer | PagerDuty / Slack | Any P1 or P2 alarm |
| **L2** | Tech Lead | Phone + Slack DM | P1 not resolved in 30 min |
| **L3** | Engineering Manager | Phone | P1 customer impact > 30 min |
| **L4** | CTO | Phone | Revenue impact or data breach |

---

## 5. Quick Diagnostic Commands

### Check recent Lambda errors (last 15 min)
```
CloudWatch → Logs Insights → Log group: /aws/lambda/freshmart-prod-*
Query: ErrorRateByService (saved query)
```

### Trace a request end-to-end
```
CloudWatch → X-Ray → Service Map → Select failing service → View traces
```

### Check DLQ accumulation
```
CloudWatch → Metrics → SQS → ApproximateNumberOfMessagesNotVisible
Or: Operations dashboard → Messaging panel
```

### Identify which Lambda is throttling
```
CloudWatch → Metrics → Lambda → Throttles → Group by FunctionName
```

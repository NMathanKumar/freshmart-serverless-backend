# Runbook: Platform Composite Failure — Critical

## Alarm
`FreshMart-prod-Composite-Platform-Failure-Critical`

## Severity
**CRITICAL — SEV1** — This is the highest severity alarm in the system. Multiple subsystems are failing simultaneously.

## Business Impact
**Total platform outage.** All customer-facing operations (browse, cart, checkout, payment) are degraded or completely unavailable.

## Customer Impact
Complete service disruption. All customers affected. Revenue impact begins immediately. Social media escalation likely within minutes.

## Detection
This composite alarm fires only when **multiple component composite alarms** are simultaneously in ALARM state:
- `Composite-API-Failure-Critical` AND/OR
- `Composite-Database-Failure-Critical` AND/OR
- `Composite-Messaging-Failure-Critical`

---

## Initial Checks (Triage — 5 minutes max)

### 1. Check the Operations Dashboard immediately
```
CloudWatch → Dashboards → FreshMart-prod-Operations
Look at: Alarm Status Widget — which component alarms are red?
```

### 2. Determine blast radius
```
Is it: API only? Database only? Multiple services?
Map: which component alarms fired → which services are affected
```

### 3. Check AWS Service Health Dashboard
```
https://health.aws.amazon.com/health/status
Check: ap-southeast-1 — any ongoing AWS incidents?
```
If AWS incident: this is outside your control. Communicate status to stakeholders.

### 4. Check recent deployments
```
AWS Lambda → All functions → Last modified
Was anything deployed in the last 60 minutes across multiple services?
```

---

## Component-Specific Runbooks
Once you identify which component(s) are failing, switch to the relevant runbook:

| Component | Runbook |
|---|---|
| API Gateway 5XX | `api-5xx.md` |
| Lambda Errors | `lambda-errors.md` |
| DynamoDB Throttles | `dynamodb-throttles.md` |
| SQS DLQ Depth | `sqs-dlq.md` |
| EventBridge Failures | `eventbridge-failed.md` |

---

## CloudWatch Dashboard Links
- [Operations Dashboard](https://console.aws.amazon.com/cloudwatch/home#dashboards:name=FreshMart-prod-Operations)
- [API Dashboard](https://console.aws.amazon.com/cloudwatch/home#dashboards:name=FreshMart-prod-API)
- [Lambda Dashboard](https://console.aws.amazon.com/cloudwatch/home#dashboards:name=FreshMart-prod-Lambda)
- [Database Dashboard](https://console.aws.amazon.com/cloudwatch/home#dashboards:name=FreshMart-prod-Database)
- [Messaging Dashboard](https://console.aws.amazon.com/cloudwatch/home#dashboards:name=FreshMart-prod-Messaging)
- [Logs Insights](https://console.aws.amazon.com/cloudwatch/home#logsV2:logs-insights)
- [X-Ray Service Map](https://console.aws.amazon.com/xray/home#service-map)
- [Contributor Insights](https://console.aws.amazon.com/cloudwatch/home#contributorInsights)
## Logs Insights Query — Cross-service error sweep
```
fields @timestamp, level, service, message, errorName, correlationId
| filter level = "error"
| stats count(*) as errorCount by service
| sort errorCount desc
```

---

## Communication Template
```
[STATUS UPDATE — HH:MM SGT]
We are investigating a platform issue affecting FreshMart services.
Impact: [describe customer-facing impact]
Status: Investigation in progress
Next update: in 15 minutes
```

## Escalation Path
| Time | Action |
|---|---|
| 0 min | On-call engineer begins triage |
| 5 min | Notify Engineering Manager immediately (SEV1) |
| 5 min | Open incident bridge call |
| 10 min | Notify Customer Support team for communication |
| 15 min | If AWS incident: notify CTO |

## Owner
**Incident Commander:** Engineering Manager (first 30 minutes)
**Technical Lead:** On-call Senior Engineer
**On-call rotation:** PagerDuty → FreshMart-SEV1

## Post-Incident Checklist
- [ ] Root cause identified
- [ ] All component alarms returned to OK
- [ ] Timeline documented
- [ ] Customer communication sent
- [ ] Post-mortem meeting scheduled within 48 hours
- [ ] Action items assigned with owners and deadlines
- [ ] Runbooks updated with new findings


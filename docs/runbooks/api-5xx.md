# Runbook: API Gateway 5XX Rate — Critical

## Alarm
`FreshMart-prod-ApiGateway-API-5XXRate-Critical`

## Severity
**CRITICAL** — Immediate response required.

## Business Impact
All API consumers (Customer Web, Admin Web, mobile clients) are receiving server errors. Checkout, order placement, and all transactional flows are degraded or unavailable.

## Customer Impact
Customers cannot complete purchases. Orders may fail silently. Revenue impact begins immediately. Support tickets expected within minutes.

## Detection
- CloudWatch Alarm: `5XXErrors / Count > 1` over 1-minute period
- Dashboard: [FreshMart-prod-API](https://console.aws.amazon.com/cloudwatch/home#dashboards:name=FreshMart-prod-API)

---

## Initial Checks (Run in order)

### 1. Verify alarm is real — not noise
```
CloudWatch → Alarms → FreshMart-prod-ApiGateway-API-5XXRate-Critical
Check: Is the graph showing sustained errors or a single spike?
```
If single spike < 2 minutes: monitor for recovery. Do not escalate yet.

### 2. Identify which Lambda is failing
```
CloudWatch → Logs Insights
Log groups: all Lambda log groups
Query: FreshMart/prod/TopErroringFunctions
Time range: Last 15 minutes
```
→ Which service has the highest error count?

### 3. Check Lambda error logs for the identified service
```
CloudWatch → Logs Insights
Log group: /aws/lambda/freshmart-prod-<service>
Query: FreshMart/prod/RecentDeploymentErrors
Time range: Last 15 minutes
```
→ Look for: stack traces, error messages, out-of-memory, timeout, missing env vars.

### 4. Check if a recent deployment triggered the issue
```
AWS Lambda → Function → freshmart-prod-<service> → Versions
Check: Was a new version deployed in the last 60 minutes?
```
If yes: this is likely a deployment regression. See Rollback section.

### 5. Check downstream dependencies
- **DynamoDB**: CloudWatch → Metrics → DynamoDB → SystemErrors / ThrottledRequests
- **SQS**: CloudWatch → Metrics → SQS → NumberOfMessagesSent (drop = upstream issue)
- **External APIs**: Check payment gateway status page if payment Lambda is failing

---

## CloudWatch Links
- [API Dashboard](https://console.aws.amazon.com/cloudwatch/home#dashboards:name=FreshMart-prod-API)
- [Operations Dashboard](https://console.aws.amazon.com/cloudwatch/home#dashboards:name=FreshMart-prod-Operations)
- [Logs Insights](https://console.aws.amazon.com/cloudwatch/home#logsV2:logs-insights)

## Logs Insights Query
```
fields @timestamp, level, service, message, correlationId, statusCode, errorName
| filter level = "error" and statusCode >= 500
| sort @timestamp desc
| limit 50
```

## X-Ray Service Map
```
AWS X-Ray → Service Map → Filter: last 15 minutes
Look for: Red nodes, broken connections, high latency edges
```

---

## Remediation Actions

### If Lambda OOM (out of memory):
1. Lambda → Configuration → General → Increase memory (e.g. 512MB → 1024MB)
2. Re-test with a manual invoke
3. Create ticket to investigate memory leak

### If Lambda timeout:
1. Lambda → Configuration → General → Increase timeout
2. Check for: slow DynamoDB queries, downstream API timeouts
3. Enable X-Ray to trace the slow path

### If deployment regression:
See **Rollback Procedure** below.

### If DynamoDB throttling is the cause:
See runbook: `dynamodb-throttles.md`

---

## Rollback Procedure
```bash
# 1. Identify the previous stable Lambda version
aws lambda list-versions-by-function --function-name freshmart-prod-<service>

# 2. Update the alias to point to the previous version
aws lambda update-alias \
  --function-name freshmart-prod-<service> \
  --name live \
  --function-version <previous-version>

# 3. Verify recovery
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApiGateway \
  --metric-name 5XXError \
  --dimensions Name=ApiId,Value=<api-id> \
  --period 60 \
  --start-time $(date -u -d '5 minutes ago' +%Y-%m-%dT%H:%M:%SZ) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
  --statistics Sum
```

---

## Escalation Path
| Time | Action |
|---|---|
| 0 min | On-call engineer investigates |
| 5 min | If unresolved: notify Tech Lead |
| 15 min | If unresolved: notify Engineering Manager |
| 30 min | If unresolved: initiate incident bridge call |

## Owner
**Team:** Platform Engineering
**On-call rotation:** PagerDuty → FreshMart-Platform

## Post-Incident Checklist
- [ ] Root cause identified
- [ ] Fix deployed and verified
- [ ] Alarm returned to OK state
- [ ] Timeline documented in incident log
- [ ] Post-mortem scheduled (if downtime > 10 minutes)
- [ ] Runbook updated with new findings

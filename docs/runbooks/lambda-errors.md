# Runbook: Lambda Error Rate — Critical

## Alarm
`FreshMart-prod-Lambda-Compute-ErrorRate-Critical-<function>`

## Severity
**CRITICAL** — A Lambda function is failing consistently.

## Business Impact
Depends on which function is failing:
- **payment**: Revenue processing stopped
- **order**: Order placement unavailable
- **auth**: User login/registration unavailable
- **cart**: Add-to-cart / checkout unavailable
- **inventory**: Stock updates not processing

## Customer Impact
Customers experience failed operations. Impact severity depends on the service.

## Detection
- CloudWatch Alarm fires when `Errors / Invocations > 10%` over 5 minutes
- Dashboard: [FreshMart-prod-Lambda](https://console.aws.amazon.com/cloudwatch/home#dashboards:name=FreshMart-prod-Lambda)

---

## Initial Checks

### 1. Identify the error type
```
CloudWatch → Logs Insights
Log group: /aws/lambda/freshmart-prod-<function>
Query:
  fields @timestamp, level, message, errorName, errorCode, stack
  | filter level = "error"
  | sort @timestamp desc
  | limit 20
```

### 2. Check for common error patterns

| Error Pattern | Likely Cause |
|---|---|
| `Task timed out after X seconds` | Lambda timeout too low, downstream slow |
| `Runtime.ImportModuleError` | Bad deployment, missing dependency |
| `Runtime.OutOfMemory` | Memory limit too low |
| `AccessDeniedException` | IAM role missing permission |
| `ResourceNotFoundException` | DynamoDB table name mismatch or wrong region |
| `ThrottlingException` | DynamoDB or downstream API throttled |
| `ProvisionedThroughputExceededException` | DynamoDB read/write capacity exceeded |

### 3. Check Lambda configuration
```
AWS Lambda → freshmart-prod-<function> → Configuration
Check: timeout, memory, environment variables, VPC config
```

### 4. Check for cold start correlation
```
CloudWatch → Logs Insights
Query: FreshMart/prod/ColdStartFrequency
```
If cold starts spiked immediately before errors: likely a deployment or configuration issue.

### 5. Check if DynamoDB is causing failures
```
CloudWatch → Metrics → DynamoDB → SystemErrors, ThrottledRequests
Filter by table name used by this service
```

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
## Logs Insights Query
```
fields @timestamp, level, message, errorName, errorCode, correlationId
| filter level = "error"
| stats count(*) as errorCount by errorName, errorCode
| sort errorCount desc
| limit 20
```

---

## Remediation Actions

### Timeout errors:
```
Lambda → Configuration → General → Timeout → Increase (max 15 min)
```
Then investigate WHY it is slow — check X-Ray trace for the slow segment.

### OOM errors:
```
Lambda → Configuration → General → Memory → Increase (128MB increments)
```

### IAM errors:
```
Lambda → Configuration → Permissions → Execution Role → Add missing permission
```
Only add minimum required permissions. Document the change.

### Deployment regression:
```bash
# Roll back to previous version
aws lambda update-alias \
  --function-name freshmart-prod-<function> \
  --name live \
  --function-version <previous-version>
```

### DynamoDB throttling causing Lambda errors:
See runbook: `dynamodb-throttles.md`

---

## Rollback Procedure
1. Identify last stable Lambda version in AWS Console
2. Update alias `live` to previous version
3. Confirm alarm transitions to OK within 5 minutes
4. Open ticket to investigate root cause before re-deploying

---

## Escalation Path
| Time | Action |
|---|---|
| 0 min | On-call engineer investigates |
| 10 min | Notify service owner if unresolved |
| 20 min | Notify Tech Lead if revenue-impacting service |

## Owner
**Team:** Platform Engineering / Service Owner
**On-call rotation:** PagerDuty → FreshMart-Platform

## Post-Incident Checklist
- [ ] Root cause identified and documented
- [ ] Fix deployed or rollback confirmed
- [ ] Alarm returned to OK
- [ ] Determine if timeout/memory thresholds need permanent adjustment
- [ ] Post-mortem if revenue-impacting service was down > 5 minutes


# Runbook: FinOps – Budget Exceeded or Cost Anomaly Detected

> **Owner:** Platform Engineering / FinOps  
> **Dashboard:** [FreshMart-prod-FinOps](https://ap-southeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-southeast-1#dashboards:name=FreshMart-prod-FinOps)

---

## Trigger Conditions

| Alert | Condition | Severity |
|---|---|---|
| Budget 80% threshold | Monthly spend reaches 80% of service limit | WARNING |
| Budget 100% threshold | Monthly spend reaches 100% of service limit | CRITICAL |
| Cost Anomaly | AWS CE detects > 20% spend anomaly vs. baseline | WARNING |
| Forecasted 120% | Spend forecast exceeds budget by 20% | WARNING |

---

## Initial Investigation (15 min)

### 1. Identify which service triggered the alert
Open → **AWS Budgets Console**:
```
AWS Console → Billing → Budgets → Review each budget's current spend vs. limit
```

### 2. Open Cost Explorer to identify the cost driver
```
AWS Console → Billing → Cost Explorer
→ Group by: Service
→ Time: Last 30 days
→ Sort by: Cost (descending)
```

### 3. If Lambda budget triggered, check invocation volume
```
CloudWatch → FinOps Dashboard → "Lambda Invocations Volume" widget
```
Look for: sudden spike in invocations, runaway recursive Lambda, or infinite retry loop.

### 4. If DynamoDB budget triggered, check consumed capacity
```
CloudWatch → FinOps Dashboard → "DynamoDB Capacity Units Consumed" widget
```
Look for: sudden CU spike, missing TTL causing table growth, inefficient scans.

### 5. If Cost Anomaly triggered, check AWS CE anomaly details
```
AWS Console → Billing → Cost Anomaly Detection → View Anomaly Details
```
Review: which service, which time window, baseline vs. actual spend.

---

## Remediation Actions

### Runaway Lambda (invocation surge)
```bash
# Throttle the function temporarily (set concurrency to 0)
aws lambda put-function-concurrency \
  --function-name freshmart-prod-<service> \
  --reserved-concurrent-executions 0
```

### DynamoDB scan causing CU spike
- Identify scan pattern via Logs Insights: `TopDynamoDBErrors` saved query.
- Add GSI (Global Secondary Index) if full table scan is occurring.
- Add `FilterExpression` to application-level queries.

### Unexpected CloudFront traffic (CDN bill spike)
```bash
# Check CloudFront access logs for unusual traffic sources
# Open CloudFront → Distribution → Monitoring → Top viewer locations
```
If DDoS-like pattern, enable CloudFront WAF rate limiting rule.

---

## Escalation Path

| Time | Action |
|---|---|
| 0 min | FinOps Engineer investigates via Cost Explorer |
| 15 min | Identify root service and check for runaway process |
| 30 min | Implement temporary concurrency limit or rate limit |
| 1 hour | Notify Engineering Lead if cost impact > $10 unplanned |

---

## Monthly FinOps Review Checklist

Run at the start of every month:
- [ ] Review each budget's utilization vs. forecast.
- [ ] Review Cost Anomaly Detection findings for the previous month.
- [ ] Identify the top 3 cost drivers.
- [ ] Review Lambda GB-second usage — consider memory tuning if duration is high.
- [ ] Review CloudWatch log ingestion costs — check for excessively verbose services.
- [ ] Review Synthetics canary execution volume — remove unused canaries.
- [ ] Update budget limits if service usage has changed significantly.

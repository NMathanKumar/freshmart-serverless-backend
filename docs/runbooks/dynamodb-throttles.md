# Runbook: DynamoDB Throttled Requests — Warning/Critical

## Alarm
`FreshMart-prod-DynamoDB-Database-SystemErrors-Critical-<table>`
`FreshMart-prod-DynamoDB-Database-ReadThrottle-Warning-<table>`
`FreshMart-prod-DynamoDB-Database-WriteThrottle-Warning-<table>`

## Severity
**WARNING → CRITICAL** based on sustained duration and impact.

## Business Impact
DynamoDB throttling causes Lambda functions to receive `ProvisionedThroughputExceededException`. If retries are exhausted, data is not written and operations fail silently or visibly.

## Customer Impact
- Read throttles: slower product/cart/order lookups, possible timeouts
- Write throttles: lost order updates, inventory not decremented, payment records delayed

## Detection
- CloudWatch Alarm: `ThrottledRequests > 0` for the affected table
- Contributor Insights: `freshmart-prod-ddb-throttled-<table>` rule shows which partition keys are throttled

---

## Initial Checks

### 1. Identify which table and which operation is throttled
```
CloudWatch → Contributor Insights → freshmart-prod-ddb-throttled-<table>
Check: Which TableName + errorCode combination has the highest count?
```

### 2. Assess the current consumed vs. provisioned capacity
```
CloudWatch → Metrics → DynamoDB → <table>
Metrics: ConsumedReadCapacityUnits, ConsumedWriteCapacityUnits
Compare against provisioned capacity visible in DynamoDB console
```

### 3. Check for hot partitions
```
CloudWatch → Contributor Insights → freshmart-prod-ddb-hot-partitions-<table>
Check: Is one partition key consuming disproportionate capacity?
```

### 4. Check if this is correlated with a traffic spike
```
CloudWatch → API Dashboard → RequestCount
Compare timing of throttles vs. spike in API traffic
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
fields @timestamp, level, message, service, errorName
| filter message like /ProvisionedThroughput/ or errorName like /Throttl/
| stats count(*) as throttleCount by service, errorName, bin(5m)
| sort @timestamp desc
```

---

## Remediation Actions

### Immediate: Enable Auto Scaling (if not already enabled)
```
DynamoDB → <table> → Capacity → Auto Scaling → Enable
Set min: current provisioned, max: 2x current
```

### Immediate: Manually increase provisioned capacity
```
DynamoDB → <table> → Capacity → Edit
Increase read/write capacity units by 2x temporarily
```

### Hot partition mitigation:
- Add random suffix to partition keys (write sharding)
- Use DynamoDB DAX for read-heavy hot partitions
- Review access patterns with team — is this query pattern expected?

### If traffic spike is normal (e.g., flash sale):
- Pre-warm DynamoDB capacity before known traffic events
- Use on-demand billing mode for unpredictable workloads

---

## Rollback Procedure
DynamoDB capacity changes are non-destructive. To revert:
1. DynamoDB → Table → Capacity → Edit → Restore original values
2. Monitor ThrottledRequests to confirm improvement

---

## Escalation Path
| Time | Action |
|---|---|
| 0 min | On-call engineer investigates |
| 15 min | If persistent: notify Tech Lead |
| 30 min | If orders/payments impacted: notify Engineering Manager |

## Owner
**Team:** Platform Engineering
**On-call rotation:** PagerDuty → FreshMart-Platform

## Post-Incident Checklist
- [ ] Throttle root cause identified (hot partition, traffic spike, wrong capacity)
- [ ] Capacity adjusted or auto-scaling enabled
- [ ] Alarm returned to OK
- [ ] Access pattern review scheduled if hot partition confirmed


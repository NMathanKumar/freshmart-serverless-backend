# Runbook: SQS Dead-Letter Queue Depth — Critical

## Alarm
`FreshMart-prod-SQS-Messaging-DLQDepth-Critical-<queue>`

## Severity
**CRITICAL** — Messages are failing to process and accumulating in the DLQ.

## Business Impact
Depends on which queue:
- **payment_processing-dlq**: Payment events not processed — revenue at risk
- **order_processing-dlq**: Orders stuck in processing — fulfillment delayed
- **inventory_events-dlq**: Inventory not updated — overselling risk
- **notification-dlq**: Notifications not sent — customer communication gap

## Customer Impact
Silent failures for customers. They may not receive order confirmations, payment receipts, or delivery notifications.

## Detection
- CloudWatch Alarm fires when DLQ `ApproximateNumberOfMessagesVisible > 0`
- Dashboard: [FreshMart-prod-Messaging](https://console.aws.amazon.com/cloudwatch/home#dashboards:name=FreshMart-prod-Messaging)

---

## Initial Checks

### 1. Confirm DLQ depth and message age
```
AWS SQS → freshmart-prod-<queue>-dlq
Check: ApproximateNumberOfMessagesVisible, ApproximateAgeOfOldestMessage
```

### 2. Inspect a DLQ message to understand the failure
```
SQS → <dlq> → Send and receive messages → Receive messages → Poll
Read: MessageBody + MessageAttributes
Note: correlationId, original message timestamp
```

### 3. Trace the correlationId back to Lambda logs
```
CloudWatch → Logs Insights
Query: FreshMart/prod/CorrelationIdTracing
Replace REPLACE_WITH_CORRELATION_ID with the correlationId from the DLQ message
```

### 4. Identify why the Lambda processor failed
```
CloudWatch → Logs Insights
Log group: /aws/lambda/freshmart-prod-<processor-function>
Query: FreshMart/prod/DLQPoisonMessages
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
fields @timestamp, level, message, service, correlationId, requestId
| filter level = "error"
| filter message like /DLQ/ or message like /dead.letter/ or message like /retry.*exhausted/
| sort @timestamp desc
| limit 50
```

---

## Remediation Actions

### If Lambda processor is broken (code bug):
1. Fix the bug and redeploy the Lambda
2. After fix: redrive messages from DLQ back to main queue (see below)

### If downstream service is unavailable (e.g., DynamoDB throttled):
1. Resolve the downstream issue first
2. Then redrive DLQ messages

### Redrive DLQ messages to main queue:
```
SQS → <dlq> → Dead-letter queue → Start DLQ redrive
Source queue: <dlq>
Destination: main queue (freshmart-prod-<queue>)
Velocity: Start slow (10 msg/s) to avoid overwhelming the processor
```

### If messages are true poison (cannot be processed):
```
SQS → <dlq> → Purge queue  ← ONLY if messages are confirmed unprocessable
```
⚠️ **Purge is permanent.** Ensure all relevant data is captured before purging.

---

## Rollback Procedure
No rollback needed for DLQ. Resolution is:
1. Fix the processor
2. Redrive messages
3. Confirm DLQ depth returns to 0

---

## Escalation Path
| Time | Action |
|---|---|
| 0 min | On-call engineer investigates |
| 10 min | Notify service owner of affected queue |
| 20 min | If payment DLQ: notify Engineering Manager immediately |

## Owner
**Team:** Platform Engineering
**On-call rotation:** PagerDuty → FreshMart-Platform

## Post-Incident Checklist
- [ ] Root cause of message processing failure identified
- [ ] Processor fix deployed
- [ ] DLQ messages redriven and confirmed processed
- [ ] DLQ depth returned to 0
- [ ] Alarm returned to OK
- [ ] Max receive count and retry policy reviewed


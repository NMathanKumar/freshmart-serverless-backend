# FreshMart Monitoring & Observability Guide

FreshMart uses Amazon CloudWatch and AWS X-Ray for end-to-end serverless observability across all microservices, API Gateway, DynamoDB tables, event buses, queues, and edge distributions in `ap-southeast-1`.

---

## 1. Complete Alarm Inventory & Severities

FreshMart deploys **87 CloudWatch Metric Alarms** across all system components.

### Alarm Summary Matrix

| Category | Component / Target | Metric Name | Threshold | Evaluation Period | Severity | Alarm Name Format |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Lambda** | 11 Microservices | `Errors` | ≥ 1 | 5m (1 period) | **P2 / P1** | `freshmart-dev-{service}-lambda-errors` |
| **Lambda** | 11 Microservices | `Duration` | > 25000 ms | 5m (1 period) | **P2** | `freshmart-dev-{service}-lambda-duration` |
| **Lambda** | 11 Microservices | `Throttles` | ≥ 1 | 5m (1 period) | **P2** | `freshmart-dev-{service}-lambda-throttles` |
| **Lambda** | 11 Microservices | `ConcurrentExecutions` | ≥ 800 | 5m (1 period) | **P3** | `freshmart-dev-{service}-lambda-concurrent` |
| **API Gateway** | `freshmart-dev-api` | `5XXError` | ≥ 1 | 5m (1 period) | **P1** | `freshmart-dev-api-5xx` |
| **API Gateway** | `freshmart-dev-api` | `4XXError` | ≥ 50 | 5m (1 period) | **P3** | `freshmart-dev-api-4xx` |
| **API Gateway** | `freshmart-dev-api` | `Latency` | > 1000 ms | 5m (1 period) | **P2** | `freshmart-dev-api-latency` |
| **DynamoDB** | 11 Tables | `ReadThrottleEvents` | ≥ 1 | 5m (1 period) | **P2** | `freshmart-dev-{table}-ddb-read-throttle` |
| **DynamoDB** | 11 Tables | `WriteThrottleEvents` | ≥ 1 | 5m (1 period) | **P1 / P2** | `freshmart-dev-{table}-ddb-write-throttle` |
| **SQS / DLQ** | 3 DLQs | `ApproximateNumberOfMessagesVisible` | ≥ 1 | 5m (1 period) | **P2** | `freshmart-dev-{queue}-dlq-messages` |
| **SQS / Queue**| 3 Queues | `ApproximateAgeOfOldestMessage` | ≥ 300 s | 5m (1 period) | **P3** | `freshmart-dev-{queue}-age` |
| **EventBridge**| 5 Rules | `FailedInvocations` | ≥ 1 | 5m (1 period) | **P2** | `freshmart-dev-eb-{rule}-failed` |
| **SNS** | 3 Topics | `NumberOfNotificationsFailed` | ≥ 1 | 5m (1 period) | **P2** | `freshmart-dev-sns-{topic}-failed` |
| **CloudFront** | 2 Web Apps | `4xxErrorRate` | ≥ 5.0 % | 5m (1 period) | **P3** | `freshmart-dev-{app}-cf-4xx` |
| **CloudFront** | 2 Web Apps | `5xxErrorRate` | ≥ 1.0 % | 5m (1 period) | **P2** | `freshmart-dev-{app}-cf-5xx` |

---

## 2. Dashboard Widget Descriptions

The central CloudWatch dashboard is named **`FreshMart-dev-observability`**.

### 1. Lambda Errors Widget (Top-Left)
- **Metrics**: `AWS/Lambda Errors` for all 11 services.
- **Statistic**: Sum over 5-minute period.
- **Operational Guidance**: Any non-zero bar indicates an unhandled runtime error or crash. Focus on the service with the highest error count first.

### 2. Lambda Duration Widget (Top-Right)
- **Metrics**: `AWS/Lambda Duration` for all 11 services.
- **Statistic**: Average over 5-minute period.
- **Operational Guidance**: Normal baseline is 50-300ms. Sustained elevation above 1000ms points to slow DynamoDB queries, network calls, or Lambda cold starts.

### 3. Lambda Throttles Widget (Middle-Left)
- **Metrics**: `AWS/Lambda Throttles` for all 11 services.
- **Statistic**: Sum over 5-minute period.
- **Operational Guidance**: Throttling occurs when concurrent invocation limits are reached. Immediate mitigation requires increasing reserved concurrency or account limits.

### 4. API Gateway 5XX Widget (Middle-Right)
- **Metrics**: `AWS/ApiGateway 5XXError` for API `freshmart-dev-api` stage `v1`.
- **Statistic**: Sum over 5-minute period.
- **Operational Guidance**: Represents customer-impacting server-side failures. Cross-reference immediately with Lambda Errors and DynamoDB Throttles widgets.

### 5. API Gateway Latency Widget (Bottom-Left)
- **Metrics**: `AWS/ApiGateway Latency` for stage `v1`.
- **Statistic**: Average (and p95 percentile) over 5-minute period.
- **Operational Guidance**: Indicates total user-perceived request delay. Baseline should stay <200ms.

### 6. DynamoDB Read Throttle & Write Throttle Widgets (Bottom-Right & Extended)
- **Metrics**: `AWS/DynamoDB ReadThrottleEvents` & `WriteThrottleEvents` for all 11 tables.
- **Statistic**: Sum over 5-minute period.
- **Operational Guidance**: Indicates table partition capacity exhaustion. On-demand tables auto-scale up to 40,000 WCU / 40,000 RCU; spikes mean key hotness or partition congestion.

---

## 3. CloudWatch Log Insights Useful Queries

Use these queries in CloudWatch Log Insights across log groups `/aws/lambda/freshmart-dev-*` or API Gateway log groups.

### 1. Lambda Error & Stack Trace Finder
Find exact runtime stack traces across all microservices:
```sql
fields @timestamp, @logStream, @message
| filter @message like /(?i)(error|exception|fail|rejected)/
| sort @timestamp desc
| limit 50
```

### 2. API Gateway 5xx Route Breakdown
Identify which HTTP API route is generating 5xx errors:
```sql
fields @timestamp, httpMethod, path, status, responseLength, latency
| filter status >= 500
| stats count(*) as ErrorCount by path, status
| sort ErrorCount desc
```

### 3. Slowest Lambda Executions (>1000ms)
Identify slow handler executions and memory utilization:
```sql
fields @timestamp, @requestId, @duration, @maxMemoryUsed, @message
| filter @type = "REPORT" and @duration > 1000
| sort @duration desc
| limit 20
```

### 4. DynamoDB Latency & Conditional Check Failure Audit
Audit DynamoDB SDK exception logs in Lambda functions:
```sql
fields @timestamp, SERVICE_NAME, @message
| filter @message like /ConditionalCheckFailedException/ or @message like /ProvisionedThroughputExceededException/
| stats count(*) by SERVICE_NAME, @message
```

### 5. EventBridge / SQS Processing Failures
Find failed background message processing attempts:
```sql
fields @timestamp, SERVICE_NAME, @message
| filter @message like /Failed to process SQS message/ or @message like /EventBridge publish failed/
| sort @timestamp desc
| limit 30
```

### 6. Cognito Auth / JWT Token Validation Failures
Trace unauthorized or token expiration errors in `auth-service`:
```sql
fields @timestamp, @message
| filter @message like /Unauthorized/ or @message like /TokenExpiredError/ or @message like /Invalid token/
| stats count(*) by @message
```

---

## 4. Metric Interpretation Guide

| Metric Name | AWS Namespace | Normal Range | Alert Threshold | Operational Action When Breached |
| :--- | :--- | :--- | :--- | :--- |
| `Errors` | `AWS/Lambda` | 0 | ≥ 1 | Check Log Insights for stack traces. Deploy code fix or rollback. |
| `Duration` | `AWS/Lambda` | 50-300ms | > 25,000ms | Optimize database queries or increase Lambda memory size. |
| `Throttles` | `AWS/Lambda` | 0 | ≥ 1 | Request Lambda concurrency limit increase via AWS quota center. |
| `ConcurrentExecutions` | `AWS/Lambda` | 5-100 | ≥ 800 | Check for traffic bursts or recursive event loops. |
| `5XXError` | `AWS/ApiGateway` | 0 | ≥ 1 | Isolate failing backend Lambda integration. |
| `4XXError` | `AWS/ApiGateway` | <10/min | ≥ 50 | Audit client authentication or invalid API payload formatting. |
| `Latency` | `AWS/ApiGateway` | <200ms | > 1000ms | Trace route latency breakdown in AWS X-Ray. |
| `ReadThrottleEvents` | `AWS/DynamoDB` | 0 | ≥ 1 | Review GSI and partition key design for read hotness. |
| `WriteThrottleEvents` | `AWS/DynamoDB` | 0 | ≥ 1 | Check batch write rates; switch table to on-demand capacity mode. |
| `ApproximateNumberOfMessagesVisible` | `AWS/SQS` | 0 (in DLQ) | ≥ 1 (DLQ) | Inspect DLQ messages using AWS CLI and redrive to main queue. |
| `ApproximateAgeOfOldestMessage` | `AWS/SQS` | <30s | ≥ 300s | Scale up consumer Lambda concurrency or batch size. |
| `FailedInvocations` | `AWS/EventBridge` | 0 | ≥ 1 | Check IAM role policies for EventBridge target permissions. |
| `NumberOfNotificationsFailed` | `AWS/SNS` | 0 | ≥ 1 | Verify SQS queue subscription policy permissions. |

---

## 5. Synthetic Monitoring Explanation

FreshMart uses **AWS CloudWatch Synthetics (Canaries)** to run continuous automated health checks against active API routes.

```
+------------------+         +-------------------------------+         +-----------------------+
|  Synthetics      | ----->  | GET /admin/health             | ----->  | Expected 200 OK       |
|  Canary Worker   | ----->  | GET /products                 | ----->  | Payload validate json |
|  (Runs every 1m) | ----->  | POST /auth/login (test user)  | ----->  | Check JWT return token|
+------------------+         +-------------------------------+         +-----------------------+
```

### Canary Architecture & Configuration
- **Script Engine**: Node.js Puppeteer / Playwright synth-nodejs runner.
- **Frequency**: Runs every 60 seconds from `ap-southeast-1`.
- **Monitored Endpoints**:
  1. `GET /admin/health` — Verifies underlying API Gateway and Admin service connectivity.
  2. `GET /products` — Verifies catalog reading and DynamoDB `products` table query latency.
  3. `POST /auth/login` — Synthetic login test using dedicated operational health test account.
- **Alert Routing**: Canary failure triggers the P1 alarm `freshmart-dev-canary-failure`, which immediately pages the Level 1 On-Call Engineer.
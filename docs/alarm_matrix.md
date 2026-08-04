# FreshMart Comprehensive Alarm Response Matrix

This document lists all **87 CloudWatch Metric Alarms** deployed in the FreshMart serverless backend (`ap-southeast-1`). It serves as the definitive reference guide for On-Call Engineers responding to alerts.

---

## 1. Lambda Metric Alarms (44 Alarms)

### 1.1 Lambda Error Alarms (`Errors >= 1`)

| Alarm Name | Metric | Threshold | Severity | Response Action | Escalation | Runbook Section |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `freshmart-dev-auth-lambda-errors` | `Errors` | Sum ≥ 1 (5m) | **P1** | Inspect `auth-service` logs in Log Insights for JWT/Cognito exception. | Level 2 Lead | Runbook § 1 & Inc. Resp. § 6.1 |
| `freshmart-dev-order-lambda-errors` | `Errors` | Sum ≥ 1 (5m) | **P1** | Inspect `order-service` logs for transaction/DDB rollback failures. | Level 2 Lead | Runbook § 1 & Inc. Resp. § 6.1 |
| `freshmart-dev-payment-lambda-errors` | `Errors` | Sum ≥ 1 (5m) | **P1** | Check `payment-service` logs for gateway integration errors. | Level 2 Lead | Runbook § 1 & Inc. Resp. § 6.1 |
| `freshmart-dev-inventory-lambda-errors` | `Errors` | Sum ≥ 1 (5m) | **P2** | Check `inventory-service` logs for stock mutation failure. | Level 1 On-Call | Runbook § 1 & Inc. Resp. § 6.1 |
| `freshmart-dev-product-lambda-errors` | `Errors` | Sum ≥ 1 (5m) | **P2** | Check `product-service` logs for catalog CRUD failures. | Level 1 On-Call | Runbook § 1 & Inc. Resp. § 6.1 |
| `freshmart-dev-menu-lambda-errors` | `Errors` | Sum ≥ 1 (5m) | **P2** | Check `menu-service` logs for catalog search exception. | Level 1 On-Call | Runbook § 1 & Inc. Resp. § 6.1 |
| `freshmart-dev-cart-lambda-errors` | `Errors` | Sum ≥ 1 (5m) | **P2** | Check `cart-service` logs for item update failures. | Level 1 On-Call | Runbook § 1 & Inc. Resp. § 6.1 |
| `freshmart-dev-user-lambda-errors` | `Errors` | Sum ≥ 1 (5m) | **P2** | Check `user-service` logs for profile fetch failures. | Level 1 On-Call | Runbook § 1 & Inc. Resp. § 6.1 |
| `freshmart-dev-notification-lambda-errors`| `Errors` | Sum ≥ 1 (5m) | **P2** | Check `notification-service` logs for email/push dispatch exception. | Level 1 On-Call | Runbook § 1 & Inc. Resp. § 6.1 |
| `freshmart-dev-analytics-lambda-errors` | `Errors` | Sum ≥ 1 (5m) | **P3** | Check `analytics-service` logs for reporting data aggregation failure. | Level 1 On-Call | Runbook § 1 & Inc. Resp. § 6.1 |
| `freshmart-dev-admin-lambda-errors` | `Errors` | Sum ≥ 1 (5m) | **P3** | Check `admin-service` logs for config/audit endpoint failure. | Level 1 On-Call | Runbook § 1 & Inc. Resp. § 6.1 |

### 1.2 Lambda Duration Alarms (`Duration > 25,000ms`)

| Alarm Name | Metric | Threshold | Severity | Response Action | Escalation | Runbook Section |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `freshmart-dev-auth-lambda-duration` | `Duration` | Avg > 25,000ms (5m) | **P2** | Check Cognito endpoint network latency and DDB query plan. | Level 1 On-Call | Runbook § 3 |
| `freshmart-dev-order-lambda-duration` | `Duration` | Avg > 25,000ms (5m) | **P2** | Inspect order transaction lock times and DDB latency. | Level 2 Lead | Runbook § 3 |
| `freshmart-dev-payment-lambda-duration` | `Duration` | Avg > 25,000ms (5m) | **P2** | Trace external payment gateway response times in X-Ray. | Level 2 Lead | Runbook § 3 |
| `freshmart-dev-inventory-lambda-duration` | `Duration` | Avg > 25,000ms (5m) | **P2** | Check inventory table query scan sizes and cold starts. | Level 1 On-Call | Runbook § 3 |
| `freshmart-dev-product-lambda-duration` | `Duration` | Avg > 25,000ms (5m) | **P2** | Check product category index query execution duration. | Level 1 On-Call | Runbook § 3 |
| `freshmart-dev-menu-lambda-duration` | `Duration` | Avg > 25,000ms (5m) | **P2** | Review menu item search payload size and cold start init. | Level 1 On-Call | Runbook § 3 |
| `freshmart-dev-cart-lambda-duration` | `Duration` | Avg > 25,000ms (5m) | **P2** | Inspect multi-item cart calculation execution times. | Level 1 On-Call | Runbook § 3 |
| `freshmart-dev-user-lambda-duration` | `Duration` | Avg > 25,000ms (5m) | **P3** | Review user profile lookup index performance. | Level 1 On-Call | Runbook § 3 |
| `freshmart-dev-notification-lambda-duration`| `Duration` | Avg > 25,000ms (5m) | **P3** | Inspect SQS batch processing execution duration. | Level 1 On-Call | Runbook § 3 |
| `freshmart-dev-analytics-lambda-duration` | `Duration` | Avg > 25,000ms (5m) | **P3** | Review analytics S3 dump aggregation duration. | Level 1 On-Call | Runbook § 3 |
| `freshmart-dev-admin-lambda-duration` | `Duration` | Avg > 25,000ms (5m) | **P3** | Check administrative reporting query execution times. | Level 1 On-Call | Runbook § 3 |

### 1.3 Lambda Throttle Alarms (`Throttles >= 1`)

| Alarm Name | Metric | Threshold | Severity | Response Action | Escalation | Runbook Section |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `freshmart-dev-auth-lambda-throttles` | `Throttles` | Sum ≥ 1 (5m) | **P1** | Increase reserved concurrency for `auth-service`. | Level 2 Lead | Inc. Resp. § 6.1 |
| `freshmart-dev-order-lambda-throttles` | `Throttles` | Sum ≥ 1 (5m) | **P1** | Increase reserved concurrency for `order-service`. | Level 2 Lead | Inc. Resp. § 6.1 |
| `freshmart-dev-payment-lambda-throttles` | `Throttles` | Sum ≥ 1 (5m) | **P1** | Increase reserved concurrency for `payment-service`. | Level 2 Lead | Inc. Resp. § 6.1 |
| `freshmart-dev-inventory-lambda-throttles` | `Throttles` | Sum ≥ 1 (5m) | **P2** | Check regional AWS account concurrency quota. | Level 1 On-Call | Inc. Resp. § 6.1 |
| `freshmart-dev-product-lambda-throttles` | `Throttles` | Sum ≥ 1 (5m) | **P2** | Inspect product catalog traffic spikes. | Level 1 On-Call | Inc. Resp. § 6.1 |
| `freshmart-dev-menu-lambda-throttles` | `Throttles` | Sum ≥ 1 (5m) | **P2** | Review menu route traffic burst pattern. | Level 1 On-Call | Inc. Resp. § 6.1 |
| `freshmart-dev-cart-lambda-throttles` | `Throttles` | Sum ≥ 1 (5m) | **P2** | Increase unreserved concurrency limit pool. | Level 1 On-Call | Inc. Resp. § 6.1 |
| `freshmart-dev-user-lambda-throttles` | `Throttles` | Sum ≥ 1 (5m) | **P3** | Review user profile lookup request rate. | Level 1 On-Call | Inc. Resp. § 6.1 |
| `freshmart-dev-notification-lambda-throttles`| `Throttles` | Sum ≥ 1 (5m) | **P3** | Adjust SQS event source concurrency limits. | Level 1 On-Call | Inc. Resp. § 6.1 |
| `freshmart-dev-analytics-lambda-throttles` | `Throttles` | Sum ≥ 1 (5m) | **P3** | Check analytics worker batch invocation rate. | Level 1 On-Call | Inc. Resp. § 6.1 |
| `freshmart-dev-admin-lambda-throttles` | `Throttles` | Sum ≥ 1 (5m) | **P3** | Check admin dashboard request rate. | Level 1 On-Call | Inc. Resp. § 6.1 |

### 1.4 Lambda Concurrent Execution Alarms (`ConcurrentExecutions >= 800`)

| Alarm Name | Metric | Threshold | Severity | Response Action | Escalation | Runbook Section |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `freshmart-dev-auth-lambda-concurrent` | `ConcurrentExecutions` | Max ≥ 800 (5m) | **P2** | Monitor auth concurrency burst; request account quota raise. | Level 2 Lead | Runbook § 3 |
| `freshmart-dev-order-lambda-concurrent` | `ConcurrentExecutions` | Max ≥ 800 (5m) | **P2** | Check for order creation event loops or flash sale surge. | Level 2 Lead | Runbook § 3 |
| `freshmart-dev-payment-lambda-concurrent` | `ConcurrentExecutions` | Max ≥ 800 (5m) | **P2** | Audit payment callback execution concurrency. | Level 2 Lead | Runbook § 3 |
| `freshmart-dev-inventory-lambda-concurrent` | `ConcurrentExecutions` | Max ≥ 800 (5m) | **P3** | Inspect SQS inventory processing worker concurrency. | Level 1 On-Call | Runbook § 4 |
| `freshmart-dev-product-lambda-concurrent` | `ConcurrentExecutions` | Max ≥ 800 (5m) | **P3** | Check public product listing traffic surge. | Level 1 On-Call | Runbook § 3 |
| `freshmart-dev-menu-lambda-concurrent` | `ConcurrentExecutions` | Max ≥ 800 (5m) | **P3** | Check public menu browsing concurrency. | Level 1 On-Call | Runbook § 3 |
| `freshmart-dev-cart-lambda-concurrent` | `ConcurrentExecutions` | Max ≥ 800 (5m) | **P3** | Inspect cart write concurrency. | Level 1 On-Call | Runbook § 3 |
| `freshmart-dev-user-lambda-concurrent` | `ConcurrentExecutions` | Max ≥ 800 (5m) | **P3** | Review user profile request volume. | Level 1 On-Call | Runbook § 3 |
| `freshmart-dev-notification-lambda-concurrent`| `ConcurrentExecutions` | Max ≥ 800 (5m) | **P3** | Adjust SQS notification trigger batch size. | Level 1 On-Call | Runbook § 4 |
| `freshmart-dev-analytics-lambda-concurrent` | `ConcurrentExecutions` | Max ≥ 800 (5m) | **P3** | Adjust analytics SQS event source mapping. | Level 1 On-Call | Runbook § 4 |
| `freshmart-dev-admin-lambda-concurrent` | `ConcurrentExecutions` | Max ≥ 800 (5m) | **P4** | Audit administrative API request loops. | Level 1 On-Call | Runbook § 3 |

---

## 2. API Gateway Metric Alarms (3 Alarms)

| Alarm Name | Metric | Threshold | Severity | Response Action | Escalation | Runbook Section |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `freshmart-dev-api-5xx` | `5XXError` | Sum ≥ 1 (5m) | **P1** | Immediate triage of HTTP 500/502/504 errors via Log Insights. | Level 2 Lead | Runbook § 1 & Inc. Resp. § 6.2 |
| `freshmart-dev-api-4xx` | `4XXError` | Sum ≥ 50 (5m) | **P3** | Audit client authentication, CORS headers, or broken UI routes. | Level 1 On-Call | Inc. Resp. § 6.2 |
| `freshmart-dev-api-latency` | `Latency` | Avg > 1000ms (5m) | **P2** | Analyze end-to-end API response time breakdown in X-Ray. | Level 1 On-Call | Runbook § 1 |

---

## 3. DynamoDB Metric Alarms (22 Alarms)

### 3.1 Read Throttle Events (`ReadThrottleEvents >= 1`)

| Alarm Name | Metric | Threshold | Severity | Response Action | Escalation | Runbook Section |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `freshmart-dev-auth_users-ddb-read-throttle` | `ReadThrottleEvents` | Sum ≥ 1 (5m) | **P2** | Inspect `auth_users` table partition hotness / EmailIndex. | Level 1 On-Call | Inc. Resp. § 6.3 |
| `freshmart-dev-orders-ddb-read-throttle` | `ReadThrottleEvents` | Sum ≥ 1 (5m) | **P2** | Inspect `orders` table customer-index read capacity. | Level 1 On-Call | Inc. Resp. § 6.3 |
| `freshmart-dev-payments-ddb-read-throttle` | `ReadThrottleEvents` | Sum ≥ 1 (5m) | **P2** | Check `payments` table order-index read query rate. | Level 1 On-Call | Inc. Resp. § 6.3 |
| `freshmart-dev-products-ddb-read-throttle` | `ReadThrottleEvents` | Sum ≥ 1 (5m) | **P2** | Review `products` category-index read throughput. | Level 1 On-Call | Inc. Resp. § 6.3 |
| `freshmart-dev-catalog_items-ddb-read-throttle`| `ReadThrottleEvents` | Sum ≥ 1 (5m) | **P2** | Check `catalog_items` CategoryIndex read throughput. | Level 1 On-Call | Inc. Resp. § 6.3 |
| `freshmart-dev-inventory-ddb-read-throttle` | `ReadThrottleEvents` | Sum ≥ 1 (5m) | **P2** | Inspect `inventory` warehouse-index partition throughput. | Level 1 On-Call | Inc. Resp. § 6.3 |
| `freshmart-dev-carts-ddb-read-throttle` | `ReadThrottleEvents` | Sum ≥ 1 (5m) | **P2** | Check `carts` table read throughput. | Level 1 On-Call | Inc. Resp. § 6.3 |
| `freshmart-dev-user_profiles-ddb-read-throttle`| `ReadThrottleEvents` | Sum ≥ 1 (5m) | **P3** | Review `user_profiles` table read throughput. | Level 1 On-Call | Inc. Resp. § 6.3 |
| `freshmart-dev-notifications-ddb-read-throttle`| `ReadThrottleEvents` | Sum ≥ 1 (5m) | **P3** | Review `notifications` GSI read capacity. | Level 1 On-Call | Inc. Resp. § 6.3 |
| `freshmart-dev-analytics-ddb-read-throttle` | `ReadThrottleEvents` | Sum ≥ 1 (5m) | **P3** | Review `analytics` table read capacity. | Level 1 On-Call | Inc. Resp. § 6.3 |
| `freshmart-dev-admin-ddb-read-throttle` | `ReadThrottleEvents` | Sum ≥ 1 (5m) | **P3** | Inspect `admin` table GSI read throughput. | Level 1 On-Call | Inc. Resp. § 6.3 |

### 3.2 Write Throttle Events (`WriteThrottleEvents >= 1`)

| Alarm Name | Metric | Threshold | Severity | Response Action | Escalation | Runbook Section |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `freshmart-dev-orders-ddb-write-throttle` | `WriteThrottleEvents` | Sum ≥ 1 (5m) | **P1** | Switch `orders` table to On-Demand capacity immediately. | Level 2 Lead | Inc. Resp. § 6.3 |
| `freshmart-dev-payments-ddb-write-throttle` | `WriteThrottleEvents` | Sum ≥ 1 (5m) | **P1** | Switch `payments` table to On-Demand capacity. | Level 2 Lead | Inc. Resp. § 6.3 |
| `freshmart-dev-auth_users-ddb-write-throttle` | `WriteThrottleEvents` | Sum ≥ 1 (5m) | **P2** | Inspect user registration write bursts on `auth_users`. | Level 1 On-Call | Inc. Resp. § 6.3 |
| `freshmart-dev-inventory-ddb-write-throttle` | `WriteThrottleEvents` | Sum ≥ 1 (5m) | **P2** | Inspect inventory stock deduction write capacity. | Level 1 On-Call | Inc. Resp. § 6.3 |
| `freshmart-dev-carts-ddb-write-throttle` | `WriteThrottleEvents` | Sum ≥ 1 (5m) | **P2** | Check cart mutation write burst rate. | Level 1 On-Call | Inc. Resp. § 6.3 |
| `freshmart-dev-products-ddb-write-throttle` | `WriteThrottleEvents` | Sum ≥ 1 (5m) | **P2** | Review product catalog write capacity. | Level 1 On-Call | Inc. Resp. § 6.3 |
| `freshmart-dev-catalog_items-ddb-write-throttle`| `WriteThrottleEvents` | Sum ≥ 1 (5m) | **P2** | Check catalog items update write throughput. | Level 1 On-Call | Inc. Resp. § 6.3 |
| `freshmart-dev-user_profiles-ddb-write-throttle`| `WriteThrottleEvents` | Sum ≥ 1 (5m) | **P3** | Review profile update write capacity. | Level 1 On-Call | Inc. Resp. § 6.3 |
| `freshmart-dev-notifications-ddb-write-throttle`| `WriteThrottleEvents` | Sum ≥ 1 (5m) | **P3** | Inspect notification persistence write rates. | Level 1 On-Call | Inc. Resp. § 6.3 |
| `freshmart-dev-analytics-ddb-write-throttle` | `WriteThrottleEvents` | Sum ≥ 1 (5m) | **P3** | Inspect analytics worker write rates. | Level 1 On-Call | Inc. Resp. § 6.3 |
| `freshmart-dev-admin-ddb-write-throttle` | `WriteThrottleEvents` | Sum ≥ 1 (5m) | **P3** | Review admin audit log write capacity. | Level 1 On-Call | Inc. Resp. § 6.3 |

---

## 4. SQS & DLQ Metric Alarms (6 Alarms)

| Alarm Name | Metric | Threshold | Severity | Response Action | Escalation | Runbook Section |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `freshmart-dev-inventory_processing-dlq-messages` | `ApproximateNumberOfMessagesVisible` | Sum ≥ 1 (5m) | **P2** | Peek DLQ messages; fix consumer bug; execute SQS redrive. | Level 1 On-Call | Runbook § 2 & Inc. Resp. § 6.4 |
| `freshmart-dev-notification_processing-dlq-messages`| `ApproximateNumberOfMessagesVisible` | Sum ≥ 1 (5m) | **P2** | Inspect failed notification messages in DLQ; redrive. | Level 1 On-Call | Runbook § 2 & Inc. Resp. § 6.4 |
| `freshmart-dev-analytics_processing-dlq-messages` | `ApproximateNumberOfMessagesVisible` | Sum ≥ 1 (5m) | **P2** | Inspect failed analytics payloads in DLQ; redrive. | Level 1 On-Call | Runbook § 2 & Inc. Resp. § 6.4 |
| `freshmart-dev-inventory_processing-queue-age` | `ApproximateAgeOfOldestMessage` | Max ≥ 300s (5m) | **P3** | Increase inventory worker batch size or concurrency. | Level 1 On-Call | Runbook § 4 |
| `freshmart-dev-notification_processing-queue-age` | `ApproximateAgeOfOldestMessage` | Max ≥ 300s (5m) | **P3** | Increase notification worker batch size. | Level 1 On-Call | Runbook § 4 |
| `freshmart-dev-analytics_processing-queue-age` | `ApproximateAgeOfOldestMessage` | Max ≥ 300s (5m) | **P3** | Increase analytics worker batch size. | Level 1 On-Call | Runbook § 4 |

---

## 5. EventBridge Metric Alarms (5 Alarms)

| Alarm Name | Metric | Threshold | Severity | Response Action | Escalation | Runbook Section |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `freshmart-dev-eb-orders-failed` | `FailedInvocations` | Sum ≥ 1 (5m) | **P2** | Check order event target SNS policy and pattern matching. | Level 1 On-Call | Runbook § 5 & Inc. Resp. § 6.5 |
| `freshmart-dev-eb-customers-failed` | `FailedInvocations` | Sum ≥ 1 (5m) | **P2** | Check customer event target SNS topic permissions. | Level 1 On-Call | Runbook § 5 & Inc. Resp. § 6.5 |
| `freshmart-dev-eb-inventory-failed` | `FailedInvocations` | Sum ≥ 1 (5m) | **P2** | Inspect inventory event target subscription. | Level 1 On-Call | Runbook § 5 & Inc. Resp. § 6.5 |
| `freshmart-dev-eb-products-failed` | `FailedInvocations` | Sum ≥ 1 (5m) | **P2** | Check product event rule matching pattern. | Level 1 On-Call | Runbook § 5 & Inc. Resp. § 6.5 |
| `freshmart-dev-eb-payments-failed` | `FailedInvocations` | Sum ≥ 1 (5m) | **P2** | Inspect payment event target delivery permissions. | Level 1 On-Call | Runbook § 5 & Inc. Resp. § 6.5 |

---

## 6. SNS Metric Alarms (3 Alarms)

| Alarm Name | Metric | Threshold | Severity | Response Action | Escalation | Runbook Section |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `freshmart-dev-sns-order_events-failed` | `NumberOfNotificationsFailed` | Sum ≥ 1 (5m) | **P2** | Verify SQS queue policy allows SNS topic `SendMessage`. | Level 1 On-Call | Runbook § 5 |
| `freshmart-dev-sns-customer_events-failed` | `NumberOfNotificationsFailed` | Sum ≥ 1 (5m) | **P2** | Check notification processing queue subscription status. | Level 1 On-Call | Runbook § 5 |
| `freshmart-dev-sns-inventory_events-failed` | `NumberOfNotificationsFailed` | Sum ≥ 1 (5m) | **P2** | Inspect inventory processing queue subscription policy. | Level 1 On-Call | Runbook § 5 |

---

## 7. CloudFront Metric Alarms (4 Alarms)

| Alarm Name | Metric | Threshold | Severity | Response Action | Escalation | Runbook Section |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `freshmart-dev-customer-cf-5xx` | `5xxErrorRate` | Avg ≥ 1.0% (5m) | **P2** | Check customer web S3 origin OAC permissions & cache. | Level 1 On-Call | Runbook § 6 & Inc. Resp. § 6.6 |
| `freshmart-dev-admin-cf-5xx` | `5xxErrorRate` | Avg ≥ 1.0% (5m) | **P2** | Check admin web S3 origin accessibility. | Level 1 On-Call | Runbook § 6 & Inc. Resp. § 6.6 |
| `freshmart-dev-customer-cf-4xx` | `4xxErrorRate` | Avg ≥ 5.0% (5m) | **P3** | Check customer web SPA routing rules / 404 index.html fallback. | Level 1 On-Call | Runbook § 6 |
| `freshmart-dev-admin-cf-4xx` | `4xxErrorRate` | Avg ≥ 5.0% (5m) | **P3** | Audit admin web static asset requests. | Level 1 On-Call | Runbook § 6 |

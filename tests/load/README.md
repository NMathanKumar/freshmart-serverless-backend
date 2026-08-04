# FreshMart Artillery Load Testing Suite

This directory contains Artillery load testing configurations for the FreshMart Serverless API.

## Installation

Artillery can be executed directly using `npx`:

```bash
npx artillery --version
```

Alternatively, to install it locally in your project dependencies:

```bash
npm install --save-dev artillery
```

---

## Running Load Tests

### 1. Production Load Test (Production-Safe)

Executes a conservative, non-destructive load test targeted at production/live environments.

```bash
npx artillery run tests/load/artillery.yml
```

Or via npm script:

```bash
npm run test:load
```

### 2. Staging / Dev Load Test

Executes a high-concurrency load test for staging and local development validation up to 100 Virtual Users (VUs).

```bash
npx artillery run tests/load/artillery-staging.yml
```

Or via npm script:

```bash
npm run test:load:staging
```

### 3. Generating HTML Performance Reports

Runs the production load test, saves execution statistics to JSON, and generates a interactive visual HTML report:

```bash
npx artillery run --output report.json tests/load/artillery.yml && npx artillery report report.json
```

Or via npm script:

```bash
npm run test:load:report
```

---

## Production Safety Rules

To safely run load tests against production serverless infrastructure without causing service degradation, billing spikes, or state corruption, all tests must adhere to the following rules:

1. **GET-Only Endpoints**: Only read endpoints (`GET`) are invoked. No `POST`, `PUT`, `PATCH`, or `DELETE` requests are allowed in production test configurations.
2. **Strict Concurrency Limits**: Production virtual users (VUs) are capped at a maximum of 10 concurrent VUs (`arrivalRate` 2 → 5 → 10).
3. **Non-Destructive Target Endpoints**: Load tests target only public catalog and health check endpoints (`/v1/products`, `/v1/products/search?q=fresh`, `/v1/menu`, `/v1/admin/health`).
4. **Monitoring & Alerting**: Keep AWS CloudWatch metrics (API Gateway latency, Lambda concurrent executions, DynamoDB read capacity) visible during test execution.
5. **Off-Peak Execution**: Perform production load testing during scheduled off-peak windows with team notification.

---

## Service Level Objectives (SLOs) & Thresholds

The load tests utilize Artillery's `ensure` plugin to automatically validate key performance SLOs:

| Metric | Threshold | Meaning |
| :--- | :--- | :--- |
| `http.response_time.p95` | `< 500ms` | 95% of all requests must complete under 500 ms for smooth end-user experience. |
| `http.response_time.p99` | `< 2000ms` | 99% of requests must complete under 2 seconds, accounting for occasional Lambda cold-starts. |
| `http.response_time.max` | `< 5000ms` | No single HTTP request is allowed to exceed 5 seconds. |
| `Error Rate` | `< 1%` | At least 99% of all requests must succeed (HTTP status code 200). |

# FreshMart – Dashboard Navigation Hub

> **Version:** 1.0  
> All dashboards are in AWS CloudWatch, region `ap-southeast-1`.

---

## Dashboard Index

| Dashboard | URL | Primary Audience | Update Frequency |
|---|---|---|---|
| 🏆 **Executive Command Center** | [FreshMart-prod-Executive](https://ap-southeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-southeast-1#dashboards:name=FreshMart-prod-Executive) | Leadership, Mentors, Evaluators | Real-time |
| ⚙️ **Operations** | [FreshMart-prod-Operations](https://ap-southeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-southeast-1#dashboards:name=FreshMart-prod-Operations) | SRE, On-call Engineers | Real-time |
| 📊 **SLA & Error Budget** | [FreshMart-prod-SLA](https://ap-southeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-southeast-1#dashboards:name=FreshMart-prod-SLA) | SRE, Architects | Real-time |
| 🔐 **Security** | [FreshMart-prod-Security](https://ap-southeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-southeast-1#dashboards:name=FreshMart-prod-Security) | Security Team | Real-time |
| 💰 **FinOps & Cost** | [FreshMart-prod-FinOps](https://ap-southeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-southeast-1#dashboards:name=FreshMart-prod-FinOps) | FinOps, Eng Lead | Daily |
| 🔬 **Synthetics** | [FreshMart-prod-Synthetics](https://ap-southeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-southeast-1#dashboards:name=FreshMart-prod-Synthetics) | QA, SRE | Real-time |
| 🌐 **API Gateway** | [FreshMart-prod-API](https://ap-southeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-southeast-1#dashboards:name=FreshMart-prod-API) | Backend Engineers | Real-time |
| ⚡ **Lambda** | [FreshMart-prod-Lambda](https://ap-southeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-southeast-1#dashboards:name=FreshMart-prod-Lambda) | Backend Engineers | Real-time |
| 🗄️ **Database** | [FreshMart-prod-Database](https://ap-southeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-southeast-1#dashboards:name=FreshMart-prod-Database) | Backend, Data Engineers | Real-time |
| 📨 **Messaging** | [FreshMart-prod-Messaging](https://ap-southeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-southeast-1#dashboards:name=FreshMart-prod-Messaging) | Integration Engineers | Real-time |

---

## Decision Guide: Which Dashboard to Open First?

```
Incident fired?
├── Platform-wide outage   → Executive → Operations → X-Ray Service Map
├── API error spike        → API → Lambda → Logs Insights (ErrorRateByService)
├── Slow responses         → API (P95/P99) → Lambda (Duration) → X-Ray (traces)
├── Database issue         → Database → DynamoDB Throttles → Logs Insights
├── Queue buildup          → Messaging → DLQ → SQS Queue Depth
├── Failed synthetic       → Synthetics → Canary Artifacts → Login/Cart scripts
├── Security alert         → Security → Logs Insights (CorrelationIdTracing)
└── Budget alert           → FinOps → AWS Budgets Console → Cost Explorer
```

---

## Key Saved Logs Insights Queries

Access via: CloudWatch → Logs Insights → Saved queries

| Query Name | Use For |
|---|---|
| `ErrorRateByService` | Which service is failing most? |
| `TopErroringFunctions` | Which Lambda functions are erroring? |
| `TopSlowestFunctions` | Latency outliers per function |
| `CorrelationIdTracing` | End-to-end request trace by correlationId |
| `RecentDeploymentErrors` | Errors introduced after the last deployment |
| `DLQPoisonMessages` | Messages stuck in dead-letter queues |
| `ExceptionHeatmap24h` | Where are errors concentrated over 24h? |
| `ColdStartAnalysis` | Cold start frequency and duration by function |

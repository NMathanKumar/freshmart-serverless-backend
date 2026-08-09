# FreshMart Observability Platform – Demo Script

**Objective**: Concisely demonstrate the maturity of the FreshMart serverless observability platform during an evaluation review. Show architecture, live data, incident investigation flow, and infrastructure-as-code stability.

**Duration**: 10-15 Minutes

---

## 1. Introduction (2 mins)
**Goal**: Establish the scope and enterprise nature of the platform.

* **Speaker Notes**: "Welcome. Today I'll demonstrate the FreshMart observability platform. This isn't just a basic monitoring setup; it's a production-grade, multi-domain observability architecture deployed 100% via Terraform. We cover application performance, platform reliability, security, and FinOps."
* **Visual**: Show the [ADR repository](../adr/) or a high-level architecture diagram. Briefly mention the 4 tiers of dashboards (Executive, Domain, Technical, Security/FinOps).

## 2. Infrastructure as Code Validation (2 mins)
**Goal**: Prove the environment is drift-free and consistently managed.

* **Action**: Open terminal in `terraform/environments/prod`.
* **Action**: Run `terraform plan -var="internal_service_token=mock-token"`.
* **Speaker Notes**: "Everything I'm about to show you is codified in modular Terraform. As you can see from this live plan, there are over 400 resources deployed, and the environment is completely drift-free."

## 3. The Executive View (2 mins)
**Goal**: Show how non-engineers view the platform's health.

* **Action**: Open the **FreshMart-prod-Executive** CloudWatch Dashboard.
* **Speaker Notes**: "We start at the highest level. The Executive dashboard rolls up our core SLIs, platform availability, and aggregate business metrics. It uses composite alarms to reduce noise. If a major outage occurs, the composite alarm triggers and this dashboard reflects the aggregate impact immediately without overwhelming stakeholders with 50 individual lambda alerts."

## 4. Incident Investigation Flow (5 mins)
**Goal**: Demonstrate MTTR (Mean Time to Resolution) reduction using integrated tools.

* **Scenario**: "Let's simulate a situation where the `Payment` service experiences a spike in latency and errors."
* **Action (Operations Dashboard)**: Open the **FreshMart-prod-Operations** Dashboard. Point out the API Gateway 5XX errors or Lambda Error rates. "First, our Operations dashboard highlights the exact domain failing."
* **Action (CloudWatch Alarms)**: Show the CloudWatch Alarms console. Highlight the `Composite-Database-Failure-Critical` or `Lambda-Compute-ErrorRate-Critical-payment` alarms. "Our alarms are routed by severity. Critical alerts hit PagerDuty via SNS."
* **Action (Logs Insights)**: Open Logs Insights and execute the **ErrorRateByService** or **TopErroringFunctions** saved query. "We don't manually grep logs. We use centralized Logs Insights saved queries to instantly identify the failing function and the specific exception."
* **Action (X-Ray Service Map)**: Open X-Ray Service Map. Trace a slow payment request from API Gateway -> Lambda -> DynamoDB. "Because we have tiered X-Ray sampling—100% for payments, 5% for standard traffic—we can visually pinpoint if the latency is in our code or the database layer."

## 5. Proactive Monitoring & FinOps (3 mins)
**Goal**: Show advanced capabilities beyond basic reactive monitoring.

* **Action (Synthetics)**: Open CloudWatch Synthetics. Show the `freshmart-prod-payment-sandbox` canary. "We don't wait for users to report errors. Our headless browser canaries validate critical journeys 24/7. Stage D canaries safely hit our payment sandboxes."
* **Action (FinOps Dashboard & Budgets)**: Open AWS Budgets and the FinOps dashboard. "Serverless scales automatically, which means costs can scale automatically too. We have dedicated Budgets per service (Lambda, DynamoDB) and Cost Anomaly Detection to catch billing spikes before the end of the month."

## 6. Conclusion (1 min)
**Goal**: Wrap up.

* **Speaker Notes**: "In summary, the FreshMart observability platform provides full lifecycle visibility, from frontend UI canaries to backend database partitions, secured and cost-managed, all deployed reproducibly through Terraform. Thank you."

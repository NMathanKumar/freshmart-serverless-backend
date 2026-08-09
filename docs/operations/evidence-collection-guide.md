# Evidence Collection Guide for Reviewers

When presenting your observability project for final review or evaluation, we strongly recommend compiling objective evidence into a portfolio. This proves that your Terraform configurations weren't just valid syntactically, but they were deployed, functional, and actually observing real traffic in an AWS account.

Use this checklist to gather screenshots and logs before destroying your infrastructure.

## 1. Dashboards

Take screenshots of the following CloudWatch dashboards showing actual widgets and graphs:

- [ ] **Executive Dashboard**: Capture the SLO/SLA widgets, composite alarms, and high-level health metrics.
- [ ] **Operations Dashboard**: Capture the domain-level metrics (API, Lambda, DB, Messaging) all loading correctly on one pane.
- [ ] **Security Dashboard**: Capture the failed logins, privilege escalation, and brute-force tracking graphs.
- [ ] **FinOps Dashboard**: Capture the Lambda invocations and estimated costs, along with API request volumes.
- [ ] **Synthetics Dashboard**: Capture the canary success percentages and duration graphs.

## 2. Infrastructure as Code Validation

- [ ] Take a screenshot or save the terminal output of `terraform plan` showing the exact phrase: 
  > **No changes. Your infrastructure matches the configuration.**
- [ ] Optionally, save the successful output log from your final `terraform apply` step.

## 3. Alerts and Incidents

- [ ] **CloudWatch Alarms Page**: Take a screenshot of the `All Alarms` page showing the active state of several alarms (many should be `OK`, and it should show `Composite` alarms at the top).
- [ ] **SNS Topics**: Take a screenshot of the SNS topics page to prove that the alerts are wired to actual notification targets (Warning, Critical, Info topics).

## 4. Diagnostics Tools in Action

- [ ] **X-Ray Service Map**: Trigger some API requests on your application, then take a screenshot of the X-Ray Service map showing the topology from API Gateway -> Lambda -> DynamoDB.
- [ ] **Logs Insights**: Run one of the saved queries (e.g., `ErrorRateByService` or `RecentDeploymentErrors`), and take a screenshot of the output table.
- [ ] **Synthetics Canary Details**: Click into one of the running canaries (e.g., `freshmart-prod-payment-sandbox`) and capture a screenshot of the successful step execution history, screenshot artifacts, and HAR trace.

## 5. Cost Governance

- [ ] **AWS Budgets**: Take a screenshot of the Billing Console -> Budgets showing your 5 configured budgets (Overall, Lambda, DDB, API Gateway, CloudFront).
- [ ] **Cost Anomaly Detection**: Take a screenshot of your active monitor under the Cost Anomaly Detection settings.

---

**Tip**: Store these screenshots in an `assets/` or `evidence/` directory in your repository, or package them into a presentation deck, so your evaluator can review your live system's final state even after you have decommissioned the cloud resources.

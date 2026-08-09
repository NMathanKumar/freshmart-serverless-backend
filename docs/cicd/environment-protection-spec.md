# FreshMart Environment Protection & Governance Specification

## Executive Overview

Environment protection rules safeguard sensitive environments (`staging`, `production`) from unverified code execution, unsafe concurrent deployments, and unauthorized deployments.

---

## 1. Approval Governance Rules

| Environment | Required Reviewers | Approver Role Requirements | Wait Timer | Branch Enforcement |
| :--- | :--- | :--- | :--- | :--- |
| **Development** | 0 | Automated deployment upon PR merge to `develop` | 0 min | `develop` branch only |
| **QA** | 0 (Optional 1) | Optional QA Lead approval for nightly regression runs | 0 min | `develop` branch only |
| **Staging** | 1 Required | 1 Tech Lead, Senior QA Engineer, or DevOps Engineer | 5 min | `staging` branch only |
| **Production** | 2 Required | 1 Principal DevOps Engineer AND 1 Lead Solutions Architect / Engineering Lead | 10 min | `main` branch (Release tag `v*.*.*`) |

---

## 2. Deployment Freeze Process

To ensure zero risk during critical business windows (e.g., peak retail hours, holidays, financial end-of-month):

### Scheduled Freeze Windows
- **Weekly Freeze**: Fridays 17:00 UTC to Mondays 06:00 UTC (No production deployments allowed over weekends).
- **Peak Retail Window**: Black Friday through Cyber Monday, and Year-End Holiday windows.

### Technical Enforcement
- Pipeline workflows include a pre-check step (`check-deployment-freeze`) that evaluates current timestamp against designated freeze parameters.
- If a freeze is active, production pipelines fail fast before attempting `assume-role` or `terraform plan`.

---

## 3. Emergency Break-Glass Override Procedure

In the event of a severe P0/P1 production incident requiring an immediate hotfix during a freeze window or bypassing standard multi-approval wait times:

1. **Trigger Condition**: Active Incident Command declaration with tracked Incident Ticket ID (`INC-XXXX`).
2. **Break-Glass OIDC Role**: A dedicated IAM role (`freshmart-github-ci-breakglass-role`) with short duration (15 min) can be assumed by authorized Incident Commanders.
3. **Audit Trail**: Every break-glass activation triggers an immediate high-priority PagerDuty / Slack alert to executive engineering and records an immutable log entry in AWS CloudTrail.
4. **Post-Mortem Requirement**: Break-glass deployments mandate a mandatory post-incident review (PIR) document within 24 hours.

---

## 4. Rollback Authorization & Execution Criteria

Rollbacks are authorized and triggered under the following explicit conditions:

- **Automated Rollback**: Triggered automatically if CloudWatch synthetic smoke tests fail within 5 minutes post-deployment, or if Lambda error rates breach 1.0% threshold.
- **Manual 1-Click Rollback**: Authorized by any DevOps Engineer or On-Call Engineer via GitHub Actions dispatch interface (`workflow_dispatch` on `rollback.yml`).
- **State Integrity**: Web frontends revert S3 static routing pointers and invalidate CloudFront edge caches; microservice Lambdas shift routing aliases back to `LIVE_PREVIOUS` version.

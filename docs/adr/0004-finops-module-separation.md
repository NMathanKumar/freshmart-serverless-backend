# ADR-0004: Dedicated FinOps Terraform Module

**Status:** Accepted  
**Date:** 2026-08  
**Deciders:** Platform Engineering

---

## Context
AWS Budgets and Cost Anomaly Detection could have been placed inside the cloudwatch module, but cost governance has different ownership, review cadence, and lifecycle than observability resources.

## Decision
Create a dedicated terraform/modules/finops/ module containing all cost governance resources (budgets, anomaly detection, cost dashboard, cost allocation tags).

## Rationale
FinOps resources are owned by Finance and Engineering leadership, not the SRE team. Separate modules allow independent updates, IAM permissions scoping, and enable future FinOps automation without touching observability infrastructure.

## Alternatives Considered
| Alternative | Reason Not Chosen |
|---|---|
| Inline in cloudwatch module | Couples unrelated concerns |
| Inline in root module | No reusability |
| AWS Cost Explorer only | No Terraform-managed budget governance |

## Consequences
### Positive
- Clear ownership boundaries
- Independent lifecycle
- Enables FinOps automation
- Principle of least privilege for module permissions

### Negative / Trade-offs
- One additional module to initialize and plan

## Review Trigger
When the FinOps team requires additional cost governance resources or when the cloudwatch module reaches 50+ resources.

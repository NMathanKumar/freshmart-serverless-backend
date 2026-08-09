# ADR-0003: Tiered X-Ray Sampling Strategy

**Status:** Accepted  
**Date:** 2026-08  
**Deciders:** Platform Engineering

---

## Context
Sampling 100% of all traces is too expensive at scale. Sampling 0% provides no observability. Payment traces require forensic-level visibility for compliance.

## Decision
Two-tier strategy: 5% default sampling for general platform traffic, 100% fixed-rate sampling for the payment flow.

## Rationale
5% default rate provides statistically representative traces for performance analysis without excessive cost. Payment flows require 100% coverage for financial audit compliance and fraud investigation.

## Alternatives Considered
| Alternative | Reason Not Chosen |
|---|---|
| Single flat 100% rate | Prohibitively expensive at scale |
| Single flat 5% rate | Insufficient for payment audit trail |
| No sampling rule | AWS default 1% is too low |

## Consequences
### Positive
- Cost-efficient tracing at scale
- Full payment audit trail
- Configurable via Terraform

### Negative / Trade-offs
- 95% of non-payment traces are not captured, reducing forensic depth for non-payment services

## Review Trigger
When monthly X-Ray costs exceed 10% of monitoring budget, or when compliance requirements change.

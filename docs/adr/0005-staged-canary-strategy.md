# ADR-0005: Staged Rollout for CloudWatch Synthetics Canaries

**Status:** Accepted  
**Date:** 2026-08  
**Deciders:** Platform Engineering

---

## Context
Immediately deploying canaries that simulate full checkout flows risks polluting production data with test orders, test payments, and test user sessions.

## Decision
Deploy canaries in 4 stages: Stage A (read-only: API health, UI checks), Stage B (authentication only), Stage C (non-polluting cart flow with immediate cleanup), Stage D (external dependencies and payment sandbox).

## Rationale
Stage A carries zero production risk. Staging B-D incrementally allows failures to be isolated to a specific stage rather than a combined flow. Stage C uses a strict add-then-remove pattern to avoid orphaned cart data. Stage D uses a sandbox environment for payment testing.

## Alternatives Considered
| Alternative | Reason Not Chosen |
|---|---|
| Single end-to-end canary immediately | High risk of data pollution, hard to debug |
| No browser canaries | Misses UI-layer failures entirely |
| External monitoring services | Datadog Synthetics, Checkly — additional cost and vendor dependency |

## Consequences
### Positive
- Zero production data pollution
- Isolated failure domains
- Incremental risk management
- Cost-effective coverage

### Negative / Trade-offs
- More complex canary management
- Stage D canaries depend on external sandbox availability

## Review Trigger
When a new critical user journey is identified, or when Stage A canaries prove stable for 30+ days.

# ADR-0001: Multi-Audience Dashboard Architecture

**Status:** Accepted  
**Date:** 2026-08  
**Deciders:** Platform Engineering

---

## Context
Single monolithic CloudWatch dashboard was hard to navigate and mixed executive metrics with low-level engineering data.

## Decision
Organize dashboards into tiers: Executive, Domain (Operations, SLA, Security, FinOps, Business), and Technical (API, Lambda, Database, Messaging, Synthetics). 11 dashboards total.

## Rationale
Different audiences need different information at different levels of detail. A single dashboard causes information overload. Domain-specific dashboards reduce MTTR by surfacing the right signal immediately.

## Alternatives Considered
| Alternative | Reason Not Chosen |
|---|---|
| Single dashboard | Too noisy |
| Grafana | Additional operational complexity |
| Third-party APM tools | Cost, vendor lock-in |

## Consequences
### Positive
- Faster incident triage
- Clear audience alignment
- Easier onboarding

### Negative / Trade-offs
- More dashboards to maintain

## Review Trigger
When the platform adds a new service domain.

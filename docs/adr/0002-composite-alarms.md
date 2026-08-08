# ADR-0002: Composite Alarms for Platform-Level Alerting

**Status:** Accepted  
**Date:** 2026-08  
**Deciders:** Platform Engineering

---

## Context
A single API failure could trigger 5–20 individual metric alarms simultaneously, flooding on-call engineers with noise.

## Decision
Implement composite alarms that aggregate individual metric alarms using OR logic into domain-level signals (API, Database, Messaging, Security, Platform).

## Rationale
Reduce MTTA by surfacing one meaningful signal per domain instead of an alert storm. Composite alarms also enable hierarchical on-call routing.

## Alternatives Considered
| Alternative | Reason Not Chosen |
|---|---|
| Alert grouping in PagerDuty | Requires PagerDuty subscription and external config |
| Dead-man switches | Doesn't solve multi-alarm aggregation |

## Consequences
### Positive
- Dramatically reduced alert noise
- Cleaner escalation path
- Faster MTTA

### Negative / Trade-offs
- Adds an extra layer of alarm logic to understand and maintain

## Review Trigger
When a new service domain is added or when false positive rate exceeds 5%.

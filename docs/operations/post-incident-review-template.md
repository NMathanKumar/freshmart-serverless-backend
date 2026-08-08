# FreshMart – Post-Incident Review Template

> **Use this template within 48 hours of any P1 or P2 incident.**  
> The goal is learning and improvement, not blame.

---

## Incident Summary

| Field | Value |
|---|---|
| **Incident ID** | INC-XXXX |
| **Date** | YYYY-MM-DD |
| **Duration** | HH:MM |
| **Severity** | P1 / P2 |
| **Status** | Resolved |
| **Incident Commander** | |
| **Scribe** | |

---

## Impact

| Metric | Value |
|---|---|
| **Customer Impact** | % of requests affected |
| **Revenue Impact** | Estimated $ / orders lost |
| **Error Rate Peak** | X% during incident window |
| **Services Affected** | List services |

---

## Timeline

| Time (UTC) | Event |
|---|---|
| HH:MM | Alarm fired: `alarm-name` |
| HH:MM | On-call engineer acknowledged |
| HH:MM | Initial diagnosis started |
| HH:MM | Root cause identified |
| HH:MM | Mitigation applied |
| HH:MM | All alarms returned to OK |
| HH:MM | Incident closed |

---

## Root Cause Analysis

### What happened?
> Describe the root cause in plain language.

### Why did it happen?
> Use 5-Why analysis.

1. **Why #1**:
2. **Why #2**:
3. **Why #3**:
4. **Why #4**:
5. **Why #5 (Root Cause)**:

---

## What Went Well

- (Detection was fast via Composite Alarm)
- (Runbook accelerated diagnosis)
- (Team communication was clear)

## What Went Poorly

- (Alert was noisy / false positive during initial phase)
- (Runbook had outdated command)
- (No clear ownership for X service)

---

## Action Items

| Action | Owner | Priority | Due Date |
|---|---|---|---|
| | | P1 / P2 / P3 | |
| | | | |

---

## Signals to Review

- [ ] CloudWatch Alarm that fired: does threshold need adjustment?
- [ ] Runbook used: does it need updating?
- [ ] Dashboard: did it surface the issue quickly?
- [ ] X-Ray traces: were they complete?
- [ ] On-call rotation: was coverage adequate?

# Runbook: Unauthorized Admin Privilege Elevation Attempt — Critical

## Alarm
`FreshMart-prod-Security-AdminPrivilegeElevation-Critical`

## Severity
**CRITICAL** — Non-administrative user or compromised token attempted to access administrative routes.

## Business Impact
Potential unauthorized administrative action (e.g. inventory modification, user deletion, price changes).

## Customer Impact
No direct customer impact unless privilege elevation succeeds.

## Detection
- CloudWatch Alarm: `PrivilegeElevationAttemptCount >= 1` in 1 minute
- Dashboard: [FreshMart-prod-Security](https://console.aws.amazon.com/cloudwatch/home#dashboards:name=FreshMart-prod-Security)

---

## Initial Checks

### 1. Identify token and user ID behind the attempt
```
CloudWatch → Logs Insights
Log group: /aws/lambda/freshmart-prod-auth
Query:
  fields @timestamp, userId, userRole, path, message, clientIp
  | filter message like /Forbidden/ or message like /Unauthorized role/
  | sort @timestamp desc
```

### 2. Revoke user session immediately
```bash
aws cognito-idp admin-user-global-sign-out \
  --user-pool-id <pool-id> \
  --username <user-id>
```

---

## Escalation Path
| Time | Action |
|---|---|
| 0 min | Security on-call engineer revokes session |
| 5 min | Audit administrative action logs for recent changes |
| 15 min | Escalate to Tech Lead & Security Lead |

## Owner
**Team:** Security Engineering / Platform

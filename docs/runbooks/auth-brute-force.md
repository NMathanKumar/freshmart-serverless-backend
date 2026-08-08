# Runbook: Authentication Brute Force Attempt — Critical

## Alarm
`FreshMart-prod-Auth-BruteForce-Critical`

## Severity
**CRITICAL** — Potential automated credential stuffing or brute force attack against user accounts.

## Business Impact
Compromise of customer accounts, unauthorized orders, fraudulent activity, and brand reputation damage.

## Customer Impact
Targeted accounts may be locked out by Cognito rate limiting. Legitimate users may experience login failures.

## Detection
- CloudWatch Alarm: `FailedLoginCount > 10` over 5-minute period
- Dashboard: [FreshMart-prod-Security](https://console.aws.amazon.com/cloudwatch/home#dashboards:name=FreshMart-prod-Security)

---

## Initial Checks

### 1. Identify offending IP addresses & targeted usernames
```
CloudWatch → Logs Insights
Log group: /aws/lambda/freshmart-prod-auth
Query:
  fields @timestamp, clientIp, username, message
  | filter level = "warn" or level = "error"
  | stats count(*) as attempts by clientIp, username
  | sort attempts desc
  | limit 20
```

### 2. Determine if attack is distributed or single-origin
- Single IP with >50 attempts: High-confidence automated script
- Multiple IPs targeting single username: Password spraying / credential stuffing

---

## Remediation Actions

### 1. Immediate IP Block via CloudFront / WAF (if WAF attached)
Add offending IP address to WAF IPSet blocklist.

### 2. Lock affected user account (if targeted)
```bash
aws cognito-idp admin-user-global-sign-out \
  --user-pool-id <pool-id> \
  --username <affected-username>
```

---

## Escalation Path
| Time | Action |
|---|---|
| 0 min | Security on-call engineer investigates |
| 5 min | Block offending IP in CloudFront/WAF |
| 15 min | Notify Security Lead if > 100 attempts |

## Owner
**Team:** Security Engineering / Platform

# 11 - Secrets Inventory & Configuration Management

## Executive Summary

Hardcoded secrets, API tokens, or unencrypted environment variables are strictly prohibited. FreshMart manages secrets through GitHub Environment Secrets and AWS SSM Parameter Store / Secrets Manager.

---

## 1. Secrets Inventory & Hierarchy

```
+----------------------------------------------------------------------------------+
|                            Secrets Management Hierarchy                          |
+----------------------------------------------------------------------------------+
                                         │
        +--------------------------------+--------------------------------+
        |                                                                 |
        v                                                                 v
+-------------------------------+                               +-------------------+
|  GitHub Environment Secrets   |                               | AWS Parameter     |
|  (Deployment Auth & Tokens)   |                               | Store / Secrets   |
+---------------+---------------+                               | Manager           |
                |                                               +---------+---------+
    +-----------+-----------+                                             |
    |                       |                                             v
    v                       v                                   +-------------------+
AWS OIDC Role ARN      Internal Service Tokens                  | Lambda Application|
(per environment)      Smoke Credentials                        | Secrets (DB, JWT) |
                                                                +-------------------+
```

---

## 2. GitHub Secrets Inventory Matrix

| Secret Name | Level | Scope / Usage | Access Scope |
| :--- | :--- | :--- | :--- |
| `AWS_OIDC_ROLE_ARN` | Environment | IAM Role ARN for OIDC authentication | `dev`, `qa`, `staging`, `production` |
| `TF_VAR_INTERNAL_SERVICE_TOKEN` | Environment | Internal service inter-communication secret token | `dev`, `qa`, `staging`, `production` |
| `SMOKE_ADMIN_EMAIL` | Environment | Test user credential for post-deploy smoke tests | `dev`, `qa`, `staging` |
| `SMOKE_ADMIN_PASSWORD` | Environment | Test user password for post-deploy smoke tests | `dev`, `qa`, `staging` |
| `SLACK_WEBHOOK_URL` | Repository | CI/CD build and deployment status notifications | All workflows |

---

## 3. Rotational & Auditing Policies

1. **Internal Service Tokens**: Rotated quarterly via Terraform state updates.
2. **Smoke Test Credentials**: Staged test accounts with least-privilege administrative access; password rotated every 90 days.
3. **No Long-Lived AWS Keys**: Zero persistent IAM access keys stored in GitHub Secrets.

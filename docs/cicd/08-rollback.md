# 08 - Automated & Manual Rollback Strategy

## Executive Summary

Continuous deployment requires continuous recovery. FreshMart implements automated and manual single-command rollback capabilities across both backend Lambda microservices and frontend web assets (S3/CloudFront).

---

## 1. Rollback Architecture & Trigger Matrix

```
[ Deployment Complete ]
          │
          ▼
   +------------------------------------+
   |   Synthetic Canary & Health Checks |
   +-----------------+------------------+
                     |
         +-----------+-----------+
         |                       |
      [ PASS ]                [ FAIL ]
         │                       │
         v                       v
[ Deployment Success ]   +---------------------------------------+
                         | Automated Rollback Triggered          |
                         | 1. Revert S3 Web Origin Pointer       |
                         | 2. Point CloudFront to Prior Release  |
                         | 3. Revert Lambda Alias Version        |
                         | 4. Invalidate CloudFront Caches       |
                         | 5. Post Incident SNS Notification     |
                         +---------------------------------------+
```

---

## 2. Automated Rollback Triggers

An automated rollback is triggered within 5 minutes of deployment if any of the following conditions occur:
1. **Synthetic Canary Failure**: CloudWatch Synthetics canary returns non-200 HTTP code or JavaScript console errors.
2. **5XX Error Rate Spike**: CloudWatch Alarm `High5XXErrorRate` breaches 1% threshold on API Gateway.
3. **Lambda Latency / Error Spike**: Lambda error rate exceeds 2% or p95 duration exceeds 3000ms.
4. **Smoke Test Failure**: `scripts/smoke-deployment.js` fails post-deploy verification.

---

## 3. Rollback Execution Mechanics

### Frontend Web Rollback (`rollback-web.js`)
Frontend rollbacks utilize S3 object versioning and CloudFront distribution origin paths:
```bash
node scripts/rollback-web.js customer --version=v2.4.1
node scripts/rollback-web.js admin --version=v2.4.1
```
1. Points CloudFront origin path to `/releases/v2.4.1/`.
2. Issues CloudFront wildcard invalidation `/*`.
3. Validates live asset availability.

### Backend Lambda Rollback
1. Microservices utilize AWS Lambda Aliases (`live`, `active`).
2. Deployment updates alias weights or flips `live` alias to point to previous immutable version (`$LATEST - 1` or explicitly tagged version).
3. If Terraform apply fails mid-flight, state lock is safely released and `terraform apply -var-file=previous.tfvars` executes.

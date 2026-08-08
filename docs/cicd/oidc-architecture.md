# FreshMart Enterprise AWS OIDC Identity Architecture

## Executive Summary

FreshMart eliminates long-lived AWS Access Keys (`AKIA...`) and Secret Keys in favor of AWS OpenID Connect (OIDC) identity federation. GitHub Actions receives ephemeral, short-lived Security Token Service (STS) credentials tied directly to the execution context of the workflow job.

---

## 1. Identity Provider & Trust Scoping

- **OIDC Provider Endpoint**: `https://token.actions.githubusercontent.com`
- **Audience (`aud`)**: `sts.amazonaws.com`
- **Thumbprint**: `6938fd5d98bab03faadb97b34396831e3780aea1`
- **Session Duration Limit**: 3600 seconds (1 hour).

---

## 2. Environment Scoped Role Trust Conditions

Each environment role is constrained using the `token.actions.githubusercontent.com:sub` claim:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::769044546162:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:NMathanKumar/freshmart-serverless-backend:environment:production"
        }
      }
    }
  ]
}
```

---

## 3. Session Tagging & CloudTrail Auditability

Every session assumed via OIDC passes session tags:
- `Repository`: `NMathanKumar/freshmart-serverless-backend`
- `Environment`: `${{ matrix.environment }}`
- `WorkflowRunId`: `${{ github.run_id }}`
- `Actor`: `${{ github.actor }}`

These tags are ingested into AWS CloudTrail logs for real-time security auditing.

# FreshMart OIDC Authentication Troubleshooting & Failure Matrix

## Executive Overview

This guide details failure modes, root causes, and remediation procedures for AWS OIDC authentication issues in GitHub Actions.

---

## 1. OIDC Failure Matrix & Remediation

| Error Message / Symptom | Root Cause | Remediation Procedure |
| :--- | :--- | :--- |
| `Not authorized to perform sts:AssumeRoleWithWebIdentity` | OIDC Trust Policy subject claim (`sub`) mismatch. | Check if workflow is running on an unapproved branch or missing `environment: <env>` declaration in job config. |
| `OpenIDConnect provider not found in account` | AWS IAM OIDC provider entity has not been created in account `769044546162`. | Apply `terraform/modules/github-oidc` to provision `token.actions.githubusercontent.com`. |
| `InvalidIdentityToken: Incorrect audience` | `aud` claim in JWT token does not match `sts.amazonaws.com`. | Verify `aws-actions/configure-aws-credentials@v4` action version and parameters. |
| `Credentials token expired after 3600 seconds` | Workflow step exceeded maximum session duration. | Optimize long-running steps or adjust `role-duration-seconds: 7200` in terraform role policy. |
| `AccessDenied: User is not authorized to perform lambda:UpdateFunctionCode` | IAM role policy missing specific service action. | Verify permission boundaries in `terraform/modules/github-oidc/main.tf`. |

---

## 2. Emergency Escalation Protocol

If an OIDC authentication failure blocks a critical release:
1. Do **NOT** commit static AWS keys (`AKIA...`) to GitHub Secrets or code.
2. Verify GitHub Actions status page (`githubstatus.com`) for OIDC token service availability.
3. Check CloudTrail logs for `AssumeRoleWithWebIdentity` event failures to inspect exact error details.

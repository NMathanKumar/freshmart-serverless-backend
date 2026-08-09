# FreshMart Reusable Workflow Authentication Pattern

## Overview

All GitHub Actions workflows in FreshMart authenticate to AWS using a standardized composite pattern requiring zero static access keys.

---

## 1. Standardized Authentication Block Specification

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: dev  # Declares GitHub Environment
    permissions:
      id-token: write # MANDATORY: Grants GitHub Actions permission to request OIDC JWT
      contents: read  # Grants permission to read repository code
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Configure AWS Credentials via OIDC
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_OIDC_ROLE_ARN }}
          aws-region: ap-southeast-1
          role-session-name: FreshMart-CI-Session-${{ github.run_id }}
          mask-aws-account-id: true
```

---

## 2. Mandatory Rules for Workflow Authors

1. **Top-level or Job-level Permissions**: `id-token: write` MUST be present in the job declaration.
2. **Environment Binding**: The job MUST specify `environment: <env_name>` to pull the correct environment-scoped `AWS_OIDC_ROLE_ARN`.
3. **Session Masking**: `mask-aws-account-id: true` prevents accidental account ID leakage in public or shared logs.
4. **Session Duration**: Defaults to 3600 seconds. Longer durations must be explicitly approved by Security.

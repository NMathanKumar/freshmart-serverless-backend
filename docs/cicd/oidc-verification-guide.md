# FreshMart OIDC Authentication Verification Guide

## Executive Overview

This guide outlines automated and manual verification procedures to validate keyless OIDC authentication before executing production deployments.

---

## 1. Verification Test Pipeline (`test-oidc-auth.yml`)

A lightweight validation workflow can be triggered to verify OIDC token exchange and role assumption:

```yaml
name: OIDC Auth Sanity Check

on:
  workflow_dispatch:
    inputs:
      target_environment:
        description: 'Target Environment to Test'
        required: true
        default: 'dev'
        type: choice
        options:
          - dev
          - qa
          - staging
          - production

jobs:
  verify-oidc:
    runs-on: ubuntu-latest
    environment: ${{ inputs.target_environment }}
    permissions:
      id-token: write
      contents: read
    steps:
      - name: Configure AWS Credentials via OIDC
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_OIDC_ROLE_ARN }}
          aws-region: ap-southeast-1

      - name: Verify Caller Identity
        run: |
          aws sts get-caller-identity
```

---

## 2. Expected Output Verification

When successful, `aws sts get-caller-identity` returns:

```json
{
    "UserId": "AROA3X...:FreshMart-CI-Session-123456",
    "Account": "769044546162",
    "Arn": "arn:aws:sts::769044546162:assumed-role/freshmart-github-ci-dev-role/FreshMart-CI-Session-123456"
}
```

If the `Arn` matches the expected environment IAM role, the OIDC authentication channel is verified.

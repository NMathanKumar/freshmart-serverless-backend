# 07 - Modular Workflow Architecture & Reusable Action Specs

## Overview

To avoid duplication and ensure maintainability, the FreshMart CI/CD platform is designed around composite actions and reusable workflows (`workflow_call`).

---

## 1. Reusable Workflow Inventory

```
.github/
  ├── workflows/
  │   ├── ci-pull-request.yml        # PR Validation Orchestrator
  │   ├── cd-development.yml         # Auto Deploy to DEV
  │   ├── cd-staging.yml             # Approval Deploy to STAGING
  │   ├── cd-production.yml          # Production Orchestrator
  │   └── cd-rollback.yml            # Emergency Rollback Pipeline
  └── actions/                       # Reusable Local Actions
      ├── setup-node-environment/    # Node 22 + caching setup
      ├── setup-terraform-env/       # Terraform CLI + setup
      ├── package-services/          # Lambda zip creation engine
      ├── verify-health/             # Synthetic health check runner
      └── check-destroy-guard/       # Terraform destroy risk guard
```

---

## 2. Reusable Action Specification

### `setup-node-environment`
Centralizes Node 22 environment initialization with npm dependency caching based on `package-lock.json` hash key:

```yaml
name: 'Setup Node Environment'
description: 'Standardizes Node 22 installation and npm cache'
runs:
  using: 'composite'
  steps:
    - uses: actions/setup-node@v4
      with:
        node-version: '22'
        cache: 'npm'
    - name: Install dependencies
      shell: bash
      run: npm ci
```

---

## 3. Orchestration Flow Diagram

```
                        +----------------------------+
                        |  .github/workflows/ci.yml  |
                        +--------------+-------------+
                                       |
                +----------------------+----------------------+
                |                      |                      |
                v                      v                      v
     +--------------------+  +--------------------+  +--------------------+
     | Action: setup-node |  | Action: setup-tf   |  | Action: sec-scan   |
     +--------------------+  +--------------------+  +--------------------+
                |                      |                      |
                +----------------------+----------------------+
                                       |
                                       v
                        +----------------------------+
                        | .github/workflows/deploy.yml|
                        +----------------------------+
```

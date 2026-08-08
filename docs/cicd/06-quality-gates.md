# 06 - Quality Gate Matrix & Threshold Enforcement

## Executive Summary

Quality Gates are non-negotiable automated checkpoints that enforce code quality, architectural compliance, security standards, and performance thresholds prior to merging or deploying code.

---

## 1. Comprehensive Quality Gate Matrix

```
[ Code Commit / PR ]
         │
         ├── Gate 1: Code Health (ESLint, Prettier, TypeScript)
         ├── Gate 2: Security & Vulnerabilities (CodeQL, npm audit, Secret Scanning)
         ├── Gate 3: Test Coverage & Verification (Unit, Integration, Contract Tests)
         ├── Gate 4: Infrastructure Integrity (Terraform fmt, validate, tfsec, Destroy Check)
         └── Gate 5: Performance & E2E (Lighthouse, Playwright Smoke Tests)
         │
[ PASS ] ──► Merge Approved / Deploy Allowed
[ FAIL ] ──► Pipeline Halted / PR Blocked
```

| Phase | Quality Check | Tool / Engine | Success Threshold | Enforcement Mechanism |
| :--- | :--- | :--- | :--- | :--- |
| **Linting** | Code Style & Rules | ESLint 9 | 0 Errors, 0 Warnings | Mandatory PR Check |
| **Formatting** | Code Formatting | Prettier | 100% compliant (`prettier --check .`) | Mandatory PR Check |
| **Type Safety** | Static Type Check | TypeScript (`tsc`) | 0 Type errors across all workspaces | Mandatory PR Check |
| **Unit Tests** | Functionality | `node --test` | 100% Pass rate | Mandatory PR Check |
| **Code Coverage** | Statement & Line Coverage | `c8` / `v8` | >= 80% Statement Coverage | PR Status Gate |
| **Contract Tests** | API Schemas & Models | `node --test tests/contracts` | 100% Pass rate | Mandatory PR Check |
| **IaC Syntax** | Terraform Formatting | `terraform fmt` | 100% formatted | Mandatory PR Check |
| **IaC Validation** | Terraform Schema | `terraform validate` | Valid configuration | Mandatory PR Check |
| **IaC Security** | Security & Compliance | `tfsec` & `Checkov` | 0 High/Critical findings | Mandatory PR Check |
| **Destructive Plan**| Resource Protection | Custom Python/JS Guard | 0 unintended resource replacements/destroys | Automated Plan Guard |
| **Browser E2E** | End-to-End User Flow | Playwright | 100% Pass on core web flows | Pre-deployment Gate |
| **Smoke Verification**| Deployment Health | `smoke-deployment.js` | 100% HTTP 200/OK on health endpoints | Post-deployment Gate |

---

## 2. Dangerous Destroy Detection Guard

Terraform changes that attempt to recreate critical infrastructure (DynamoDB tables, Cognito User Pools, S3 buckets, CloudFront distributions) must immediately fail the pipeline:

```yaml
- name: Terraform Dangerous Destroy Guard
  run: |
    node scripts/check-tf-destroy-guard.js tfplan.json
```

If the plan includes `destroy` or `replace` actions on protected resource types without an explicit emergency override flag (`ALLOW_DANGEROUS_DESTROY=true`), execution halts automatically.

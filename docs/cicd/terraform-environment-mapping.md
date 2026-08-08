# FreshMart Terraform Environment Mapping Specification

## Executive Overview

This document maps GitHub Environments (`dev`, `qa`, `staging`, `production`) to the physical Terraform infrastructure configurations located under `terraform/environments/`.

---

## 1. Directory Structure Audit & Mapping Matrix

```
terraform/
  └── environments/
        ├── dev/        <── Maps to GitHub Environment: Development (`dev`)
        ├── qa/         <── Maps to GitHub Environment: QA (`qa`)
        ├── prod/       <── Maps to GitHub Environment: Production (`production`)
        └── staging/    <── Target Environment (Does not currently exist in repo)
```

| GitHub Environment | Physical Terraform Path | Status in Repository | Active Backend Key / Workspace | Deployment Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **Development (`dev`)** | `terraform/environments/dev` | Existing Baseline | `freshmart/dev/terraform.tfstate` | Applied on `develop` branch merge |
| **QA (`qa`)** | `terraform/environments/qa` | Existing Baseline | `freshmart/qa/terraform.tfstate` | Applied on `develop` branch verification |
| **Staging (`staging`)** | `terraform/environments/staging` | **Missing in Baseline** | `freshmart/staging/terraform.tfstate` | **Interim Strategy**: Parameterized `qa` / `prod` configuration using `-var-file=staging.tfvars` until `terraform/environments/staging` is formally created. |
| **Production (`production`)** | `terraform/environments/prod` | Existing Baseline | `freshmart/prod/terraform.tfstate` | Applied on `main` release tag approval |

---

## 2. Staging Infrastructure Handling Plan

Because `terraform/environments/staging` is not yet present in the codebase:
1. **Short-Term (Non-Breaking Interim)**: Staging workflow runs `terraform -chdir=terraform/environments/prod plan -var-file=../staging/staging.tfvars` or reuses `qa` parameters with staging prefixes, ensuring no unexpected state mutation occurs on `prod` or `qa`.
2. **Long-Term Additive Plan**: Create `terraform/environments/staging` by cloning `terraform/environments/qa` with dedicated S3 state backend keys without modifying existing `dev`, `qa`, or `prod` code.

# FreshMart Deployment Concurrency & Lock Governance Specification

## Executive Overview

To prevent race conditions, state file corruption, and out-of-order resource provisioning, the FreshMart CI/CD platform enforces strict deployment concurrency rules across all target environments.

---

## 1. Concurrency Group Mapping

Every GitHub Action workflow executing a deployment job must declare an explicit `concurrency` block tied to its target environment:

| Environment | Concurrency Group Name | `cancel-in-progress` Policy | Rationale |
| :--- | :--- | :--- | :--- |
| **Development** | `development` | `true` (for CI/builds), `false` (for IaC) | In-flight feature branch builds are cancelled when newer commits arrive. IaC applies are never cancelled. |
| **QA** | `qa` | `false` | Queues deployments sequentially to complete active integration test suites. |
| **Staging** | `staging` | `false` | Strict FIFO ordering. Prevents overlapping UAT releases. |
| **Production** | `production` | `false` | Non-cancellable FIFO execution. Guarantees Terraform state file integrity and atomic alias deployment. |

---

## 2. GitHub Actions YAML Concurrency Specification

### Deployment Job Concurrency Lock Syntax

```yaml
jobs:
  deploy-prod:
    name: Deploy to Production Environment
    environment: production
    concurrency:
      group: production
      cancel-in-progress: false
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
      - name: Configure AWS OIDC Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_OIDC_ROLE_ARN }}
          aws-region: ${{ vars.AWS_REGION }}
      - name: Apply Infrastructure Changes
        run: terraform apply -auto-approve tfplan
```

---

## 3. Terraform State Lock Protection

In addition to GitHub Actions job-level concurrency control, Terraform enforces lock protection at the AWS infrastructure level:

- **Lock Storage**: DynamoDB Table `freshmart-tf-locks`.
- **Lock Key Structure**: Digest of state path (e.g., `freshmart-tf-locks/environments/prod/terraform.tfstate`).
- **Behavior**: If two workflows attempt `terraform apply` concurrently, DynamoDB state locking immediately aborts the second attempt with an explicit lock acquisition failure error (`ConditionalCheckFailedException`), safeguarding state integrity.

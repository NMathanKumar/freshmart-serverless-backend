# 02 - FreshMart Git Branching & Protection Strategy

## Enterprise Branch Topology

FreshMart enforces a multi-tier git branching workflow designed to guarantee stability and continuous delivery without risking main branch integrity.

```
  feature/ABC-123 (Feature Branch)
         │
         ├──► Pull Request + Mandatory CI Quality Gate Pass
         ▼
      develop (Development / Integration Branch)
         │
         ├──► Automatic Deployment to DEV Environment & E2E Tests
         ▼
      staging (Staging / UAT Branch)
         │
         ├──► Approval Gate + Deployment to STAGING Environment
         ▼
       main (Production Release Branch)
         │
         └──► Production Environment Deployment (OIDC + Multi-Party Approval)
```

---

## 1. Branch Taxonomy

| Branch | Purpose | Target Environment | Deployment Mode | Access Controls |
| :--- | :--- | :--- | :--- | :--- |
| `feature/*` | Feature development & bug fixes | Ephemeral / Local | No Direct Deploy | Open for developer commits |
| `develop` | Integration branch for active sprint work | `dev` | Automatic on PR Merge | Protected. Mandatory PR review (1 approvals). |
| `staging` | Pre-production UAT & performance validation | `staging` | Automatic post-PR approval | Highly Protected. Require 1 Lead Reviewer. |
| `main` | Production baseline | `production` | Manual Gate Approval required | Strictly Protected. Require 2 Senior Approvers. |
| `hotfix/*` | Critical production patch branches | `staging` -> `main` | Expedited pipeline | Fast-track approval with security lead signoff. |

---

## 2. GitHub Branch Protection Rules

### `main` Branch Rules
- **Require pull request before merging**: Yes.
- **Required approvals**: 2 (Lead Engineer / Architect).
- **Dismiss stale pull request approvals when new commits are pushed**: Yes.
- **Require status checks to pass before merging**:
  - `Lint & Formatting`
  - `TypeScript Typecheck`
  - `Unit & Integration Tests`
  - `Security & Secret Scan`
  - `Terraform Validate & Plan`
- **Require branch to be up to date before merging**: Yes.
- **Require linear history**: Yes.
- **Include administrators**: Yes.
- **Allow force pushes**: No.
- **Allow deletions**: No.

### `staging` Branch Rules
- **Required approvals**: 1.
- **Require status checks to pass before merging**: Same as `main`.
- **Allow force pushes**: No.

### `develop` Branch Rules
- **Required approvals**: 1.
- **Require status checks to pass before merging**: Mandatory CI suite pass.
- **Allow force pushes**: No.

---

## 3. Pull Request Requirements & PR Template Protocol

Every PR MUST include:
1. Linked Jira/GitHub issue tracker reference (`Closes #123` or `Fixes FRESH-456`).
2. Description of changes and risk assessment.
3. Automated test proof (unit, integration, contract).
4. Terraform plan summary (if infrastructure is modified).

# FreshMart Branch Protection & Required Status Checks

## GitHub Repository Settings → Branches → Branch Protection Rules

This document defines the mandatory GitHub Branch Protection Rules that make
the CI pipeline gates enforceable. Without these rules, developers can merge
PRs even when the CI pipeline fails.

---

## Required Protection Rules Per Branch

### `main` (Production Gate)

| Setting                          | Value                         |
|----------------------------------|-------------------------------|
| Require a pull request before merging | ✅ Yes |
| Required approving reviews       | 2                             |
| Dismiss stale reviews on push    | ✅ Yes                        |
| Require review from CODEOWNERS   | ✅ Yes                        |
| Require status checks to pass    | ✅ Yes                        |
| Require branches to be up to date | ✅ Yes                       |
| Restrict who can push            | Admin + Release Manager only  |
| Require linear history           | ✅ Yes (squash merge)        |
| Allow force pushes               | ❌ No                         |
| Allow deletions                  | ❌ No                         |
| Require signed commits           | ✅ Yes                        |

#### Required Status Checks for `main`

```
Backend CI / Detect Changed Backend Services
Backend CI / GitHub Dependency & License Review
Backend CI / Gitleaks Enterprise Secret Scan
Backend CI / Microservice Quality Gate (auth-service)
Backend CI / Microservice Quality Gate (product-service)
Backend CI / Microservice Quality Gate (order-service)
Backend CI / Microservice Quality Gate (payment-service)
Backend CI / Microservice Quality Gate (inventory-service)
Backend CI / Microservice Quality Gate (admin-service)
Backend CI / Microservice Quality Gate (user-service)
Backend CI / Microservice Quality Gate (notification-service)
Backend CI / Microservice Quality Gate (analytics-service)
Backend CI / Full Workspace Coverage Instrumentation
Backend CI / SonarQube Analysis & Quality Gate
Backend CI / CodeQL SAST Analysis & SARIF Upload
Backend CI / Package Lambda Services, SLSA Attestation & Manifest
```

---

### `staging` (Staging Gate)

| Setting                          | Value          |
|----------------------------------|----------------|
| Required approving reviews       | 1              |
| Dismiss stale reviews on push    | ✅ Yes         |
| Require status checks to pass    | ✅ Yes         |
| Allow force pushes               | ❌ No          |
| Allow deletions                  | ❌ No          |

#### Required Status Checks for `staging`

```
Backend CI / Gitleaks Enterprise Secret Scan
Backend CI / Microservice Quality Gate (*)
Backend CI / CodeQL SAST Analysis & SARIF Upload
Backend CI / SonarQube Analysis & Quality Gate
```

---

### `develop` (Developer Integration)

| Setting                          | Value                  |
|----------------------------------|------------------------|
| Required approving reviews       | 1                      |
| Dismiss stale reviews on push    | ✅ Yes                 |
| Require status checks to pass    | ✅ Yes                 |
| Allow force pushes               | ❌ No                  |

#### Required Status Checks for `develop`

```
Backend CI / Gitleaks Enterprise Secret Scan
Backend CI / Microservice Quality Gate (*)
Backend CI / Full Workspace Coverage Instrumentation
```

---

## GitHub Environments

| Environment | Approvers            | Secrets                              |
|-------------|----------------------|--------------------------------------|
| development | (auto-deploy)        | AWS_ROLE_ARN_DEV                     |
| qa          | (auto-deploy)        | AWS_ROLE_ARN_QA                      |
| staging     | 1 senior reviewer    | AWS_ROLE_ARN_STAGING                 |
| production  | 2 senior reviewers   | AWS_ROLE_ARN_PROD                    |

---

## GitHub Repository Secrets & Variables

| Secret / Variable     | Scope       | Purpose                              |
|-----------------------|-------------|--------------------------------------|
| `SONAR_TOKEN`         | Secret      | SonarCloud/SonarQube authentication  |
| `SONAR_HOST_URL`      | Variable    | SonarCloud URL (default: sonarcloud.io)|
| `AWS_ROLE_ARN_DEV`    | Secret      | OIDC role for dev account            |
| `AWS_ROLE_ARN_QA`     | Secret      | OIDC role for QA account             |
| `AWS_ROLE_ARN_STAGING`| Secret      | OIDC role for staging account        |
| `AWS_ROLE_ARN_PROD`   | Secret      | OIDC role for production account     |
| `GITLEAKS_LICENSE`    | Secret      | Enterprise Gitleaks license (optional)|

---

## Enforced Quality Gates Summary

| Gate                         | Tool                              | Block on Failure |
|------------------------------|-----------------------------------|-----------------|
| Secret Detection             | Gitleaks                          | ✅ Yes          |
| Dependency CVE Check         | `dependency-review-action`        | ✅ Yes (High+)  |
| License Policy               | Custom allowlist/denylist script  | ✅ Yes          |
| Unit Test Pass Rate          | Node.js test runner + c8          | ✅ Yes          |
| Code Coverage (Lines ≥90%)   | c8 check-coverage                 | ✅ Yes          |
| Code Coverage (Branches ≥85%)| c8 check-coverage                 | ✅ Yes          |
| SAST Analysis                | CodeQL                            | ✅ Yes          |
| SARIF Upload                 | `codeql-action/analyze`           | ✅ Yes          |
| Sonar Quality Gate           | `sonarqube-quality-gate-action`   | ✅ Yes          |
| Code Duplication Gate        | SonarQube Quality Gate profile    | ✅ Yes          |
| Complexity Gate              | SonarQube Quality Gate profile    | ✅ Yes          |
| Build Provenance (SLSA)      | `attest-build-provenance`         | ✅ Yes          |
| PR Annotation                | `mikepenz/action-junit-report`    | ✅ Yes          |

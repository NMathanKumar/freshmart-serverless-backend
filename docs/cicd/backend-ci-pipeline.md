# FreshMart Backend CI Pipeline Documentation

## Executive Overview

The FreshMart Backend CI Pipeline (`.github/workflows/ci-backend.yml`) automates quality assurance, security scanning, unit/integration testing, and packaging for all 25+ AWS Lambda microservices in the monorepo on every pull request targeting `develop`, `staging`, or `main`.

---

## 1. Pipeline Execution Architecture

```
[ Pull Request / Commit ]
           │
           ▼
    ci-backend.yml
           │
           ├── Job 1: `backend-lint-test`
           │     ├─ Action: setup-node-env (Node 22 + npm cache)
           │     ├─ Action: lint-and-typecheck (ESLint + Prettier + Typecheck)
           │     ├─ Action: run-unit-tests (Unit, Integration & Contract Tests)
           │     └─ Action: security-scan (npm audit + Secret Scan)
           │
           ├── Job 2: `package-backend-services` (Depends on Job 1)
           │     ├─ Action: package-services (Build + Zip + SHA-256 Manifest)
           │     ├─ Upload Artifact: `freshmart-lambda-zips-<sha>` (14 day retention)
           │     └─ Upload Artifact: `lambda-artifacts-manifest-<sha>` (30 day retention)
           │
           └── Job 3: `backend-ci-summary` (Depends on Job 2)
                 └─ Publishes GitHub Step Summary markdown with SHA-256 digests
```

---

## 2. Trigger Rules & Path Filtering

The pipeline executes only when relevant backend or shared code changes:

- `services/**`
- `packages/shared/**`, `packages/platform-core/**`, `packages/api-sdk/**`
- `package.json`, `package-lock.json`
- `.github/workflows/ci-backend.yml`, `.github/actions/**`

---

## 3. Artifact Integrity & Provenance

Every packaged Lambda microservice ZIP (`services/<service-name>/lambda.zip`) is cryptographically hashed with SHA-256. The resulting `lambda-artifacts-manifest.json` is stored alongside the build artifacts for downstream verification during deployment.

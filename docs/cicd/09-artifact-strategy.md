# 09 - Build Artifact Packaging & Versioning Strategy

## Overview

Build artifacts must be immutable, traceable, and versioned. FreshMart establishes a strict artifact lifecycle where build outputs are compiled once during CI, cryptographically hashed, uploaded to GitHub Actions Artifact Storage / S3 Artifact Repositories, and reused across environments.

---

## 1. Artifact Taxonomy & Storage

| Artifact Type | Component | Packaging Format | Storage Location | Retention Policy |
| :--- | :--- | :--- | :--- | :--- |
| **Lambda Packages** | 25+ Microservices (`services/*`) | ZIP archive (`services/<name>/lambda.zip`) | GitHub Actions Artifacts / S3 Deploy Bucket | 30 days (Dev/QA), 90 days (Prod) |
| **Web Bundles** | Customer & Admin Web Apps (`apps/*`) | Static Distribution (`dist.tar.gz`) | GitHub Actions Artifacts / S3 Assets Bucket | 30 days (Dev/QA), 90 days (Prod) |
| **Terraform Plans** | Infrastructure Specs (`terraform/*`) | Encrypted Binary (`tfplan.binary` / `tfplan.json`) | GitHub Actions Job Artifacts | 14 days |
| **Security Reports** | CodeQL, tfsec, Audit Logs | JSON / SARIF (`security-results.sarif`) | GitHub Security Tab / Artifacts | 90 days |

---

## 2. Immutable Packaging Pipeline

```
[ Source Commit ]
        │
        ▼
   Build Project (`npm run build`)
        │
        ▼
   Package Microservices (`npm run package`)
        │
        ├── Calculates SHA-256 Digest of every zip
        ├── Emits `artifacts-manifest.json` containing digests
        └── Uploads artifacts to GitHub Actions storage
```

---

## 3. SHA-256 Verification Protocol

Before Terraform or S3 deployment runs:
1. The deployment job downloads the packaged zip artifacts.
2. Recalculates the SHA-256 hash.
3. Compares the hash against `artifacts-manifest.json`.
4. Aborts deployment if any hash mismatch is detected.

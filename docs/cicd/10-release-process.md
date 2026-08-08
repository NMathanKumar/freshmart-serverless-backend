# 10 - Release Tagging & Production Release Process

## Overview

FreshMart releases adhere to Semantic Versioning (SemVer `vX.Y.Z`). Releases are orchestrated via Git tags and GitHub Releases, ensuring clear provenance, release notes, and operational readiness.

---

## 1. Release Flow Diagram

```
[ Feature PRs Merged to develop ]
                │
                ▼
      Integration Testing (DEV / QA)
                │
                ▼
     PR Merged to `staging`
                │
                ▼
       Staging Approval & UAT
                │
                ▼
     PR Merged to `main`
                │
                ▼
     Tag Release (`v2.1.0`)
                │
                ├── Triggers `release.yml` Workflow
                ├── Auto-generates Release Notes from commits
                ├── Attaches Lambda & Web distribution zips
                └── Triggers Production CD Pipeline (Requires Approval)
```

---

## 2. Semantic Versioning Standards

- **MAJOR (`v2.0.0`)**: Breaking API changes, database schema redesigns requiring maintenance windows.
- **MINOR (`v2.1.0`)**: Backwards-compatible new features, new microservice additions, UI enhancements.
- **PATCH (`v2.0.1`)**: Backwards-compatible hotfixes, security patches, performance tuning.

---

## 3. Automated Release Notes Generation

GitHub Release Notes are generated automatically from pull request titles using category configurations:

```yaml
changelog:
  categories:
    - title: "🚀 Features"
      labels: ["feature", "enhancement"]
    - title: "🐛 Fixes"
      labels: ["bug", "fix"]
    - title: "🛡️ Security"
      labels: ["security"]
    - title: "🧰 Infrastructure & CI"
      labels: ["terraform", "ci"]
```

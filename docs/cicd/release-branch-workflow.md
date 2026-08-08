# FreshMart Release Branch Lifecycle & Versioning Specification

## Executive Overview

For scheduled releases and major version milestones, FreshMart utilizes release branches (`release/vX.Y.Z`) to stabilize releases prior to production promotion.

---

## 1. Release Lifecycle Diagram

```
feature/A ──┐
            ├──► develop ──► release/v2.1.0 ──► staging ──► main (Tag: v2.1.0)
feature/B ──┘                      │                          │
                                   └─► bugfix back-merge ─────┴─► develop
```

---

## 2. Release Lifecycle Stages

### Stage 1: Release Branch Cut (`release/vX.Y.Z`)
When a sprint features set is ready for UAT:
1. Cut `release/v2.1.0` from `develop`.
2. Increment package version numbers (`npm version minor --no-git-tag-version`).
3. Only documentation updates and release bugfixes are committed to `release/v2.1.0`.

### Stage 2: Staging Promotion & UAT
1. PR opened from `release/v2.1.0` into `staging`.
2. Staging CD executes automatically, triggering Playwright end-to-end tests and synthetic canary runs.
3. Quality Assurance and Business stakeholders perform UAT verification.

### Stage 3: Production Promotion & Tagging
1. Upon approval, PR merged from `release/v2.1.0` to `main`.
2. Production CD workflow runs upon release tag publication (`v2.1.0`).
3. `release/v2.1.0` is merged back into `develop` to ensure release bugfixes are retained in the integration baseline.

---

## 3. Hotfix Lifecycle (`hotfix/*`)

In the event of a production P1 defect:
1. Cut `hotfix/v2.1.1` directly from `main`.
2. Apply defect patch & pass local test suite.
3. Open PR to `staging` for expedited verification.
4. Merge to `main` with production deployment.
5. Back-merge `hotfix/v2.1.1` into `develop` and `staging`.

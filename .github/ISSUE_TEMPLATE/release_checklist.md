---
name: '📋 Release Checklist'
about: Release verification and deployment signoff tracking
title: '[RELEASE]: vX.Y.Z'
labels: 'release'
assignees: ''
---

## FreshMart Production Release vX.Y.Z

### Pre-Deployment Verification
- [ ] All feature PRs merged to `develop` and passed automated CI suite.
- [ ] Staging environment deployment verified on `staging` branch.
- [ ] Playwright E2E and Artillery performance test suites passed without regressions.
- [ ] `terraform plan` reviewed for unexpected resource destructions.
- [ ] Change Advisory Board (CAB) / Tech Lead signoff obtained.

### Deployment Phase
- [ ] GitHub Environment approval granted for `production`.
- [ ] Terraform apply executed successfully.
- [ ] Web static assets deployed to CloudFront S3 origin.
- [ ] CloudFront cache invalidation issued (`/*`).

### Post-Deployment Verification
- [ ] Live Synthetic Canary checks returning 200 OK.
- [ ] CloudWatch Alarm dashboards clear of 5xx / Latency spikes.
- [ ] Smoke tests verified (`npm run test:smoke:deployment`).
- [ ] Git tag `vX.Y.Z` published to GitHub Releases.

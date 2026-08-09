# FreshMart Git Migration & Governance Plan (Phase 2)

## Step 1 – Current Branch Audit Report

### Branch Matrix Analysis

| Branch Name | Type | Remote Tracking | Status & Active Purpose | Retention Action |
| :--- | :--- | :--- | :--- | :--- |
| `main` | Primary Baseline | `origin/main` | Default production branch containing baseline infrastructure & code. | **PRESERVE** (Keep as default production baseline) |
| `recovery/customer-ui-from-stash` | Active Workspace | `origin/recovery/customer-ui-from-stash` | **CURRENT HEAD**. Contains uncommitted local UI patches & baseline stability work. | **PRESERVE & MERGE** (Do not disturb; will merge into `develop` post-creation) |
| `feature/admin-ui-finalization` | Active Feature | `origin/feature/admin-ui-finalization` | Active feature branch for Admin UI finalization work. | **PRESERVE** (Keep active until feature PR complete) |
| `feature/customer-ui-modernization` | Active Feature | `origin/feature/customer-ui-modernization` | Feature branch for customer UI modernization. | **PRESERVE** (Keep active until feature PR complete) |
| `ui-production-backup` | Backup / Tag | `origin/ui-production-backup` | Snapshot backup of production baseline UI. | **ARCHIVE** (Tag as `archive/ui-prod-backup-2026` and delete branch ref) |
| `subagent-Authentication...` | Temporary | Local only | Temporary subagent workspace branch. | **ARCHIVE / DELETE** (Safe to clean up after verification) |

---

## Step 2 – Migration Plan (Current -> Target Topology)

```
CURRENT STATE:                               TARGET STATE:

  main (Default)                                main (Production Only)
  recovery/customer-ui-from-stash  ────────►    staging (UAT & Pre-prod)
  feature/admin-ui-finalization                 develop (Active Integration)
  feature/customer-ui-modernization             feature/* (Feature Branches)
  ui-production-backup                          release/v* (Release Staging)
  subagent-*                                    hotfix/* (Urgent Hotfixes)
```

### Migration Execution Procedure (Planned - Not Executed Yet)
1. **Preserve Baseline**: Keep `main` untouched.
2. **Branch Creation**:
   - Create `develop` from `main`.
   - Create `staging` from `main`.
3. **Branch Migration**:
   - Merge active branch `recovery/customer-ui-from-stash` into `develop` via Pull Request once CI pipeline is active.
   - Retain `feature/admin-ui-finalization` and `feature/customer-ui-modernization`, retargeting their base branch to `develop`.
4. **Zero Data Loss Guarantee**:
   - All branch heads are tagged (`backup/pre-migration-<branch-name>`) prior to branch reorganization.

---

## Step 3 – Branch Governance Policies (Documentation Only)

### Rules for `main`
- **Strict Pull Request Gate**: 2 Senior Approvals required. No direct pushes.
- **Linear History**: Require Squash Merge or Fast-Forward Rebase.
- **Signed Commits**: Enforce GPG signature verification for release tags and merges.
- **Resolved Discussions**: 100% of PR review comments must be resolved.
- **Passing Status Checks**: All CI Quality Gates (Lint, Typecheck, Tests, Security, IaC Plan).

### Rules for `staging`
- **Pull Request Gate**: 1 Tech Lead Approval required.
- **Protected Environment**: Deploys automatically to Staging environment post-merge.

### Rules for `develop`
- **Pull Request Gate**: 1 Peer Review Approval required.
- **Integration Target**: Default target for all `feature/*` pull requests.

---

## Step 8 – Safe Migration Checklist & Rollback Plan

### Safe Migration Checklist
- [ ] No uncommitted working tree changes left unbacked up.
- [ ] Active feature branches identified and assigned owners.
- [ ] CI pipeline initial setup complete before enabling branch protection rules.
- [ ] Remote backup tags created (`git tag backup/pre-migration-$(date +%Y%m%d)`).

### Migration Rollback Plan
If branch migration encounters unexpected conflicts or needs postponement:
1. Re-point local `HEAD` to `recovery/customer-ui-from-stash`.
2. Continue existing development workflow without enforcing branch protection blocks.
3. No repository history will be rebased or force-pushed during migration.

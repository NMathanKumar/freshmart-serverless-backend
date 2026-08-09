# FreshMart Monorepo Merge Strategy & Git Conventions

## Executive Summary

To maintain a clean, bisect-friendly, and auditable repository history, FreshMart defines clear rules for merging across branches and environments.

---

## 1. Branch Merge Matrix

```
Target Branch      Allowed Source Branches        Allowed Merge Strategy      Require Approval
─────────────      ───────────────────────        ──────────────────────      ────────────────
develop            feature/*, hotfix/*            Squash & Merge              1 Approval
staging            develop                        Merge Commit (Preserve)     1 Approval
main               staging, hotfix/*              Merge Commit / Fast-Forward  2 Approvals
```

---

## 2. Merge Strategy Selection Rationale

### A. Feature Branch -> `develop` (Squash and Merge)
- **Why**: Feature branches often contain multiple micro-commits ("fix lint", "wip", "debug log"). Squashing condenses the feature into a single clean commit on `develop` containing the pull request title and PR reference (`#123`).
- **Commit Title Standard**: `feat(cart-service): add multi-item checkout validation (#456)`

### B. `develop` -> `staging` (Merge Commit)
- **Why**: Preserves individual squashed feature commits while establishing an explicit integration merge point. Allows bisecting specific features in staging.

### C. `staging` -> `main` (Merge Commit / Fast-Forward Release)
- **Why**: Guarantees that what was tested in staging is identical to production. Ensures tag provenance.

---

## 3. Commit Message Conventions (Conventional Commits)

Commit messages must follow the Conventional Commits specification:

```
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

### Allowed Types
- `feat`: A new feature for users or services.
- `fix`: A bug fix.
- `docs`: Documentation changes only.
- `style`: Code style/formatting changes (no logic change).
- `refactor`: Code change that neither fixes a bug nor adds a feature.
- `perf`: Code change that improves performance.
- `test`: Adding missing tests or correcting existing tests.
- `chore`: Infrastructure, tooling, or build configuration updates.

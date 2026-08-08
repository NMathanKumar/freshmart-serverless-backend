# FreshMart Backend Quality Platform & Enterprise CI Pipeline

## Executive Overview

The Backend Quality Platform combines microservice change detection, parallel matrix test execution, SonarQube/CodeQL SAST analysis, Cobertura/LCOV test reporting, coverage threshold enforcement, and SPDX Software Bill of Materials (SBOM) generation into a unified continuous integration pipeline.

---

## 1. Enterprise Quality Architecture

```
[ Code Change / PR ]
         │
         ▼
   detect-changes (Path Filter)
         │
         ▼
   backend-quality-matrix (Parallel Test Execution per Microservice)
         │
         ├─ Unit & Integration Tests (`npm test`)
         ├─ Contract Schema Validation (`npm run test:contracts`)
         └─ LCOV / Cobertura HTML Coverage Reports (`c8`)
         │
         ▼
   sonarqube-analysis (CodeQL SAST + License Audit + SBOM)
         │
         ├── CodeQL Static Application Security Testing
         ├── Dependency Vulnerability Audit (`npm audit`)
         └── SPDX Software Bill of Materials (`freshmart-sbom.spdx.json`)
         │
         ▼
   package-backend-services (Immutable Packaging)
         │
         ├── Packaging 25+ Lambda Services (`services/*/lambda.zip`)
         └── SHA-256 Digest Manifest (`lambda-artifacts-manifest.json`)
```

---

## 2. Quality Gate Thresholds

The pipeline enforces mandatory thresholds before approving pull requests:

- **Code Coverage**: minimum 80% lines, 80% functions, 75% branches, 80% statements.
- **Security Audit**: 0 High or Critical vulnerabilities allowed.
- **SAST**: 0 CodeQL security alerts.
- **Secret Scanning**: 0 exposed AWS access keys or tokens.
- **Packaging Integrity**: 100% SHA-256 checksum matching across service zips.

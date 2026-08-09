# 05 - Security Pipeline & Compliance Architecture

## Executive Summary

FreshMart implements a zero-trust, continuous security scanning pipeline across every layer of the monorepo—from static application source code and dynamic dependencies to Terraform infrastructure definitions and secret leakage prevention.

---

## 1. Security Scanner Taxonomy

```
+------------------------------------------------------------------------------------+
|                                FreshMart PR Pipeline                               |
+------------------------------------------------------------------------------------+
       |                     |                      |                     |
       v                     v                      v                     v
+--------------+     +---------------+      +---------------+     +---------------+
| Code Analysis|     |  Dependency   |      | Secret & License|   |  Terraform    |
| (CodeQL)     |     | (Audit/Review)|      | (SecretScan)  |     | (tfsec/Checkov)|
+--------------+     +---------------+      +---------------+     +---------------+
```

| Security Dimension | Engine / Scanner | Scope | Failure Condition |
| :--- | :--- | :--- | :--- |
| **SAST (Code Analysis)** | GitHub CodeQL | JS / TS / Node.js source code | Any `High` or `Critical` severity rule violation |
| **SCA (Dependency Vulnerabilities)** | `npm audit` / GitHub Dependency Review | `package.json`, `package-lock.json` | High / Critical CVSS vulnerabilities |
| **Secret Scanning** | GitGuardian / Trufflehog / GitHub Secret Scan | Repository commits & PR diffs | Any exposed AWS keys, private tokens, API secrets |
| **IaC Security** | `tfsec` & `Checkov` | `terraform/**/*.tf` | Unencrypted storage, wildcard IAM actions, public S3 buckets |
| **License Compliance** | License Checker | Third-party node modules | AGPL / Copyleft licenses flagged without explicit exemption |
| **SBOM Generation** | Syft / Anchore SBOM | Build distribution zips & web bundles | Missing Software Bill of Materials in release assets |

---

## 2. Infrastructure Security Rules (Terraform Gate)

The pipeline enforces strict security rules against Terraform manifests:
1. **S3 Bucket Security**: Buckets must block public access and enforce SSE-KMS encryption.
2. **Lambda Security**: Functions must not operate in unhandled public subnets; IAM policies must avoid `Action: "*"` wildcards.
3. **API Gateway**: CORS origins must be explicitly specified (no `*` in production).
4. **Cognito**: Password policies must enforce 12+ characters, uppercase, lowercase, numbers, and special characters.

---

## 3. SBOM Generation & Attestation

For compliance auditing, every production deployment automatically generates an CycloneDX/SPDX Software Bill of Materials (SBOM) using `syft` and attaches cryptographically signed attestations using GitHub Artifact Attestations:

```yaml
- name: Generate SBOM
  uses: anchore/sbom-action@v0
  with:
    path: .
    format: spdx-json
    output-file: freshmart-sbom.spdx.json
```

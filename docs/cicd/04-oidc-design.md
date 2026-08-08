# 04 - AWS OpenID Connect (OIDC) Security Architecture

## Executive Overview

Long-lived IAM access keys pose severe security risks. FreshMart uses OpenID Connect (OIDC) federation between GitHub Actions and AWS IAM. GitHub Actions requests short-lived, scoped AWS STS credentials directly from AWS IAM without storing permanent AWS credentials in GitHub Secrets.

---

## 1. OIDC Trust Relationship Diagram

```
+-------------------+                      +-------------------+                    +-----------------------+
|  GitHub Actions   | -- 1. Request JWT -> | GitHub OIDC Provider| -- 2. Issues JWT ->|  GitHub Actions Run   |
+-------------------+                      +-------------------+                    +-----------+-----------+
                                                                                                |
                                                                                    3. STS AssumeRoleWithWebIdentity
                                                                                                |
                                                                                                v
+-------------------+                      +-------------------+                    +-----------------------+
| Temporary AWS     | <-- 5. Return Token  | AWS IAM OIDC      | <-- 4. Verify JWT  | AWS IAM Role          |
| Credentials (1h)  |                      | Identity Provider |      Claims        | (FreshMartGitHubRole) |
+-------------------+                      +-------------------+                    +-----------------------+
```

---

## 2. IAM OIDC Trust Policy Specification

The IAM Role Trust Policy restricts assume role permissions specifically to the FreshMart repository and specified environments or branches:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::769044546162:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:NMathanKumar/freshmart-serverless-backend:*"
        }
      }
    }
  ]
}
```

---

## 3. Environment Scoped OIDC Roles

| Environment | Target IAM Role ARN | Permitted Subject Claim (`sub`) |
| :--- | :--- | :--- |
| `dev` | `arn:aws:iam::769044546162:role/freshmart-github-ci-dev-role` | `repo:NMathanKumar/freshmart-serverless-backend:environment:dev` |
| `qa` | `arn:aws:iam::769044546162:role/freshmart-github-ci-qa-role` | `repo:NMathanKumar/freshmart-serverless-backend:environment:qa` |
| `staging` | `arn:aws:iam::769044546162:role/freshmart-github-ci-staging-role` | `repo:NMathanKumar/freshmart-serverless-backend:environment:staging` |
| `production` | `arn:aws:iam::769044546162:role/freshmart-github-ci-prod-role` | `repo:NMathanKumar/freshmart-serverless-backend:environment:production` |

---

## 4. GitHub Workflow Integration Pattern

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      id-token: write  # Mandatory for requesting JWT token from GitHub OIDC
      contents: read
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Configure AWS Credentials via OIDC
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_OIDC_ROLE_ARN }}
          aws-region: ap-southeast-1
          role-session-name: FreshMartGitHubActionsSession
```

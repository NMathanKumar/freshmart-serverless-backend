# FreshMart GitHub Actions OIDC Module
#
# PURPOSE:
#   Provisions the AWS IAM OpenID Connect (OIDC) Provider for GitHub Actions
#   and environment-scoped IAM AssumeRoles for PR Planning, DEV, QA, and PROD.
#
# PRIVILEGE BOUNDARY:
#   - PR Plan Role (freshmart-github-ci-plan-role): Scoped to pull_request contexts.
#     Grants read/plan access to S3 state and metadata; NO deployment/write permissions.
#   - DEV Role (freshmart-github-ci-dev-role): Scoped to dev environment / main branch.
#   - QA Role (freshmart-github-ci-qa-role): Scoped to qa environment / main branch.
#   - PROD Role (freshmart-github-ci-prod-role): Scoped to prod environment / release tags.

data "aws_caller_identity" "current" {}

# -----------------------------------------------------------------------------
# 1. GitHub OIDC Identity Provider
# -----------------------------------------------------------------------------
resource "aws_iam_openid_connect_provider" "github" {
  count           = var.create_oidc_provider ? 1 : 0
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [
    "6938fd5d98bab03faadb97b34396831e3780aea1", # Primary GitHub Actions OIDC CA
    "1c2866c82703772034947936a0d244976c7c006b"  # Backup GitHub Actions OIDC CA
  ]

  tags = var.tags
}

locals {
  provider_arn = var.create_oidc_provider ? aws_iam_openid_connect_provider.github[0].arn : "arn:aws:iam::${data.aws_caller_identity.current.account_id}:oidc-provider/token.actions.githubusercontent.com"
}

# -----------------------------------------------------------------------------
# 2. PR PLAN ROLE — Read/Plan Only (Strictly No Deployment/Write Access)
# -----------------------------------------------------------------------------
data "aws_iam_policy_document" "plan_trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [local.provider_arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = [
        "repo:${var.github_org_repo}:pull_request*",
        "repo:${var.github_org_repo}:environment:dev",
        "repo:${var.github_org_repo}:environment:qa",
        "repo:${var.github_org_repo}:environment:prod"
      ]
    }
  }
}

resource "aws_iam_role" "github_ci_plan" {
  name                 = "freshmart-github-ci-plan-role"
  description          = "GitHub Actions read-only role for PR terraform plan and validation"
  assume_role_policy   = data.aws_iam_policy_document.plan_trust.json
  max_session_duration = var.role_max_session_duration
  tags                 = merge(var.tags, { Purpose = "pr-plan-read-only" })
}

data "aws_iam_policy_document" "plan_permissions" {
  # Read-Only S3 State Access for terraform plan
  statement {
    sid       = "TerraformStateReadLock"
    effect    = "Allow"
    actions   = [
      "s3:GetObject",
      "s3:PutObject",   # Required for S3 native locking .tflock during plan
      "s3:DeleteObject", # Required for S3 native locking .tflock release during plan
      "s3:ListBucket",
      "s3:GetBucketVersioning"
    ]
    resources = [
      "arn:aws:s3:::freshmart-terraform-state",
      "arn:aws:s3:::freshmart-terraform-state/*"
    ]
  }

  # Read-Only Infrastructure Metadata for terraform plan state refresh
  statement {
    sid       = "ReadOnlyInfrastructureMetadata"
    effect    = "Allow"
    actions   = [
      "lambda:GetFunction",
      "lambda:GetFunctionConfiguration",
      "lambda:GetAlias",
      "lambda:ListFunctions",
      "cloudfront:GetDistribution",
      "s3:GetBucket*",
      "s3:ListBucket",
      "cloudwatch:DescribeAlarms",
      "cloudwatch:GetMetricData",
      "cloudwatch:ListMetrics",
      "cognito-idp:DescribeUserPool",
      "cognito-idp:DescribeUserPoolClient",
      "sqs:GetQueueAttributes",
      "sqs:GetQueueUrl",
      "sqs:ListQueues",
      "sqs:ListQueueTags",
      "dynamodb:DescribeTable",
      "dynamodb:ListTables",
      "dynamodb:DescribeContinuousBackups",
      "dynamodb:DescribeTimeToLive",
      "apigateway:GET",
      "sns:GetTopicAttributes",
      "sns:ListTopics",
      "sns:ListSubscriptionsByTopic",
      "events:DescribeRule",
      "events:ListRules",
      "events:ListTargetsByRule",
      "synthetics:DescribeCanaries",
      "synthetics:GetCanaryRuns",
      "iam:GetRole",
      "iam:GetPolicy",
      "iam:GetPolicyVersion",
      "iam:ListAttachedRolePolicies",
      "secretsmanager:DescribeSecret",
      "ssm:DescribeParameters",
      "ssm:GetParameter",
      "ses:GetIdentityVerificationAttributes",
      "ses:GetCustomVerificationEmailTemplate",
      "logs:DescribeLogGroups",
      "logs:DescribeMetricFilters",
      "xray:GetSamplingRules",
      "cloudwatch:GetDashboard"
    ]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "plan_permissions" {
  name        = "freshmart-github-actions-plan-policy"
  description = "Read-only plan policy for FreshMart PR terraform validation"
  policy      = data.aws_iam_policy_document.plan_permissions.json
  tags        = var.tags
}

resource "aws_iam_role_policy_attachment" "plan_attach" {
  role       = aws_iam_role.github_ci_plan.name
  policy_arn = aws_iam_policy.plan_permissions.arn
}

# -----------------------------------------------------------------------------
# 3. DEV ROLE — Execution & Deployment for Dev Environment
# -----------------------------------------------------------------------------
data "aws_iam_policy_document" "dev_trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [local.provider_arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = [
        "repo:${var.github_org_repo}:environment:dev",
        "repo:${var.github_org_repo}:ref:refs/heads/main"
      ]
    }
  }
}

resource "aws_iam_role" "github_ci_dev" {
  name                 = "freshmart-github-ci-dev-role"
  description          = "GitHub Actions CI/CD execution role for DEV environment deployment"
  assume_role_policy   = data.aws_iam_policy_document.dev_trust.json
  max_session_duration = var.role_max_session_duration
  tags                 = merge(var.tags, { Environment = "dev" })
}

# -----------------------------------------------------------------------------
# 4. QA ROLE — Execution & Deployment for QA Environment
# -----------------------------------------------------------------------------
data "aws_iam_policy_document" "qa_trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [local.provider_arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = [
        "repo:${var.github_org_repo}:environment:qa",
        "repo:${var.github_org_repo}:ref:refs/heads/main"
      ]
    }
  }
}

resource "aws_iam_role" "github_ci_qa" {
  name                 = "freshmart-github-ci-qa-role"
  description          = "GitHub Actions CI/CD execution role for QA environment deployment"
  assume_role_policy   = data.aws_iam_policy_document.qa_trust.json
  max_session_duration = var.role_max_session_duration
  tags                 = merge(var.tags, { Environment = "qa" })
}

# -----------------------------------------------------------------------------
# 5. PROD ROLE — Execution & Deployment for PROD Environment
# -----------------------------------------------------------------------------
data "aws_iam_policy_document" "prod_trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [local.provider_arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = [
        "repo:${var.github_org_repo}:environment:prod",
        "repo:${var.github_org_repo}:ref:refs/tags/v*"
      ]
    }
  }
}

resource "aws_iam_role" "github_ci_prod" {
  name                 = "freshmart-github-ci-prod-role"
  description          = "GitHub Actions CI/CD execution role for PROD environment deployment"
  assume_role_policy   = data.aws_iam_policy_document.prod_trust.json
  max_session_duration = var.role_max_session_duration
  tags                 = merge(var.tags, { Environment = "prod" })
}

# -----------------------------------------------------------------------------
# 6. Deployment Permission Policy — Scoped to FreshMart Infrastructure
# -----------------------------------------------------------------------------
data "aws_iam_policy_document" "deploy_permissions" {
  # S3 Remote State Access (Bucket & Object Operations for S3 Native Locking)
  statement {
    sid       = "TerraformStateAccess"
    effect    = "Allow"
    actions   = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:ListBucket",
      "s3:GetBucketVersioning"
    ]
    resources = [
      "arn:aws:s3:::freshmart-terraform-state",
      "arn:aws:s3:::freshmart-terraform-state/*"
    ]
  }

  # S3 Static Web Asset Deployments
  statement {
    sid       = "S3AssetsDeploy"
    effect    = "Allow"
    actions   = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:ListBucket",
      "s3:DeleteObject"
    ]
    resources = [
      "arn:aws:s3:::freshmart-*",
      "arn:aws:s3:::freshmart-*/*"
    ]
  }

  # CloudFront Cache Invalidations
  statement {
    sid       = "CloudFrontInvalidation"
    effect    = "Allow"
    actions   = [
      "cloudfront:CreateInvalidation",
      "cloudfront:GetInvalidation",
      "cloudfront:GetDistribution"
    ]
    resources = ["*"]
  }

  # Lambda Deployment Updates
  statement {
    sid       = "LambdaDeployment"
    effect    = "Allow"
    actions   = [
      "lambda:GetFunction",
      "lambda:UpdateFunctionCode",
      "lambda:UpdateFunctionConfiguration",
      "lambda:PublishVersion",
      "lambda:UpdateAlias",
      "lambda:GetAlias"
    ]
    resources = ["arn:aws:lambda:${var.aws_region}:${data.aws_caller_identity.current.account_id}:function:freshmart-*"]
  }

  # Observability & Health Verification Read Access
  statement {
    sid       = "ObservabilityRead"
    effect    = "Allow"
    actions   = [
      "cloudwatch:DescribeAlarms",
      "cloudwatch:GetMetricData",
      "synthetics:DescribeCanaries",
      "synthetics:GetCanaryRuns"
    ]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "deploy_permissions" {
  name        = "freshmart-github-actions-deploy-policy"
  description = "Deployment policy for FreshMart GitHub Actions CI/CD execution roles"
  policy      = data.aws_iam_policy_document.deploy_permissions.json
  tags        = var.tags
}

resource "aws_iam_role_policy_attachment" "dev_attach" {
  role       = aws_iam_role.github_ci_dev.name
  policy_arn = aws_iam_policy.deploy_permissions.arn
}

resource "aws_iam_role_policy_attachment" "qa_attach" {
  role       = aws_iam_role.github_ci_qa.name
  policy_arn = aws_iam_policy.deploy_permissions.arn
}

resource "aws_iam_role_policy_attachment" "prod_attach" {
  role       = aws_iam_role.github_ci_prod.name
  policy_arn = aws_iam_policy.deploy_permissions.arn
}

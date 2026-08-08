# FreshMart GitHub Actions OIDC Module

# 1. GitHub OIDC OpenID Connect Provider
resource "aws_iam_openid_connect_provider" "github" {
  count           = var.create_oidc_provider ? 1 : 0
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [
    "6938fd5d98bab03faadb97b34396831e3780aea1", # GitHub Actions OIDC Thumbprint
    "1c2866c82703772034947936a0d244976c7c006b"
  ]

  tags = var.tags
}

locals {
  provider_arn = var.create_oidc_provider ? aws_iam_openid_connect_provider.github[0].arn : "arn:aws:iam::${data.aws_caller_identity.current.account_id}:oidc-provider/token.actions.githubusercontent.com"
}

data "aws_caller_identity" "current" {}

# 2. Environment Trust Policies & Roles

# ---------------------------------------------------
# DEV ROLE
# ---------------------------------------------------
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
        "repo:${var.github_org_repo}:ref:refs/heads/develop"
      ]
    }
  }
}

resource "aws_iam_role" "github_ci_dev" {
  name                 = "freshmart-github-ci-dev-role"
  assume_role_policy   = data.aws_iam_policy_document.dev_trust.json
  max_session_duration = var.role_max_session_duration
  tags                 = merge(var.tags, { Environment = "dev" })
}

# ---------------------------------------------------
# QA ROLE
# ---------------------------------------------------
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
        "repo:${var.github_org_repo}:ref:refs/heads/develop"
      ]
    }
  }
}

resource "aws_iam_role" "github_ci_qa" {
  name                 = "freshmart-github-ci-qa-role"
  assume_role_policy   = data.aws_iam_policy_document.qa_trust.json
  max_session_duration = var.role_max_session_duration
  tags                 = merge(var.tags, { Environment = "qa" })
}

# ---------------------------------------------------
# STAGING ROLE
# ---------------------------------------------------
data "aws_iam_policy_document" "staging_trust" {
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
        "repo:${var.github_org_repo}:environment:staging",
        "repo:${var.github_org_repo}:ref:refs/heads/staging"
      ]
    }
  }
}

resource "aws_iam_role" "github_ci_staging" {
  name                 = "freshmart-github-ci-staging-role"
  assume_role_policy   = data.aws_iam_policy_document.staging_trust.json
  max_session_duration = var.role_max_session_duration
  tags                 = merge(var.tags, { Environment = "staging" })
}

# ---------------------------------------------------
# PRODUCTION ROLE
# ---------------------------------------------------
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
        "repo:${var.github_org_repo}:environment:production",
        "repo:${var.github_org_repo}:ref:refs/tags/v*"
      ]
    }
  }
}

resource "aws_iam_role" "github_ci_prod" {
  name                 = "freshmart-github-ci-prod-role"
  assume_role_policy   = data.aws_iam_policy_document.prod_trust.json
  max_session_duration = var.role_max_session_duration
  tags                 = merge(var.tags, { Environment = "prod" })
}

# 3. Least Privilege Permission Policies

data "aws_iam_policy_document" "cicd_permissions" {
  # S3 Deployments
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

  # CloudFront Invalidations
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

  # Terraform State Locking & Management
  statement {
    sid       = "TerraformStateAccess"
    effect    = "Allow"
    actions   = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:ListBucket",
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:DeleteItem"
    ]
    resources = [
      "arn:aws:s3:::freshmart-tf-state-*",
      "arn:aws:s3:::freshmart-tf-state-*/*",
      "arn:aws:dynamodb:${var.aws_region}:${data.aws_caller_identity.current.account_id}:table/freshmart-tf-locks"
    ]
  }

  # Observability & CloudWatch Health Checks
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

resource "aws_iam_policy" "cicd_permissions" {
  name        = "freshmart-github-actions-cicd-policy"
  description = "Least privilege permission policy for FreshMart GitHub Actions CI/CD deployment roles"
  policy      = data.aws_iam_policy_document.cicd_permissions.json
  tags        = var.tags
}

resource "aws_iam_role_policy_attachment" "dev_attach" {
  role       = aws_iam_role.github_ci_dev.name
  policy_arn = aws_iam_policy.cicd_permissions.arn
}

resource "aws_iam_role_policy_attachment" "qa_attach" {
  role       = aws_iam_role.github_ci_qa.name
  policy_arn = aws_iam_policy.cicd_permissions.arn
}

resource "aws_iam_role_policy_attachment" "staging_attach" {
  role       = aws_iam_role.github_ci_staging.name
  policy_arn = aws_iam_policy.cicd_permissions.arn
}

resource "aws_iam_role_policy_attachment" "prod_attach" {
  role       = aws_iam_role.github_ci_prod.name
  policy_arn = aws_iam_policy.cicd_permissions.arn
}

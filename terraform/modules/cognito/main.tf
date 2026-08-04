data "aws_partition" "current" {}

locals {
  base_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Region      = var.aws_region
  }

  merged_tags = merge(local.base_tags, var.tags)

  user_pool_name           = coalesce(var.user_pool_name, "${var.project_name}-${var.environment}-users")
  domain_prefix            = coalesce(var.domain_prefix, "${var.project_name}-${var.environment}-auth")
  hosted_ui_domain_enabled = var.domain_prefix != null && trimspace(var.domain_prefix) != ""
  oauth_enabled            = local.hosted_ui_domain_enabled && length(var.callback_urls) > 0 && length(var.logout_urls) > 0
}

resource "aws_cognito_user_pool" "this" {
  name = local.user_pool_name

  mfa_configuration = var.mfa_configuration

  dynamic "software_token_mfa_configuration" {
    for_each = var.software_token_mfa_enabled ? [1] : []

    content {
      enabled = true
    }
  }

  auto_verified_attributes = ["email"]
  username_attributes      = ["email"]

  password_policy {
    minimum_length                   = var.password_policy.minimum_length
    require_lowercase                = var.password_policy.require_lowercase
    require_numbers                  = var.password_policy.require_numbers
    require_symbols                  = var.password_policy.require_symbols
    require_uppercase                = var.password_policy.require_uppercase
    temporary_password_validity_days = var.password_policy.temporary_password_validity_days
  }

  admin_create_user_config {
    allow_admin_create_user_only = false
  }

  dynamic "email_configuration" {
    for_each = var.ses_from_email_address != null && var.ses_source_arn != null ? [1] : []
    content {
      email_sending_account = "DEVELOPER"
      from_email_address    = var.ses_from_email_address
      source_arn            = var.ses_source_arn
    }
  }

  lambda_config {
    post_confirmation = aws_lambda_function.cognito_post_confirmation.arn
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "profile"
    required                 = false

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  tags = merge(local.merged_tags, {
    Name = local.user_pool_name
  })
}

resource "aws_cognito_user_pool_client" "this" {
  name         = "${local.user_pool_name}-client"
  user_pool_id = aws_cognito_user_pool.this.id

  generate_secret         = false
  enable_token_revocation = true

  prevent_user_existence_errors = "ENABLED"
  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]

  access_token_validity  = 1
  id_token_validity      = 1
  refresh_token_validity = 30

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  supported_identity_providers = ["COGNITO"]

  allowed_oauth_flows_user_pool_client = local.oauth_enabled
  allowed_oauth_flows                  = local.oauth_enabled ? ["code"] : null
  allowed_oauth_scopes                 = local.oauth_enabled ? ["openid", "email", "profile"] : null
  callback_urls                        = local.oauth_enabled ? var.callback_urls : null
  logout_urls                          = local.oauth_enabled ? var.logout_urls : null
  default_redirect_uri                 = local.oauth_enabled ? var.callback_urls[0] : null

  read_attributes      = ["email", "family_name", "given_name", "phone_number", "custom:profile"]
  write_attributes     = ["email", "family_name", "given_name", "phone_number"]
}

resource "aws_cognito_user_pool_domain" "this" {
  count = local.hosted_ui_domain_enabled ? 1 : 0

  domain       = local.domain_prefix
  user_pool_id = aws_cognito_user_pool.this.id
}

resource "aws_cognito_user_group" "this" {
  for_each = var.groups

  user_pool_id = aws_cognito_user_pool.this.id
  name         = each.key
  description  = try(each.value.description, null)
  precedence   = try(each.value.precedence, null)
}

resource "aws_cognito_identity_pool" "this" {
  identity_pool_name               = "${local.user_pool_name}-identity-pool"
  allow_unauthenticated_identities = false

  cognito_identity_providers {
    client_id               = aws_cognito_user_pool_client.this.id
    provider_name           = aws_cognito_user_pool.this.endpoint
    server_side_token_check = true
  }

  supported_login_providers = {}
}

data "aws_iam_policy_document" "assume_role_authenticated" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = ["cognito-identity.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "cognito-identity.amazonaws.com:aud"
      values   = [aws_cognito_identity_pool.this.id]
    }

    condition {
      test     = "ForAnyValue:StringLike"
      variable = "cognito-identity.amazonaws.com:amr"
      values   = ["authenticated"]
    }
  }
}

data "aws_iam_policy_document" "assume_role_unauthenticated" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = ["cognito-identity.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "cognito-identity.amazonaws.com:aud"
      values   = [aws_cognito_identity_pool.this.id]
    }

    condition {
      test     = "ForAnyValue:StringLike"
      variable = "cognito-identity.amazonaws.com:amr"
      values   = ["unauthenticated"]
    }
  }
}

resource "aws_iam_role" "authenticated" {
  name               = "${local.user_pool_name}-authenticated-role"
  assume_role_policy = data.aws_iam_policy_document.assume_role_authenticated.json
  tags               = merge(local.merged_tags, { Name = "${local.user_pool_name}-authenticated-role" })
}

resource "aws_iam_role" "unauthenticated" {
  name               = "${local.user_pool_name}-unauthenticated-role"
  assume_role_policy = data.aws_iam_policy_document.assume_role_unauthenticated.json
  tags               = merge(local.merged_tags, { Name = "${local.user_pool_name}-unauthenticated-role" })
}

resource "aws_cognito_identity_pool_roles_attachment" "this" {
  identity_pool_id = aws_cognito_identity_pool.this.id

  roles = {
    authenticated   = aws_iam_role.authenticated.arn
    unauthenticated = aws_iam_role.unauthenticated.arn
  }
}

data "archive_file" "cognito_post_confirmation" {
  type        = "zip"
  source_file = "${path.module}/src/post-confirmation.js"
  output_path = "${path.module}/dist/post-confirmation.zip"
}

resource "aws_iam_role" "cognito_post_confirmation" {
  name = "${local.user_pool_name}-post-conf-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(local.merged_tags, { Name = "${local.user_pool_name}-post-conf-role" })
}

resource "aws_iam_role_policy" "cognito_post_confirmation" {
  name = "${local.user_pool_name}-post-conf-policy"
  role = aws_iam_role.cognito_post_confirmation.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "cognito-idp:AdminUpdateUserAttributes"
        ]
        Resource = aws_cognito_user_pool.this.arn
      }
    ]
  })
}

resource "aws_lambda_function" "cognito_post_confirmation" {
  filename         = data.archive_file.cognito_post_confirmation.output_path
  source_code_hash = data.archive_file.cognito_post_confirmation.output_base64sha256
  function_name    = "${local.user_pool_name}-post-confirmation"
  role             = aws_iam_role.cognito_post_confirmation.arn
  handler          = "post-confirmation.handler"
  runtime          = "nodejs18.x"
  timeout          = 10

  tags = merge(local.merged_tags, { Name = "${local.user_pool_name}-post-confirmation" })
}

resource "aws_lambda_permission" "cognito_post_confirmation" {
  statement_id  = "AllowExecutionFromCognito"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cognito_post_confirmation.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.this.arn
}

resource "aws_cognito_user_pool_ui_customization" "this" {
  count = local.hosted_ui_domain_enabled ? 1 : 0

  user_pool_id = aws_cognito_user_pool.this.id
  client_id    = aws_cognito_user_pool_client.this.id

  css = <<EOF
/* Background page color */
.background-customizable {
  background-color: #f4fcf0 !important;
}
EOF

  depends_on = [
    aws_cognito_user_pool_domain.this
  ]
}

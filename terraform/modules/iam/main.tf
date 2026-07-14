data "aws_partition" "current" {}

data "aws_caller_identity" "current" {}

locals {
  # Build stable names from the service identity so the module stays reusable.
  base_name   = "${var.project_name}-${var.environment}-${var.service_name}"
  role_name   = coalesce(var.role_name, "${local.base_name}-lambda-execution-role")
  policy_name = coalesce(var.policy_name, "${local.base_name}-lambda-execution-policy")

  # Base tags provide consistent metadata for the role and policy.
  base_tags = {
    Name        = local.role_name
    Project     = var.project_name
    Environment = var.environment
    Service     = var.service_name
    ManagedBy   = "Terraform"
    Region      = var.aws_region
  }

  # Default Lambda log group naming keeps the module useful even without overrides.
  default_cloudwatch_logs_resources = [
    "arn:${data.aws_partition.current.partition}:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/${local.base_name}:*"
  ]

  cloudwatch_logs_resources = length(var.cloudwatch_logs_resource_arns) > 0 ? var.cloudwatch_logs_resource_arns : local.default_cloudwatch_logs_resources

  # Scope EventBridge permissions to explicit bus and rule name patterns.
  eventbridge_bus_resources = [
    for bus_name in var.eventbridge_bus_names :
    "arn:${data.aws_partition.current.partition}:events:${var.aws_region}:${data.aws_caller_identity.current.account_id}:event-bus/${bus_name}"
  ]

  eventbridge_rule_resources = [
    for rule_name_prefix in var.eventbridge_rule_name_prefixes :
    "arn:${data.aws_partition.current.partition}:events:${var.aws_region}:${data.aws_caller_identity.current.account_id}:rule/${rule_name_prefix}*"
  ]

  sns_publish_enabled         = coalesce(var.allow_sns_publish, false)
  sns_topic_resources         = coalesce(var.sns_topic_arns, [])
  sqs_send_message_enabled    = coalesce(var.allow_sqs_send_message, false)
  sqs_queue_resources         = coalesce(var.sqs_queue_arns, [])
  s3_object_access_enabled    = coalesce(var.allow_s3_object_access, false)
  s3_object_resources         = coalesce(var.s3_object_arns, [])
  cognito_user_pool_enabled   = coalesce(var.allow_cognito_user_pool_access, false)
  cognito_user_pool_resources = coalesce(var.cognito_user_pool_arns, [])

}

# Trust policy stays narrowly scoped to AWS Lambda.
data "aws_iam_policy_document" "assume_role" {
  statement {
    sid     = "LambdaAssumeRole"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

# Permission policy is assembled from reusable statements for each service need.
data "aws_iam_policy_document" "permissions" {
  dynamic "statement" {
    for_each = var.enable_cloudwatch_logs ? [1] : []

    content {
      sid = "CloudWatchLogs"

      actions = [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
      ]

      resources = local.cloudwatch_logs_resources
    }
  }

  dynamic "statement" {
    for_each = var.enable_xray ? [1] : []

    content {
      sid = "XRayTracing"

      actions = [
        "xray:PutTraceSegments",
        "xray:PutTelemetryRecords",
      ]

      resources = ["*"]
    }
  }

  dynamic "statement" {
    for_each = { for index, permission in var.dynamodb_table_permissions : tostring(index) => permission }

    content {
      sid = "DynamoDB${statement.key}"

      actions = statement.value.actions
      resources = [
        statement.value.table_arn,
        "${statement.value.table_arn}/index/*",
      ]
    }
  }

  dynamic "statement" {
    for_each = local.sns_publish_enabled ? [1] : []

    content {
      sid = "SNSPublish"

      actions = ["sns:Publish"]

      resources = local.sns_topic_resources
    }
  }

  dynamic "statement" {
    for_each = local.sqs_send_message_enabled ? [1] : []

    content {
      sid = "SQSSendMessage"

      actions = ["sqs:SendMessage"]

      resources = local.sqs_queue_resources
    }
  }

  dynamic "statement" {
    for_each = local.s3_object_access_enabled ? [1] : []

    content {
      sid = "S3ObjectAccess"

      actions = [
        "s3:PutObject",
        "s3:DeleteObject",
      ]

      resources = local.s3_object_resources
    }
  }

  dynamic "statement" {
    for_each = var.allow_eventbridge_put_events ? [1] : []

    content {
      sid = "EventBridgePutEvents"

      actions = ["events:PutEvents"]

      resources = local.eventbridge_bus_resources
    }
  }

  dynamic "statement" {
    for_each = local.cognito_user_pool_enabled ? [1] : []

    content {
      sid = "CognitoUserPoolAccess"

      actions = [
        "cognito-idp:AdminAddUserToGroup",
        "cognito-idp:AdminCreateUser",
        "cognito-idp:AdminDeleteUser",
        "cognito-idp:AdminGetUser",
        "cognito-idp:AdminSetUserMFAPreference",
        "cognito-idp:AdminSetUserPassword",
        "cognito-idp:AssociateSoftwareToken",
        "cognito-idp:ChangePassword",
        "cognito-idp:ConfirmForgotPassword",
        "cognito-idp:ForgotPassword",
        "cognito-idp:GlobalSignOut",
        "cognito-idp:GetUser",
        "cognito-idp:GetUserAttributeVerificationCode",
        "cognito-idp:InitiateAuth",
        "cognito-idp:ListUsers",
        "cognito-idp:RevokeToken",
        "cognito-idp:RespondToAuthChallenge",
        "cognito-idp:SetUserMFAPreference",
        "cognito-idp:VerifySoftwareToken",
        "cognito-idp:VerifyUserAttribute",
      ]

      resources = local.cognito_user_pool_resources
    }
  }

  dynamic "statement" {
    for_each = var.allow_eventbridge_read ? [1] : []

    content {
      sid = "EventBridgeReadScoped"

      actions = [
        "events:DescribeEventBus",
        "events:DescribeRule",
        "events:ListTargetsByRule",
        "events:TestEventPattern",
      ]

      resources = concat(local.eventbridge_bus_resources, local.eventbridge_rule_resources)
    }
  }

  dynamic "statement" {
    for_each = var.allow_eventbridge_read ? [1] : []

    content {
      sid = "EventBridgeListRules"

      actions   = ["events:ListRules"]
      resources = ["*"]
    }
  }
}

resource "aws_iam_role" "this" {
  name               = local.role_name
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
  description        = "Lambda execution role for ${var.service_name} in ${var.environment}."
  tags               = merge(local.base_tags, var.tags)

  lifecycle {
    precondition {
      condition     = !var.allow_eventbridge_put_events || length(var.eventbridge_bus_names) > 0
      error_message = "eventbridge_bus_names must be provided when allow_eventbridge_put_events is true."
    }

    precondition {
      condition     = !var.allow_eventbridge_read || (length(var.eventbridge_bus_names) > 0 || length(var.eventbridge_rule_name_prefixes) > 0)
      error_message = "eventbridge_bus_names or eventbridge_rule_name_prefixes must be provided when allow_eventbridge_read is true."
    }

    precondition {
      condition     = !local.sns_publish_enabled || length(local.sns_topic_resources) > 0
      error_message = "sns_topic_arns must be provided when allow_sns_publish is true."
    }

    precondition {
      condition     = !local.sqs_send_message_enabled || length(local.sqs_queue_resources) > 0
      error_message = "sqs_queue_arns must be provided when allow_sqs_send_message is true."
    }

    precondition {
      condition     = !local.s3_object_access_enabled || length(local.s3_object_resources) > 0
      error_message = "s3_object_arns must be provided when allow_s3_object_access is true."
    }

    precondition {
      condition     = !local.cognito_user_pool_enabled || length(local.cognito_user_pool_resources) > 0
      error_message = "cognito_user_pool_arns must be provided when allow_cognito_user_pool_access is true."
    }

    precondition {
      condition     = alltrue([for permission in var.dynamodb_table_permissions : length(permission.actions) > 0])
      error_message = "Each DynamoDB permission block must include at least one action."
    }
  }
}

resource "aws_iam_policy" "this" {
  name        = local.policy_name
  description = "Least-privilege execution policy for ${var.service_name} in ${var.environment}."
  policy      = data.aws_iam_policy_document.permissions.json
  tags        = merge(local.base_tags, var.tags)
}

resource "aws_iam_role_policy_attachment" "this" {
  role       = aws_iam_role.this.name
  policy_arn = aws_iam_policy.this.arn
}

resource "aws_iam_role_policy_attachment" "vpc_access" {
  count = var.enable_vpc_access ? 1 : 0

  role       = aws_iam_role.this.name
  policy_arn = "arn:${data.aws_partition.current.partition}:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

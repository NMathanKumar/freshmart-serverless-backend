
# ──────────────────────────────────────────────────────────────────────────────
# Lambda Insights – Enhanced Runtime Metrics
# Attaches the AWS-managed LambdaInsightsExtension layer to each Lambda
# function, providing CPU utilization, memory usage, cold starts, network I/O,
# disk I/O, and init duration metrics.
#
# Layer version is explicitly pinned — never auto-updated without review.
# To upgrade: update lambda_insights_layer_version in variables.tf and
# run terraform plan to review the change scope.
# ──────────────────────────────────────────────────────────────────────────────

# Region-specific Lambda Insights layer ARN lookup
# AWS publishes the layer per-region. The version is pinned via variable.
locals {
  lambda_insights_layer_arn = "arn:aws:lambda:${var.aws_region}:580247275435:layer:LambdaInsightsExtension:${var.lambda_insights_layer_version}"
}

# IAM policy to allow Lambda functions to emit Lambda Insights metrics
# This is additive — appended to existing execution roles via a separate policy
resource "aws_iam_policy" "lambda_insights" {
  count = var.enable_lambda_insights ? 1 : 0

  name        = "${var.project_name}-${var.environment}-lambda-insights-policy"
  description = "Allows Lambda functions to emit enhanced monitoring metrics to CloudWatch Lambda Insights."

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData",
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams"
        ]
        Resource = "*"
      }
    ]
  })

  tags = merge(var.tags, {
    Environment = var.environment
    ManagedBy   = "Terraform"
    Project     = var.project_name
    Purpose     = "LambdaInsights"
  })
}

# Attach Lambda Insights policy to each Lambda execution role
# This is purely additive — does not modify or replace existing policies.
resource "aws_iam_role_policy_attachment" "lambda_insights" {
  for_each = var.enable_lambda_insights ? var.lambda_function_role_arns : {}

  role       = each.value
  policy_arn = aws_iam_policy.lambda_insights[0].arn
}

# CloudWatch Log Group for Lambda Insights data
# Lambda Insights writes to /aws/lambda-insights/<function-name>
resource "aws_cloudwatch_log_group" "lambda_insights" {
  count = var.enable_lambda_insights ? 1 : 0

  name              = "/aws/lambda-insights"
  retention_in_days = var.log_retention_in_days

  tags = merge(var.tags, {
    Environment = var.environment
    Service     = "Lambda"
    Category    = "Compute"
    ManagedBy   = "Terraform"
    Project     = var.project_name
  })
}

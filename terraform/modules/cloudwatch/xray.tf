
# ──────────────────────────────────────────────────────────────────────────────
# X-Ray – Distributed Tracing
# Enables end-to-end request tracing across:
#   API Gateway → Lambda → DynamoDB → SQS → SNS → EventBridge
#
# IMPORTANT: Terraform provisions the sampling rule and IAM permissions.
# Application-level instrumentation (AWS X-Ray SDK) must be separately
# configured in each service for trace context to propagate correctly.
#
# Verify trace propagation across:
#   - API Gateway (enable Active Tracing in stage settings)
#   - Lambda (enable Active Tracing in function config)
#   - EventBridge, SNS, SQS (propagated via message attributes)
#   - DynamoDB (traced via X-Ray SDK instrumentation)
# ──────────────────────────────────────────────────────────────────────────────

# X-Ray Sampling Rule
# Controls what percentage of requests are traced.
# Default: 5% rate + 5 requests/sec reservoir (always sampled).
resource "aws_xray_sampling_rule" "default" {
  count = var.enable_xray_tracing ? 1 : 0

  rule_name      = "${var.project_name}-${var.environment}-default"
  priority       = 9999
  version        = 1
  reservoir_size = var.xray_reservoir_size
  fixed_rate     = var.xray_sampling_rate
  url_path       = "*"
  host           = "*"
  http_method    = "*"
  service_type   = "*"
  service_name   = "*"
  resource_arn   = "*"

  attributes = {}

  tags = merge(var.tags, {
    Environment = var.environment
    ManagedBy   = "Terraform"
    Project     = var.project_name
    Purpose     = "DistributedTracing"
  })
}

# High-priority sampling rule for payment service — always trace payment flows
resource "aws_xray_sampling_rule" "payment_full_trace" {
  count = var.enable_xray_tracing ? 1 : 0

  rule_name      = "${var.project_name}-${var.environment}-payment-trace"
  priority       = 100
  version        = 1
  reservoir_size = 50
  fixed_rate     = 1.0
  url_path       = "*"
  host           = "*"
  http_method    = "*"
  service_type   = "AWS::Lambda::Function"
  service_name   = "*payment*"
  resource_arn   = "*"

  attributes = {}

  tags = merge(var.tags, {
    Environment = var.environment
    ManagedBy   = "Terraform"
    Project     = var.project_name
    Purpose     = "PaymentTracing"
  })
}

# IAM policy granting X-Ray permissions to Lambda execution roles (additive)
resource "aws_iam_policy" "xray_write" {
  count = var.enable_xray_tracing ? 1 : 0

  name        = "${var.project_name}-${var.environment}-xray-write-policy"
  description = "Allows Lambda functions to emit traces to AWS X-Ray."

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "xray:PutTraceSegments",
          "xray:PutTelemetryRecords",
          "xray:GetSamplingRules",
          "xray:GetSamplingTargets",
          "xray:GetSamplingStatisticSummaries"
        ]
        Resource = "*"
      }
    ]
  })

  tags = merge(var.tags, {
    Environment = var.environment
    ManagedBy   = "Terraform"
    Project     = var.project_name
    Purpose     = "XRayTracing"
  })
}

# Attach X-Ray policy to each Lambda execution role (additive only)
resource "aws_iam_role_policy_attachment" "xray_write" {
  for_each = var.enable_xray_tracing ? var.lambda_function_role_arns : {}

  role       = each.value
  policy_arn = aws_iam_policy.xray_write[0].arn
}

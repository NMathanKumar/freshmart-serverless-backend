
# ──────────────────────────────────────────────────────────────────────────────
# Metric Filters – Structured Log → Custom CloudWatch Metrics
#
# Log schema verified against packages/shared/src/utils/logger.js:
#   ✅ level     — Winston format.json() always emits this
#   ✅ message   — passed to every logger.info/error/warn() call
#   ✅ service   — injected via defaultMeta: { service: config.serviceName }
#   ✅ statusCode — emitted by requestLogger.js on every HTTP request finish
#   ✅ correlationId — set from x-correlation-id header in requestLogger.js
#   ✅ coldStart  — tracked via isColdStart flag in logger.js
#   ✅ durationMs — emitted by requestLogger.js on request finish
# ──────────────────────────────────────────────────────────────────────────────

# ── 1. Authentication Failures ─────────────────────────────────────────────────
resource "aws_cloudwatch_log_metric_filter" "auth_failures" {
  for_each = {
    for k, v in var.lambda_functions : k => v
    if k == "auth"
  }

  name           = "${var.project_name}-${var.environment}-auth-failures"
  log_group_name = each.value.log_group_name

  pattern = "{ ($.level = \"error\" || $.level = \"warn\") && ($.message = \"*nauthorized*\" || $.message = \"*orbidden*\" || $.message = \"*nvalid token*\" || $.message = \"*uth*\") }"

  metric_transformation {
    name          = "AuthFailures"
    namespace     = "FreshMart/${var.environment}/Auth"
    value         = "1"
    default_value = "0"
    unit          = "Count"
  }
}

# ── 2. Payment Failures ────────────────────────────────────────────────────────
resource "aws_cloudwatch_log_metric_filter" "payment_failures" {
  for_each = {
    for k, v in var.lambda_functions : k => v
    if k == "payment"
  }

  name           = "${var.project_name}-${var.environment}-payment-failures"
  log_group_name = each.value.log_group_name

  pattern = "{ $.level = \"error\" }"

  metric_transformation {
    name          = "PaymentFailures"
    namespace     = "FreshMart/${var.environment}/Payments"
    value         = "1"
    default_value = "0"
    unit          = "Count"
  }
}

# ── 3. Order Failures ──────────────────────────────────────────────────────────
resource "aws_cloudwatch_log_metric_filter" "order_failures" {
  for_each = {
    for k, v in var.lambda_functions : k => v
    if k == "order"
  }

  name           = "${var.project_name}-${var.environment}-order-failures"
  log_group_name = each.value.log_group_name

  pattern = "{ $.level = \"error\" }"

  metric_transformation {
    name          = "OrderFailures"
    namespace     = "FreshMart/${var.environment}/Orders"
    value         = "1"
    default_value = "0"
    unit          = "Count"
  }
}

# ── 4. Application 5XX Errors (all services) ──────────────────────────────────
resource "aws_cloudwatch_log_metric_filter" "application_5xx" {
  for_each = var.lambda_functions

  name           = "${var.project_name}-${var.environment}-5xx-${each.key}"
  log_group_name = each.value.log_group_name

  pattern = "{ $.statusCode >= 500 }"

  metric_transformation {
    name          = "Application5XXErrors"
    namespace     = "FreshMart/${var.environment}/API"
    value         = "1"
    dimensions = {
      Service = "$.service"
    }
    unit = "Count"
  }
}

# ── 5. Cold Starts ─────────────────────────────────────────────────────────────
resource "aws_cloudwatch_log_metric_filter" "cold_starts" {
  for_each = var.lambda_functions

  name           = "${var.project_name}-${var.environment}-cold-starts-${each.key}"
  log_group_name = each.value.log_group_name

  # Matches logs where coldStart field is true (boolean JSON field)
  pattern = "{ $.coldStart IS TRUE }"

  metric_transformation {
    name          = "ColdStarts"
    namespace     = "FreshMart/${var.environment}/Lambda"
    value         = "1"
    dimensions = {
      Service = "$.service"
    }
    unit = "Count"
  }
}

# ── 6. Slow Requests (>2000ms) ─────────────────────────────────────────────────
resource "aws_cloudwatch_log_metric_filter" "slow_requests" {
  for_each = var.lambda_functions

  name           = "${var.project_name}-${var.environment}-slow-requests-${each.key}"
  log_group_name = each.value.log_group_name

  pattern = "{ $.durationMs > 2000 }"

  metric_transformation {
    name          = "SlowRequests"
    namespace     = "FreshMart/${var.environment}/API"
    value         = "1"
    dimensions = {
      Service = "$.service"
    }
    unit = "Count"
  }
}

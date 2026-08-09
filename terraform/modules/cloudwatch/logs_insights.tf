
# ──────────────────────────────────────────────────────────────────────────────
# Logs Insights – Saved Query Definitions
# Operators use these during incidents to diagnose issues without writing
# ad-hoc queries from scratch.
# ──────────────────────────────────────────────────────────────────────────────

locals {
  all_lambda_log_groups = [for k, v in var.lambda_functions : v.log_group_name]
}

resource "aws_cloudwatch_query_definition" "error_rate_by_service" {
  name            = "${var.project_name}/${var.environment}/ErrorRateByService"
  log_group_names = local.all_lambda_log_groups
  query_string    = <<-EOT
    fields @timestamp, level, service, message
    | filter level = "error"
    | stats count(*) as errorCount by service
    | sort errorCount desc
    | limit 20
  EOT
}

resource "aws_cloudwatch_query_definition" "top_erroring_functions" {
  name            = "${var.project_name}/${var.environment}/TopErroringFunctions"
  log_group_names = local.all_lambda_log_groups
  query_string    = <<-EOT
    fields @timestamp, level, service, message, @logStream
    | filter level = "error"
    | stats count(*) as errorCount by @logStream, service
    | sort errorCount desc
    | limit 20
  EOT
}

resource "aws_cloudwatch_query_definition" "top_slowest_functions" {
  name            = "${var.project_name}/${var.environment}/TopSlowestFunctions"
  log_group_names = local.all_lambda_log_groups
  query_string    = <<-EOT
    fields @timestamp, service, durationMs, endpoint, statusCode
    | filter ispresent(durationMs)
    | stats avg(durationMs) as avgDuration, max(durationMs) as maxDuration, pct(durationMs, 95) as p95Duration by service
    | sort p95Duration desc
    | limit 20
  EOT
}

resource "aws_cloudwatch_query_definition" "cold_start_frequency" {
  name            = "${var.project_name}/${var.environment}/ColdStartFrequency"
  log_group_names = local.all_lambda_log_groups
  query_string    = <<-EOT
    fields @timestamp, service, coldStart
    | filter coldStart = true
    | stats count(*) as coldStarts by service, bin(1h)
    | sort coldStarts desc
  EOT
}

resource "aws_cloudwatch_query_definition" "cold_start_trend_24h" {
  name            = "${var.project_name}/${var.environment}/ColdStartTrend24h"
  log_group_names = local.all_lambda_log_groups
  query_string    = <<-EOT
    fields @timestamp, service, coldStart
    | filter coldStart = true
    | stats count(*) as coldStarts by bin(15m)
    | sort @timestamp asc
  EOT
}

resource "aws_cloudwatch_query_definition" "auth_failures" {
  name = "${var.project_name}/${var.environment}/AuthenticationFailures"
  log_group_names = [
    for k, v in var.lambda_functions : v.log_group_name
    if k == "auth"
  ]
  query_string = <<-EOT
    fields @timestamp, level, message, correlationId, requestId, statusCode
    | filter level = "error" or level = "warn"
    | filter message like /[Aa]uth/ or message like /[Uu]nauthorized/ or message like /[Ff]orbidden/ or message like /[Ii]nvalid token/
    | sort @timestamp desc
    | limit 100
  EOT
}

resource "aws_cloudwatch_query_definition" "payment_failures" {
  name = "${var.project_name}/${var.environment}/PaymentFailures"
  log_group_names = [
    for k, v in var.lambda_functions : v.log_group_name
    if k == "payment"
  ]
  query_string = <<-EOT
    fields @timestamp, level, message, correlationId, requestId, statusCode
    | filter level = "error"
    | sort @timestamp desc
    | limit 100
  EOT
}

resource "aws_cloudwatch_query_definition" "payment_timeout_analysis" {
  name = "${var.project_name}/${var.environment}/PaymentTimeoutAnalysis"
  log_group_names = [
    for k, v in var.lambda_functions : v.log_group_name
    if k == "payment"
  ]
  query_string = <<-EOT
    fields @timestamp, message, durationMs, correlationId
    | filter message like /[Tt]imeout/ or message like /[Tt]ime out/ or durationMs > 10000
    | stats count(*) as timeoutCount, avg(durationMs) as avgDuration, max(durationMs) as maxDuration by bin(1h)
    | sort @timestamp desc
  EOT
}

resource "aws_cloudwatch_query_definition" "slow_requests" {
  name            = "${var.project_name}/${var.environment}/SlowRequests"
  log_group_names = local.all_lambda_log_groups
  query_string    = <<-EOT
    fields @timestamp, service, endpoint, method, durationMs, statusCode, correlationId
    | filter durationMs > 2000
    | sort durationMs desc
    | limit 100
  EOT
}

resource "aws_cloudwatch_query_definition" "most_frequent_api_routes" {
  name            = "${var.project_name}/${var.environment}/MostFrequentAPIRoutes"
  log_group_names = local.all_lambda_log_groups
  query_string    = <<-EOT
    fields @timestamp, method, endpoint, statusCode, service
    | filter ispresent(endpoint) and ispresent(method)
    | stats count(*) as requestCount, avg(durationMs) as avgDuration by method, endpoint
    | sort requestCount desc
    | limit 30
  EOT
}

resource "aws_cloudwatch_query_definition" "dynamodb_errors" {
  name            = "${var.project_name}/${var.environment}/MostFrequentDynamoDBErrors"
  log_group_names = local.all_lambda_log_groups
  query_string    = <<-EOT
    fields @timestamp, level, message, service, errorName, errorCode
    | filter level = "error"
    | filter message like /[Dd]ynamo/ or errorName like /[Dd]ynamo/ or message like /[Cc]onditional[Cc]heck/ or message like /[Pp]rovisioned[Tt]hroughput/
    | stats count(*) as errorCount by service, errorName, errorCode
    | sort errorCount desc
    | limit 20
  EOT
}

resource "aws_cloudwatch_query_definition" "dlq_poison_messages" {
  name            = "${var.project_name}/${var.environment}/DLQPoisonMessages"
  log_group_names = local.all_lambda_log_groups
  query_string    = <<-EOT
    fields @timestamp, level, message, service, correlationId, requestId
    | filter level = "error"
    | filter message like /[Dd][Ll][Qq]/ or message like /[Dd]ead.letter/ or message like /[Pp]oison/ or message like /[Rr]etry.*exhausted/
    | sort @timestamp desc
    | limit 50
  EOT
}

resource "aws_cloudwatch_query_definition" "correlation_id_trace" {
  name            = "${var.project_name}/${var.environment}/CorrelationIdTracing"
  log_group_names = local.all_lambda_log_groups
  query_string    = <<-EOT
    fields @timestamp, level, service, message, correlationId, statusCode, durationMs
    | filter correlationId = "REPLACE_WITH_CORRELATION_ID"
    | sort @timestamp asc
  EOT
}

resource "aws_cloudwatch_query_definition" "top_correlation_ids_by_error" {
  name            = "${var.project_name}/${var.environment}/TopCorrelationIdsByError"
  log_group_names = local.all_lambda_log_groups
  query_string    = <<-EOT
    fields @timestamp, level, correlationId, service, message
    | filter level = "error" and ispresent(correlationId)
    | stats count(*) as errorCount by correlationId
    | sort errorCount desc
    | limit 10
  EOT
}

resource "aws_cloudwatch_query_definition" "exception_heatmap" {
  name            = "${var.project_name}/${var.environment}/ExceptionHeatmap24h"
  log_group_names = local.all_lambda_log_groups
  query_string    = <<-EOT
    fields @timestamp, level, errorName, errorCode, service, message
    | filter level = "error"
    | stats count(*) as errorCount by errorName, errorCode, service
    | sort errorCount desc
    | limit 50
  EOT
}

resource "aws_cloudwatch_query_definition" "recent_deployment_errors" {
  name            = "${var.project_name}/${var.environment}/RecentDeploymentErrors"
  log_group_names = local.all_lambda_log_groups
  query_string    = <<-EOT
    fields @timestamp, level, service, message, errorName, errorCode, @logStream
    | filter level = "error"
    | filter @timestamp >= (now() - 30 * 60 * 1000)
    | stats count(*) as errorCount by service, errorName
    | sort errorCount desc
    | limit 30
  EOT
}

locals {
  # Keep names and tags consistent across every CloudWatch resource.
  base_tags = {
    Name        = "${var.project_name}-${var.environment}-observability"
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Region      = var.aws_region
  }

  merged_tags = merge(local.base_tags, var.tags)

  # Normalize inputs for dashboard widgets and outputs.
  dashboard_name = coalesce(var.dashboard_name, "${var.project_name}-${var.environment}-observability")

  lambda_functions = var.lambda_functions
  dynamodb_tables  = var.dynamodb_tables

  # Precompute reusable metric definitions so the dashboard stays readable.
  lambda_error_metrics = [
    for key, fn in local.lambda_functions : [
      "AWS/Lambda",
      "Errors",
      "FunctionName",
      fn.function_name,
      {
        stat   = "Sum"
        period = var.metric_period_seconds
        region = var.aws_region
        label  = key
      }
    ]
  ]

  lambda_duration_metrics = [
    for key, fn in local.lambda_functions : [
      "AWS/Lambda",
      "Duration",
      "FunctionName",
      fn.function_name,
      {
        stat   = "Average"
        period = var.metric_period_seconds
        region = var.aws_region
        label  = key
      }
    ]
  ]

  lambda_throttle_metrics = [
    for key, fn in local.lambda_functions : [
      "AWS/Lambda",
      "Throttles",
      "FunctionName",
      fn.function_name,
      {
        stat   = "Sum"
        period = var.metric_period_seconds
        region = var.aws_region
        label  = key
      }
    ]
  ]

  dynamodb_read_throttle_metrics = [
    for key, table in local.dynamodb_tables : [
      "AWS/DynamoDB",
      "ReadThrottleEvents",
      "TableName",
      table.table_name,
      {
        stat   = "Sum"
        period = var.metric_period_seconds
        region = var.aws_region
        label  = key
      }
    ]
  ]

  dynamodb_write_throttle_metrics = [
    for key, table in local.dynamodb_tables : [
      "AWS/DynamoDB",
      "WriteThrottleEvents",
      "TableName",
      table.table_name,
      {
        stat   = "Sum"
        period = var.metric_period_seconds
        region = var.aws_region
        label  = key
      }
    ]
  ]

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          title   = "Lambda Errors"
          region  = var.aws_region
          stat    = "Sum"
          period  = var.metric_period_seconds
          metrics = local.lambda_error_metrics
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          title   = "Lambda Duration"
          region  = var.aws_region
          stat    = "Average"
          period  = var.metric_period_seconds
          metrics = local.lambda_duration_metrics
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6
        properties = {
          title   = "Lambda Throttles"
          region  = var.aws_region
          stat    = "Sum"
          period  = var.metric_period_seconds
          metrics = local.lambda_throttle_metrics
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 6
        width  = 12
        height = 6
        properties = {
          title  = "API Gateway 5XX"
          region = var.aws_region
          stat   = "Sum"
          period = var.metric_period_seconds
          metrics = [
            [
              "AWS/ApiGateway",
              "5XXError",
              "ApiId",
              var.api_id,
              "Stage",
              var.api_stage_name,
              {
                stat   = "Sum"
                period = var.metric_period_seconds
                region = var.aws_region
              }
            ]
          ]
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 12
        width  = 12
        height = 6
        properties = {
          title  = "API Gateway Latency"
          region = var.aws_region
          stat   = "Average"
          period = var.metric_period_seconds
          metrics = [
            [
              "AWS/ApiGateway",
              "Latency",
              "ApiId",
              var.api_id,
              "Stage",
              var.api_stage_name,
              {
                stat   = "Average"
                period = var.metric_period_seconds
                region = var.aws_region
              }
            ]
          ]
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 12
        width  = 12
        height = 6
        properties = {
          title   = "DynamoDB Read Throttle"
          region  = var.aws_region
          stat    = "Sum"
          period  = var.metric_period_seconds
          metrics = local.dynamodb_read_throttle_metrics
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 18
        width  = 12
        height = 6
        properties = {
          title   = "DynamoDB Write Throttle"
          region  = var.aws_region
          stat    = "Sum"
          period  = var.metric_period_seconds
          metrics = local.dynamodb_write_throttle_metrics
        }
      },
    ]
  })
}

# The dashboard gives a single-pane operational view across Lambda, API Gateway, and DynamoDB.
resource "aws_cloudwatch_dashboard" "this" {
  dashboard_name = local.dashboard_name
  dashboard_body = local.dashboard_body
}

# Lambda error alarms help surface code failures quickly.
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  for_each = local.lambda_functions

  alarm_name          = "${var.project_name}-${var.environment}-${each.key}-lambda-errors"
  alarm_description   = "Lambda errors for ${each.value.function_name}."
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = var.evaluation_periods
  datapoints_to_alarm = var.datapoints_to_alarm
  threshold           = var.lambda_error_threshold
  namespace           = "AWS/Lambda"
  metric_name         = "Errors"
  statistic           = "Sum"
  period              = var.metric_period_seconds
  dimensions = {
    FunctionName = each.value.function_name
  }
  treat_missing_data = "notBreaching"
  actions_enabled    = length(var.alarm_actions) > 0 || length(var.ok_actions) > 0
  alarm_actions      = var.alarm_actions
  ok_actions         = var.ok_actions
  tags               = local.merged_tags
}

# Lambda duration alarms catch latency regressions before they become outages.
resource "aws_cloudwatch_metric_alarm" "lambda_duration" {
  for_each = local.lambda_functions

  alarm_name          = "${var.project_name}-${var.environment}-${each.key}-lambda-duration"
  alarm_description   = "Lambda duration for ${each.value.function_name}."
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = var.evaluation_periods
  datapoints_to_alarm = var.datapoints_to_alarm
  threshold           = var.lambda_duration_threshold_ms
  namespace           = "AWS/Lambda"
  metric_name         = "Duration"
  statistic           = "Average"
  unit                = "Milliseconds"
  period              = var.metric_period_seconds
  dimensions = {
    FunctionName = each.value.function_name
  }
  treat_missing_data = "notBreaching"
  actions_enabled    = length(var.alarm_actions) > 0 || length(var.ok_actions) > 0
  alarm_actions      = var.alarm_actions
  ok_actions         = var.ok_actions
  tags               = local.merged_tags
}

# Lambda throttles indicate concurrency pressure or insufficient reserved capacity.
resource "aws_cloudwatch_metric_alarm" "lambda_throttles" {
  for_each = local.lambda_functions

  alarm_name          = "${var.project_name}-${var.environment}-${each.key}-lambda-throttles"
  alarm_description   = "Lambda throttles for ${each.value.function_name}."
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = var.evaluation_periods
  datapoints_to_alarm = var.datapoints_to_alarm
  threshold           = var.lambda_throttle_threshold
  namespace           = "AWS/Lambda"
  metric_name         = "Throttles"
  statistic           = "Sum"
  period              = var.metric_period_seconds
  dimensions = {
    FunctionName = each.value.function_name
  }
  treat_missing_data = "notBreaching"
  actions_enabled    = length(var.alarm_actions) > 0 || length(var.ok_actions) > 0
  alarm_actions      = var.alarm_actions
  ok_actions         = var.ok_actions
  tags               = local.merged_tags
}

# API Gateway 5XX alarms track server-side failures at the API edge.
resource "aws_cloudwatch_metric_alarm" "api_gateway_5xx" {
  alarm_name          = "${var.project_name}-${var.environment}-api-5xx"
  alarm_description   = "HTTP API 5XX errors."
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = var.evaluation_periods
  datapoints_to_alarm = var.datapoints_to_alarm
  threshold           = var.api_5xx_threshold
  namespace           = "AWS/ApiGateway"
  metric_name         = "5XXError"
  statistic           = "Sum"
  period              = var.metric_period_seconds
  dimensions = {
    ApiId = var.api_id
    Stage = var.api_stage_name
  }
  treat_missing_data = "notBreaching"
  actions_enabled    = length(var.alarm_actions) > 0 || length(var.ok_actions) > 0
  alarm_actions      = var.alarm_actions
  ok_actions         = var.ok_actions
  tags               = local.merged_tags
}

# API Gateway latency alarms highlight slow route execution.
resource "aws_cloudwatch_metric_alarm" "api_gateway_latency" {
  alarm_name          = "${var.project_name}-${var.environment}-api-latency"
  alarm_description   = "HTTP API latency."
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = var.evaluation_periods
  datapoints_to_alarm = var.datapoints_to_alarm
  threshold           = var.api_latency_threshold_ms
  namespace           = "AWS/ApiGateway"
  metric_name         = "Latency"
  statistic           = "Average"
  unit                = "Milliseconds"
  period              = var.metric_period_seconds
  dimensions = {
    ApiId = var.api_id
    Stage = var.api_stage_name
  }
  treat_missing_data = "notBreaching"
  actions_enabled    = length(var.alarm_actions) > 0 || length(var.ok_actions) > 0
  alarm_actions      = var.alarm_actions
  ok_actions         = var.ok_actions
  tags               = local.merged_tags
}

# DynamoDB read throttle alarms protect against hot partitions and unplanned bursts.
resource "aws_cloudwatch_metric_alarm" "dynamodb_read_throttle" {
  for_each = local.dynamodb_tables

  alarm_name          = "${var.project_name}-${var.environment}-${each.key}-ddb-read-throttle"
  alarm_description   = "DynamoDB read throttles for ${each.value.table_name}."
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = var.evaluation_periods
  datapoints_to_alarm = var.datapoints_to_alarm
  threshold           = var.dynamodb_read_throttle_threshold
  namespace           = "AWS/DynamoDB"
  metric_name         = "ReadThrottleEvents"
  statistic           = "Sum"
  period              = var.metric_period_seconds
  dimensions = {
    TableName = each.value.table_name
  }
  treat_missing_data = "notBreaching"
  actions_enabled    = length(var.alarm_actions) > 0 || length(var.ok_actions) > 0
  alarm_actions      = var.alarm_actions
  ok_actions         = var.ok_actions
  tags               = local.merged_tags
}

# DynamoDB write throttle alarms surface write pressure before it impacts customers.
resource "aws_cloudwatch_metric_alarm" "dynamodb_write_throttle" {
  for_each = local.dynamodb_tables

  alarm_name          = "${var.project_name}-${var.environment}-${each.key}-ddb-write-throttle"
  alarm_description   = "DynamoDB write throttles for ${each.value.table_name}."
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = var.evaluation_periods
  datapoints_to_alarm = var.datapoints_to_alarm
  threshold           = var.dynamodb_write_throttle_threshold
  namespace           = "AWS/DynamoDB"
  metric_name         = "WriteThrottleEvents"
  statistic           = "Sum"
  period              = var.metric_period_seconds
  dimensions = {
    TableName = each.value.table_name
  }
  treat_missing_data = "notBreaching"
  actions_enabled    = length(var.alarm_actions) > 0 || length(var.ok_actions) > 0
  alarm_actions      = var.alarm_actions
  ok_actions         = var.ok_actions
  tags               = local.merged_tags
}

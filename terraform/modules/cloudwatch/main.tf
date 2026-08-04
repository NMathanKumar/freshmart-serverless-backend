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

  lambda_invocations_metrics = [
    for key, fn in local.lambda_functions : [
      "AWS/Lambda", "Invocations", "FunctionName", fn.function_name,
      { stat = "Sum", period = var.metric_period_seconds, region = var.aws_region, label = key }
    ]
  ]

  lambda_concurrent_executions_metrics = [
    for key, fn in local.lambda_functions : [
      "AWS/Lambda", "ConcurrentExecutions", "FunctionName", fn.function_name,
      { stat = "Maximum", period = var.metric_period_seconds, region = var.aws_region, label = key }
    ]
  ]

  sqs_queue_depth_metrics = [
    for key, q in var.sqs_queues : [
      "AWS/SQS", "ApproximateNumberOfMessagesVisible", "QueueName", q.queue_name,
      { stat = "Average", period = var.metric_period_seconds, region = var.aws_region, label = key }
    ]
  ]

  sqs_dlq_depth_metrics = [
    for key, q in var.sqs_dlqs : [
      "AWS/SQS", "ApproximateNumberOfMessagesVisible", "QueueName", q.queue_name,
      { stat = "Average", period = var.metric_period_seconds, region = var.aws_region, label = key }
    ]
  ]

  sns_published_metrics = [
    for key, t in var.sns_topics : [
      "AWS/SNS", "NumberOfMessagesPublished", "TopicName", t.topic_name,
      { stat = "Sum", period = var.metric_period_seconds, region = var.aws_region, label = key }
    ]
  ]

  sns_failed_metrics = [
    for key, t in var.sns_topics : [
      "AWS/SNS", "NumberOfNotificationsFailed", "TopicName", t.topic_name,
      { stat = "Sum", period = var.metric_period_seconds, region = var.aws_region, label = key }
    ]
  ]

  cloudfront_requests_metrics = [
    for key, d in var.cloudfront_distributions : [
      "AWS/CloudFront", "Requests", "DistributionId", d.distribution_id, "Region", "Global",
      { stat = "Sum", period = var.metric_period_seconds, region = "us-east-1", label = "${key} Requests" }
    ]
  ]

  cloudfront_bytes_metrics = [
    for key, d in var.cloudfront_distributions : [
      "AWS/CloudFront", "BytesDownloaded", "DistributionId", d.distribution_id, "Region", "Global",
      { stat = "Sum", period = var.metric_period_seconds, region = "us-east-1", label = "${key} Bytes" }
    ]
  ]

  cloudfront_4xx_metrics = [
    for key, d in var.cloudfront_distributions : [
      "AWS/CloudFront", "4xxErrorRate", "DistributionId", d.distribution_id, "Region", "Global",
      { stat = "Average", period = var.metric_period_seconds, region = "us-east-1", label = "${key} 4xx" }
    ]
  ]

  cloudfront_5xx_metrics = [
    for key, d in var.cloudfront_distributions : [
      "AWS/CloudFront", "5xxErrorRate", "DistributionId", d.distribution_id, "Region", "Global",
      { stat = "Average", period = var.metric_period_seconds, region = "us-east-1", label = "${key} 5xx" }
    ]
  ]

  eventbridge_matched_metrics = var.eventbridge_bus_name != "" ? [
    [
      "AWS/Events", "MatchedEvents", "EventBusName", var.eventbridge_bus_name,
      { stat = "Sum", period = var.metric_period_seconds, region = var.aws_region, label = "Matched Events" }
    ]
  ] : []

  eventbridge_failed_metrics = var.eventbridge_bus_name != "" ? [
    [
      "AWS/Events", "FailedInvocations", "EventBusName", var.eventbridge_bus_name,
      { stat = "Sum", period = var.metric_period_seconds, region = var.aws_region, label = "Failed Invocations" }
    ]
  ] : []

  synthetic_availability_metrics = var.enable_synthetic_monitoring ? [
    [
      "FreshMart/Synthetic", "EndpointAvailability", "Endpoint", "/v1/products",
      { stat = "Average", period = var.metric_period_seconds, region = var.aws_region, label = "/v1/products" }
    ],
    [
      "FreshMart/Synthetic", "EndpointAvailability", "Endpoint", "/v1/menu",
      { stat = "Average", period = var.metric_period_seconds, region = var.aws_region, label = "/v1/menu" }
    ],
    [
      "FreshMart/Synthetic", "EndpointAvailability", "Endpoint", "/v1/admin/health",
      { stat = "Average", period = var.metric_period_seconds, region = var.aws_region, label = "/v1/admin/health" }
    ]
  ] : []

  synthetic_response_time_metrics = var.enable_synthetic_monitoring ? [
    [
      "FreshMart/Synthetic", "ResponseTime", "Endpoint", "/v1/products",
      { stat = "Average", period = var.metric_period_seconds, region = var.aws_region, label = "/v1/products" }
    ],
    [
      "FreshMart/Synthetic", "ResponseTime", "Endpoint", "/v1/menu",
      { stat = "Average", period = var.metric_period_seconds, region = var.aws_region, label = "/v1/menu" }
    ],
    [
      "FreshMart/Synthetic", "ResponseTime", "Endpoint", "/v1/admin/health",
      { stat = "Average", period = var.metric_period_seconds, region = var.aws_region, label = "/v1/admin/health" }
    ]
  ] : []

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


      {
        type   = "metric"
        width  = 12
        height = 6
        properties = {
          title   = "Lambda Invocations"
          region  = var.aws_region
          stat    = "Sum"
          period  = var.metric_period_seconds
          metrics = local.lambda_invocations_metrics
        }
      },
      {
        type   = "metric"
        width  = 12
        height = 6
        properties = {
          title   = "Lambda Concurrent Executions"
          region  = var.aws_region
          stat    = "Maximum"
          period  = var.metric_period_seconds
          metrics = local.lambda_concurrent_executions_metrics
        }
      },
      {
        type   = "metric"
        width  = 12
        height = 6
        properties = {
          title  = "API Gateway Request Count"
          region = var.aws_region
          stat   = "Sum"
          period = var.metric_period_seconds
          metrics = [
            ["AWS/ApiGateway", "Count", "ApiId", var.api_id, "Stage", var.api_stage_name, { stat = "Sum", period = var.metric_period_seconds, region = var.aws_region }]
          ]
        }
      },
      {
        type   = "metric"
        width  = 12
        height = 6
        properties = {
          title  = "API Gateway 4XX Errors"
          region = var.aws_region
          stat   = "Sum"
          period = var.metric_period_seconds
          metrics = [
            ["AWS/ApiGateway", "4XXError", "ApiId", var.api_id, "Stage", var.api_stage_name, { stat = "Sum", period = var.metric_period_seconds, region = var.aws_region }]
          ]
        }
      },
      {
        type   = "metric"
        width  = 12
        height = 6
        properties = {
          title   = "SQS Queue Depth"
          region  = var.aws_region
          stat    = "Average"
          period  = var.metric_period_seconds
          metrics = local.sqs_queue_depth_metrics
        }
      },
      {
        type   = "metric"
        width  = 12
        height = 6
        properties = {
          title   = "SQS DLQ Depth"
          region  = var.aws_region
          stat    = "Average"
          period  = var.metric_period_seconds
          metrics = local.sqs_dlq_depth_metrics
        }
      },
      {
        type   = "metric"
        width  = 12
        height = 6
        properties = {
          title   = "EventBridge Matched Events"
          region  = var.aws_region
          stat    = "Sum"
          period  = var.metric_period_seconds
          metrics = local.eventbridge_matched_metrics
        }
      },
      {
        type   = "metric"
        width  = 12
        height = 6
        properties = {
          title   = "EventBridge Failed Invocations"
          region  = var.aws_region
          stat    = "Sum"
          period  = var.metric_period_seconds
          metrics = local.eventbridge_failed_metrics
        }
      },
      {
        type   = "metric"
        width  = 12
        height = 6
        properties = {
          title   = "SNS Messages Published"
          region  = var.aws_region
          stat    = "Sum"
          period  = var.metric_period_seconds
          metrics = local.sns_published_metrics
        }
      },
      {
        type   = "metric"
        width  = 12
        height = 6
        properties = {
          title   = "SNS Notifications Failed"
          region  = var.aws_region
          stat    = "Sum"
          period  = var.metric_period_seconds
          metrics = local.sns_failed_metrics
        }
      },
      {
        type   = "metric"
        width  = 12
        height = 6
        properties = {
          title   = "CloudFront Requests"
          region  = "us-east-1"
          stat    = "Sum"
          period  = var.metric_period_seconds
          metrics = local.cloudfront_requests_metrics
        }
      },
      {
        type   = "metric"
        width  = 12
        height = 6
        properties = {
          title   = "CloudFront Bytes Downloaded"
          region  = "us-east-1"
          stat    = "Sum"
          period  = var.metric_period_seconds
          metrics = local.cloudfront_bytes_metrics
        }
      },
      {
        type   = "metric"
        width  = 12
        height = 6
        properties = {
          title   = "CloudFront Error Rates (4xx + 5xx)"
          region  = "us-east-1"
          stat    = "Average"
          period  = var.metric_period_seconds
          metrics = concat(local.cloudfront_4xx_metrics, local.cloudfront_5xx_metrics)
        }
      },
      {
        type   = "metric"
        width  = 12
        height = 6
        properties = {
          title   = "Synthetic Endpoint Availability"
          region  = var.aws_region
          stat    = "Average"
          period  = var.metric_period_seconds
          metrics = local.synthetic_availability_metrics
        }
      },
      {
        type   = "metric"
        width  = 12
        height = 6
        properties = {
          title   = "Synthetic Response Time"
          region  = var.aws_region
          stat    = "Average"
          period  = var.metric_period_seconds
          metrics = local.synthetic_response_time_metrics
        }
      },


      {
        type   = "text"
        width  = 24
        height = 2
        properties = {
          markdown = "## Service Level Objectives (SLOs)"
        }
      },
      {
        type   = "metric"
        width  = 12
        height = 6
        properties = {
          title  = "API Availability (Target: >= 99.9%)"
          region = var.aws_region
          period = var.metric_period_seconds
          stat   = "Sum"
          metrics = [
            [{ expression = "(1 - (m2 / m1)) * 100", label = "Availability %", id = "e1", region = var.aws_region }],
            ["AWS/ApiGateway", "Count", "ApiId", var.api_id, "Stage", var.api_stage_name, { id = "m1", visible = false, stat = "Sum", region = var.aws_region }],
            ["AWS/ApiGateway", "5XXError", "ApiId", var.api_id, "Stage", var.api_stage_name, { id = "m2", visible = false, stat = "Sum", region = var.aws_region }]
          ]
        }
      },
      {
        type   = "metric"
        width  = 12
        height = 6
        properties = {
          title  = "API p95 Latency (Target: < 500ms)"
          region = var.aws_region
          stat   = "p95"
          period = var.metric_period_seconds
          metrics = [
            ["AWS/ApiGateway", "Latency", "ApiId", var.api_id, "Stage", var.api_stage_name, { stat = "p95", period = var.metric_period_seconds, region = var.aws_region }]
          ]
        }
      },
      {
        type   = "metric"
        width  = 12
        height = 6
        properties = {
          title  = "API 5xx Rate %"
          region = var.aws_region
          period = var.metric_period_seconds
          stat   = "Sum"
          metrics = [
            [{ expression = "(m2 / m1) * 100", label = "5xx Rate %", id = "e1", region = var.aws_region }],
            ["AWS/ApiGateway", "Count", "ApiId", var.api_id, "Stage", var.api_stage_name, { id = "m1", visible = false, stat = "Sum", region = var.aws_region }],
            ["AWS/ApiGateway", "5XXError", "ApiId", var.api_id, "Stage", var.api_stage_name, { id = "m2", visible = false, stat = "Sum", region = var.aws_region }]
          ]
        }
      },
      {
        type   = "metric"
        width  = 12
        height = 6
        properties = {
          title  = "Lambda Error Rate %"
          region = var.aws_region
          period = var.metric_period_seconds
          stat   = "Sum"
          metrics = [
            [{ expression = "SUM(METRICS('errors')) / SUM(METRICS('invocations')) * 100", label = "Error Rate %", id = "e1", region = var.aws_region }],
            ["AWS/Lambda", "Errors", { id = "errors", visible = false, stat = "Sum", region = var.aws_region }],
            ["AWS/Lambda", "Invocations", { id = "invocations", visible = false, stat = "Sum", region = var.aws_region }]
          ]
        }
      }

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

# SQS DLQ message count > 0
resource "aws_cloudwatch_metric_alarm" "sqs_dlq_messages" {
  for_each            = var.sqs_dlqs
  alarm_name          = "${var.project_name}-${var.environment}-${each.key}-dlq-messages"
  alarm_description   = "SQS DLQ messages for ${each.value.queue_name}."
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = var.evaluation_periods
  datapoints_to_alarm = var.datapoints_to_alarm
  threshold           = 0
  namespace           = "AWS/SQS"
  metric_name         = "ApproximateNumberOfMessagesVisible"
  statistic           = "Sum"
  period              = var.metric_period_seconds
  dimensions = {
    QueueName = each.value.queue_name
  }
  treat_missing_data = "notBreaching"
  actions_enabled    = length(var.alarm_actions) > 0 || length(var.ok_actions) > 0
  alarm_actions      = var.alarm_actions
  ok_actions         = var.ok_actions
  tags               = local.merged_tags
}

# EventBridge FailedInvocations > 0
resource "aws_cloudwatch_metric_alarm" "eventbridge_failed_invocations" {
  count               = var.eventbridge_bus_name != "" ? 1 : 0
  alarm_name          = "${var.project_name}-${var.environment}-eventbridge-failed-invocations"
  alarm_description   = "EventBridge Failed Invocations for ${var.eventbridge_bus_name}."
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = var.evaluation_periods
  datapoints_to_alarm = var.datapoints_to_alarm
  threshold           = 0
  namespace           = "AWS/Events"
  metric_name         = "FailedInvocations"
  statistic           = "Sum"
  period              = var.metric_period_seconds
  dimensions = {
    EventBusName = var.eventbridge_bus_name
  }
  treat_missing_data = "notBreaching"
  actions_enabled    = length(var.alarm_actions) > 0 || length(var.ok_actions) > 0
  alarm_actions      = var.alarm_actions
  ok_actions         = var.ok_actions
  tags               = local.merged_tags
}

# SNS NumberOfNotificationsFailed > 0
resource "aws_cloudwatch_metric_alarm" "sns_notifications_failed" {
  for_each            = var.sns_topics
  alarm_name          = "${var.project_name}-${var.environment}-${each.key}-sns-failed"
  alarm_description   = "SNS Failed Notifications for ${each.value.topic_name}."
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = var.evaluation_periods
  datapoints_to_alarm = var.datapoints_to_alarm
  threshold           = 0
  namespace           = "AWS/SNS"
  metric_name         = "NumberOfNotificationsFailed"
  statistic           = "Sum"
  period              = var.metric_period_seconds
  dimensions = {
    TopicName = each.value.topic_name
  }
  treat_missing_data = "notBreaching"
  actions_enabled    = length(var.alarm_actions) > 0 || length(var.ok_actions) > 0
  alarm_actions      = var.alarm_actions
  ok_actions         = var.ok_actions
  tags               = local.merged_tags
}

# SQS ApproximateAgeOfOldestMessage > 300 seconds
resource "aws_cloudwatch_metric_alarm" "sqs_oldest_message_age" {
  for_each            = var.sqs_queues
  alarm_name          = "${var.project_name}-${var.environment}-${each.key}-sqs-oldest-message"
  alarm_description   = "SQS Oldest Message Age for ${each.value.queue_name}."
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = var.evaluation_periods
  datapoints_to_alarm = var.datapoints_to_alarm
  threshold           = 300
  namespace           = "AWS/SQS"
  metric_name         = "ApproximateAgeOfOldestMessage"
  statistic           = "Maximum"
  period              = var.metric_period_seconds
  dimensions = {
    QueueName = each.value.queue_name
  }
  treat_missing_data = "notBreaching"
  actions_enabled    = length(var.alarm_actions) > 0 || length(var.ok_actions) > 0
  alarm_actions      = var.alarm_actions
  ok_actions         = var.ok_actions
  tags               = local.merged_tags
}


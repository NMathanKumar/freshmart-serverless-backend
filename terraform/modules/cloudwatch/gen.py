import re

widgets = """
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
"""

new_widgets = """
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
          title   = "API Gateway Request Count"
          region  = var.aws_region
          stat    = "Sum"
          period  = var.metric_period_seconds
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
          title   = "API Gateway 4XX Errors"
          region  = var.aws_region
          stat    = "Sum"
          period  = var.metric_period_seconds
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
"""

slo_widgets = """
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
          title   = "API Availability (Target: >= 99.9%)"
          region  = var.aws_region
          period  = var.metric_period_seconds
          stat    = "Sum"
          metrics = [
            [ { expression = "(1 - (m2 / m1)) * 100", label = "Availability %", id = "e1", region = var.aws_region } ],
            [ "AWS/ApiGateway", "Count", "ApiId", var.api_id, "Stage", var.api_stage_name, { id = "m1", visible = false, stat = "Sum", region = var.aws_region } ],
            [ "AWS/ApiGateway", "5XXError", "ApiId", var.api_id, "Stage", var.api_stage_name, { id = "m2", visible = false, stat = "Sum", region = var.aws_region } ]
          ]
        }
      },
      {
        type   = "metric"
        width  = 12
        height = 6
        properties = {
          title   = "API p95 Latency (Target: < 500ms)"
          region  = var.aws_region
          stat    = "p95"
          period  = var.metric_period_seconds
          metrics = [
            [ "AWS/ApiGateway", "Latency", "ApiId", var.api_id, "Stage", var.api_stage_name, { stat = "p95", period = var.metric_period_seconds, region = var.aws_region } ]
          ]
        }
      },
      {
        type   = "metric"
        width  = 12
        height = 6
        properties = {
          title   = "API 5xx Rate %"
          region  = var.aws_region
          period  = var.metric_period_seconds
          stat    = "Sum"
          metrics = [
            [ { expression = "(m2 / m1) * 100", label = "5xx Rate %", id = "e1", region = var.aws_region } ],
            [ "AWS/ApiGateway", "Count", "ApiId", var.api_id, "Stage", var.api_stage_name, { id = "m1", visible = false, stat = "Sum", region = var.aws_region } ],
            [ "AWS/ApiGateway", "5XXError", "ApiId", var.api_id, "Stage", var.api_stage_name, { id = "m2", visible = false, stat = "Sum", region = var.aws_region } ]
          ]
        }
      },
      {
        type   = "metric"
        width  = 12
        height = 6
        properties = {
          title   = "Lambda Error Rate %"
          region  = var.aws_region
          period  = var.metric_period_seconds
          stat    = "Sum"
          metrics = [
            [ { expression = "SUM(METRICS('errors')) / SUM(METRICS('invocations')) * 100", label = "Error Rate %", id = "e1", region = var.aws_region } ],
            [ "AWS/Lambda", "Errors", { id = "errors", visible = false, stat = "Sum", region = var.aws_region } ],
            [ "AWS/Lambda", "Invocations", { id = "invocations", visible = false, stat = "Sum", region = var.aws_region } ]
          ]
        }
      }
"""

dashboard_body = f"""  dashboard_body = jsonencode({{
    widgets = [
{widgets}
{new_widgets}
{slo_widgets}
    ]
  }})"""

import sys
lines = open('main.tf').read().splitlines()

start = -1
end = -1
for i, line in enumerate(lines):
    if line.startswith('  dashboard_body = jsonencode({'):
        start = i
    if start != -1 and line == '  })':
        end = i
        break

if start != -1 and end != -1:
    lines = lines[:start] + [dashboard_body] + lines[end+1:]
    open('main.tf', 'w').write('\n'.join(lines))
    print("Done")
else:
    print("Could not find dashboard_body")

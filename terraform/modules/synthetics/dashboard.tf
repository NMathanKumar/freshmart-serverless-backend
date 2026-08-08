resource "aws_cloudwatch_dashboard" "synthetics" {
  dashboard_name = "FreshMart-${var.environment}-Synthetics"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "text"
        x      = 0
        y      = 0
        width  = 24
        height = 1
        properties = {
          markdown = "[Operations](#dashboards:name=FreshMart-${var.environment}-Operations) | [Synthetics](#dashboards:name=FreshMart-${var.environment}-Synthetics) | [API](#dashboards:name=FreshMart-${var.environment}-API) | [Lambda](#dashboards:name=FreshMart-${var.environment}-Lambda) | [Database](#dashboards:name=FreshMart-${var.environment}-Database)"
        }
      },
      {
        type   = "alarm"
        x      = 0
        y      = 1
        width  = 24
        height = 3
        properties = {
          title = "Synthetic Canary Alarms"
          alarms = [
            aws_cloudwatch_composite_alarm.customer_journey_failure.arn,
            aws_cloudwatch_metric_alarm.canary_failure["api-health"].arn,
            aws_cloudwatch_metric_alarm.canary_failure["customer-ui"].arn,
            aws_cloudwatch_metric_alarm.canary_failure["admin-ui"].arn,
            aws_cloudwatch_metric_alarm.canary_failure["login-flow"].arn,
            aws_cloudwatch_metric_alarm.canary_failure["cart-flow"].arn,
            aws_cloudwatch_metric_alarm.canary_failure["dependency"].arn,
            aws_cloudwatch_metric_alarm.canary_failure["payment-sandbox"].arn
          ]
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 4
        width  = 12
        height = 6
        properties = {
          region  = var.aws_region
          title   = "Canary Success Percent (%)"
          stat    = "Average"
          period  = 300
          view    = "timeSeries"
          stacked = false
          metrics = [
            for k, v in local.canary_definitions : [
              "CloudWatchSynthetics", "SuccessPercent", "CanaryName", v.name
            ]
          ]
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 4
        width  = 12
        height = 6
        properties = {
          region  = var.aws_region
          title   = "Canary Duration (ms)"
          stat    = "Average"
          period  = 300
          view    = "timeSeries"
          stacked = false
          metrics = [
            for k, v in local.canary_definitions : [
              "CloudWatchSynthetics", "Duration", "CanaryName", v.name
            ]
          ]
        }
      }
    ]
  })
}

resource "aws_cloudwatch_dashboard" "finops" {
  dashboard_name = "FreshMart-${var.environment}-FinOps"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "text"
        x      = 0
        y      = 0
        width  = 24
        height = 1
        properties = {
          markdown = "[Operations](#dashboards:name=FreshMart-${var.environment}-Operations) | [FinOps & Cost](#dashboards:name=FreshMart-${var.environment}-FinOps) | [SLA](#dashboards:name=FreshMart-${var.environment}-SLA) | [Synthetics](#dashboards:name=FreshMart-${var.environment}-Synthetics) | [API](#dashboards:name=FreshMart-${var.environment}-API) | [Lambda](#dashboards:name=FreshMart-${var.environment}-Lambda)"
        }
      },
      {
        type   = "text"
        x      = 0
        y      = 1
        width  = 24
        height = 2
        properties = {
          markdown = "## 💰 Financial & Cost Observability Overview\n| Metric | Budget Target | Notification Thresholds | Status |\n|---|---|---|---|\n| **Overall Spend** | **$${var.monthly_budget_usd}.00 / mo** | 50% (Info), 80% (Warn), 100% (Critical), 120% (Forecast) | Active |\n| **Lambda Compute** | **$${var.lambda_budget_usd}.00 / mo** | 80% (Warn), 100% (Critical) | Active |\n| **DynamoDB Database** | **$${var.dynamodb_budget_usd}.00 / mo** | 80% (Warn), 100% (Critical) | Active |\n| **API Gateway** | **$${var.apigateway_budget_usd}.00 / mo** | 80% (Warn), 100% (Critical) | Active |"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 3
        width  = 12
        height = 6
        properties = {
          region  = var.aws_region
          title   = "API Request Volume (Cost Proxy — $1.00 / 1M HTTP Requests)"
          stat    = "Sum"
          period  = 86400
          view    = "timeSeries"
          stacked = false
          metrics = [
            [ "AWS/ApiGateway", "Count", "ApiId", "${var.api_id}", "Stage", "${var.api_stage_name}", { "label": "Daily API Requests" } ]
          ]
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 3
        width  = 12
        height = 6
        properties = {
          region  = var.aws_region
          title   = "Lambda Invocations Volume (Cost Proxy — $0.20 / 1M Invocations)"
          stat    = "Sum"
          period  = 86400
          view    = "timeSeries"
          stacked = false
          metrics = [
            [ "AWS/Lambda", "Invocations", { "label": "Total Platform Lambda Invocations (Daily)" } ]
          ]
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 9
        width  = 12
        height = 6
        properties = {
          region  = var.aws_region
          title   = "DynamoDB Capacity Units Consumed (Cost Proxy)"
          stat    = "Sum"
          period  = 86400
          view    = "timeSeries"
          stacked = false
          metrics = [
            [ "AWS/DynamoDB", "ConsumedReadCapacityUnits", { "label": "Read Capacity Units" } ],
            [ "AWS/DynamoDB", "ConsumedWriteCapacityUnits", { "label": "Write Capacity Units" } ]
          ]
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 9
        width  = 12
        height = 6
        properties = {
          region  = var.aws_region
          title   = "Synthetics Canary Runs (Cost Proxy — $0.0012 / Run)"
          stat    = "Sum"
          period  = 86400
          view    = "timeSeries"
          stacked = false
          metrics = [
            [ "CloudWatchSynthetics", "SuccessPercent", { "stat": "SampleCount", "label": "Daily Canary Runs" } ]
          ]
        }
      }
    ]
  })
}

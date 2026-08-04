locals {
  business_dashboard_name = var.business_dashboard_name != null ? var.business_dashboard_name : "${var.project_name}-${var.environment}-business"
}

resource "aws_cloudwatch_dashboard" "business" {
  count          = var.enable_business_dashboard ? 1 : 0
  dashboard_name = local.business_dashboard_name
  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "text"
        x      = 0
        y      = 0
        width  = 24
        height = 1
        properties = {
          markdown = "# Executive KPIs\nKey business metrics for FreshMart"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 1
        width  = 6
        height = 6
        properties = {
          view = "singleValue"
          metrics = [
            ["FreshMart/Business", "OrderRevenue", "Environment", var.environment]
          ]
          region = var.aws_region
          title  = "Revenue Today"
          period = 86400
          stat   = "Sum"
        }
      },
      {
        type   = "metric"
        x      = 6
        y      = 1
        width  = 6
        height = 6
        properties = {
          view = "singleValue"
          metrics = [
            ["FreshMart/Business", "OrderPlaced", "Environment", var.environment]
          ]
          region = var.aws_region
          title  = "Orders Today"
          period = 86400
          stat   = "Sum"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 1
        width  = 6
        height = 6
        properties = {
          view = "singleValue"
          metrics = [
            [{ expression = "m1 / m2", label = "AOV", id = "e1" }],
            ["FreshMart/Business", "OrderRevenue", "Environment", var.environment, { id = "m1", visible = false, stat = "Sum" }],
            [".", "OrderPlaced", ".", ".", { id = "m2", visible = false, stat = "Sum" }]
          ]
          region = var.aws_region
          title  = "Average Order Value"
          period = 86400
        }
      },
      {
        type   = "metric"
        x      = 18
        y      = 1
        width  = 6
        height = 6
        properties = {
          view = "singleValue"
          metrics = [
            [{ expression = "(m1 / (m1 + m2)) * 100", label = "Success %", id = "e1" }],
            ["FreshMart/Business", "PaymentSucceeded", "Environment", var.environment, { id = "m1", visible = false, stat = "Sum" }],
            [".", "PaymentFailed", ".", ".", { id = "m2", visible = false, stat = "Sum" }]
          ]
          region = var.aws_region
          title  = "Payment Success Rate"
          period = 86400
        }
      },
      {
        type   = "text"
        x      = 0
        y      = 7
        width  = 24
        height = 1
        properties = {
          markdown = "# Customer Activity"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 8
        width  = 6
        height = 6
        properties = {
          view    = "timeSeries"
          stacked = false
          metrics = [
            ["FreshMart/Business", "UserRegistered", "Environment", var.environment]
          ]
          region = var.aws_region
          title  = "Registrations"
          period = 3600
          stat   = "Sum"
        }
      },
      {
        type   = "metric"
        x      = 6
        y      = 8
        width  = 6
        height = 6
        properties = {
          view    = "timeSeries"
          stacked = false
          metrics = [
            ["FreshMart/Business", "UserLogin", "Environment", var.environment]
          ]
          region = var.aws_region
          title  = "Logins"
          period = 3600
          stat   = "Sum"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 8
        width  = 6
        height = 6
        properties = {
          view    = "timeSeries"
          stacked = false
          metrics = [
            ["FreshMart/Business", "CartViewed", "Environment", var.environment]
          ]
          region = var.aws_region
          title  = "Cart Views"
          period = 3600
          stat   = "Sum"
        }
      },
      {
        type   = "metric"
        x      = 18
        y      = 8
        width  = 6
        height = 6
        properties = {
          view    = "timeSeries"
          stacked = false
          metrics = [
            ["FreshMart/Business", "ProductViewed", "Environment", var.environment]
          ]
          region = var.aws_region
          title  = "Product Views"
          period = 3600
          stat   = "Sum"
        }
      },
      {
        type   = "text"
        x      = 0
        y      = 14
        width  = 24
        height = 1
        properties = {
          markdown = "# Sales Funnel\nConversion tracking across the platform"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 15
        width  = 24
        height = 6
        properties = {
          view = "bar"
          metrics = [
            ["FreshMart/Business", "ProductSearched", "Environment", var.environment, { label = "1. Searches" }],
            [".", "CartItemAdded", ".", ".", { label = "2. Add to Cart" }],
            [".", "PaymentCreated", ".", ".", { label = "3. Checkout Completed (Payment)" }],
            [".", "OrderPlaced", ".", ".", { label = "4. Orders Placed" }]
          ]
          region = var.aws_region
          title  = "Sales Funnel"
          period = 86400
          stat   = "Sum"
        }
      },
      {
        type   = "text"
        x      = 0
        y      = 21
        width  = 24
        height = 1
        properties = {
          markdown = "# Operations\nBusiness operational metrics and errors"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 22
        width  = 8
        height = 6
        properties = {
          view    = "timeSeries"
          stacked = false
          metrics = [
            ["FreshMart/Business", "PaymentFailed", "Environment", var.environment]
          ]
          region = var.aws_region
          title  = "Payment Failures"
          period = 300
          stat   = "Sum"
        }
      },
      {
        type   = "metric"
        x      = 8
        y      = 22
        width  = 8
        height = 6
        properties = {
          view    = "timeSeries"
          stacked = false
          metrics = [
            ["FreshMart/Business", "SearchNoResults", "Environment", var.environment]
          ]
          region = var.aws_region
          title  = "Search No Results"
          period = 300
          stat   = "Sum"
        }
      },
      {
        type   = "metric"
        x      = 16
        y      = 22
        width  = 8
        height = 6
        properties = {
          view    = "timeSeries"
          stacked = false
          metrics = [
            ["FreshMart/Business", "LowStockAlert", "Environment", var.environment]
          ]
          region = var.aws_region
          title  = "Low Stock Alerts"
          period = 3600
          stat   = "Sum"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 28
        width  = 8
        height = 6
        properties = {
          view    = "timeSeries"
          stacked = false
          metrics = [
            ["FreshMart/Business", "LoginFailed", "Environment", var.environment]
          ]
          region = var.aws_region
          title  = "Login Failures"
          period = 300
          stat   = "Sum"
        }
      },
      {
        type   = "metric"
        x      = 8
        y      = 28
        width  = 8
        height = 6
        properties = {
          view    = "timeSeries"
          stacked = false
          metrics = [
            ["FreshMart/Business", "InventoryUpdated", "Environment", var.environment]
          ]
          region = var.aws_region
          title  = "Inventory Updates"
          period = 300
          stat   = "Sum"
        }
      }
    ]
  })
}

# --- Alarms ---

resource "aws_cloudwatch_metric_alarm" "payment_failure_spike" {
  count               = var.enable_business_dashboard ? 1 : 0
  alarm_name          = "${var.project_name}-${var.environment}-PaymentFailureSpike"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "PaymentFailed"
  namespace           = "FreshMart/Business"
  period              = 300
  statistic           = "Sum"
  threshold           = 5
  alarm_description   = "Payment failures exceeded 5 in the last 5 minutes. Severity: CRITICAL"
  alarm_actions       = var.alarm_actions
  ok_actions          = var.ok_actions
  treat_missing_data  = "notBreaching"
  dimensions = {
    Environment = var.environment
  }
}

resource "aws_cloudwatch_metric_alarm" "login_failure_spike" {
  count               = var.enable_business_dashboard ? 1 : 0
  alarm_name          = "${var.project_name}-${var.environment}-LoginFailureSpike"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "LoginFailed"
  namespace           = "FreshMart/Business"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "Login failures exceeded 10 in the last 5 minutes. Severity: MEDIUM"
  alarm_actions       = var.alarm_actions
  ok_actions          = var.ok_actions
  treat_missing_data  = "notBreaching"
  dimensions = {
    Environment = var.environment
  }
}

resource "aws_cloudwatch_metric_alarm" "search_no_results_spike" {
  count               = var.enable_business_dashboard ? 1 : 0
  alarm_name          = "${var.project_name}-${var.environment}-SearchNoResultsSpike"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "SearchNoResults"
  namespace           = "FreshMart/Business"
  period              = 300
  statistic           = "Sum"
  threshold           = 20
  alarm_description   = "Empty search results exceeded 20 in the last 5 minutes. Severity: MEDIUM"
  alarm_actions       = var.alarm_actions
  ok_actions          = var.ok_actions
  treat_missing_data  = "notBreaching"
  dimensions = {
    Environment = var.environment
  }
}

resource "aws_cloudwatch_metric_alarm" "low_stock_hourly" {
  count               = var.enable_business_dashboard ? 1 : 0
  alarm_name          = "${var.project_name}-${var.environment}-LowStockAlerts"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "LowStockAlert"
  namespace           = "FreshMart/Business"
  period              = 3600
  statistic           = "Sum"
  threshold           = 3
  alarm_description   = "More than 3 low stock alerts triggered in the last hour. Severity: HIGH"
  alarm_actions       = var.alarm_actions
  ok_actions          = var.ok_actions
  treat_missing_data  = "notBreaching"
  dimensions = {
    Environment = var.environment
  }
}

resource "aws_cloudwatch_metric_alarm" "zero_orders_business_hours" {
  count               = var.enable_business_dashboard ? 1 : 0
  alarm_name          = "${var.project_name}-${var.environment}-ZeroOrdersBusinessHours"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 6
  threshold           = 1 # We want to alarm if Orders == 0
  alarm_description   = "0 orders placed for 6 consecutive hours during business hours (08:00-22:00 SGT). Severity: HIGH"
  alarm_actions       = var.alarm_actions
  ok_actions          = var.ok_actions
  treat_missing_data  = "notBreaching"

  metric_query {
    id          = "e1"
    expression  = "IF(HOUR(m1) >= 0 AND HOUR(m1) < 14, m1, 1)" # 00:00 to 14:00 UTC = 08:00 to 22:00 SGT
    label       = "Business Hours Orders"
    return_data = true
  }

  metric_query {
    id = "m1"
    metric {
      metric_name = "OrderPlaced"
      namespace   = "FreshMart/Business"
      period      = 3600
      stat        = "Sum"
      dimensions = {
        Environment = var.environment
      }
    }
  }
}

resource "aws_cloudwatch_metric_alarm" "funnel_degradation" {
  count               = var.enable_business_dashboard ? 1 : 0
  alarm_name          = "${var.project_name}-${var.environment}-FunnelDegradation"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  threshold           = 0.6
  alarm_description   = "Cart Add to Order Placed ratio dropped below 60%. Severity: HIGH"
  alarm_actions       = var.alarm_actions
  ok_actions          = var.ok_actions
  treat_missing_data  = "notBreaching"

  metric_query {
    id          = "e1"
    expression  = "m2 / m1"
    label       = "Funnel Conversion Ratio"
    return_data = true
  }

  metric_query {
    id = "m1"
    metric {
      metric_name = "CartItemAdded"
      namespace   = "FreshMart/Business"
      period      = 1800
      stat        = "Sum"
      dimensions = {
        Environment = var.environment
      }
    }
  }

  metric_query {
    id = "m2"
    metric {
      metric_name = "OrderPlaced"
      namespace   = "FreshMart/Business"
      period      = 1800
      stat        = "Sum"
      dimensions = {
        Environment = var.environment
      }
    }
  }
}

resource "aws_cloudwatch_dashboard" "security" {
  dashboard_name = "FreshMart-${var.environment}-Security"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "text"
        x      = 0
        y      = 0
        width  = 24
        height = 1
        properties = {
          markdown = "[Operations](#dashboards:name=FreshMart-${var.environment}-Operations) | [Security](#dashboards:name=FreshMart-${var.environment}-Security) | [FinOps](#dashboards:name=FreshMart-${var.environment}-FinOps) | [SLA](#dashboards:name=FreshMart-${var.environment}-SLA) | [Synthetics](#dashboards:name=FreshMart-${var.environment}-Synthetics) | [API](#dashboards:name=FreshMart-${var.environment}-API)"
        }
      },
      {
        type   = "alarm"
        x      = 0
        y      = 1
        width  = 24
        height = 3
        properties = {
          title = "Security & Governance Alarms"
          alarms = [
            aws_cloudwatch_composite_alarm.security_threat.arn,
            aws_cloudwatch_metric_alarm.brute_force.arn,
            aws_cloudwatch_metric_alarm.unauthorized_access.arn,
            aws_cloudwatch_metric_alarm.privilege_elevation.arn
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
          title   = "Failed Login & Brute Force Attempts"
          stat    = "Sum"
          period  = 300
          view    = "timeSeries"
          stacked = false
          metrics = [
            [ "FreshMart/${var.environment}/Security", "FailedLoginCount", { "label": "Failed Logins" } ]
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
          title   = "Unauthorized Access Attempts (401/403)"
          stat    = "Sum"
          period  = 300
          view    = "timeSeries"
          stacked = false
          metrics = [
            [ "FreshMart/${var.environment}/Security", "UnauthorizedAccessCount", { "label": "401/403 Access Denied Count" } ]
          ]
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 10
        width  = 24
        height = 6
        properties = {
          region  = var.aws_region
          title   = "Admin Privilege Elevation Attempts"
          stat    = "Sum"
          period  = 60
          view    = "timeSeries"
          stacked = false
          metrics = [
            [ "FreshMart/${var.environment}/Security", "PrivilegeElevationAttemptCount", { "label": "Unauthorized Admin Access Attempts" } ]
          ]
        }
      }
    ]
  })
}

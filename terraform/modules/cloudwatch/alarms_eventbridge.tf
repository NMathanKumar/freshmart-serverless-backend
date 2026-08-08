resource "aws_cloudwatch_metric_alarm" "eb_failed" {
  alarm_name          = "${var.project_name}-${var.environment}-EventBridge-Messaging-FailedInvocations-Critical"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "FailedInvocations"
  namespace           = "AWS/Events"
  period              = 60
  statistic           = "Sum"
  threshold           = 0
  alarm_description   = "EventBridge Failed Invocations > 0.\n\nSeverity: Critical\n\nAction: Investigate event bus targets.\nRunbook: https://internal.docs/freshmart/runbooks/eb-failed.md"
  alarm_actions       = [var.alarm_sns_topics["critical"]]
  ok_actions          = [var.alarm_sns_topics["critical"]]

  dimensions = {
    EventBusName = var.eventbridge_bus_name
  }

  tags = merge(var.tags, {
    Category = "Messaging"
    Severity = "Critical"
    Service  = "EventBridge"
  })
}

resource "aws_cloudwatch_metric_alarm" "eb_retry" {
  alarm_name          = "${var.project_name}-${var.environment}-EventBridge-Messaging-RetryAttempts-Warning"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Invocations"
  namespace           = "AWS/Events"
  period              = 60
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "EventBridge Invocations (Proxy for Retries) unusually high.\n\nSeverity: Warning\n\nAction: Investigate event bus loop or failures.\nRunbook: https://internal.docs/freshmart/runbooks/eb-retry.md"
  alarm_actions       = [var.alarm_sns_topics["warning"]]
  ok_actions          = [var.alarm_sns_topics["warning"]]

  dimensions = {
    EventBusName = var.eventbridge_bus_name
  }

  tags = merge(var.tags, {
    Category = "Messaging"
    Severity = "Warning"
    Service  = "EventBridge"
  })
}

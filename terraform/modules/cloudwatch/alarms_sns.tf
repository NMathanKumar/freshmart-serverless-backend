resource "aws_cloudwatch_metric_alarm" "sns_failed" {
  for_each            = var.sns_topics
  alarm_name          = "${var.project_name}-${var.environment}-SNS-Messaging-DeliveryFailures-Critical-${each.key}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "NumberOfNotificationsFailed"
  namespace           = "AWS/SNS"
  period              = 60
  statistic           = "Sum"
  threshold           = 0
  alarm_description   = "SNS Delivery Failures > 0 for ${each.key}.\n\nSeverity: Critical\n\nAction: Investigate SNS subscriptions.\nRunbook: https://internal.docs/freshmart/runbooks/sns-failed.md"
  alarm_actions       = [var.alarm_sns_topics["critical"]]
  ok_actions          = [var.alarm_sns_topics["critical"]]

  dimensions = {
    TopicName = each.value.topic_name
  }

  tags = merge(var.tags, {
    Category = "Messaging"
    Severity = "Critical"
    Service  = "SNS"
  })
}

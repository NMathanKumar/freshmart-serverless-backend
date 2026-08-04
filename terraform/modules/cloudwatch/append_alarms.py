alarms = """
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
"""

with open('main.tf', 'a') as f:
    f.write('\n' + alarms + '\n')

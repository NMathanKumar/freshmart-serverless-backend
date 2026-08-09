resource "aws_cloudwatch_metric_alarm" "sqs_oldest" {
  for_each            = var.sqs_queues
  alarm_name          = "${var.project_name}-${var.environment}-SQS-Messaging-OldestMsg-Critical-${each.key}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "ApproximateAgeOfOldestMessage"
  namespace           = "AWS/SQS"
  period              = 60
  statistic           = "Maximum"
  threshold           = 300
  alarm_description   = "SQS Oldest Message > 5 minutes for ${each.key}.\n\nSeverity: Critical\n\nAction: Investigate consumer lambda processing.\nRunbook: https://internal.docs/freshmart/runbooks/sqs-oldest-msg.md"
  alarm_actions       = [var.alarm_sns_topics["critical"]]
  ok_actions          = [var.alarm_sns_topics["critical"]]

  dimensions = {
    QueueName = each.value.queue_name
  }

  tags = merge(var.tags, {
    Category = "Messaging"
    Severity = "Critical"
    Service  = "SQS"
  })
}

resource "aws_cloudwatch_metric_alarm" "sqs_depth" {
  for_each            = var.sqs_queues
  alarm_name          = "${var.project_name}-${var.environment}-SQS-Messaging-QueueDepth-Warning-${each.key}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = 60
  statistic           = "Maximum"
  threshold           = 1000
  alarm_description   = "SQS Queue Depth > 1000 for ${each.key}.\n\nSeverity: Warning\n\nAction: Investigate consumer backlog.\nRunbook: https://internal.docs/freshmart/runbooks/sqs-depth.md"
  alarm_actions       = [var.alarm_sns_topics["warning"]]
  ok_actions          = [var.alarm_sns_topics["warning"]]

  dimensions = {
    QueueName = each.value.queue_name
  }

  tags = merge(var.tags, {
    Category = "Messaging"
    Severity = "Warning"
    Service  = "SQS"
  })
}

resource "aws_cloudwatch_metric_alarm" "sqs_not_visible" {
  for_each            = var.sqs_queues
  alarm_name          = "${var.project_name}-${var.environment}-SQS-Messaging-NotVisible-Warning-${each.key}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "ApproximateNumberOfMessagesNotVisible"
  namespace           = "AWS/SQS"
  period              = 60
  statistic           = "Maximum"
  threshold           = 500
  alarm_description   = "SQS Messages Not Visible (In Flight) > 500 for ${each.key}.\n\nSeverity: Warning\n\nAction: Investigate if messages are taking too long to process.\nRunbook: https://internal.docs/freshmart/runbooks/sqs-inflight.md"
  alarm_actions       = [var.alarm_sns_topics["warning"]]
  ok_actions          = [var.alarm_sns_topics["warning"]]

  dimensions = {
    QueueName = each.value.queue_name
  }

  tags = merge(var.tags, {
    Category = "Messaging"
    Severity = "Warning"
    Service  = "SQS"
  })
}

resource "aws_cloudwatch_metric_alarm" "dlq_depth" {
  for_each            = var.sqs_dlqs
  alarm_name          = "${var.project_name}-${var.environment}-SQS_DLQ-Messaging-DLQDepth-Critical-${each.key}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = 60
  statistic           = "Maximum"
  threshold           = 0
  alarm_description   = "SQS DLQ contains messages for ${each.key}.\n\nSeverity: Critical\n\nAction: Investigate poison pill messages.\nRunbook: https://internal.docs/freshmart/runbooks/sqs-dlq.md"
  alarm_actions       = [var.alarm_sns_topics["critical"]]
  ok_actions          = [var.alarm_sns_topics["critical"]]

  dimensions = {
    QueueName = each.value.queue_name
  }

  tags = merge(var.tags, {
    Category = "Messaging"
    Severity = "Critical"
    Service  = "SQS_DLQ"
  })
}

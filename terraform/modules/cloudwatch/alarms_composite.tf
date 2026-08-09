resource "aws_cloudwatch_composite_alarm" "api_failure" {
  alarm_name        = "${var.project_name}-${var.environment}-Composite-API-Failure-Critical"
  alarm_description = "API Failure: API Gateway 5XX AND Any Lambda Errors.\n\nSeverity: Critical\n\nRunbook: https://internal.docs/freshmart/runbooks/composite-api-failure.md"
  alarm_actions     = [var.alarm_sns_topics["critical"]]
  ok_actions        = [var.alarm_sns_topics["critical"]]

  alarm_rule = "(ALARM(\"${aws_cloudwatch_metric_alarm.api_5xx.alarm_name}\") AND (${join(" OR ", [for a in aws_cloudwatch_metric_alarm.lambda_errors : "ALARM(\"${a.alarm_name}\")"])}))"

  tags = merge(var.tags, {
    Category = "API"
    Severity = "Critical"
    Service  = "Composite"
  })
}

resource "aws_cloudwatch_composite_alarm" "database_failure" {
  alarm_name        = "${var.project_name}-${var.environment}-Composite-Database-Failure-Critical"
  alarm_description = "Database Failure: Any Lambda Errors AND Any DynamoDB System Errors.\n\nSeverity: Critical\n\nRunbook: https://internal.docs/freshmart/runbooks/composite-database-failure.md"
  alarm_actions     = [var.alarm_sns_topics["critical"]]
  ok_actions        = [var.alarm_sns_topics["critical"]]

  alarm_rule = "((${join(" OR ", [for a in aws_cloudwatch_metric_alarm.lambda_errors : "ALARM(\"${a.alarm_name}\")"])}) AND (${join(" OR ", [for a in aws_cloudwatch_metric_alarm.ddb_syserr : "ALARM(\"${a.alarm_name}\")"])}))"

  tags = merge(var.tags, {
    Category = "Database"
    Severity = "Critical"
    Service  = "Composite"
  })
}

resource "aws_cloudwatch_composite_alarm" "messaging_failure" {
  alarm_name        = "${var.project_name}-${var.environment}-Composite-Messaging-Failure-Critical"
  alarm_description = "Messaging Failure: SQS DLQ OR SNS Delivery Failed OR EventBridge Failed.\n\nSeverity: Critical\n\nRunbook: https://internal.docs/freshmart/runbooks/composite-messaging-failure.md"
  alarm_actions     = [var.alarm_sns_topics["critical"]]
  ok_actions        = [var.alarm_sns_topics["critical"]]

  alarm_rule = "(${join(" OR ", [for a in aws_cloudwatch_metric_alarm.dlq_depth : "ALARM(\"${a.alarm_name}\")"])} OR ${join(" OR ", [for a in aws_cloudwatch_metric_alarm.sns_failed : "ALARM(\"${a.alarm_name}\")"])} OR ALARM(\"${aws_cloudwatch_metric_alarm.eb_failed.alarm_name}\"))"

  tags = merge(var.tags, {
    Category = "Messaging"
    Severity = "Critical"
    Service  = "Composite"
  })
}

resource "aws_cloudwatch_composite_alarm" "platform_failure" {
  alarm_name        = "${var.project_name}-${var.environment}-Composite-Platform-Failure-Critical"
  alarm_description = "Complete Platform Failure: API AND Database AND Messaging Failure.\n\nSeverity: Critical\n\nRunbook: https://internal.docs/freshmart/runbooks/composite-platform-failure.md"
  alarm_actions     = [var.alarm_sns_topics["critical"]]
  ok_actions        = [var.alarm_sns_topics["critical"]]

  alarm_rule = "(ALARM(\"${aws_cloudwatch_composite_alarm.api_failure.alarm_name}\") AND ALARM(\"${aws_cloudwatch_composite_alarm.database_failure.alarm_name}\") AND ALARM(\"${aws_cloudwatch_composite_alarm.messaging_failure.alarm_name}\"))"

  tags = merge(var.tags, {
    Category = "Platform"
    Severity = "Critical"
    Service  = "Composite"
  })
}

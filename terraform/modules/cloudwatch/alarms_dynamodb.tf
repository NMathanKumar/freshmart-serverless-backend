resource "aws_cloudwatch_metric_alarm" "ddb_syserr" {
  for_each            = var.dynamodb_tables
  alarm_name          = "${var.project_name}-${var.environment}-DynamoDB-Database-SystemErrors-Critical-${each.key}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "SystemErrors"
  namespace           = "AWS/DynamoDB"
  period              = 60
  statistic           = "Sum"
  threshold           = 0
  alarm_description   = "DynamoDB SystemErrors > 0 for ${each.key}.\n\nSeverity: Critical\n\nAction: Investigate AWS health and retries.\nRunbook: https://internal.docs/freshmart/runbooks/ddb-syserrors.md"
  alarm_actions       = [var.alarm_sns_topics["critical"]]
  ok_actions          = [var.alarm_sns_topics["critical"]]

  dimensions = {
    TableName = each.value.table_name
  }

  tags = merge(var.tags, {
    Category = "Database"
    Severity = "Critical"
    Service  = "DynamoDB"
  })
}

resource "aws_cloudwatch_metric_alarm" "ddb_usererr" {
  for_each            = var.dynamodb_tables
  alarm_name          = "${var.project_name}-${var.environment}-DynamoDB-Database-UserErrors-Warning-${each.key}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "UserErrors"
  namespace           = "AWS/DynamoDB"
  period              = 60
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "DynamoDB UserErrors > 10 for ${each.key}.\n\nSeverity: Warning\n\nAction: Investigate query access patterns.\nRunbook: https://internal.docs/freshmart/runbooks/ddb-usererrors.md"
  alarm_actions       = [var.alarm_sns_topics["warning"]]
  ok_actions          = [var.alarm_sns_topics["warning"]]

  dimensions = {
    TableName = each.value.table_name
  }

  tags = merge(var.tags, {
    Category = "Database"
    Severity = "Warning"
    Service  = "DynamoDB"
  })
}

resource "aws_cloudwatch_metric_alarm" "ddb_rcu" {
  for_each            = var.dynamodb_tables
  alarm_name          = "${var.project_name}-${var.environment}-DynamoDB-Database-HighRCU-Warning-${each.key}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "ConsumedReadCapacityUnits"
  namespace           = "AWS/DynamoDB"
  period              = 60
  statistic           = "Sum"
  threshold           = 1000
  alarm_description   = "DynamoDB Consumed RCU > High Threshold for ${each.key}.\n\nSeverity: Warning\n\nAction: Investigate read capacity limits.\nRunbook: https://internal.docs/freshmart/runbooks/ddb-capacity.md"
  alarm_actions       = [var.alarm_sns_topics["warning"]]
  ok_actions          = [var.alarm_sns_topics["warning"]]

  dimensions = {
    TableName = each.value.table_name
  }

  tags = merge(var.tags, {
    Category = "Database"
    Severity = "Warning"
    Service  = "DynamoDB"
  })
}

resource "aws_cloudwatch_metric_alarm" "ddb_wcu" {
  for_each            = var.dynamodb_tables
  alarm_name          = "${var.project_name}-${var.environment}-DynamoDB-Database-HighWCU-Warning-${each.key}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "ConsumedWriteCapacityUnits"
  namespace           = "AWS/DynamoDB"
  period              = 60
  statistic           = "Sum"
  threshold           = 1000
  alarm_description   = "DynamoDB Consumed WCU > High Threshold for ${each.key}.\n\nSeverity: Warning\n\nAction: Investigate write capacity limits.\nRunbook: https://internal.docs/freshmart/runbooks/ddb-capacity.md"
  alarm_actions       = [var.alarm_sns_topics["warning"]]
  ok_actions          = [var.alarm_sns_topics["warning"]]

  dimensions = {
    TableName = each.value.table_name
  }

  tags = merge(var.tags, {
    Category = "Database"
    Severity = "Warning"
    Service  = "DynamoDB"
  })
}

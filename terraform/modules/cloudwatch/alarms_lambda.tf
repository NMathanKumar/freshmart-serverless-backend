resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  for_each            = var.lambda_functions
  alarm_name          = "${var.project_name}-${var.environment}-Lambda-Compute-ErrorRate-Critical-${each.key}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  threshold           = 5
  alarm_description   = "Lambda Error Rate > 5% for ${each.key}.\n\nSeverity: Critical\n\nAction: Investigate immediately.\nRunbook: https://internal.docs/freshmart/runbooks/lambda-errors.md"
  alarm_actions       = [var.alarm_sns_topics["critical"]]
  ok_actions          = [var.alarm_sns_topics["critical"]]

  metric_query {
    id          = "e1"
    expression  = "(m2 / m1) * 100"
    label       = "Error Rate"
    return_data = true
  }
  metric_query {
    id = "m1"
    metric {
      metric_name = "Invocations"
      namespace   = "AWS/Lambda"
      period      = 60
      stat        = "Sum"
      dimensions  = { FunctionName = each.value.function_name }
    }
  }
  metric_query {
    id = "m2"
    metric {
      metric_name = "Errors"
      namespace   = "AWS/Lambda"
      period      = 60
      stat        = "Sum"
      dimensions  = { FunctionName = each.value.function_name }
    }
  }

  tags = merge(var.tags, {
    Category = "Compute"
    Severity = "Critical"
    Service  = "Lambda"
  })
}

resource "aws_cloudwatch_metric_alarm" "lambda_duration" {
  for_each            = var.lambda_functions
  alarm_name          = "${var.project_name}-${var.environment}-Lambda-Compute-Duration-Warning-${each.key}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Duration"
  namespace           = "AWS/Lambda"
  period              = 60
  extended_statistic  = "p95"
  threshold           = 3000
  alarm_description   = "Lambda Duration p95 > 3000ms for ${each.key}.\n\nSeverity: Warning\n\nAction: Investigate latency bottlenecks.\nRunbook: https://internal.docs/freshmart/runbooks/lambda-latency.md"
  alarm_actions       = [var.alarm_sns_topics["warning"]]
  ok_actions          = [var.alarm_sns_topics["warning"]]

  dimensions = {
    FunctionName = each.value.function_name
  }

  tags = merge(var.tags, {
    Category = "Compute"
    Severity = "Warning"
    Service  = "Lambda"
  })
}

resource "aws_cloudwatch_metric_alarm" "lambda_throttles" {
  for_each            = var.lambda_functions
  alarm_name          = "${var.project_name}-${var.environment}-Lambda-Compute-Throttles-Warning-${each.key}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Throttles"
  namespace           = "AWS/Lambda"
  period              = 60
  statistic           = "Sum"
  threshold           = 5
  alarm_description   = "Lambda Throttles > 5 for ${each.key}.\n\nSeverity: Warning\n\nAction: Investigate concurrency limits.\nRunbook: https://internal.docs/freshmart/runbooks/lambda-throttles.md"
  alarm_actions       = [var.alarm_sns_topics["warning"]]
  ok_actions          = [var.alarm_sns_topics["warning"]]

  dimensions = {
    FunctionName = each.value.function_name
  }

  tags = merge(var.tags, {
    Category = "Compute"
    Severity = "Warning"
    Service  = "Lambda"
  })
}

resource "aws_cloudwatch_metric_alarm" "lambda_concurrent" {
  for_each            = var.lambda_functions
  alarm_name          = "${var.project_name}-${var.environment}-Lambda-Compute-Concurrent-Info-${each.key}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "ConcurrentExecutions"
  namespace           = "AWS/Lambda"
  period              = 60
  statistic           = "Maximum"
  threshold           = 50
  alarm_description   = "Lambda Concurrent Executions high for ${each.key}.\n\nSeverity: Info\n\nAction: Informational.\nRunbook: https://internal.docs/freshmart/runbooks/lambda-concurrent.md"
  alarm_actions       = [var.alarm_sns_topics["info"]]
  ok_actions          = [var.alarm_sns_topics["info"]]

  dimensions = {
    FunctionName = each.value.function_name
  }

  tags = merge(var.tags, {
    Category = "Compute"
    Severity = "Info"
    Service  = "Lambda"
  })
}

resource "aws_cloudwatch_metric_alarm" "lambda_iterator" {
  for_each            = var.lambda_functions
  alarm_name          = "${var.project_name}-${var.environment}-Lambda-Compute-IteratorAge-Critical-${each.key}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "IteratorAge"
  namespace           = "AWS/Lambda"
  period              = 60
  statistic           = "Maximum"
  threshold           = 60000
  treat_missing_data  = "ignore"
  alarm_description   = "Lambda Iterator Age > 60000ms for ${each.key}.\n\nSeverity: Critical\n\nAction: Investigate Kinesis/DynamoDB stream processing.\nRunbook: https://internal.docs/freshmart/runbooks/lambda-iterator.md"
  alarm_actions       = [var.alarm_sns_topics["critical"]]
  ok_actions          = [var.alarm_sns_topics["critical"]]

  dimensions = {
    FunctionName = each.value.function_name
  }

  tags = merge(var.tags, {
    Category = "Compute"
    Severity = "Critical"
    Service  = "Lambda"
  })
}

resource "aws_cloudwatch_metric_alarm" "lambda_timeouts" {
  for_each            = var.lambda_functions
  alarm_name          = "${var.project_name}-${var.environment}-Lambda-Compute-Timeouts-Critical-${each.key}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Timeouts"
  namespace           = "AWS/Lambda"
  period              = 60
  statistic           = "Sum"
  threshold           = 0
  treat_missing_data  = "ignore"
  alarm_description   = "Lambda Timeouts detected for ${each.key}.\n\nSeverity: Critical\n\nAction: Investigate lambda performance and timeout config.\nRunbook: https://internal.docs/freshmart/runbooks/lambda-timeouts.md"
  alarm_actions       = [var.alarm_sns_topics["critical"]]
  ok_actions          = [var.alarm_sns_topics["critical"]]

  dimensions = {
    FunctionName = each.value.function_name
  }

  tags = merge(var.tags, {
    Category = "Compute"
    Severity = "Critical"
    Service  = "Lambda"
  })
}

resource "aws_cloudwatch_metric_alarm" "anomaly_api_latency" {
  alarm_name          = "${var.project_name}-${var.environment}-ApiGateway-API-LatencyAnomaly-Warning"
  comparison_operator = "GreaterThanUpperThreshold"
  evaluation_periods  = 2
  threshold_metric_id = "e1"
  alarm_description   = "API Gateway Latency Anomaly detected.\n\nSeverity: Warning\n\nRunbook: https://internal.docs/freshmart/runbooks/anomaly-api-latency.md"
  alarm_actions       = [var.alarm_sns_topics["warning"]]
  ok_actions          = [var.alarm_sns_topics["warning"]]

  metric_query {
    id          = "e1"
    expression  = "ANOMALY_DETECTION_BAND(m1, 2)"
    label       = "Latency (Expected)"
    return_data = true
  }
  metric_query {
    id = "m1"
    return_data = true
    metric {
      metric_name = "IntegrationLatency"
      namespace   = "AWS/ApiGateway"
      period      = 300
      stat        = "p95"
      dimensions  = { ApiId = var.api_id, Stage = var.api_stage_name }
    }
  }

  tags = merge(var.tags, { Category = "API", Severity = "Warning", Service = "ApiGateway" })
}

resource "aws_cloudwatch_metric_alarm" "anomaly_api_5xx" {
  alarm_name          = "${var.project_name}-${var.environment}-ApiGateway-API-5XXAnomaly-Warning"
  comparison_operator = "GreaterThanUpperThreshold"
  evaluation_periods  = 2
  threshold_metric_id = "e1"
  alarm_description   = "API Gateway 5XX Error Anomaly detected.\n\nSeverity: Warning\n\nRunbook: https://internal.docs/freshmart/runbooks/anomaly-api-5xx.md"
  alarm_actions       = [var.alarm_sns_topics["warning"]]
  ok_actions          = [var.alarm_sns_topics["warning"]]

  metric_query {
    id          = "e1"
    expression  = "ANOMALY_DETECTION_BAND(m1, 2)"
    label       = "5XX (Expected)"
    return_data = true
  }
  metric_query {
    id = "m1"
    return_data = true
    metric {
      metric_name = "5XXError"
      namespace   = "AWS/ApiGateway"
      period      = 300
      stat        = "Sum"
      dimensions  = { ApiId = var.api_id, Stage = var.api_stage_name }
    }
  }

  tags = merge(var.tags, { Category = "API", Severity = "Warning", Service = "ApiGateway" })
}

resource "aws_cloudwatch_metric_alarm" "anomaly_lambda_errors" {
  for_each            = var.lambda_functions
  alarm_name          = "${var.project_name}-${var.environment}-Lambda-Compute-ErrorAnomaly-Warning-${each.key}"
  comparison_operator = "GreaterThanUpperThreshold"
  evaluation_periods  = 2
  threshold_metric_id = "e1"
  alarm_description   = "Lambda Error Anomaly detected for ${each.key}.\n\nSeverity: Warning\n\nRunbook: https://internal.docs/freshmart/runbooks/anomaly-lambda-errors.md"
  alarm_actions       = [var.alarm_sns_topics["warning"]]
  ok_actions          = [var.alarm_sns_topics["warning"]]

  metric_query {
    id          = "e1"
    expression  = "ANOMALY_DETECTION_BAND(m1, 2)"
    label       = "Errors (Expected)"
    return_data = true
  }
  metric_query {
    id = "m1"
    return_data = true
    metric {
      metric_name = "Errors"
      namespace   = "AWS/Lambda"
      period      = 300
      stat        = "Sum"
      dimensions  = { FunctionName = each.value.function_name }
    }
  }

  tags = merge(var.tags, { Category = "Compute", Severity = "Warning", Service = "Lambda" })
}

resource "aws_cloudwatch_metric_alarm" "anomaly_ddb_rcu" {
  for_each            = var.dynamodb_tables
  alarm_name          = "${var.project_name}-${var.environment}-DynamoDB-Database-RCUAnomaly-Warning-${each.key}"
  comparison_operator = "GreaterThanUpperThreshold"
  evaluation_periods  = 2
  threshold_metric_id = "e1"
  alarm_description   = "DynamoDB Consumed RCU Anomaly detected for ${each.key}.\n\nSeverity: Warning\n\nRunbook: https://internal.docs/freshmart/runbooks/anomaly-ddb-rcu.md"
  alarm_actions       = [var.alarm_sns_topics["warning"]]
  ok_actions          = [var.alarm_sns_topics["warning"]]

  metric_query {
    id          = "e1"
    expression  = "ANOMALY_DETECTION_BAND(m1, 2)"
    label       = "RCU (Expected)"
    return_data = true
  }
  metric_query {
    id = "m1"
    return_data = true
    metric {
      metric_name = "ConsumedReadCapacityUnits"
      namespace   = "AWS/DynamoDB"
      period      = 300
      stat        = "Sum"
      dimensions  = { TableName = each.value.table_name }
    }
  }

  tags = merge(var.tags, { Category = "Database", Severity = "Warning", Service = "DynamoDB" })
}

resource "aws_cloudwatch_metric_alarm" "anomaly_ddb_wcu" {
  for_each            = var.dynamodb_tables
  alarm_name          = "${var.project_name}-${var.environment}-DynamoDB-Database-WCUAnomaly-Warning-${each.key}"
  comparison_operator = "GreaterThanUpperThreshold"
  evaluation_periods  = 2
  threshold_metric_id = "e1"
  alarm_description   = "DynamoDB Consumed WCU Anomaly detected for ${each.key}.\n\nSeverity: Warning\n\nRunbook: https://internal.docs/freshmart/runbooks/anomaly-ddb-wcu.md"
  alarm_actions       = [var.alarm_sns_topics["warning"]]
  ok_actions          = [var.alarm_sns_topics["warning"]]

  metric_query {
    id          = "e1"
    expression  = "ANOMALY_DETECTION_BAND(m1, 2)"
    label       = "WCU (Expected)"
    return_data = true
  }
  metric_query {
    id = "m1"
    return_data = true
    metric {
      metric_name = "ConsumedWriteCapacityUnits"
      namespace   = "AWS/DynamoDB"
      period      = 300
      stat        = "Sum"
      dimensions  = { TableName = each.value.table_name }
    }
  }

  tags = merge(var.tags, { Category = "Database", Severity = "Warning", Service = "DynamoDB" })
}

resource "aws_cloudwatch_metric_alarm" "anomaly_sqs_depth" {
  for_each            = var.sqs_queues
  alarm_name          = "${var.project_name}-${var.environment}-SQS-Messaging-DepthAnomaly-Warning-${each.key}"
  comparison_operator = "GreaterThanUpperThreshold"
  evaluation_periods  = 2
  threshold_metric_id = "e1"
  alarm_description   = "SQS Queue Depth Anomaly detected for ${each.key}.\n\nSeverity: Warning\n\nRunbook: https://internal.docs/freshmart/runbooks/anomaly-sqs-depth.md"
  alarm_actions       = [var.alarm_sns_topics["warning"]]
  ok_actions          = [var.alarm_sns_topics["warning"]]

  metric_query {
    id          = "e1"
    expression  = "ANOMALY_DETECTION_BAND(m1, 2)"
    label       = "QueueDepth (Expected)"
    return_data = true
  }
  metric_query {
    id = "m1"
    return_data = true
    metric {
      metric_name = "ApproximateNumberOfMessagesVisible"
      namespace   = "AWS/SQS"
      period      = 300
      stat        = "Maximum"
      dimensions  = { QueueName = each.value.queue_name }
    }
  }

  tags = merge(var.tags, { Category = "Messaging", Severity = "Warning", Service = "SQS" })
}


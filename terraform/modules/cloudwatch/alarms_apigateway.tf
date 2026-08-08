resource "aws_cloudwatch_metric_alarm" "api_5xx" {
  alarm_name          = "${var.project_name}-${var.environment}-ApiGateway-API-5XXRate-Critical"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  threshold           = 5
  alarm_description   = "API Gateway 5XX Rate > 5%.\n\nSeverity: Critical\n\nAction: Investigate immediately.\nRunbook: https://internal.docs/freshmart/runbooks/api-5xx.md"
  alarm_actions       = [var.alarm_sns_topics["critical"]]
  ok_actions          = [var.alarm_sns_topics["critical"]]

  metric_query {
    id          = "e1"
    expression  = "(m2 / m1) * 100"
    label       = "5XX Rate"
    return_data = true
  }
  metric_query {
    id = "m1"
    metric {
      metric_name = "Count"
      namespace   = "AWS/ApiGateway"
      period      = 60
      stat        = "Sum"
      dimensions  = { ApiId = var.api_id, Stage = var.api_stage_name }
    }
  }
  metric_query {
    id = "m2"
    metric {
      metric_name = "5XXError"
      namespace   = "AWS/ApiGateway"
      period      = 60
      stat        = "Sum"
      dimensions  = { ApiId = var.api_id, Stage = var.api_stage_name }
    }
  }

  tags = merge(var.tags, {
    Category = "API"
    Severity = "Critical"
    Service  = "ApiGateway"
  })
}

resource "aws_cloudwatch_metric_alarm" "api_4xx" {
  alarm_name          = "${var.project_name}-${var.environment}-ApiGateway-API-4XXRate-Warning"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  threshold           = 10
  alarm_description   = "API Gateway 4XX Rate > 10%.\n\nSeverity: Warning\n\nAction: Check client integration.\nRunbook: https://internal.docs/freshmart/runbooks/api-4xx.md"
  alarm_actions       = [var.alarm_sns_topics["warning"]]
  ok_actions          = [var.alarm_sns_topics["warning"]]

  metric_query {
    id          = "e1"
    expression  = "(m2 / m1) * 100"
    label       = "4XX Rate"
    return_data = true
  }
  metric_query {
    id = "m1"
    metric {
      metric_name = "Count"
      namespace   = "AWS/ApiGateway"
      period      = 60
      stat        = "Sum"
      dimensions  = { ApiId = var.api_id, Stage = var.api_stage_name }
    }
  }
  metric_query {
    id = "m2"
    metric {
      metric_name = "4XXError"
      namespace   = "AWS/ApiGateway"
      period      = 60
      stat        = "Sum"
      dimensions  = { ApiId = var.api_id, Stage = var.api_stage_name }
    }
  }

  tags = merge(var.tags, {
    Category = "API"
    Severity = "Warning"
    Service  = "ApiGateway"
  })
}

resource "aws_cloudwatch_metric_alarm" "api_latency" {
  alarm_name          = "${var.project_name}-${var.environment}-ApiGateway-API-IntegrationLatency-Warning"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "IntegrationLatency"
  namespace           = "AWS/ApiGateway"
  period              = 60
  extended_statistic  = "p95"
  threshold           = 2000
  alarm_description   = "API Gateway Integration Latency > 2000ms.\n\nSeverity: Warning\n\nAction: Investigate backend latency.\nRunbook: https://internal.docs/freshmart/runbooks/api-latency.md"
  alarm_actions       = [var.alarm_sns_topics["warning"]]
  ok_actions          = [var.alarm_sns_topics["warning"]]

  dimensions = {
    ApiId = var.api_id
    Stage = var.api_stage_name
  }

  tags = merge(var.tags, {
    Category = "API"
    Severity = "Warning"
    Service  = "ApiGateway"
  })
}

resource "aws_cloudwatch_metric_alarm" "api_req_drop" {
  alarm_name          = "${var.project_name}-${var.environment}-ApiGateway-API-RequestDrop-Critical"
  comparison_operator = "LessThanOrEqualToThreshold"
  evaluation_periods  = 5
  metric_name         = "Count"
  namespace           = "AWS/ApiGateway"
  period              = 60
  statistic           = "Sum"
  threshold           = 0
  treat_missing_data  = "breaching"
  alarm_description   = "API Gateway Request Count dropped to zero.\n\nSeverity: Critical\n\nAction: Check edge network and DNS.\nRunbook: https://internal.docs/freshmart/runbooks/api-zero-requests.md"
  alarm_actions       = [var.alarm_sns_topics["critical"]]
  ok_actions          = [var.alarm_sns_topics["critical"]]

  dimensions = {
    ApiId = var.api_id
    Stage = var.api_stage_name
  }

  tags = merge(var.tags, {
    Category = "API"
    Severity = "Critical"
    Service  = "ApiGateway"
  })
}

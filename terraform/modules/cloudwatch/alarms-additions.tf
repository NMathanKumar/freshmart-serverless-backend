resource "aws_cloudwatch_metric_alarm" "api_gateway_4xx" {
  alarm_name          = "${var.project_name}-${var.environment}-api-4xx"
  alarm_description   = "HTTP API 4XX errors."
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = var.evaluation_periods
  datapoints_to_alarm = var.datapoints_to_alarm
  threshold           = var.api_4xx_threshold
  namespace           = "AWS/ApiGateway"
  metric_name         = "4XXError"
  statistic           = "Sum"
  period              = var.metric_period_seconds
  dimensions = {
    ApiId = var.api_id
    Stage = var.api_stage_name
  }
  treat_missing_data = "notBreaching"
  actions_enabled    = length(var.alarm_actions) > 0 || length(var.ok_actions) > 0
  alarm_actions      = var.alarm_actions
  ok_actions         = var.ok_actions
  tags               = local.merged_tags
}

resource "aws_cloudwatch_metric_alarm" "cloudfront_4xx_error_rate" {
  for_each            = var.cloudfront_distributions
  alarm_name          = "${var.project_name}-${var.environment}-${each.key}-cf-4xx"
  alarm_description   = "CloudFront 4XX Error Rate for ${each.key}."
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = var.evaluation_periods
  datapoints_to_alarm = var.datapoints_to_alarm
  threshold           = var.cloudfront_4xx_error_rate_threshold
  namespace           = "AWS/CloudFront"
  metric_name         = "4xxErrorRate"
  statistic           = "Average"
  period              = var.metric_period_seconds
  dimensions = {
    DistributionId = each.value.distribution_id
    Region         = "Global"
  }
  treat_missing_data = "notBreaching"
  actions_enabled    = length(var.alarm_actions) > 0 || length(var.ok_actions) > 0
  alarm_actions      = var.alarm_actions
  ok_actions         = var.ok_actions
  tags               = local.merged_tags
}

resource "aws_cloudwatch_metric_alarm" "cloudfront_5xx_error_rate" {
  for_each            = var.cloudfront_distributions
  alarm_name          = "${var.project_name}-${var.environment}-${each.key}-cf-5xx"
  alarm_description   = "CloudFront 5XX Error Rate for ${each.key}."
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = var.evaluation_periods
  datapoints_to_alarm = var.datapoints_to_alarm
  threshold           = var.cloudfront_5xx_error_rate_threshold
  namespace           = "AWS/CloudFront"
  metric_name         = "5xxErrorRate"
  statistic           = "Average"
  period              = var.metric_period_seconds
  dimensions = {
    DistributionId = each.value.distribution_id
    Region         = "Global"
  }
  treat_missing_data = "notBreaching"
  actions_enabled    = length(var.alarm_actions) > 0 || length(var.ok_actions) > 0
  alarm_actions      = var.alarm_actions
  ok_actions         = var.ok_actions
  tags               = local.merged_tags
}

resource "aws_cloudwatch_metric_alarm" "lambda_concurrent_executions" {
  for_each            = local.lambda_functions
  alarm_name          = "${var.project_name}-${var.environment}-${each.key}-lambda-concurrent"
  alarm_description   = "Lambda Concurrent Executions for ${each.value.function_name}."
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = var.evaluation_periods
  datapoints_to_alarm = var.datapoints_to_alarm
  threshold           = var.lambda_concurrent_executions_threshold
  namespace           = "AWS/Lambda"
  metric_name         = "ConcurrentExecutions"
  statistic           = "Maximum"
  period              = var.metric_period_seconds
  dimensions = {
    FunctionName = each.value.function_name
  }
  treat_missing_data = "notBreaching"
  actions_enabled    = length(var.alarm_actions) > 0 || length(var.ok_actions) > 0
  alarm_actions      = var.alarm_actions
  ok_actions         = var.ok_actions
  tags               = local.merged_tags
}

resource "aws_cloudwatch_metric_alarm" "cloudfront_cache_hit_rate" {
  for_each            = var.cloudfront_distributions
  alarm_name          = "${var.project_name}-${var.environment}-${each.key}-cf-cache-hit"
  alarm_description   = "CloudFront Cache Hit Rate for ${each.key} is too low."
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = var.evaluation_periods
  threshold           = var.cloudfront_cache_hit_threshold
  treat_missing_data  = "notBreaching"

  metric_query {
    id          = "e1"
    expression  = "(m1 / (m1 + m2 + m3)) * 100"
    label       = "Cache Hit Ratio"
    return_data = true
  }

  metric_query {
    id = "m1"
    metric {
      metric_name = "Requests"
      namespace   = "AWS/CloudFront"
      period      = var.metric_period_seconds
      stat        = "Sum"
      dimensions = {
        DistributionId = each.value.distribution_id
        Region         = "Global"
      }
    }
  }

  metric_query {
    id = "m2"
    metric {
      metric_name = "Requests"
      namespace   = "AWS/CloudFront"
      period      = var.metric_period_seconds
      stat        = "Sum"
      dimensions = {
        DistributionId = each.value.distribution_id
        Region         = "Global"
      }
    }
  }

  metric_query {
    id = "m3"
    metric {
      metric_name = "Requests"
      namespace   = "AWS/CloudFront"
      period      = var.metric_period_seconds
      stat        = "Sum"
      dimensions = {
        DistributionId = each.value.distribution_id
        Region         = "Global"
      }
    }
  }

  actions_enabled = length(var.alarm_actions) > 0 || length(var.ok_actions) > 0
  alarm_actions   = var.alarm_actions
  ok_actions      = var.ok_actions
  tags            = local.merged_tags
}

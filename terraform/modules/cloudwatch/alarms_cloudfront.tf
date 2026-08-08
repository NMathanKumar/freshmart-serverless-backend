resource "aws_cloudwatch_metric_alarm" "cf_5xx" {
  for_each            = var.cloudfront_distributions
  alarm_name          = "${var.project_name}-${var.environment}-CloudFront-Edge-5XXRate-Critical-${each.key}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  threshold           = 5
  alarm_description   = "CloudFront 5XX Error Rate > 5%.\n\nSeverity: Critical\n\nAction: Investigate immediately.\nRunbook: https://internal.docs/freshmart/runbooks/cloudfront-5xx.md"
  alarm_actions       = [var.alarm_sns_topics["critical"]]
  ok_actions          = [var.alarm_sns_topics["critical"]]

  metric_query {
    id          = "e1"
    expression  = "(m2 / m1) * 100"
    label       = "5xx Error Rate"
    return_data = true
  }
  metric_query {
    id = "m1"
    metric {
      metric_name = "Requests"
      namespace   = "AWS/CloudFront"
      period      = 60
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
      metric_name = "5xxErrorRate"
      namespace   = "AWS/CloudFront"
      period      = 60
      stat        = "Average"
      dimensions = {
        DistributionId = each.value.distribution_id
        Region         = "Global"
      }
    }
  }

  tags = merge(var.tags, {
    Category = "Edge"
    Severity = "Critical"
    Service  = "CloudFront"
  })
}

resource "aws_cloudwatch_metric_alarm" "cf_origin_latency" {
  for_each            = var.cloudfront_distributions
  alarm_name          = "${var.project_name}-${var.environment}-CloudFront-Edge-OriginLatency-Warning-${each.key}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "OriginLatency"
  namespace           = "AWS/CloudFront"
  period              = 60
  statistic           = "Average"
  threshold           = 1000
  alarm_description   = "CloudFront Origin Latency > 1000ms.\n\nSeverity: Warning\n\nAction: Investigate origin performance.\nRunbook: https://internal.docs/freshmart/runbooks/cloudfront-latency.md"
  alarm_actions       = [var.alarm_sns_topics["warning"]]
  ok_actions          = [var.alarm_sns_topics["warning"]]

  dimensions = {
    DistributionId = each.value.distribution_id
    Region         = "Global"
  }

  tags = merge(var.tags, {
    Category = "Edge"
    Severity = "Warning"
    Service  = "CloudFront"
  })
}

resource "aws_cloudwatch_metric_alarm" "cf_cache_hit_drop" {
  for_each            = var.cloudfront_distributions
  alarm_name          = "${var.project_name}-${var.environment}-CloudFront-Edge-CacheHitDrop-Warning-${each.key}"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  metric_name         = "CacheHitRate"
  namespace           = "AWS/CloudFront"
  period              = 60
  statistic           = "Average"
  threshold           = 50
  treat_missing_data  = "notBreaching"
  alarm_description   = "CloudFront Cache Hit Rate dropped below 50%.\n\nSeverity: Warning\n\nAction: Investigate caching behaviors.\nRunbook: https://internal.docs/freshmart/runbooks/cloudfront-cache.md"
  alarm_actions       = [var.alarm_sns_topics["warning"]]
  ok_actions          = [var.alarm_sns_topics["warning"]]

  dimensions = {
    DistributionId = each.value.distribution_id
    Region         = "Global"
  }

  tags = merge(var.tags, {
    Category = "Edge"
    Severity = "Warning"
    Service  = "CloudFront"
  })
}


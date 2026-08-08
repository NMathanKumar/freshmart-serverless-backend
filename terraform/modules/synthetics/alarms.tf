# ── Canary Success Percent Alarms ─────────────────────────────────────────────
resource "aws_cloudwatch_metric_alarm" "canary_failure" {
  for_each = local.canary_definitions

  alarm_name          = "${var.project_name}-${var.environment}-Synthetics-${each.key}-Failure-Critical"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  metric_name         = "SuccessPercent"
  namespace           = "CloudWatchSynthetics"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Canary ${each.key} success rate fell below 80%.\n\nRunbook: https://internal.docs/freshmart/runbooks/synthetics.md\nSeverity: CRITICAL"

  dimensions = {
    CanaryName = each.value.name
  }

  alarm_actions = [var.alarm_sns_topics.critical]
  ok_actions    = [var.alarm_sns_topics.info]

  tags = merge(var.tags, {
    Environment = var.environment
    ManagedBy   = "Terraform"
    Project     = var.project_name
    Category    = "Synthetics"
    Severity    = "CRITICAL"
  })
}

# ── Canary Duration Warning Alarms ───────────────────────────────────────────
resource "aws_cloudwatch_metric_alarm" "canary_duration" {
  for_each = local.canary_definitions

  alarm_name          = "${var.project_name}-${var.environment}-Synthetics-${each.key}-Duration-Warning"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "Duration"
  namespace           = "CloudWatchSynthetics"
  period              = 300
  extended_statistic  = "p90"
  threshold           = 10000 # 10 seconds
  alarm_description   = "Canary ${each.key} p90 duration exceeded 10s.\n\nSeverity: WARNING"

  dimensions = {
    CanaryName = each.value.name
  }

  alarm_actions = [var.alarm_sns_topics.warning]
  ok_actions    = [var.alarm_sns_topics.info]

  tags = merge(var.tags, {
    Environment = var.environment
    ManagedBy   = "Terraform"
    Project     = var.project_name
    Category    = "Synthetics"
    Severity    = "WARNING"
  })
}

# ── Composite Customer Journey Failure Alarm ──────────────────────────────────
resource "aws_cloudwatch_composite_alarm" "customer_journey_failure" {
  alarm_name        = "${var.project_name}-${var.environment}-Composite-Synthetics-CustomerJourney-Failure-Critical"
  alarm_description = "Composite Alarm: Critical failure across core synthetic customer journeys (login, cart, customer UI).\n\nSeverity: CRITICAL"

  alarm_rule = join(" OR ", [
    "ALARM(${aws_cloudwatch_metric_alarm.canary_failure["login-flow"].alarm_name})",
    "ALARM(${aws_cloudwatch_metric_alarm.canary_failure["cart-flow"].alarm_name})",
    "ALARM(${aws_cloudwatch_metric_alarm.canary_failure["customer-ui"].alarm_name})"
  ])

  alarm_actions = [var.alarm_sns_topics.critical]
  ok_actions    = [var.alarm_sns_topics.info]

  tags = merge(var.tags, {
    Environment = var.environment
    ManagedBy   = "Terraform"
    Project     = var.project_name
    Category    = "Synthetics"
    Severity    = "CRITICAL"
  })
}

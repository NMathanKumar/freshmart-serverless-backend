# ── Brute Force Auth Alarm ───────────────────────────────────────────────────
resource "aws_cloudwatch_metric_alarm" "brute_force" {
  alarm_name          = "${var.project_name}-${var.environment}-Auth-BruteForce-Critical"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "FailedLoginCount"
  namespace           = "FreshMart/${var.environment}/Security"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "High volume of failed login attempts detected (>10 in 5 min).\n\nRunbook: https://internal.docs/freshmart/runbooks/auth-brute-force.md\nSeverity: CRITICAL"

  alarm_actions = [var.alarm_sns_topics.critical]
  ok_actions    = [var.alarm_sns_topics.info]

  tags = merge(var.tags, {
    Environment = var.environment
    ManagedBy   = "Terraform"
    Project     = var.project_name
    Category    = "Security"
    Severity    = "CRITICAL"
  })
}

# ── Unauthorized 401/403 Access Alarm ─────────────────────────────────────────
resource "aws_cloudwatch_metric_alarm" "unauthorized_access" {
  alarm_name          = "${var.project_name}-${var.environment}-Security-UnauthorizedAccess-Warning"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "UnauthorizedAccessCount"
  namespace           = "FreshMart/${var.environment}/Security"
  period              = 300
  statistic           = "Sum"
  threshold           = 25
  alarm_description   = "Elevated HTTP 401/403 responses detected.\n\nSeverity: WARNING"

  alarm_actions = [var.alarm_sns_topics.warning]
  ok_actions    = [var.alarm_sns_topics.info]

  tags = merge(var.tags, {
    Environment = var.environment
    ManagedBy   = "Terraform"
    Project     = var.project_name
    Category    = "Security"
    Severity    = "WARNING"
  })
}

# ── Admin Privilege Elevation Alarm ───────────────────────────────────────────
resource "aws_cloudwatch_metric_alarm" "privilege_elevation" {
  alarm_name          = "${var.project_name}-${var.environment}-Security-AdminPrivilegeElevation-Critical"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "PrivilegeElevationAttemptCount"
  namespace           = "FreshMart/${var.environment}/Security"
  period              = 60
  statistic           = "Sum"
  threshold           = 1
  alarm_description   = "Unauthorized admin route access attempt detected.\n\nRunbook: https://internal.docs/freshmart/runbooks/iam-tampering.md\nSeverity: CRITICAL"

  alarm_actions = [var.alarm_sns_topics.critical]
  ok_actions    = [var.alarm_sns_topics.info]

  tags = merge(var.tags, {
    Environment = var.environment
    ManagedBy   = "Terraform"
    Project     = var.project_name
    Category    = "Security"
    Severity    = "CRITICAL"
  })
}

# ── Composite Security Threat Alarm ───────────────────────────────────────────
resource "aws_cloudwatch_composite_alarm" "security_threat" {
  alarm_name        = "${var.project_name}-${var.environment}-Composite-Security-Threat-Critical"
  alarm_description = "Composite Alarm: Critical security threat detected (brute force OR admin privilege elevation attempt).\n\nSeverity: CRITICAL"

  alarm_rule = join(" OR ", [
    "ALARM(${aws_cloudwatch_metric_alarm.brute_force.alarm_name})",
    "ALARM(${aws_cloudwatch_metric_alarm.privilege_elevation.alarm_name})"
  ])

  alarm_actions = [var.alarm_sns_topics.critical]
  ok_actions    = [var.alarm_sns_topics.info]

  tags = merge(var.tags, {
    Environment = var.environment
    ManagedBy   = "Terraform"
    Project     = var.project_name
    Category    = "Security"
    Severity    = "CRITICAL"
  })
}

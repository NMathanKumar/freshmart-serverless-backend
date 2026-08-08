output "security_dashboard_name" {
  description = "Security observability dashboard name."
  value       = aws_cloudwatch_dashboard.security.dashboard_name
}

output "composite_security_alarm_arn" {
  description = "Composite Security Threat Alarm ARN."
  value       = aws_cloudwatch_composite_alarm.security_threat.arn
}

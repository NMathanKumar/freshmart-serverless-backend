output "bus_arn" {
  description = "EventBridge bus ARN."
  value       = aws_cloudwatch_event_bus.this.arn
}

output "bus_name" {
  description = "EventBridge bus name."
  value       = aws_cloudwatch_event_bus.this.name
}

output "rule_arns" {
  description = "EventBridge rule ARNs keyed by rule name."
  value = {
    for name, rule in aws_cloudwatch_event_rule.this : name => rule.arn
  }
}

output "dlq_arn" {
  description = "Module-managed DLQ ARN, if created."
  value       = local.dlq_arn
}

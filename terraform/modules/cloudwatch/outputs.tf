output "operations_dashboard_name" {
  description = "Operations dashboard name."
  value       = aws_cloudwatch_dashboard.operations.dashboard_name
}

output "lambda_dashboard_name" {
  description = "Lambda dashboard name."
  value       = aws_cloudwatch_dashboard.lambda.dashboard_name
}

output "api_dashboard_name" {
  description = "API dashboard name."
  value       = aws_cloudwatch_dashboard.api.dashboard_name
}

output "database_dashboard_name" {
  description = "Database dashboard name."
  value       = aws_cloudwatch_dashboard.database.dashboard_name
}

output "messaging_dashboard_name" {
  description = "Messaging dashboard name."
  value       = aws_cloudwatch_dashboard.messaging.dashboard_name
}

output "sla_dashboard_name" {
  description = "SLA and Error Budget dashboard name."
  value       = aws_cloudwatch_dashboard.sla.dashboard_name
}

output "executive_dashboard_name" {
  description = "Executive Command Center dashboard name."
  value       = aws_cloudwatch_dashboard.executive.dashboard_name
}

output "business_dashboard_name" {
  description = "Business Intelligence dashboard name."
  value       = aws_cloudwatch_dashboard.business.dashboard_name
}

output "log_group_names" {
  description = "Lambda log group names keyed by service alias."
  value = {
    for name, lambda in var.lambda_functions : name => lambda.log_group_name
  }
}



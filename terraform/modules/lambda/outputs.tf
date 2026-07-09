output "function_name" {
  description = "Lambda function name."
  value       = aws_lambda_function.this.function_name
}

output "function_arn" {
  description = "Lambda function ARN."
  value       = aws_lambda_function.this.arn
}

output "invoke_arn" {
  description = "Lambda invoke ARN."
  value       = aws_lambda_function.this.invoke_arn
}

output "qualified_arn" {
  description = "Lambda qualified ARN."
  value       = aws_lambda_function.this.qualified_arn
}

output "log_group_name" {
  description = "CloudWatch log group name for the function."
  value       = aws_cloudwatch_log_group.this.name
}

output "role_arn" {
  description = "IAM role ARN attached to the function."
  value       = var.role_arn
}

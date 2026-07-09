output "dashboard_name" {
  description = "CloudWatch dashboard name."
  value       = aws_cloudwatch_dashboard.this.dashboard_name
}

output "alarm_arns" {
  description = "Alarm ARNs keyed by category."
  value = {
    lambda_errors = {
      for name, alarm in aws_cloudwatch_metric_alarm.lambda_errors : name => alarm.arn
    }
    lambda_duration = {
      for name, alarm in aws_cloudwatch_metric_alarm.lambda_duration : name => alarm.arn
    }
    lambda_throttles = {
      for name, alarm in aws_cloudwatch_metric_alarm.lambda_throttles : name => alarm.arn
    }
    api_gateway_5xx     = aws_cloudwatch_metric_alarm.api_gateway_5xx.arn
    api_gateway_latency = aws_cloudwatch_metric_alarm.api_gateway_latency.arn
    dynamodb_read_throttle = {
      for name, alarm in aws_cloudwatch_metric_alarm.dynamodb_read_throttle : name => alarm.arn
    }
    dynamodb_write_throttle = {
      for name, alarm in aws_cloudwatch_metric_alarm.dynamodb_write_throttle : name => alarm.arn
    }
  }
}

output "log_group_names" {
  description = "Lambda log group names keyed by service alias."
  value = {
    for name, lambda in var.lambda_functions : name => lambda.log_group_name
  }
}

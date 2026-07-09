variable "project_name" {
  description = "Project name used for resource naming and tagging."
  type        = string
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
}

variable "aws_region" {
  description = "AWS region used for metrics and dashboard widgets."
  type        = string
}

variable "lambda_functions" {
  description = "Lambda functions keyed by service alias."
  type = map(object({
    function_name  = string
    log_group_name = string
  }))
}

variable "api_id" {
  description = "HTTP API identifier used by API Gateway alarms and widgets."
  type        = string
}

variable "api_stage_name" {
  description = "HTTP API stage name."
  type        = string
  default     = "v1"
}

variable "dynamodb_tables" {
  description = "DynamoDB tables keyed by domain alias."
  type = map(object({
    table_name = string
  }))
}

variable "dashboard_name" {
  description = "Optional CloudWatch dashboard name override."
  type        = string
  default     = null
}

variable "metric_period_seconds" {
  description = "Metric period used by dashboard widgets and alarms."
  type        = number
  default     = 300
}

variable "log_retention_in_days" {
  description = "Standard log retention for CloudWatch-managed log groups."
  type        = number
  default     = 30
}

variable "evaluation_periods" {
  description = "Number of periods to evaluate before alarming."
  type        = number
  default     = 1
}

variable "datapoints_to_alarm" {
  description = "Number of datapoints required to breach the alarm threshold."
  type        = number
  default     = 1
}

variable "lambda_error_threshold" {
  description = "Threshold for Lambda Errors alarms."
  type        = number
  default     = 1
}

variable "lambda_duration_threshold_ms" {
  description = "Threshold for Lambda duration alarms in milliseconds."
  type        = number
  default     = 3000
}

variable "lambda_throttle_threshold" {
  description = "Threshold for Lambda throttles alarms."
  type        = number
  default     = 1
}

variable "api_5xx_threshold" {
  description = "Threshold for API Gateway 5XX alarms."
  type        = number
  default     = 1
}

variable "api_latency_threshold_ms" {
  description = "Threshold for API Gateway latency alarms in milliseconds."
  type        = number
  default     = 1000
}

variable "dynamodb_read_throttle_threshold" {
  description = "Threshold for DynamoDB read throttle alarms."
  type        = number
  default     = 1
}

variable "dynamodb_write_throttle_threshold" {
  description = "Threshold for DynamoDB write throttle alarms."
  type        = number
  default     = 1
}

variable "alarm_actions" {
  description = "Alarm action ARNs."
  type        = list(string)
  default     = []
}

variable "ok_actions" {
  description = "OK action ARNs."
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "Additional tags applied to CloudWatch resources."
  type        = map(string)
  default     = {}
}

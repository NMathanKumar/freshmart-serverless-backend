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

variable "alarm_sns_topics" {
  description = "SNS topic ARNs for alarms keyed by severity (critical, warning, info)."
  type = object({
    critical = string
    warning  = string
    info     = string
  })
}

variable "tags" {
  description = "Additional tags applied to CloudWatch resources."
  type        = map(string)
  default     = {}
}

variable "sqs_queues" {
  description = "SQS processing queues keyed by name."
  type        = map(object({ queue_name = string }))
  default     = {}
}

variable "sqs_dlqs" {
  description = "SQS dead-letter queues keyed by name."
  type        = map(object({ queue_name = string }))
  default     = {}
}

variable "sns_topics" {
  description = "SNS topics keyed by name."
  type        = map(object({ topic_name = string }))
  default     = {}
}

variable "eventbridge_bus_name" {
  description = "EventBridge bus name."
  type        = string
  default     = ""
}

variable "api_base_url" {
  description = "API base URL for synthetic monitoring."
  type        = string
  default     = ""
}

variable "enable_synthetic_monitoring" {
  description = "Enable synthetic health check monitoring."
  type        = bool
  default     = false
}

variable "enable_business_dashboard" {
  description = "Enable business observability dashboard."
  type        = bool
  default     = false
}

variable "business_dashboard_name" {
  description = "Optional override for business dashboard name."
  type        = string
  default     = null
}

variable "business_hours" {
  description = "Business hours for zero-order alarm (HH:MM-HH:MM, timezone SGT)"
  type        = string
  default     = "08:00-22:00"
}

variable "cloudfront_cache_hit_threshold" {
  description = "Threshold for CloudFront cache hit ratio % alarms."
  type        = number
  default     = 80
}

variable "enable_lambda_insights" {
  description = "Enable Lambda Insights enhanced runtime metrics via the LambdaInsightsExtension layer."
  type        = bool
  default     = true
}

variable "lambda_insights_layer_version" {
  description = "Pinned version of the AWS-managed LambdaInsightsExtension layer. Update deliberately after review."
  type        = number
  default     = 38
}

variable "lambda_function_role_arns" {
  description = "Map of Lambda service alias to IAM execution role ARN. Used to attach Lambda Insights policy additively."
  type        = map(string)
  default     = {}
}

variable "enable_xray_tracing" {
  description = "Enable X-Ray tracing sampling rule and IAM permissions."
  type        = bool
  default     = true
}

variable "xray_sampling_rate" {
  description = "X-Ray sampling rate (0.0 to 1.0). 0.05 = 5% of requests sampled."
  type        = number
  default     = 0.05
}

variable "xray_reservoir_size" {
  description = "Number of requests per second always sampled regardless of rate (reservoir)."
  type        = number
  default     = 5
}

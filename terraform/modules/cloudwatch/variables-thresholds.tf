variable "api_4xx_threshold" {
  description = "Threshold for API Gateway 4XX alarms."
  type        = number
  default     = 10
}

variable "cloudfront_4xx_error_rate_threshold" {
  description = "Threshold for CloudFront 4XX Error Rate."
  type        = number
  default     = 5
}

variable "cloudfront_5xx_error_rate_threshold" {
  description = "Threshold for CloudFront 5XX Error Rate."
  type        = number
  default     = 1
}

variable "lambda_concurrent_executions_threshold" {
  description = "Threshold for Lambda Concurrent Executions."
  type        = number
  default     = 100
}

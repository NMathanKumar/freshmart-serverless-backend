variable "project_name" {
  description = "Project name used for resource naming and tagging."
  type        = string
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
}

variable "aws_region" {
  description = "AWS region for FinOps resources."
  type        = string
}

variable "monthly_budget_usd" {
  description = "Monthly overall AWS budget limit in USD."
  type        = number
  default     = 100
}

variable "lambda_budget_usd" {
  description = "Monthly Lambda service budget limit in USD."
  type        = number
  default     = 30
}

variable "dynamodb_budget_usd" {
  description = "Monthly DynamoDB service budget limit in USD."
  type        = number
  default     = 25
}

variable "apigateway_budget_usd" {
  description = "Monthly API Gateway service budget limit in USD."
  type        = number
  default     = 20
}

variable "cloudfront_budget_usd" {
  description = "Monthly CloudFront service budget limit in USD."
  type        = number
  default     = 15
}

variable "synthetics_budget_usd" {
  description = "Monthly Synthetics service budget limit in USD."
  type        = number
  default     = 10
}

variable "api_id" {
  description = "API Gateway ID for traffic metrics."
  type        = string
  default     = ""
}

variable "api_stage_name" {
  description = "API Gateway stage name."
  type        = string
  default     = "v1"
}

variable "alarm_sns_topics" {
  description = "SNS topic ARNs for budget and anomaly alerts keyed by severity."
  type = object({
    critical = string
    warning  = string
    info     = string
  })
}

variable "tags" {
  description = "Tags applied to all FinOps resources."
  type        = map(string)
  default     = {}
}

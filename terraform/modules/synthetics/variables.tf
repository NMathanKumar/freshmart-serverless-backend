variable "project_name" {
  description = "Project name used for resource naming and tagging."
  type        = string
}

variable "environment" {
  description = "Deployment environment name (e.g. dev, qa, prod)."
  type        = string
}

variable "aws_region" {
  description = "AWS region for synthetics resources."
  type        = string
}

variable "api_base_url" {
  description = "API Gateway base URL for API health canary."
  type        = string
  default     = ""
}

variable "customer_ui_url" {
  description = "Customer Web UI URL for storefront canary."
  type        = string
  default     = ""
}

variable "admin_ui_url" {
  description = "Admin Web UI URL for admin canary."
  type        = string
  default     = ""
}

variable "cognito_user_pool_id" {
  description = "Cognito User Pool ID for auth validation."
  type        = string
  default     = ""
}

variable "payment_provider_url" {
  description = "Payment provider health endpoint."
  type        = string
  default     = "https://api.stripe.com/v1/health"
}

variable "canary_artifact_retention_days" {
  description = "Number of days to retain canary screenshots and HAR files in S3."
  type        = number
  default     = 30
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
  description = "Tags applied to all synthetics resources."
  type        = map(string)
  default     = {}
}

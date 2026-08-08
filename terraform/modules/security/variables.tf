variable "project_name" {
  description = "Project name used for resource naming and tagging."
  type        = string
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
}

variable "aws_region" {
  description = "AWS region for Security resources."
  type        = string
}

variable "auth_log_group_name" {
  description = "Log group name for authentication lambda service."
  type        = string
  default     = "/aws/lambda/freshmart-prod-auth"
}

variable "api_id" {
  description = "API Gateway ID for security metrics."
  type        = string
  default     = ""
}

variable "api_stage_name" {
  description = "API Gateway stage name."
  type        = string
  default     = "v1"
}

variable "alarm_sns_topics" {
  description = "SNS topic ARNs for security alerts keyed by severity."
  type = object({
    critical = string
    warning  = string
    info     = string
  })
}

variable "tags" {
  description = "Tags applied to all Security resources."
  type        = map(string)
  default     = {}
}

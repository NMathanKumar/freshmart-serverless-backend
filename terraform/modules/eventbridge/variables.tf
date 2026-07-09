variable "project_name" {
  description = "Project name used for naming and tagging."
  type        = string
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
}

variable "aws_region" {
  description = "AWS region used for naming and tagging."
  type        = string
}

variable "bus_name" {
  description = "Custom EventBridge bus name."
  type        = string
  default     = "freshmart-events"
}

variable "rules" {
  description = "EventBridge rule definitions keyed by domain."
  type = map(object({
    description          = optional(string, null)
    enabled              = optional(bool, true)
    detail_type_prefixes = list(string)
    sources              = optional(list(string), [])
    target_lambda_keys   = list(string)
  }))
}

variable "lambda_targets" {
  description = "Lambda targets keyed by target alias."
  type = map(object({
    function_name = string
    function_arn  = string
  }))
}

variable "retry_policy" {
  description = "Retry policy applied to EventBridge targets."
  type = object({
    maximum_event_age_in_seconds = number
    maximum_retry_attempts       = number
  })
  default = {
    maximum_event_age_in_seconds = 3600
    maximum_retry_attempts       = 185
  }
}

variable "create_dlq" {
  description = "Whether to create an EventBridge target DLQ in this module."
  type        = bool
  default     = true
}

variable "dlq_name" {
  description = "Optional DLQ name override."
  type        = string
  default     = null
}

variable "dlq_arn" {
  description = "Optional externally managed DLQ ARN."
  type        = string
  default     = null
}

variable "dlq_message_retention_seconds" {
  description = "Message retention period for the module-managed DLQ."
  type        = number
  default     = 1209600
}

variable "dlq_visibility_timeout_seconds" {
  description = "Visibility timeout for the module-managed DLQ."
  type        = number
  default     = 30
}

variable "archive_enabled" {
  description = "Whether EventBridge archive should be created."
  type        = bool
  default     = false
}

variable "archive_name" {
  description = "Optional EventBridge archive name override."
  type        = string
  default     = null
}

variable "archive_description" {
  description = "Optional EventBridge archive description."
  type        = string
  default     = null
}

variable "archive_event_pattern" {
  description = "Optional archive event pattern."
  type        = string
  default     = null
}

variable "archive_retention_days" {
  description = "Archive retention period in days."
  type        = number
  default     = 365
}

variable "tags" {
  description = "Additional tags applied to EventBridge resources."
  type        = map(string)
  default     = {}
}

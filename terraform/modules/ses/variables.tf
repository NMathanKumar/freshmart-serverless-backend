variable "project_name" {
  description = "Project name used for resource naming and tagging."
  type        = string
}

variable "environment" {
  description = "Deployment environment name (dev, qa, prod)."
  type        = string
}

variable "aws_region" {
  description = "AWS region for SES resources."
  type        = string
  default     = "ap-southeast-1"
}

variable "domain_name" {
  description = "Domain name for SES domain identity (e.g. freshmart.com). Set null or empty string if using email identity."
  type        = string
  default     = null
}

variable "email_address" {
  description = "Sender email address for SES email identity (e.g. no-reply@freshmart.com or developer email)."
  type        = string
  default     = null
}

variable "enable_dkim" {
  description = "Whether to generate DKIM tokens for the domain identity."
  type        = bool
  default     = true
}

variable "mail_from_subdomain" {
  description = "Custom MAIL FROM subdomain (e.g. mail or bounces). Optional."
  type        = string
  default     = null
}

variable "behavior_on_mx_failure" {
  description = "Behavior when custom MAIL FROM MX record is not found (UseDefaultValue or RejectMessage)."
  type        = string
  default     = "UseDefaultValue"
}

variable "enable_configuration_set" {
  description = "Whether to create a dedicated SES Configuration Set."
  type        = bool
  default     = true
}

variable "configuration_set_name" {
  description = "Name for the SES Configuration Set. Defaults to project-environment-email-config."
  type        = string
  default     = null
}

variable "reputation_metrics_enabled" {
  description = "Whether reputation metrics are enabled on the configuration set."
  type        = bool
  default     = true
}

variable "sending_enabled" {
  description = "Whether sending is enabled for the configuration set."
  type        = bool
  default     = true
}

variable "tls_policy" {
  description = "TLS policy for delivery (Require or Optional)."
  type        = string
  default     = "Require"
}

variable "enable_cloudwatch_events" {
  description = "Whether to publish SES event metrics to CloudWatch."
  type        = bool
  default     = true
}

variable "sns_topic_arn" {
  description = "SNS topic ARN to receive bounce, complaint, and delivery notifications."
  type        = string
  default     = null
}

variable "event_matching_types" {
  description = "List of matching SES event types to publish to destinations."
  type        = list(string)
  default     = ["send", "reject", "bounce", "complaint", "delivery"]
}

variable "tags" {
  description = "Additional tags applied to all SES resources."
  type        = map(string)
  default     = {}
}

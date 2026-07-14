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

variable "topics" {
  description = "SNS topics keyed by logical topic name."
  type = map(object({
    name                        = string
    display_name                = optional(string, null)
    fifo_topic                  = optional(bool, false)
    content_based_deduplication = optional(bool, false)
    subscriptions = optional(list(object({
      protocol = string
      endpoint = string
      enabled  = optional(bool, false)
    })), [])
  }))
}

variable "tags" {
  description = "Additional tags applied to SNS resources."
  type        = map(string)
  default     = {}
}

variable "kms_master_key_id" {
  description = "Optional KMS key ID or alias used to encrypt SNS topics."
  type        = string
  default     = "alias/aws/sns"
}

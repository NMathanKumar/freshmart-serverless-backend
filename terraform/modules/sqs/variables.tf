variable "project_name" {
  description = "Project name used for resource naming and tagging."
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

variable "queues" {
  description = "SQS queues keyed by logical queue name."
  type = map(object({
    name                              = string
    fifo_queue                        = optional(bool, false)
    content_based_deduplication       = optional(bool, false)
    visibility_timeout_seconds        = optional(number, 30)
    message_retention_seconds         = optional(number, 345600)
    delay_seconds                     = optional(number, 0)
    max_message_size                  = optional(number, 262144)
    receive_wait_time_seconds         = optional(number, 20)
    sse_enabled                       = optional(bool, true)
    kms_master_key_id                 = optional(string, null)
    kms_data_key_reuse_period_seconds = optional(number, null)
    max_receive_count                 = optional(number, 5)
    dlq_name                          = optional(string, null)
    dlq_message_retention_seconds     = optional(number, 1209600)
    sns_topic_keys                    = optional(list(string), [])
  }))
}

variable "sns_topic_arns" {
  description = "SNS topic ARNs keyed by topic alias for queue subscriptions."
  type        = map(string)
  default     = {}
}

variable "tags" {
  description = "Additional tags applied to SQS resources."
  type        = map(string)
  default     = {}
}

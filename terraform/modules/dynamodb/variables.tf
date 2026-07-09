variable "project_name" {
  description = "Project name used for standard tagging."
  type        = string
}

variable "environment" {
  description = "Deployment environment name used for standard tagging."
  type        = string
}

variable "aws_region" {
  description = "AWS region used for standard tagging."
  type        = string
}

variable "table_name" {
  description = "DynamoDB table name."
  type        = string
}

variable "partition_key" {
  description = "Partition key attribute name."
  type        = string
}

variable "sort_key" {
  description = "Optional sort key attribute name."
  type        = string
  default     = null
}

variable "ttl_enabled" {
  description = "Whether TTL should be enabled for the table."
  type        = bool
  default     = false
}

variable "ttl_attribute" {
  description = "Attribute used as the TTL timestamp when TTL is enabled."
  type        = string
  default     = null
}

variable "point_in_time_recovery" {
  description = "Whether point-in-time recovery should be enabled."
  type        = bool
  default     = true
}

variable "deletion_protection" {
  description = "Whether deletion protection should be enabled."
  type        = bool
  default     = false
}

variable "stream_enabled" {
  description = "Whether DynamoDB Streams should be enabled."
  type        = bool
  default     = false
}

variable "stream_view_type" {
  description = "Stream view type used when DynamoDB Streams are enabled."
  type        = string
  default     = "NEW_AND_OLD_IMAGES"

  validation {
    condition = contains([
      "KEYS_ONLY",
      "NEW_IMAGE",
      "OLD_IMAGE",
      "NEW_AND_OLD_IMAGES",
    ], var.stream_view_type)
    error_message = "stream_view_type must be one of KEYS_ONLY, NEW_IMAGE, OLD_IMAGE, or NEW_AND_OLD_IMAGES."
  }
}

variable "tags" {
  description = "Additional tags applied to the DynamoDB table."
  type        = map(string)
  default     = {}
}

variable "global_secondary_indexes" {
  description = "Optional list of DynamoDB Global Secondary Index definitions."
  type = list(object({
    name               = string
    partition_key      = string
    sort_key           = optional(string)
    projection_type    = optional(string, "ALL")
    non_key_attributes = optional(list(string), [])
  }))
  default = []
}

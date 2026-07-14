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

variable "service_name" {
  description = "Logical service name used for naming and tagging."
  type        = string
}

variable "function_name" {
  description = "Lambda function name."
  type        = string
}

variable "description" {
  description = "Optional Lambda description."
  type        = string
  default     = null
}

variable "filename" {
  description = "Path to the ZIP deployment artifact."
  type        = string
}

variable "source_code_hash" {
  description = "Base64-encoded SHA256 hash of the ZIP artifact."
  type        = string
  default     = null
}

variable "runtime" {
  description = "Lambda runtime."
  type        = string
  default     = "nodejs22.x"

  validation {
    condition     = var.runtime == "nodejs22.x"
    error_message = "Lambda runtime must be nodejs22.x."
  }
}

variable "handler" {
  description = "Lambda handler entrypoint."
  type        = string
}

variable "timeout" {
  description = "Lambda timeout in seconds."
  type        = number
  default     = 30
}

variable "memory_size" {
  description = "Lambda memory size in MB."
  type        = number
  default     = 512
}

variable "architecture" {
  description = "Lambda CPU architecture."
  type        = string
  default     = "x86_64"

  validation {
    condition     = contains(["x86_64", "arm64"], var.architecture)
    error_message = "architecture must be x86_64 or arm64."
  }
}

variable "role_arn" {
  description = "IAM role ARN used by the Lambda function."
  type        = string
}

variable "tracing_mode" {
  description = "X-Ray tracing mode."
  type        = string
  default     = "PassThrough"

  validation {
    condition     = contains(["Active", "PassThrough"], var.tracing_mode)
    error_message = "tracing_mode must be Active or PassThrough."
  }
}

variable "publish" {
  description = "Whether to publish a new Lambda version on update."
  type        = bool
  default     = true
}

variable "environment_variables" {
  description = "Environment variables passed to the Lambda runtime."
  type        = map(string)
  default     = {}
}

variable "dead_letter_config" {
  description = "Optional dead letter queue configuration."
  type = object({
    target_arn = string
  })
  default = null
}

variable "reserved_concurrent_executions" {
  description = "Optional reserved concurrency limit."
  type        = number
  default     = null
}

variable "subnet_ids" {
  description = "Optional VPC subnet IDs for Lambda VPC attachment."
  type        = list(string)
  default     = []
}

variable "security_group_ids" {
  description = "Optional VPC security group IDs for Lambda VPC attachment."
  type        = list(string)
  default     = []
}

variable "ephemeral_storage" {
  description = "Optional ephemeral storage configuration."
  type = object({
    size = number
  })
  default = null
}

variable "layers" {
  description = "Optional Lambda layer ARNs."
  type        = list(string)
  default     = []
}

variable "log_retention_in_days" {
  description = "CloudWatch Logs retention for the Lambda log group."
  type        = number
  default     = 30
}

variable "log_group_kms_key_id" {
  description = "Optional KMS key ID or alias for encrypting the Lambda log group."
  type        = string
  default     = "alias/aws/logs"
}

variable "permissions" {
  description = "Optional Lambda invoke permissions."
  type = list(object({
    statement_id     = string
    action           = string
    principal        = string
    qualifier        = optional(string)
    source_arn       = optional(string)
    source_account   = optional(string)
    principal_org_id = optional(string)
  }))
  default = []
}

variable "tags" {
  description = "Additional tags applied to the Lambda resources."
  type        = map(string)
  default     = {}
}

variable "project_name" {
  description = "Project name used for naming and tagging."
  type        = string
}

variable "environment" {
  description = "Deployment environment name used for naming and tagging."
  type        = string
}

variable "aws_region" {
  description = "AWS region used for resource scoping."
  type        = string
}

variable "service_name" {
  description = "Service identifier used to build IAM role and policy names."
  type        = string
}

variable "role_name" {
  description = "Optional override for the IAM role name."
  type        = string
  default     = null
}

variable "policy_name" {
  description = "Optional override for the managed policy name."
  type        = string
  default     = null
}

variable "enable_cloudwatch_logs" {
  description = "Whether to grant CloudWatch Logs permissions."
  type        = bool
  default     = true
}

variable "cloudwatch_logs_resource_arns" {
  description = "Optional explicit CloudWatch Logs resource ARNs."
  type        = list(string)
  default     = []
}

variable "enable_xray" {
  description = "Whether to grant X-Ray tracing permissions."
  type        = bool
  default     = true
}

variable "dynamodb_table_permissions" {
  description = "List of DynamoDB tables and the actions allowed on each table."
  type = list(object({
    table_arn = string
    actions   = list(string)
  }))
  default = []
}

variable "allow_sns_publish" {
  description = "Whether to grant SNS Publish permissions."
  type        = bool
  default     = false
}

variable "sns_topic_arns" {
  description = "SNS topic ARNs that Publish may target."
  type        = list(string)
  default     = []
}

variable "allow_sqs_send_message" {
  description = "Whether to grant SQS SendMessage permissions."
  type        = bool
  default     = false
}

variable "sqs_queue_arns" {
  description = "SQS queue ARNs that SendMessage may target."
  type        = list(string)
  default     = []
}

variable "allow_s3_object_access" {
  description = "Whether to grant S3 object write/delete permissions."
  type        = bool
  default     = false
}

variable "s3_object_arns" {
  description = "S3 object ARNs that PutObject/DeleteObject may target."
  type        = list(string)
  default     = []
}

variable "allow_eventbridge_put_events" {
  description = "Whether to grant EventBridge PutEvents permissions."
  type        = bool
  default     = false
}

variable "eventbridge_bus_names" {
  description = "EventBridge bus names that PutEvents may target."
  type        = list(string)
  default     = []
}

variable "allow_eventbridge_read" {
  description = "Whether to grant EventBridge read-style permissions."
  type        = bool
  default     = false
}

variable "eventbridge_rule_name_prefixes" {
  description = "EventBridge rule name prefixes used to scope read permissions."
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "Additional tags applied to IAM resources."
  type        = map(string)
  default     = {}
}

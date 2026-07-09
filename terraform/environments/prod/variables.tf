variable "environment" {
  description = "Environment name for prod."
  type        = string
  default     = "prod"
}

variable "project_name" {
  description = "Project or application name used for naming and tagging."
  type        = string
  default     = "freshmart"
}

variable "aws_region" {
  description = "AWS region used by the provider."
  type        = string
  default     = "ap-south-1"
}

variable "owner" {
  description = "Owning team or contact."
  type        = string
  default     = "platform"
}

variable "cost_center" {
  description = "Optional cost allocation tag."
  type        = string
  default     = "freshmart"
}

variable "tags" {
  description = "Additional tags applied to environment-managed resources."
  type        = map(string)
  default     = {}
}

variable "lambda_package_root" {
  description = "Optional root directory for Lambda ZIP artifacts."
  type        = string
  default     = null
}

variable "lambda_package_filename" {
  description = "ZIP filename used under each service directory."
  type        = string
  default     = "lambda.zip"
}

variable "lambda_log_level" {
  description = "Default application log level for Lambda environment variables."
  type        = string
  default     = "info"
}

variable "jwt_secret" {
  description = "JWT signing secret injected into authenticated Lambda services."
  type        = string
  sensitive   = true
}

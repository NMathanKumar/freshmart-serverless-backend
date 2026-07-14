variable "project_name" {
  description = "Project name used for naming and tagging."
  type        = string
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
}

variable "aws_region" {
  description = "AWS region used for resource scoping."
  type        = string
}

variable "secrets" {
  description = "Secrets Manager secrets keyed by logical name."
  type = map(object({
    name                    = string
    description             = optional(string, null)
    recovery_window_in_days = optional(number, 7)
    value                   = string
  }))
}

variable "parameters" {
  description = "Parameter Store entries keyed by logical name."
  type = map(object({
    name                    = string
    description             = optional(string, null)
    type                    = optional(string, "SecureString")
    value                   = string
    tier                    = optional(string, "Standard")
    recovery_window_in_days = optional(number, 7)
  }))
  default = {}
}

variable "tags" {
  description = "Additional tags applied to secret resources."
  type        = map(string)
  default     = {}
}

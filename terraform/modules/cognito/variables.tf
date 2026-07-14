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

variable "user_pool_name" {
  description = "Optional Cognito user pool name override."
  type        = string
  default     = null
}

variable "domain_prefix" {
  description = "Optional Cognito hosted UI domain prefix."
  type        = string
  default     = null
}

variable "callback_urls" {
  description = "OAuth callback URLs for the user pool app client."
  type        = list(string)
  default     = []
}

variable "logout_urls" {
  description = "OAuth logout URLs for the user pool app client."
  type        = list(string)
  default     = []
}

variable "mfa_configuration" {
  description = "Cognito MFA configuration."
  type        = string
  default     = "OFF"
}

variable "software_token_mfa_enabled" {
  description = "Whether software token MFA should be enabled."
  type        = bool
  default     = false
}

variable "password_policy" {
  description = "Cognito password policy."
  type = object({
    minimum_length                   = number
    require_lowercase                = bool
    require_numbers                  = bool
    require_symbols                  = bool
    require_uppercase                = bool
    temporary_password_validity_days = number
  })
  default = {
    minimum_length                   = 12
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = true
    require_uppercase                = true
    temporary_password_validity_days = 7
  }
}

variable "groups" {
  description = "User pool groups keyed by logical group name."
  type = map(object({
    description = optional(string, null)
    precedence  = optional(number, null)
    role_name   = optional(string, null)
  }))
  default = {
    admins = {
      description = "Administrators with operational access."
      precedence  = 1
    }
    staff = {
      description = "Operational support and back-office staff."
      precedence  = 10
    }
    customers = {
      description = "Standard FreshMart customers."
      precedence  = 100
    }
  }
}

variable "tags" {
  description = "Additional tags applied to Cognito resources."
  type        = map(string)
  default     = {}
}

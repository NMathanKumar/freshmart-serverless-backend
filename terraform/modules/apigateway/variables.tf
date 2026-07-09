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

variable "api_name" {
  description = "HTTP API name."
  type        = string
}

variable "description" {
  description = "Optional API description."
  type        = string
  default     = null
}

variable "stage_name" {
  description = "HTTP API stage name."
  type        = string
  default     = "v1"
}

variable "lambdas" {
  description = "Lambda targets keyed by service alias."
  type = map(object({
    function_name = string
    function_arn  = string
    invoke_arn    = string
  }))
}

variable "routes" {
  description = "HTTP route definitions keyed by logical route name."
  type = map(object({
    method               = string
    path                 = string
    lambda_key           = string
    authorization_type   = optional(string, "NONE")
    authorization_scopes = optional(list(string), [])
  }))
}

variable "cors_allow_origins" {
  description = "Allowed CORS origins."
  type        = list(string)
  default     = ["*"]
}

variable "cors_allow_methods" {
  description = "Allowed CORS methods."
  type        = list(string)
  default     = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}

variable "cors_allow_headers" {
  description = "Allowed CORS headers."
  type        = list(string)
  default     = ["content-type", "authorization", "x-amz-date", "x-api-key", "x-amz-security-token", "x-amz-user-agent"]
}

variable "cors_expose_headers" {
  description = "Exposed CORS headers."
  type        = list(string)
  default     = []
}

variable "cors_allow_credentials" {
  description = "Whether CORS should allow credentials."
  type        = bool
  default     = false
}

variable "cors_max_age" {
  description = "CORS preflight cache age in seconds."
  type        = number
  default     = 86400
}

variable "jwt_authorizer_enabled" {
  description = "Whether the JWT authorizer placeholder should be created."
  type        = bool
  default     = false
}

variable "jwt_authorizer_name" {
  description = "JWT authorizer name."
  type        = string
  default     = "freshmart-jwt-authorizer"
}

variable "jwt_issuer" {
  description = "JWT issuer URL."
  type        = string
  default     = null
}

variable "jwt_audience" {
  description = "JWT audience values."
  type        = list(string)
  default     = []
}

variable "jwt_identity_sources" {
  description = "JWT identity sources."
  type        = list(string)
  default     = ["$request.header.Authorization"]
}

variable "tags" {
  description = "Additional tags applied to API Gateway resources."
  type        = map(string)
  default     = {}
}

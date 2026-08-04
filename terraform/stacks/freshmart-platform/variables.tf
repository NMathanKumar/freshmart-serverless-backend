variable "project_name" {
  type        = string
  default     = "freshmart"
  description = "Project name prefix."
}

variable "environment" {
  type        = string
  description = "Deployment environment."
}

variable "aws_region" {
  type        = string
  description = "AWS region."
}

variable "tags" {
  type        = map(string)
  default     = {}
  description = "Additional stack tags."
}

variable "web_callback_urls" {
  type        = list(string)
  default     = []
  description = "Allowed Cognito callback URLs."
}

variable "web_logout_urls" {
  type        = list(string)
  default     = []
  description = "Allowed Cognito logout URLs."
}

variable "allowed_origins" {
  type        = list(string)
  default     = []
  description = "Allowed browser origins for API Gateway CORS."
}

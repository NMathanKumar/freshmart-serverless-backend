variable "github_org_repo" {
  description = "GitHub Organization and Repository name (e.g. NMathanKumar/freshmart-serverless-backend)"
  type        = string
  default     = "NMathanKumar/freshmart-serverless-backend"
}

variable "create_oidc_provider" {
  description = "Whether to create the GitHub OIDC Identity Provider entity if it doesn't already exist"
  type        = bool
  default     = true
}

variable "aws_region" {
  description = "Target AWS Region"
  type        = string
  default     = "ap-southeast-1"
}

variable "role_max_session_duration" {
  description = "Maximum session duration in seconds for assumed IAM roles"
  type        = number
  default     = 3600
}

variable "tags" {
  description = "Resource tags"
  type        = map(string)
  default = {
    Project    = "FreshMart"
    ManagedBy  = "Terraform"
    Subsystem  = "CI-CD-OIDC"
  }
}

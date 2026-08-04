variable "project_name" {
  type        = string
  description = "Project name"
}

variable "environment" {
  type        = string
  description = "Deployment environment"
}

variable "parameters" {
  type        = map(string)
  description = "Map of SSM parameter names (without prefix) to their values."
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to resources"
  default     = {}
}

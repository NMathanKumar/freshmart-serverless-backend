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

variable "bucket_name" {
  description = "Name of the S3 bucket."
  type        = string
}

variable "versioning_enabled" {
  description = "Whether S3 versioning should be enabled."
  type        = bool
  default     = true
}

variable "tags" {
  description = "Additional tags applied to the S3 bucket."
  type        = map(string)
  default     = {}
}

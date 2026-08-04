variable "project_name" {
  type        = string
  description = "Project name (freshmart)"
}

variable "environment" {
  type        = string
  description = "Target environment (dev, qa, prod)"
}

variable "app_name" {
  type        = string
  description = "Application tier name (customer, admin)"
}

variable "bucket_name" {
  type        = string
  description = "Full S3 bucket name"
}

variable "force_destroy" {
  type        = bool
  description = "Allow bucket destruction even if non-empty"
  default     = true
}

variable "versioning_enabled" {
  type        = bool
  description = "Enable S3 bucket versioning"
  default     = true
}

variable "tags" {
  type        = map(string)
  description = "Resource tags"
  default     = {}
}

variable "extra_source_arns" {
  type        = list(string)
  description = "Extra CloudFront distribution ARNs allowed to access the bucket"
  default     = []
}

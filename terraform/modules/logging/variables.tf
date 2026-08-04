variable "bucket_name" {
  description = "The name of the logging S3 bucket."
  type        = string
}

variable "project_name" {
  description = "Project name for tags."
  type        = string
}

variable "environment" {
  description = "Environment name for tags."
  type        = string
}

variable "force_destroy" {
  description = "Whether to force destroy the bucket."
  type        = bool
  default     = false
}

variable "tags" {
  description = "Tags for the logging bucket."
  type        = map(string)
  default     = {}
}

variable "project_name" {
  type        = string
  description = "Project name (freshmart)"
}

variable "environment" {
  type        = string
  description = "Target environment (dev, qa, prod)"
}

variable "customer_bucket_id" {
  type        = string
  description = "Customer S3 bucket ID"
}

variable "customer_bucket_arn" {
  type        = string
  description = "Customer S3 bucket ARN"
}

variable "customer_bucket_regional_domain_name" {
  type        = string
  description = "Customer S3 bucket regional domain name"
}

variable "admin_bucket_id" {
  type        = string
  description = "Admin S3 bucket ID"
}

variable "admin_bucket_arn" {
  type        = string
  description = "Admin S3 bucket ARN"
}

variable "admin_bucket_regional_domain_name" {
  type        = string
  description = "Admin S3 bucket regional domain name"
}

variable "logging_bucket_domain_name" {
  type        = string
  default     = ""
  description = "Domain name for the S3 bucket to store CloudFront logs"
}

variable "tags" {
  type        = map(string)
  description = "Resource tags"
  default     = {}
}

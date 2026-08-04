variable "logging_bucket_domain_name" {
  description = "The domain name of the S3 bucket to store CloudFront access logs."
  type        = string
  default     = ""
}

variable "logging_bucket_id" {
  description = "The ID of the S3 bucket to store S3 server access logs."
  type        = string
  default     = ""
}

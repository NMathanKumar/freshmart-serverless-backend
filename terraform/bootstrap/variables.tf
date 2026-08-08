variable "aws_region" {
  description = "AWS region where the Terraform state bucket will be created."
  type        = string
  default     = "ap-southeast-1"
}

variable "state_bucket_name" {
  description = "Name of the S3 bucket that will store Terraform state for all FreshMart environments."
  type        = string
  default     = "freshmart-terraform-state"
}

variable "project" {
  description = "Project name used for tagging."
  type        = string
  default     = "freshmart"
}

variable "project_name" {
  description = "Project or application name used for naming and tags."
  type        = string
  default     = "freshmart"
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
}

variable "aws_region" {
  description = "AWS region used by the provider."
  type        = string
  default     = "ap-southeast-1"
}

variable "owner" {
  description = "Owning team or contact."
  type        = string
  default     = "platform"
}

variable "cost_center" {
  description = "Optional cost allocation tag."
  type        = string
  default     = "freshmart"
}

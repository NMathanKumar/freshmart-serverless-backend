variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "monthly_budget_amount" {
  type    = string
  default = "100.0"
}

variable "subscriber_sns_topic_arn" {
  type = string
}

variable "tags" {
  type    = map(string)
  default = {}
}

variable "cloudfront_distributions" {
  description = "CloudFront distributions keyed by app name."
  type = map(object({
    distribution_id = string
  }))
  default = {}
}

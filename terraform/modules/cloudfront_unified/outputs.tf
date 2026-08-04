output "cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.this.id
  description = "ID of the unified CloudFront distribution"
}

output "cloudfront_domain_name" {
  value       = aws_cloudfront_distribution.this.domain_name
  description = "Domain name of the unified CloudFront distribution"
}

output "customer_bucket_arn" {
  value       = var.customer_bucket_arn
  description = "ARN of the customer S3 bucket"
}

output "admin_bucket_arn" {
  value       = var.admin_bucket_arn
  description = "ARN of the admin S3 bucket"
}

output "cloudfront_distribution_arn" {
  value       = aws_cloudfront_distribution.this.arn
  description = "ARN of the unified CloudFront distribution"
}

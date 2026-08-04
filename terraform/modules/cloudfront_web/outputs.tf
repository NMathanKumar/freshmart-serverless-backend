output "bucket_id" {
  value       = aws_s3_bucket.this.id
  description = "Name of the S3 bucket"
}

output "bucket_arn" {
  value       = aws_s3_bucket.this.arn
  description = "ARN of the S3 bucket"
}

output "bucket_domain_name" {
  value       = aws_s3_bucket.this.bucket_regional_domain_name
  description = "Regional domain name of the S3 bucket"
}

output "cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.this.id
  description = "ID of the CloudFront distribution"
}

output "cloudfront_distribution_arn" {
  value       = aws_cloudfront_distribution.this.arn
  description = "ARN of the CloudFront distribution"
}

output "cloudfront_domain_name" {
  value       = aws_cloudfront_distribution.this.domain_name
  description = "Domain name of the CloudFront distribution"
}

output "cloudfront_url" {
  value       = "https://${aws_cloudfront_distribution.this.domain_name}"
  description = "Full HTTPS URL of the CloudFront distribution"
}

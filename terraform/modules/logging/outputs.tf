output "bucket_id" {
  description = "The name of the logging bucket."
  value       = aws_s3_bucket.logging.id
}

output "bucket_domain_name" {
  description = "The domain name of the logging bucket."
  value       = aws_s3_bucket.logging.bucket_domain_name
}

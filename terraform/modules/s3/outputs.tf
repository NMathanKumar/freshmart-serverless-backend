output "bucket_name" {
  description = "S3 bucket name."
  value       = aws_s3_bucket.this.bucket
}

output "bucket_arn" {
  description = "S3 bucket ARN."
  value       = aws_s3_bucket.this.arn
}

output "object_arn" {
  description = "Wildcard ARN covering objects inside the bucket."
  value       = "${aws_s3_bucket.this.arn}/*"
}

output "canary_names" {
  description = "Names of the provisioned CloudWatch Synthetics canaries."
  value       = [for k, v in aws_synthetics_canary.canaries : v.name]
}

output "canary_arns" {
  description = "ARNs of the provisioned CloudWatch Synthetics canaries."
  value       = { for k, v in aws_synthetics_canary.canaries : k => v.arn }
}

output "artifact_bucket_name" {
  description = "S3 bucket storing canary screenshots and HAR artifacts."
  value       = aws_s3_bucket.canary_artifacts.bucket
}

output "synthetics_dashboard_name" {
  description = "Synthetics observability dashboard name."
  value       = aws_cloudwatch_dashboard.synthetics.dashboard_name
}

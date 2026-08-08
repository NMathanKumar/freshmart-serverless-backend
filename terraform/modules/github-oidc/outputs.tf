output "oidc_provider_arn" {
  description = "ARN of the GitHub OIDC Identity Provider"
  value       = local.provider_arn
}

output "dev_role_arn" {
  description = "IAM Role ARN for Development Environment"
  value       = aws_iam_role.github_ci_dev.arn
}

output "qa_role_arn" {
  description = "IAM Role ARN for QA Environment"
  value       = aws_iam_role.github_ci_qa.arn
}

output "staging_role_arn" {
  description = "IAM Role ARN for Staging Environment"
  value       = aws_iam_role.github_ci_staging.arn
}

output "prod_role_arn" {
  description = "IAM Role ARN for Production Environment"
  value       = aws_iam_role.github_ci_prod.arn
}

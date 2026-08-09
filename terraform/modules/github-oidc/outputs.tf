output "oidc_provider_arn" {
  description = "ARN of the GitHub OIDC Identity Provider"
  value       = local.provider_arn
}

output "plan_role_arn" {
  description = "IAM Role ARN for Read-Only PR Plan Execution"
  value       = aws_iam_role.github_ci_plan.arn
}

output "dev_role_arn" {
  description = "IAM Role ARN for DEV Environment CI/CD Execution"
  value       = aws_iam_role.github_ci_dev.arn
}

output "qa_role_arn" {
  description = "IAM Role ARN for QA Environment CI/CD Execution"
  value       = aws_iam_role.github_ci_qa.arn
}

output "prod_role_arn" {
  description = "IAM Role ARN for PROD Environment CI/CD Execution"
  value       = aws_iam_role.github_ci_prod.arn
}

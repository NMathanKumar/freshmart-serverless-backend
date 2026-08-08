output "state_bucket_name" {
  description = "Name of the S3 bucket provisioned for Terraform remote state."
  value       = aws_s3_bucket.terraform_state.id
}

output "state_bucket_arn" {
  description = "ARN of the Terraform state S3 bucket."
  value       = aws_s3_bucket.terraform_state.arn
}

output "state_bucket_region" {
  description = "AWS region where the state bucket was created."
  value       = var.aws_region
}

output "backend_config_snippet" {
  description = "backend.tf snippet to paste into each environment (dev/qa/prod)."
  value       = <<-EOT
    # Paste this into terraform/environments/<ENV>/backend.tf
    # Replace <ENV> with: dev, qa, or prod
    terraform {
      backend "s3" {
        bucket       = "${aws_s3_bucket.terraform_state.id}"
        key          = "freshmart/<ENV>/terraform.tfstate"
        region       = "${var.aws_region}"
        use_lockfile = true
        encrypt      = true
      }
    }
  EOT
}

output "github_oidc_provider_arn" {
  description = "ARN of the GitHub OIDC Identity Provider entity."
  value       = module.github_oidc.oidc_provider_arn
}

output "github_plan_role_arn" {
  description = "IAM Role ARN for PR read-only terraform plan runs."
  value       = module.github_oidc.plan_role_arn
}

output "github_dev_role_arn" {
  description = "IAM Role ARN for DEV environment CI/CD deployment."
  value       = module.github_oidc.dev_role_arn
}

output "github_qa_role_arn" {
  description = "IAM Role ARN for QA environment CI/CD deployment."
  value       = module.github_oidc.qa_role_arn
}

output "github_prod_role_arn" {
  description = "IAM Role ARN for PROD environment CI/CD deployment."
  value       = module.github_oidc.prod_role_arn
}


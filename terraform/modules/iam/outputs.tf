output "role_arn" {
  description = "IAM role ARN."
  value       = aws_iam_role.this.arn
}

output "role_name" {
  description = "IAM role name."
  value       = aws_iam_role.this.name
}

output "policy_arn" {
  description = "Managed policy ARN attached to the role."
  value       = aws_iam_policy.this.arn
}

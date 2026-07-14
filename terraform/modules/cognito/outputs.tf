output "user_pool_id" {
  description = "Cognito user pool ID."
  value       = aws_cognito_user_pool.this.id
}

output "user_pool_arn" {
  description = "Cognito user pool ARN."
  value       = aws_cognito_user_pool.this.arn
}

output "user_pool_client_id" {
  description = "Cognito app client ID."
  value       = aws_cognito_user_pool_client.this.id
}

output "user_pool_domain" {
  description = "Cognito hosted UI domain prefix, if configured."
  value       = try(aws_cognito_user_pool_domain.this[0].domain, null)
}

output "identity_pool_id" {
  description = "Cognito identity pool ID."
  value       = aws_cognito_identity_pool.this.id
}

output "authenticated_role_arn" {
  description = "Authenticated identity pool role ARN."
  value       = aws_iam_role.authenticated.arn
}

output "unauthenticated_role_arn" {
  description = "Unauthenticated identity pool role ARN."
  value       = aws_iam_role.unauthenticated.arn
}

output "group_names" {
  description = "Cognito group names keyed by logical name."
  value = {
    for name, group in aws_cognito_user_group.this : name => group.name
  }
}

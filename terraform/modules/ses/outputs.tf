output "identity_arn" {
  description = "The ARN of the created SES domain or email identity."
  value       = local.is_domain_identity ? aws_ses_domain_identity.domain[0].arn : (local.is_email_identity ? aws_ses_email_identity.email[0].arn : null)
}

output "identity_name" {
  description = "The domain name or email address of the SES identity."
  value       = local.is_domain_identity ? aws_ses_domain_identity.domain[0].domain : (local.is_email_identity ? aws_ses_email_identity.email[0].email : null)
}

output "dkim_tokens" {
  description = "DKIM tokens generated for the domain identity, used for Route53 CNAME DNS records."
  value       = local.is_domain_identity && var.enable_dkim ? aws_ses_domain_dkim.dkim[0].dkim_tokens : []
}

output "configuration_set_name" {
  description = "The name of the SES Configuration Set."
  value       = var.enable_configuration_set ? aws_ses_configuration_set.this[0].name : null
}

output "configuration_set_arn" {
  description = "The ARN of the SES Configuration Set."
  value       = var.enable_configuration_set ? aws_ses_configuration_set.this[0].arn : null
}

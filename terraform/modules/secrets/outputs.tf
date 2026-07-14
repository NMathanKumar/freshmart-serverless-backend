output "secret_arns" {
  description = "Secret ARNs keyed by logical name."
  value = {
    for name, secret in aws_secretsmanager_secret.this : name => secret.arn
  }
}

output "secret_names" {
  description = "Secret names keyed by logical name."
  value = {
    for name, secret in aws_secretsmanager_secret.this : name => secret.name
  }
}

output "parameter_arns" {
  description = "SSM parameter ARNs keyed by logical name."
  value = {
    for name, parameter in aws_ssm_parameter.this : name => parameter.arn
  }
}

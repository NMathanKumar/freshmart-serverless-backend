output "parameters" {
  value       = { for k, v in aws_ssm_parameter.this : k => v.name }
  description = "The names of the SSM parameters"
}

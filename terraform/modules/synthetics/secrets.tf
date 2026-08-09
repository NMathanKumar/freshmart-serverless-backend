resource "aws_secretsmanager_secret" "canary_credentials" {
  name        = "${var.project_name}-${var.environment}-canary-credentials"
  description = "Test credentials used by CloudWatch Synthetics canary scripts."

  tags = merge(var.tags, {
    Environment = var.environment
    ManagedBy   = "Terraform"
    Project     = var.project_name
    Category    = "Synthetics"
  })
}

resource "aws_secretsmanager_secret_version" "canary_credentials" {
  secret_id = aws_secretsmanager_secret.canary_credentials.id
  secret_string = jsonencode({
    username = "canary@freshmart.internal"
    password = "CanaryTestUser123!"
  })
}

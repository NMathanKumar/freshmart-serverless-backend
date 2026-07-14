locals {
  base_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Region      = var.aws_region
  }

  merged_tags = merge(local.base_tags, var.tags)
}

resource "aws_secretsmanager_secret" "this" {
  for_each = var.secrets

  name                    = each.value.name
  description             = try(each.value.description, null)
  recovery_window_in_days = try(each.value.recovery_window_in_days, 7)
  tags                    = merge(local.merged_tags, { Name = each.value.name })
}

resource "aws_secretsmanager_secret_version" "this" {
  for_each = var.secrets

  secret_id     = aws_secretsmanager_secret.this[each.key].id
  secret_string = each.value.value
}

resource "aws_ssm_parameter" "this" {
  for_each = var.parameters

  name        = each.value.name
  description = try(each.value.description, null)
  type        = try(each.value.type, "SecureString")
  tier        = try(each.value.tier, "Standard")
  value       = each.value.value
  key_id      = "alias/aws/ssm"
  tags        = merge(local.merged_tags, { Name = each.value.name })
}

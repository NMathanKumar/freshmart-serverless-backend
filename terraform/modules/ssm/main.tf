resource "aws_ssm_parameter" "this" {
  for_each = var.parameters

  name  = "/${var.project_name}/monitoring/${each.key}"
  type  = "String"
  value = each.value

  lifecycle {
    ignore_changes = [value]
  }

  tags = var.tags
}

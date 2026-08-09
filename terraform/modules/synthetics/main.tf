data "archive_file" "canary_zips" {
  for_each    = local.canary_definitions
  type        = "zip"
  output_path = "${path.module}/zips/${each.key}.zip"

  source {
    content  = file("${path.module}/scripts/${each.value.script_file}")
    filename = "nodejs/node_modules/${each.value.script_file}"
  }
}

resource "aws_synthetics_canary" "canaries" {
  for_each = local.canary_definitions

  name                 = each.value.name
  artifact_s3_location = "s3://${aws_s3_bucket.canary_artifacts.bucket}/artifacts/${each.key}"
  execution_role_arn   = aws_iam_role.canary_execution.arn
  handler              = each.value.handler
  zip_file             = data.archive_file.canary_zips[each.key].output_path
  runtime_version      = each.value.runtime
  start_canary         = true

  schedule {
    expression = each.value.schedule
  }

  run_config {
    timeout_in_seconds = each.value.timeout_sec
    active_tracing     = each.value.active_tracing
    environment_variables = {
      API_BASE_URL         = var.api_base_url
      CUSTOMER_UI_URL      = var.customer_ui_url
      ADMIN_UI_URL         = var.admin_ui_url
      PAYMENT_PROVIDER_URL = var.payment_provider_url
      TARGET_REGION        = var.aws_region
      SECRET_ARN           = aws_secretsmanager_secret.canary_credentials.arn
    }
  }

  tags = merge(var.tags, {
    Environment = var.environment
    ManagedBy   = "Terraform"
    Project     = var.project_name
    Category    = "Synthetics"
    CanaryName  = each.key
  })
}

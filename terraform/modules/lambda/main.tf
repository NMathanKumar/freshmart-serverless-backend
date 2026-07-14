locals {
  # Centralize naming and tagging so every Lambda stays consistent.
  base_tags = {
    Name        = var.function_name
    Project     = var.project_name
    Environment = var.environment
    Service     = var.service_name
    ManagedBy   = "Terraform"
    Region      = var.aws_region
  }

  merged_tags = merge(local.base_tags, var.tags)
}

# Lambda execution role is supplied by the IAM module so permissions stay decoupled.
resource "aws_lambda_function" "this" {
  function_name = var.function_name
  description   = var.description
  role          = var.role_arn
  runtime       = var.runtime
  handler       = var.handler
  filename      = var.filename

  # Hashing the ZIP keeps deployments drift-aware when the artifact changes.
  source_code_hash = var.source_code_hash

  timeout                        = var.timeout
  memory_size                    = var.memory_size
  architectures                  = [var.architecture]
  publish                        = var.publish
  reserved_concurrent_executions = var.reserved_concurrent_executions
  package_type                   = "Zip"
  tags                           = local.merged_tags
  layers                         = var.layers

  # Environment variables are fully caller-controlled and can carry any service config.
  environment {
    variables = var.environment_variables
  }

  # Enable or relax tracing without changing the module structure.
  tracing_config {
    mode = var.tracing_mode
  }

  dynamic "dead_letter_config" {
    for_each = var.dead_letter_config == null ? [] : [var.dead_letter_config]

    content {
      target_arn = dead_letter_config.value.target_arn
    }
  }

  dynamic "ephemeral_storage" {
    for_each = var.ephemeral_storage == null ? [] : [var.ephemeral_storage]

    content {
      size = ephemeral_storage.value.size
    }
  }

  dynamic "vpc_config" {
    for_each = length(var.subnet_ids) > 0 && length(var.security_group_ids) > 0 ? [1] : []

    content {
      subnet_ids         = var.subnet_ids
      security_group_ids = var.security_group_ids
    }
  }

  lifecycle {
    precondition {
      condition     = var.runtime == "nodejs22.x"
      error_message = "Lambda runtime must be nodejs22.x."
    }

    precondition {
      condition     = var.filename != null && trimspace(var.filename) != ""
      error_message = "filename must point to a Lambda ZIP artifact."
    }

    precondition {
      condition     = length(distinct([for permission in var.permissions : permission.statement_id])) == length(var.permissions)
      error_message = "Each Lambda permission statement_id must be unique."
    }

    precondition {
      condition     = var.reserved_concurrent_executions == null || var.reserved_concurrent_executions >= 0
      error_message = "reserved_concurrent_executions must be null or a non-negative integer."
    }

    precondition {
      condition     = var.ephemeral_storage == null || (var.ephemeral_storage.size >= 512 && var.ephemeral_storage.size <= 10240)
      error_message = "ephemeral_storage.size must be between 512 and 10240 MB."
    }

    precondition {
      condition     = var.tracing_mode == "Active" || var.tracing_mode == "PassThrough"
      error_message = "tracing_mode must be Active or PassThrough."
    }

    precondition {
      condition     = (length(var.subnet_ids) == 0 && length(var.security_group_ids) == 0) || (length(var.subnet_ids) > 0 && length(var.security_group_ids) > 0)
      error_message = "subnet_ids and security_group_ids must be provided together when attaching Lambda to a VPC."
    }
  }
}

# Create the CloudWatch log group up front so retention is standardized.
resource "aws_cloudwatch_log_group" "this" {
  name              = "/aws/lambda/${var.function_name}"
  retention_in_days = var.log_retention_in_days
  kms_key_id        = var.log_group_kms_key_id
  tags              = local.merged_tags
}

# Optional invoke permissions support event sources without hardcoding them in the module.
resource "aws_lambda_permission" "this" {
  for_each = { for permission in var.permissions : permission.statement_id => permission }

  statement_id     = each.value.statement_id
  action           = each.value.action
  function_name    = aws_lambda_function.this.function_name
  principal        = each.value.principal
  qualifier        = try(each.value.qualifier, null)
  source_arn       = try(each.value.source_arn, null)
  source_account   = try(each.value.source_account, null)
  principal_org_id = try(each.value.principal_org_id, null)
}

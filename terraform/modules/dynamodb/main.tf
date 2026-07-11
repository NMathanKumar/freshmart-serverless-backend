locals {
  # Centralize module-level tags so every table gets consistent metadata.
  base_tags = {
    Name        = var.table_name
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Region      = var.aws_region
  }

  table_tags = merge(local.base_tags, var.tags)

  # DynamoDB requires every key attribute used by the table or any GSI to be declared once.
  attribute_names = distinct(compact(concat(
    [var.partition_key],
    var.sort_key == null ? [] : [var.sort_key],
    flatten([
      for index in var.global_secondary_indexes : compact([
        index.partition_key,
        try(index.sort_key, null),
      ])
    ])
  )))
}

# DynamoDB table with on-demand capacity, encryption, PITR, and optional TTL/GSIs.
resource "aws_dynamodb_table" "this" {
  name                        = var.table_name
  billing_mode                = "PAY_PER_REQUEST"
  hash_key                    = var.partition_key
  range_key                   = var.sort_key
  deletion_protection_enabled = var.deletion_protection
  stream_enabled              = var.stream_enabled
  stream_view_type            = var.stream_enabled ? var.stream_view_type : null
  tags                        = local.table_tags

  # Enable server-side encryption using the AWS owned key.
  server_side_encryption {
    enabled = true
  }

  # Keep historical table versions available for recovery and rollback.
  point_in_time_recovery {
    enabled = var.point_in_time_recovery
  }

  dynamic "attribute" {
    for_each = toset(local.attribute_names)

    content {
      name = attribute.value
      type = "S"
    }
  }

  # Enable TTL only when the caller requests it.
  dynamic "ttl" {
    for_each = var.ttl_enabled ? [1] : []

    content {
      attribute_name = var.ttl_attribute
      enabled        = true
    }
  }

  # Provision optional GSIs from a reusable schema description.
  dynamic "global_secondary_index" {
    for_each = var.global_secondary_indexes

    content {
      name               = global_secondary_index.value.name
      hash_key           = global_secondary_index.value.partition_key
      range_key          = global_secondary_index.value.sort_key
      projection_type    = global_secondary_index.value.projection_type
      non_key_attributes = global_secondary_index.value.projection_type == "INCLUDE" ? global_secondary_index.value.non_key_attributes : null
    }
  }

  lifecycle {
    precondition {
      condition     = !var.ttl_enabled || var.ttl_attribute != null
      error_message = "ttl_attribute must be provided when ttl_enabled is true."
    }

    precondition {
      condition     = length(distinct([for index in var.global_secondary_indexes : index.name])) == length(var.global_secondary_indexes)
      error_message = "Each global secondary index must use a unique name."
    }
  }
}

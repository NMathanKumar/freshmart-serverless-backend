locals {
  # Keep names and tags predictable across environments.
  base_tags = {
    Name        = var.bus_name
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Region      = var.aws_region
  }

  merged_tags = var.enable_tags ? merge(local.base_tags, var.tags) : {}

  # Optional DLQ is created in-module so target failure handling stays reusable.
  dlq_name = coalesce(var.dlq_name, "${var.bus_name}-dlq")

  # Flatten rules and target fan-out into deterministic maps for event targets and permissions.
  rule_target_pairs = merge([
    for rule_key, rule in var.rules : {
      for target_key in rule.target_lambda_keys :
      "${rule_key}-${target_key}" => {
        rule_key   = rule_key
        target_key = target_key
      }
    }
  ]...)

  rule_patterns = {
    for rule_key, rule in var.rules :
    rule_key => jsonencode(merge(
      length(rule.sources) > 0 ? { source = rule.sources } : {},
      {
        "detail-type" = [
          for prefix in rule.detail_type_prefixes : {
            prefix = prefix
          }
        ]
      }
    ))
  }
}

# Custom bus keeps FreshMart domain events isolated from other event traffic.
resource "aws_cloudwatch_event_bus" "this" {
  name = var.bus_name
  tags = local.merged_tags
}

# Optional archive gives the environment a replay path without enabling it by default.
resource "aws_cloudwatch_event_archive" "this" {
  count = var.archive_enabled ? 1 : 0

  name             = coalesce(var.archive_name, "${var.bus_name}-archive")
  description      = var.archive_description
  event_source_arn = aws_cloudwatch_event_bus.this.arn
  event_pattern    = var.archive_event_pattern
  retention_days   = var.archive_retention_days
}

# Optional dead letter queue handles EventBridge target delivery failures.
resource "aws_sqs_queue" "dlq" {
  count = var.create_dlq ? 1 : 0

  name                       = local.dlq_name
  message_retention_seconds  = var.dlq_message_retention_seconds
  visibility_timeout_seconds = var.dlq_visibility_timeout_seconds
  sqs_managed_sse_enabled    = true
  tags                       = local.merged_tags
}

# The queue policy allows EventBridge to deliver failed target messages.
data "aws_iam_policy_document" "dlq" {
  count = var.create_dlq ? 1 : 0

  statement {
    sid = "AllowEventBridgeSendMessage"

    actions = ["sqs:SendMessage"]

    principals {
      type        = "Service"
      identifiers = ["events.amazonaws.com"]
    }

    resources = [aws_sqs_queue.dlq[0].arn]

    condition {
      test     = "ArnEquals"
      variable = "aws:SourceArn"
      values   = [for rule in aws_cloudwatch_event_rule.this : rule.arn]
    }
  }
}

resource "aws_sqs_queue_policy" "dlq" {
  count = var.create_dlq ? 1 : 0

  queue_url = aws_sqs_queue.dlq[0].id
  policy    = data.aws_iam_policy_document.dlq[0].json
}

# Rules are driven by event-type prefixes so service domains stay easy to extend.
resource "aws_cloudwatch_event_rule" "this" {
  for_each = var.rules

  name           = "${var.project_name}-${var.environment}-${each.key}"
  description    = each.value.description
  event_bus_name = aws_cloudwatch_event_bus.this.name
  event_pattern  = local.rule_patterns[each.key]
  state          = each.value.enabled ? "ENABLED" : "DISABLED"
  tags           = local.merged_tags
}

# Lambda targets remain explicit per rule and are fanned out to Notification and Analytics.
resource "aws_cloudwatch_event_target" "this" {
  for_each = local.rule_target_pairs

  event_bus_name = aws_cloudwatch_event_bus.this.name
  rule           = aws_cloudwatch_event_rule.this[each.value.rule_key].name
  arn            = var.lambda_targets[each.value.target_key].function_arn
  target_id      = "${each.value.rule_key}-${each.value.target_key}"

  retry_policy {
    maximum_event_age_in_seconds = var.retry_policy.maximum_event_age_in_seconds
    maximum_retry_attempts       = var.retry_policy.maximum_retry_attempts
  }

  dynamic "dead_letter_config" {
    for_each = local.dlq_arn == null ? [] : [1]

    content {
      arn = local.dlq_arn
    }
  }
}

# EventBridge needs permission to invoke each Lambda target.
resource "aws_lambda_permission" "this" {
  for_each = local.rule_target_pairs

  statement_id  = "${each.value.rule_key}-${each.value.target_key}-eventbridge"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_targets[each.value.target_key].function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.this[each.value.rule_key].arn
}

locals {
  dlq_arn = var.create_dlq ? aws_sqs_queue.dlq[0].arn : var.dlq_arn
}

locals {
  # Keep queue and DLQ naming consistent across environments.
  base_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Region      = var.aws_region
  }

  merged_tags = merge(local.base_tags, var.tags)

  # Flatten SNS topic subscriptions so each queue can opt into topic fan-in.
  subscription_pairs = {
    for pair in flatten([
      for queue_key, queue in var.queues : [
        for index, topic_key in try(queue.sns_topic_keys, []) : {
          key = "${queue_key}-${index}"
          value = {
            queue_key = queue_key
            topic_key = topic_key
          }
        }
      ]
    ]) : pair.key => pair.value
  }
}

# One DLQ per queue keeps failure handling isolated and predictable.
resource "aws_sqs_queue" "dlq" {
  for_each = var.queues

  name                        = coalesce(each.value.dlq_name, "${each.value.name}-dlq")
  fifo_queue                  = try(each.value.fifo_queue, false)
  content_based_deduplication = try(each.value.content_based_deduplication, false)
  message_retention_seconds   = try(each.value.dlq_message_retention_seconds, 1209600)
  sqs_managed_sse_enabled     = try(each.value.sse_enabled, true)
  tags                        = merge(local.merged_tags, { Name = coalesce(each.value.dlq_name, "${each.value.name}-dlq") })
}

# Main queues receive domain messages and point at their dedicated DLQs.
resource "aws_sqs_queue" "this" {
  for_each = var.queues

  name                              = each.value.name
  fifo_queue                        = try(each.value.fifo_queue, false)
  content_based_deduplication       = try(each.value.content_based_deduplication, false)
  visibility_timeout_seconds        = try(each.value.visibility_timeout_seconds, 30)
  message_retention_seconds         = try(each.value.message_retention_seconds, 345600)
  delay_seconds                     = try(each.value.delay_seconds, 0)
  max_message_size                  = try(each.value.max_message_size, 262144)
  receive_wait_time_seconds         = try(each.value.receive_wait_time_seconds, 20)
  sqs_managed_sse_enabled           = try(each.value.sse_enabled, true)
  kms_master_key_id                 = try(each.value.kms_master_key_id, null)
  kms_data_key_reuse_period_seconds = try(each.value.kms_data_key_reuse_period_seconds, null)
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dlq[each.key].arn
    maxReceiveCount     = try(each.value.max_receive_count, 5)
  })

  tags = merge(local.merged_tags, {
    Name = each.value.name
  })

  lifecycle {
    precondition {
      condition     = !try(each.value.fifo_queue, false) || endswith(each.value.name, ".fifo")
      error_message = "FIFO queues must use a .fifo name."
    }
  }
}

# SNS topics can fan into queues through the standard SQS subscription protocol.
resource "aws_sns_topic_subscription" "this" {
  for_each = local.subscription_pairs

  topic_arn = var.sns_topic_arns[each.value.topic_key]
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.this[each.value.queue_key].arn
}

# Queue policies allow the selected SNS topics to publish messages to SQS.
data "aws_iam_policy_document" "queue" {
  for_each = {
    for queue_key, queue in var.queues : queue_key => queue
    if length(try(queue.sns_topic_keys, [])) > 0
  }

  statement {
    sid = "AllowSNSSendMessage"

    actions = ["sqs:SendMessage"]

    principals {
      type        = "Service"
      identifiers = ["sns.amazonaws.com"]
    }

    resources = [aws_sqs_queue.this[each.key].arn]

    condition {
      test     = "ArnEquals"
      variable = "aws:SourceArn"
      values   = [for topic_key in try(each.value.sns_topic_keys, []) : var.sns_topic_arns[topic_key]]
    }
  }
}

resource "aws_sqs_queue_policy" "this" {
  for_each = data.aws_iam_policy_document.queue

  queue_url = aws_sqs_queue.this[each.key].id
  policy    = each.value.json
}

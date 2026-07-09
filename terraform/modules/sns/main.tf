locals {
  # Keep SNS naming and tagging consistent across environments.
  base_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Region      = var.aws_region
  }

  merged_tags = merge(local.base_tags, var.tags)

  # Flatten optional subscriptions so enabled email endpoints can be managed per topic.
  topic_subscriptions = {
    for subscription in flatten([
      for topic_key, topic in var.topics : [
        for index, item in try(topic.subscriptions, []) : {
          key   = "${topic_key}-${index}"
          value = merge(item, { topic_key = topic_key })
        } if try(item.enabled, false)
      ]
    ]) : subscription.key => subscription.value
  }
}

# Each SNS topic is created once and can be reused by alarms and application publishers.
resource "aws_sns_topic" "this" {
  for_each = var.topics

  name         = each.value.name
  display_name = try(each.value.display_name, null)
  fifo_topic   = try(each.value.fifo_topic, false)

  tags = merge(local.merged_tags, {
    Name = each.value.name
  })
}

# Optional subscriptions stay disabled by default and can be enabled per topic.
resource "aws_sns_topic_subscription" "this" {
  for_each = local.topic_subscriptions

  topic_arn = aws_sns_topic.this[each.value.topic_key].arn
  protocol  = each.value.protocol
  endpoint  = each.value.endpoint
}

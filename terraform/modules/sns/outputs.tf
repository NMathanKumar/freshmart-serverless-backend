output "topic_arns" {
  description = "SNS topic ARNs keyed by logical topic name."
  value = {
    for name, topic in aws_sns_topic.this : name => topic.arn
  }
}

output "topic_names" {
  description = "SNS topic names keyed by logical topic name."
  value = {
    for name, topic in aws_sns_topic.this : name => topic.name
  }
}

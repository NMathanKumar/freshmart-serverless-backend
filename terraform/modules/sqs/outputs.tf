output "queue_name" {
  description = "SQS queue names keyed by logical queue name."
  value = {
    for name, queue in aws_sqs_queue.this : name => queue.name
  }
}

output "queue_url" {
  description = "SQS queue URLs keyed by logical queue name."
  value = {
    for name, queue in aws_sqs_queue.this : name => queue.url
  }
}

output "queue_arn" {
  description = "SQS queue ARNs keyed by logical queue name."
  value = {
    for name, queue in aws_sqs_queue.this : name => queue.arn
  }
}

output "dlq_name" {
  description = "DLQ names keyed by logical queue name."
  value = {
    for name, queue in aws_sqs_queue.dlq : name => queue.name
  }
}

output "dlq_arn" {
  description = "DLQ ARNs keyed by logical queue name."
  value = {
    for name, queue in aws_sqs_queue.dlq : name => queue.arn
  }
}

output "dlq_url" {
  description = "DLQ URLs keyed by logical queue name."
  value = {
    for name, queue in aws_sqs_queue.dlq : name => queue.url
  }
}

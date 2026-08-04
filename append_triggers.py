import os

main_tf_path = r'c:\Users\mathankumar.n\Downloads\projects\freshmart-serverless-backend\terraform\environments\dev\main.tf'

append_content = """
# Connect SQS Queues to Lambda Consumers

resource "aws_lambda_event_source_mapping" "analytics_sqs_trigger" {
  event_source_arn = module.sqs.queue_arn["analytics_processing"]
  function_name    = module.lambda["analytics"].function_name
  batch_size       = 10
  enabled          = true
}

resource "aws_lambda_event_source_mapping" "inventory_sqs_trigger" {
  event_source_arn = module.sqs.queue_arn["inventory_processing"]
  function_name    = module.lambda["inventory"].function_name
  batch_size       = 10
  enabled          = true
}

resource "aws_lambda_event_source_mapping" "notification_sqs_trigger" {
  event_source_arn = module.sqs.queue_arn["notification_processing"]
  function_name    = module.lambda["notification"].function_name
  batch_size       = 10
  enabled          = true
}
"""

with open(main_tf_path, 'a') as f:
    f.write(append_content)

print("Appended SQS triggers to main.tf")

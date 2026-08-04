import re

main_tf_path = r'c:\Users\mathankumar.n\Downloads\projects\freshmart-serverless-backend\terraform\modules\iam\main.tf'

with open(main_tf_path, 'r') as f:
    content = f.read()

target = "sqs_send_message_enabled    = coalesce(var.allow_sqs_send_message, false)"
replacement = "sqs_send_message_enabled    = coalesce(var.allow_sqs_send_message, false)\n  sqs_receive_message_enabled = coalesce(var.allow_sqs_receive_message, false)"

if target in content and "sqs_receive_message_enabled =" not in content:
    content = content.replace(target, replacement)
    with open(main_tf_path, 'w') as f:
        f.write(content)
    print("Added local.sqs_receive_message_enabled to locals block")
else:
    print("Could not find target or it's already added.")

# Check the preconditions
target2 = """
    precondition {
      condition     = !local.sqs_send_message_enabled || length(local.sqs_queue_resources) > 0
      error_message = "sqs_queue_arns must be provided when allow_sqs_send_message is true."
    }"""
replacement2 = """
    precondition {
      condition     = !local.sqs_send_message_enabled || length(local.sqs_queue_resources) > 0
      error_message = "sqs_queue_arns must be provided when allow_sqs_send_message is true."
    }
    precondition {
      condition     = !local.sqs_receive_message_enabled || length(local.sqs_queue_resources) > 0
      error_message = "sqs_queue_arns must be provided when allow_sqs_receive_message is true."
    }"""

if target2 in content and "allow_sqs_receive_message is true" not in content:
    content = content.replace(target2, replacement2)
    with open(main_tf_path, 'w') as f:
        f.write(content)
    print("Added precondition for sqs_receive_message")


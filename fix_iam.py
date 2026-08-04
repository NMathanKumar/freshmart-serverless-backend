import os

main_tf_path = r'c:\Users\mathankumar.n\Downloads\projects\freshmart-serverless-backend\terraform\modules\iam\main.tf'

with open(main_tf_path, 'r') as f:
    content = f.read()

sqs_receive_block = """
  dynamic "statement" {
    for_each = local.sqs_receive_message_enabled ? [1] : []

    content {
      sid = "SQSReceiveMessage"

      actions = [
        "sqs:ReceiveMessage",
        "sqs:DeleteMessage",
        "sqs:GetQueueAttributes"
      ]

      resources = local.sqs_queue_resources
    }
  }
"""

# Find the SQS Send Message block and insert the SQS Receive Message block after it
target_block = """
  dynamic "statement" {
    for_each = local.sqs_send_message_enabled ? [1] : []

    content {
      sid = "SQSSendMessage"

      actions = ["sqs:SendMessage"]

      resources = local.sqs_queue_resources
    }
  }
"""

if target_block in content:
    content = content.replace(target_block, target_block + sqs_receive_block)
    with open(main_tf_path, 'w') as f:
        f.write(content)
    print("Successfully added SQSReceiveMessage block to IAM module.")
else:
    print("Could not find SQSSendMessage block in IAM module.")

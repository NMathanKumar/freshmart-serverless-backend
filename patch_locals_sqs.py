import re

filepath = r'c:\Users\mathankumar.n\Downloads\projects\freshmart-serverless-backend\terraform\environments\dev\locals.tf'

with open(filepath, 'r') as f:
    content = f.read()

# For notification:
content = re.sub(
    r'(service_name\s*=\s*"notification-service"[\s\S]*?)allow_sqs_send_message\s*=\s*false\s*sqs_queue_arns\s*=\s*\[\]',
    r'\1allow_sqs_receive_message = true\n        sqs_queue_arns = [module.sqs.queue_arn["notification_processing"]]',
    content
)

# For analytics:
content = re.sub(
    r'(service_name\s*=\s*"analytics-service"[\s\S]*?)allow_sqs_send_message\s*=\s*false\s*sqs_queue_arns\s*=\s*\[\]',
    r'\1allow_sqs_receive_message = true\n        sqs_queue_arns = [module.sqs.queue_arn["analytics_processing"]]',
    content
)

# For inventory:
content = re.sub(
    r'(service_name\s*=\s*"inventory-service"[\s\S]*?)allow_sqs_send_message\s*=\s*false\s*sqs_queue_arns\s*=\s*\[\]',
    r'\1allow_sqs_receive_message = true\n        sqs_queue_arns = [module.sqs.queue_arn["inventory_processing"]]',
    content
)

with open(filepath, 'w') as f:
    f.write(content)

print("Updated locals.tf to grant SQS receive permissions to lambda roles.")

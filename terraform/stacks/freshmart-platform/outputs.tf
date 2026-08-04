output "api_endpoint" {
  value       = module.apigateway.api_endpoint
  description = "FreshMart platform API endpoint."
}

output "service_table_names" {
  value = {
    for name, table in module.dynamodb :
    name => table.table_name
  }
  description = "DynamoDB tables keyed by service."
}

output "lambda_function_names" {
  value = {
    for name, lambda_module in module.lambda :
    name => lambda_module.function_name
  }
  description = "Lambda function names keyed by service."
}

output "event_bus_name" {
  value       = module.eventbridge.bus_name
  description = "EventBridge bus used by the platform."
}

output "assets_bucket_name" {
  value       = module.s3.bucket_name
  description = "Shared S3 assets bucket name."
}

output "customer_web_bucket_name" {
  value       = module.cloudfront_web_customer.bucket_id
  description = "Customer web S3 bucket name."
}

output "customer_web_cloudfront_url" {
  value       = module.cloudfront_web_customer.cloudfront_url
  description = "Customer web CloudFront URL."
}

output "admin_web_bucket_name" {
  value       = module.cloudfront_web_admin.bucket_id
  description = "Admin web S3 bucket name."
}

output "admin_web_cloudfront_url" {
  value       = module.cloudfront_web_admin.cloudfront_url
  description = "Admin web CloudFront URL."
}

data "aws_caller_identity" "current" {}

resource "aws_ses_email_identity" "freshmart_noreply" {
  email = "nmathankumar020@gmail.com"
}
module "secrets" {
  source = "../../modules/secrets"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region
  secrets = {
  }
  parameters = {
    internal_service_token = {
      name        = "/${var.project_name}/${var.environment}/internal-service-token"
      description = "FreshMart internal service token for ${var.environment}."
      value       = var.internal_service_token
    }
  }
  tags = local.common_tags
}

# Instantiate one reusable Lambda module per FreshMart service.
module "lambda" {
  for_each = local.lambda_functions

  source = "../../modules/lambda"

  project_name                   = var.project_name
  environment                    = var.environment
  aws_region                     = var.aws_region
  service_name                   = each.value.service_name
  function_name                  = each.value.function_name
  description                    = each.value.description
  filename                       = each.value.filename
  source_code_hash               = try(filebase64sha256(each.value.filename), null)
  runtime                        = each.value.runtime
  handler                        = each.value.handler
  timeout                        = each.value.timeout
  memory_size                    = each.value.memory_size
  architecture                   = each.value.architecture
  role_arn                       = each.value.role_arn
  tracing_mode                   = each.value.tracing_mode
  publish                        = each.value.publish
  environment_variables          = each.value.environment_variables
  dead_letter_config             = each.value.dead_letter_config
  reserved_concurrent_executions = each.value.reserved_concurrent_executions
  ephemeral_storage              = each.value.ephemeral_storage
  layers                         = each.value.layers
  log_retention_in_days          = each.value.log_retention_in_days

  log_group_kms_key_id = each.value.log_group_kms_key_id
  permissions          = each.value.permissions
  tags                 = merge(local.common_tags, var.tags, each.value.tags)
}

# Instantiate the reusable DynamoDB module once per FreshMart table.
module "dynamodb" {
  for_each = local.dynamodb_tables

  source = "../../modules/dynamodb"

  project_name             = var.project_name
  environment              = var.environment
  aws_region               = var.aws_region
  table_name               = each.value.table_name
  partition_key            = each.value.partition_key
  sort_key                 = each.value.sort_key
  ttl_enabled              = each.value.ttl_enabled
  ttl_attribute            = each.value.ttl_attribute
  point_in_time_recovery   = each.value.point_in_time_recovery
  deletion_protection      = each.value.deletion_protection
  stream_enabled           = each.value.stream_enabled
  stream_view_type         = each.value.stream_view_type
  tags                     = merge(local.common_tags, var.tags, each.value.tags)
  global_secondary_indexes = each.value.global_secondary_indexes
}

# Instantiate the reusable API Gateway module once per environment.
module "apigateway" {
  source = "../../modules/apigateway"

  project_name           = var.project_name
  environment            = var.environment
  aws_region             = var.aws_region
  api_name               = local.api_name
  description            = "FreshMart HTTP API for ${var.environment}."
  lambdas                = local.api_gateway_lambdas
  routes                 = local.api_gateway_routes
  cors_allow_origins = [
    "https://${module.unified_web.cloudfront_domain_name}",
    "https://${module.customer_web.cloudfront_domain_name}",
    "https://${module.admin_web.cloudfront_domain_name}",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://localhost:3001"
  ]
  cors_allow_methods     = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  cors_allow_headers     = ["content-type", "authorization", "x-amz-date", "x-api-key", "x-amz-security-token", "x-amz-user-agent"]
  cors_allow_credentials = false
  jwt_authorizer_enabled = true
  jwt_issuer             = local.cognito_issuer
  jwt_audience           = [module.cognito.user_pool_client_id]
  tags                   = local.common_tags
}

# Instantiate the reusable IAM module once per FreshMart service.
module "iam" {
  for_each = local.iam_roles

  source = "../../modules/iam"

  project_name                   = var.project_name
  environment                    = var.environment
  aws_region                     = var.aws_region
  service_name                   = each.value.service_name
  dynamodb_table_permissions     = each.value.dynamodb_table_permissions
  allow_sns_publish              = try(each.value.allow_sns_publish, null)
  sns_topic_arns                 = try(each.value.sns_topic_arns, null)
  allow_sqs_send_message         = try(each.value.allow_sqs_send_message, null)
  allow_sqs_receive_message      = try(each.value.allow_sqs_receive_message, null)
  sqs_queue_arns                 = try(each.value.sqs_queue_arns, null)
  allow_s3_object_access         = try(each.value.allow_s3_object_access, null)
  s3_object_arns                 = try(each.value.s3_object_arns, null)
  allow_eventbridge_put_events   = each.value.allow_eventbridge_put_events
  eventbridge_bus_names          = each.value.eventbridge_bus_names
  allow_eventbridge_read         = each.value.allow_eventbridge_read
  allow_cognito_user_pool_access = try(each.value.allow_cognito_user_pool_access, false)
  cognito_user_pool_arns         = try(each.value.cognito_user_pool_arns, null)
  eventbridge_rule_name_prefixes = each.value.eventbridge_rule_name_prefixes

  tags = merge(local.common_tags, var.tags, each.value.tags)
}

module "s3" {
  source = "../../modules/s3"

  project_name       = var.project_name
  environment        = var.environment
  aws_region         = var.aws_region
  bucket_name        = "${var.project_name}-${var.environment}-assets-${data.aws_caller_identity.current.account_id}"
  versioning_enabled = true
  tags               = local.common_tags
}

module "customer_web" {
  source = "../../modules/cloudfront_web"

  project_name       = var.project_name
  environment        = var.environment
  app_name           = "customer"
  bucket_name        = "${var.project_name}-${var.environment}-customer-web-${data.aws_caller_identity.current.account_id}"
  versioning_enabled = true
  tags               = local.common_tags
  extra_source_arns  = [module.unified_web.cloudfront_distribution_arn]
}

module "admin_web" {
  source = "../../modules/cloudfront_web"

  project_name       = var.project_name
  environment        = var.environment
  app_name           = "admin"
  bucket_name        = "${var.project_name}-${var.environment}-admin-web-${data.aws_caller_identity.current.account_id}"
  versioning_enabled = true
  tags               = local.common_tags
  extra_source_arns  = [module.unified_web.cloudfront_distribution_arn]
}

module "unified_web" {
  source = "../../modules/cloudfront_unified"

  project_name                         = var.project_name
  environment                          = var.environment
  customer_bucket_id                   = module.customer_web.bucket_id
  customer_bucket_arn                  = module.customer_web.bucket_arn
  customer_bucket_regional_domain_name = module.customer_web.bucket_domain_name
  admin_bucket_id                      = module.admin_web.bucket_id
  admin_bucket_arn                     = module.admin_web.bucket_arn
  admin_bucket_regional_domain_name    = module.admin_web.bucket_domain_name
  tags                                 = local.common_tags
}

module "cloudwatch" {
  source = "../../modules/cloudwatch"

  project_name          = var.project_name
  environment           = var.environment
  aws_region            = var.aws_region
  lambda_functions      = local.cloudwatch_lambda_functions
  api_id                = local.cloudwatch_api_id
  api_stage_name        = local.cloudwatch_api_stage_name
  dynamodb_tables       = local.cloudwatch_dynamodb_tables
  log_retention_in_days = 30
  alarm_sns_topics = {
    critical = module.sns.topic_arns["customer_events"]
    warning  = module.sns.topic_arns["customer_events"]
    info     = module.sns.topic_arns["customer_events"]
  }
  tags                  = local.common_tags

  sqs_queues = {
    for name, q in module.sqs.queue_name : name => { queue_name = q }
  }
  sqs_dlqs = {
    for name, q in module.sqs.dlq_name : name => { queue_name = q }
  }
  sns_topics = {
    for name, t in module.sns.topic_names : name => { topic_name = t }
  }
  eventbridge_bus_name = local.eventbridge_bus_name
  cloudfront_distributions = {
    unified = { distribution_id = module.unified_web.cloudfront_distribution_id }
  }
  api_base_url                = "https://${module.apigateway.api_id}.execute-api.${var.aws_region}.amazonaws.com"
  enable_synthetic_monitoring = true
  enable_business_dashboard   = true
  business_hours              = "08:00-22:00"
}

module "eventbridge" {
  source = "../../modules/eventbridge"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region
  bus_name     = local.eventbridge_bus_name
  rules        = local.eventbridge_rules
  sns_targets  = local.eventbridge_sns_targets
  enable_tags  = false
  tags         = local.common_tags
}

module "cognito" {
  source = "../../modules/cognito"

  project_name               = var.project_name
  environment                = var.environment
  aws_region                 = var.aws_region
  ses_from_email_address     = aws_ses_email_identity.freshmart_noreply.email
  ses_source_arn             = aws_ses_email_identity.freshmart_noreply.arn
  domain_prefix              = "${var.project_name}-${var.environment}-auth"
  mfa_configuration          = "OPTIONAL"
  software_token_mfa_enabled = true
  password_policy = {
    minimum_length                   = 8
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = true
    require_uppercase                = true
    temporary_password_validity_days = 7
  }
  callback_urls = [
    "https://${module.unified_web.cloudfront_domain_name}/admin/auth/callback",
    "https://${module.unified_web.cloudfront_domain_name}/auth/callback",
    "https://${module.admin_web.cloudfront_domain_name}/admin/auth/callback",
    "http://localhost:5173/admin/auth/callback",
    "http://localhost:5173/auth/callback",
    "http://localhost:3001/auth/callback"
  ]
  logout_urls = [
    "https://${module.unified_web.cloudfront_domain_name}/admin",
    "https://${module.unified_web.cloudfront_domain_name}",
    "https://${module.admin_web.cloudfront_domain_name}",
    "http://localhost:5173",
    "http://localhost:3001"
  ]
  tags = local.common_tags
}

module "sns" {
  source = "../../modules/sns"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region
  topics       = local.sns_topics
  tags         = local.common_tags
}

module "sqs" {
  source = "../../modules/sqs"

  project_name   = var.project_name
  environment    = var.environment
  aws_region     = var.aws_region
  queues         = local.sqs_queues
  sns_topic_arns = module.sns.topic_arns
  tags           = local.common_tags
}

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

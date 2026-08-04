data "aws_caller_identity" "current" {}

module "ssm" {
  source = "../../modules/ssm"

  project_name = var.project_name
  environment  = var.environment
  parameters = {
    "log-level"           = "INFO"
    "error-threshold"     = "5"
    "latency-threshold"   = "500"
    "cache-hit-threshold" = "80"
  }
  tags = local.common_tags
}

module "budgets" {
  source = "../../modules/budgets"

  project_name             = var.project_name
  environment              = var.environment
  monthly_budget_amount    = "100.0"
  subscriber_sns_topic_arn = module.sns.topic_arns["ops"]
  tags                     = local.common_tags
}
module "cognito" {
  source = "../../modules/cognito"

  project_name               = var.project_name
  environment                = var.environment
  aws_region                 = var.aws_region
  domain_prefix              = "${var.project_name}-${var.environment}-auth"
  callback_urls              = var.web_callback_urls
  logout_urls                = var.web_logout_urls
  mfa_configuration          = "OPTIONAL"
  software_token_mfa_enabled = true
  tags                       = local.common_tags
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

module "eventbridge" {
  source = "../../modules/eventbridge"

  project_name    = var.project_name
  environment     = var.environment
  aws_region      = var.aws_region
  bus_name        = local.eventbridge_bus_name
  rules           = local.eventbridge_rules
  lambda_targets  = local.eventbridge_lambda_targets
  archive_enabled = true
  archive_name    = "${var.project_name}-${var.environment}-event-archive"
  tags            = local.common_tags
}

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
  tags                     = merge(local.common_tags, each.value.tags)
  global_secondary_indexes = each.value.global_secondary_indexes
}

module "iam" {
  for_each = local.iam_roles

  source = "../../modules/iam"

  project_name                   = var.project_name
  environment                    = var.environment
  aws_region                     = var.aws_region
  service_name                   = each.value.service_name
  dynamodb_table_permissions     = each.value.dynamodb_table_permissions
  allow_sns_publish              = each.value.allow_sns_publish
  sns_topic_arns                 = each.value.sns_topic_arns
  allow_sqs_send_message         = each.value.allow_sqs_send_message
  sqs_queue_arns                 = each.value.sqs_queue_arns
  allow_s3_object_access         = each.value.allow_s3_object_access
  s3_object_arns                 = each.value.s3_object_arns
  allow_eventbridge_put_events   = each.value.allow_eventbridge_put_events
  eventbridge_bus_names          = each.value.eventbridge_bus_names
  allow_eventbridge_read         = each.value.allow_eventbridge_read
  allow_cognito_user_pool_access = each.value.allow_cognito_user_pool_access
  cognito_user_pool_arns         = each.value.cognito_user_pool_arns
  eventbridge_rule_name_prefixes = each.value.eventbridge_rule_name_prefixes
  enable_vpc_access              = false
  tags                           = merge(local.common_tags, each.value.tags)
}

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
  subnet_ids                     = each.value.subnet_ids
  security_group_ids             = each.value.security_group_ids
  log_group_kms_key_id           = each.value.log_group_kms_key_id
  permissions                    = each.value.permissions
  tags                           = merge(local.common_tags, each.value.tags)
}

module "apigateway" {
  source = "../../modules/apigateway"

  project_name           = var.project_name
  environment            = var.environment
  aws_region             = var.aws_region
  api_name               = local.api_name
  description            = "FreshMart platform HTTP API."
  lambdas                = local.api_gateway_lambdas
  routes                 = local.api_gateway_routes
  cors_allow_origins     = var.allowed_origins
  cors_allow_methods     = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  cors_allow_headers     = ["content-type", "authorization", "x-amz-date", "x-api-key", "x-amz-security-token", "x-amz-user-agent"]
  cors_allow_credentials = false
  throttling_burst_limit = 200
  throttling_rate_limit  = 100
  jwt_authorizer_enabled = true
  jwt_issuer             = "https://cognito-idp.${var.aws_region}.amazonaws.com/${module.cognito.user_pool_id}"
  jwt_audience           = [module.cognito.user_pool_client_id]
  tags                   = local.common_tags
}

module "cloudwatch" {
  source = "../../modules/cloudwatch"

  project_name     = var.project_name
  environment      = var.environment
  aws_region       = var.aws_region
  lambda_functions = local.cloudwatch_lambda_functions
  api_id           = module.apigateway.api_id
  api_stage_name   = "v1"
  dynamodb_tables  = local.cloudwatch_dynamodb_tables
  cloudfront_distributions = {
    customer = { distribution_id = module.cloudfront_web_customer.cloudfront_distribution_id }
    admin    = { distribution_id = module.cloudfront_web_admin.cloudfront_distribution_id }
  }
  log_retention_in_days          = 30
  lambda_error_threshold         = tonumber(data.aws_ssm_parameter.error_threshold.value)
  api_5xx_threshold              = tonumber(data.aws_ssm_parameter.error_threshold.value)
  api_latency_threshold_ms       = tonumber(data.aws_ssm_parameter.latency_threshold.value)
  cloudfront_cache_hit_threshold = tonumber(data.aws_ssm_parameter.cache_hit_threshold.value)
  alarm_actions                  = [module.sns.topic_arns["ops"]]
  ok_actions                     = [module.sns.topic_arns["ops"]]
  tags                           = local.common_tags
}

module "logging" {
  source = "../../modules/logging"

  project_name  = var.project_name
  environment   = var.environment
  bucket_name   = "${var.project_name}-${var.environment}-logs-${data.aws_caller_identity.current.account_id}"
  force_destroy = true
  tags          = local.common_tags
}

module "cloudfront_web_customer" {
  source = "../../modules/cloudfront_web"

  project_name               = var.project_name
  environment                = var.environment
  app_name                   = "customer"
  bucket_name                = "${var.project_name}-${var.environment}-customer-web-${data.aws_caller_identity.current.account_id}"
  versioning_enabled         = true
  force_destroy              = true
  logging_bucket_domain_name = module.logging.bucket_domain_name
  logging_bucket_id          = module.logging.bucket_id
  tags                       = local.common_tags
}

module "cloudfront_web_admin" {
  source = "../../modules/cloudfront_web"

  project_name               = var.project_name
  environment                = var.environment
  app_name                   = "admin"
  bucket_name                = "${var.project_name}-${var.environment}-admin-web-${data.aws_caller_identity.current.account_id}"
  versioning_enabled         = true
  force_destroy              = true
  logging_bucket_domain_name = module.logging.bucket_domain_name
  logging_bucket_id          = module.logging.bucket_id
  tags                       = local.common_tags
}

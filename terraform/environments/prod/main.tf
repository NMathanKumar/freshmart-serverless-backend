data "aws_caller_identity" "current" {}

module "network" {
  source = "../../modules/network"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region
  tags         = local.common_tags
}

module "secrets" {
  source = "../../modules/secrets"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region
  secrets      = {}
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
  subnet_ids                     = each.value.subnet_ids
  security_group_ids             = each.value.security_group_ids
  log_group_kms_key_id           = each.value.log_group_kms_key_id
  permissions                    = each.value.permissions
  tags                           = merge(local.common_tags, var.tags, each.value.tags)
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
  cors_allow_origins     = ["*"]
  cors_allow_methods     = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
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
  sqs_queue_arns                 = try(each.value.sqs_queue_arns, null)
  allow_s3_object_access         = try(each.value.allow_s3_object_access, null)
  s3_object_arns                 = try(each.value.s3_object_arns, null)
  allow_eventbridge_put_events   = each.value.allow_eventbridge_put_events
  eventbridge_bus_names          = each.value.eventbridge_bus_names
  allow_eventbridge_read         = each.value.allow_eventbridge_read
  allow_cognito_user_pool_access = try(each.value.allow_cognito_user_pool_access, false)
  cognito_user_pool_arns         = try(each.value.cognito_user_pool_arns, null)
  eventbridge_rule_name_prefixes = each.value.eventbridge_rule_name_prefixes
  enable_vpc_access              = true
  tags                           = merge(local.common_tags, var.tags, each.value.tags)
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
  alarm_actions         = [module.sns.topic_arns["notification"]]
  ok_actions            = [module.sns.topic_arns["notification"]]
  tags                  = local.common_tags
}

module "eventbridge" {
  source = "../../modules/eventbridge"

  project_name   = var.project_name
  environment    = var.environment
  aws_region     = var.aws_region
  bus_name       = local.eventbridge_bus_name
  rules          = local.eventbridge_rules
  lambda_targets = local.eventbridge_lambda_targets
  tags           = local.common_tags
}

module "cognito" {
  source = "../../modules/cognito"

  project_name               = var.project_name
  environment                = var.environment
  aws_region                 = var.aws_region
  domain_prefix              = "${var.project_name}-${var.environment}-auth"
  mfa_configuration          = "OPTIONAL"
  software_token_mfa_enabled = true
  tags                       = local.common_tags
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

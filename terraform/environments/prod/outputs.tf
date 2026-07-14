output "environment" {
  description = "Deployment environment."
  value       = local.environment_name
}

output "network" {
  description = "Provisioned network and VPC attachment details."
  value = {
    vpc_id                     = module.network.vpc_id
    vpc_arn                    = module.network.vpc_arn
    public_subnet_ids          = module.network.public_subnet_ids
    private_subnet_ids         = module.network.private_subnet_ids
    lambda_security_group_id   = module.network.lambda_security_group_id
    endpoint_security_group_id = module.network.endpoint_security_group_id
    nat_gateway_id             = module.network.nat_gateway_id
    internet_gateway_id        = module.network.internet_gateway_id
    vpc_endpoint_ids           = module.network.vpc_endpoint_ids
    interface_vpc_endpoint_ids = module.network.interface_vpc_endpoint_ids
  }
}

output "secrets" {
  description = "Provisioned secrets and parameter store references."
  value = {
    secret_arns    = module.secrets.secret_arns
    secret_names   = module.secrets.secret_names
    parameter_arns = module.secrets.parameter_arns
  }
}

output "cognito" {
  description = "Provisioned Cognito resources."
  value = {
    user_pool_id             = module.cognito.user_pool_id
    user_pool_arn            = module.cognito.user_pool_arn
    user_pool_client_id      = module.cognito.user_pool_client_id
    user_pool_domain         = module.cognito.user_pool_domain
    identity_pool_id         = module.cognito.identity_pool_id
    authenticated_role_arn   = module.cognito.authenticated_role_arn
    unauthenticated_role_arn = module.cognito.unauthenticated_role_arn
    group_names              = module.cognito.group_names
  }
}

output "dynamodb_tables" {
  description = "Provisioned DynamoDB tables and their key identifiers."
  value = {
    for name, table in module.dynamodb : name => {
      table_name = table.table_name
      table_arn  = table.table_arn
      table_id   = table.table_id
      stream_arn = table.stream_arn
    }
  }
}

output "iam_roles" {
  description = "Provisioned IAM roles and managed policies."
  value = {
    for name, role in module.iam : name => {
      role_arn   = role.role_arn
      role_name  = role.role_name
      policy_arn = role.policy_arn
    }
  }
}

output "lambda_functions" {
  description = "Provisioned Lambda functions and their key identifiers."
  value = {
    for name, fn in module.lambda : name => {
      function_name  = fn.function_name
      function_arn   = fn.function_arn
      invoke_arn     = fn.invoke_arn
      qualified_arn  = fn.qualified_arn
      log_group_name = fn.log_group_name
      role_arn       = fn.role_arn
    }
  }
}

output "api_gateway" {
  description = "Provisioned API Gateway details."
  value = {
    api_id    = module.apigateway.api_id
    endpoint  = module.apigateway.api_endpoint
    stage_url = module.apigateway.stage_url
  }
}

output "eventbridge" {
  description = "Provisioned EventBridge details."
  value = {
    bus_arn   = module.eventbridge.bus_arn
    bus_name  = module.eventbridge.bus_name
    rule_arns = module.eventbridge.rule_arns
    dlq_arn   = module.eventbridge.dlq_arn
  }
}

output "cloudwatch" {
  description = "Provisioned CloudWatch details."
  value = {
    dashboard_name  = module.cloudwatch.dashboard_name
    alarm_arns      = module.cloudwatch.alarm_arns
    log_group_names = module.cloudwatch.log_group_names
  }
}

output "sns" {
  description = "Provisioned SNS details."
  value = {
    topic_arns  = module.sns.topic_arns
    topic_names = module.sns.topic_names
  }
}

output "s3" {
  description = "Provisioned S3 details."
  value = {
    bucket_name = module.s3.bucket_name
    bucket_arn  = module.s3.bucket_arn
    object_arn  = module.s3.object_arn
  }
}

output "sqs" {
  description = "Provisioned SQS details."
  value = {
    queue_name = module.sqs.queue_name
    queue_url  = module.sqs.queue_url
    queue_arn  = module.sqs.queue_arn
    dlq_name   = module.sqs.dlq_name
    dlq_arn    = module.sqs.dlq_arn
  }
}

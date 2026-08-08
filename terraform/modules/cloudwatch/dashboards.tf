
resource "aws_cloudwatch_dashboard" "operations" {
  dashboard_name = "FreshMart-${var.environment}-Operations"
  dashboard_body = templatefile("${path.module}/dashboards/operations.json.tpl", {
    project_name             = var.project_name
    environment              = var.environment
    account_id               = data.aws_caller_identity.current.account_id
    region                   = var.aws_region
    period                   = var.metric_period_seconds
    api_id                   = var.api_id
    api_stage_name           = var.api_stage_name
    cloudfront_distributions = var.cloudfront_distributions
    lambdas                  = local.lambda_functions
    tables                   = local.dynamodb_tables
    queues                   = var.sqs_queues
    dlqs                     = var.sqs_dlqs
    topics                   = var.sns_topics
    eventbridge_bus_name     = var.eventbridge_bus_name
  })
}

resource "aws_cloudwatch_dashboard" "lambda" {
  dashboard_name = "FreshMart-${var.environment}-Lambda"
  dashboard_body = templatefile("${path.module}/dashboards/lambda.json.tpl", {
    project_name = var.project_name
    environment  = var.environment
    account_id   = data.aws_caller_identity.current.account_id
    region       = var.aws_region
    period       = var.metric_period_seconds
    lambdas      = local.lambda_functions
  })
}

resource "aws_cloudwatch_dashboard" "api" {
  dashboard_name = "FreshMart-${var.environment}-API"
  dashboard_body = templatefile("${path.module}/dashboards/api.json.tpl", {
    project_name   = var.project_name
    environment    = var.environment
    account_id     = data.aws_caller_identity.current.account_id
    region         = var.aws_region
    period         = var.metric_period_seconds
    api_id         = var.api_id
    api_stage_name = var.api_stage_name
  })
}

resource "aws_cloudwatch_dashboard" "database" {
  dashboard_name = "FreshMart-${var.environment}-Database"
  dashboard_body = templatefile("${path.module}/dashboards/database.json.tpl", {
    project_name = var.project_name
    environment  = var.environment
    account_id   = data.aws_caller_identity.current.account_id
    region       = var.aws_region
    period       = var.metric_period_seconds
    tables       = local.dynamodb_tables
  })
}

resource "aws_cloudwatch_dashboard" "messaging" {
  dashboard_name = "FreshMart-${var.environment}-Messaging"
  dashboard_body = templatefile("${path.module}/dashboards/messaging.json.tpl", {
    project_name         = var.project_name
    environment          = var.environment
    account_id           = data.aws_caller_identity.current.account_id
    region               = var.aws_region
    period               = var.metric_period_seconds
    queues               = var.sqs_queues
    dlqs                 = var.sqs_dlqs
    topics               = var.sns_topics
    eventbridge_bus_name = var.eventbridge_bus_name
  })
}

resource "aws_cloudwatch_dashboard" "sla" {
  dashboard_name = "FreshMart-${var.environment}-SLA"
  dashboard_body = templatefile("${path.module}/dashboards/sla.json.tpl", {
    project_name   = var.project_name
    environment    = var.environment
    account_id     = data.aws_caller_identity.current.account_id
    region         = var.aws_region
    period         = var.metric_period_seconds
    api_id         = var.api_id
    api_stage_name = var.api_stage_name
  })
}

resource "aws_cloudwatch_dashboard" "executive" {
  dashboard_name = "FreshMart-${var.environment}-Executive"
  dashboard_body = templatefile("${path.module}/dashboards/executive.json.tpl", {
    project_name   = var.project_name
    environment    = var.environment
    account_id     = data.aws_caller_identity.current.account_id
    region         = var.aws_region
    period         = var.metric_period_seconds
    api_id         = var.api_id
    api_stage_name = var.api_stage_name
  })
}

resource "aws_cloudwatch_dashboard" "business" {
  dashboard_name = "FreshMart-${var.environment}-Business"
  dashboard_body = templatefile("${path.module}/dashboards/business.json.tpl", {
    project_name = var.project_name
    environment  = var.environment
    account_id   = data.aws_caller_identity.current.account_id
    region       = var.aws_region
    period       = var.metric_period_seconds
  })
}




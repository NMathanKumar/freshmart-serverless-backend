locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Owner       = var.owner
    CostCenter  = var.cost_center
  }

  module_names = {
    lambda      = "lambda"
    dynamodb    = "dynamodb"
    apigateway  = "apigateway"
    iam         = "iam"
    cloudwatch  = "cloudwatch"
    eventbridge = "eventbridge"
    cognito     = "cognito"
    sns         = "sns"
    sqs         = "sqs"
  }
}

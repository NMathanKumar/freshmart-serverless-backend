# ── 1. Monthly Overall AWS Budget ──────────────────────────────────────────────
resource "aws_budgets_budget" "overall" {
  name              = "${var.project_name}-${var.environment}-monthly-overall"
  budget_type       = "COST"
  limit_amount      = tostring(var.monthly_budget_usd)
  limit_unit        = "USD"
  time_unit         = "MONTHLY"
  time_period_start = "2026-01-01_00:00"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 50
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_sns_topic_arns  = [var.alarm_sns_topics.info]
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_sns_topic_arns  = [var.alarm_sns_topics.warning]
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_sns_topic_arns  = [var.alarm_sns_topics.critical]
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 120
    threshold_type             = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_sns_topic_arns  = [var.alarm_sns_topics.warning]
  }

  tags = merge(var.tags, local.mandatory_finops_tags, {
    BudgetType = "Overall"
  })
}

# ── 2. Lambda Service Budget ──────────────────────────────────────────────────
resource "aws_budgets_budget" "lambda" {
  name              = "${var.project_name}-${var.environment}-service-lambda"
  budget_type       = "COST"
  limit_amount      = tostring(var.lambda_budget_usd)
  limit_unit        = "USD"
  time_unit         = "MONTHLY"
  time_period_start = "2026-01-01_00:00"

  cost_filter {
    name   = "Service"
    values = ["AWS Lambda"]
  }

  notification {
    comparison_operator       = "GREATER_THAN"
    threshold                 = 80
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_sns_topic_arns = [var.alarm_sns_topics.warning]
  }

  notification {
    comparison_operator       = "GREATER_THAN"
    threshold                 = 100
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_sns_topic_arns = [var.alarm_sns_topics.critical]
  }

  tags = merge(var.tags, local.mandatory_finops_tags, {
    BudgetType = "Service"
    Service    = "Lambda"
  })
}

# ── 3. DynamoDB Service Budget ────────────────────────────────────────────────
resource "aws_budgets_budget" "dynamodb" {
  name              = "${var.project_name}-${var.environment}-service-dynamodb"
  budget_type       = "COST"
  limit_amount      = tostring(var.dynamodb_budget_usd)
  limit_unit        = "USD"
  time_unit         = "MONTHLY"
  time_period_start = "2026-01-01_00:00"

  cost_filter {
    name   = "Service"
    values = ["Amazon DynamoDB"]
  }

  notification {
    comparison_operator       = "GREATER_THAN"
    threshold                 = 80
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_sns_topic_arns = [var.alarm_sns_topics.warning]
  }

  notification {
    comparison_operator       = "GREATER_THAN"
    threshold                 = 100
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_sns_topic_arns = [var.alarm_sns_topics.critical]
  }

  tags = merge(var.tags, local.mandatory_finops_tags, {
    BudgetType = "Service"
    Service    = "DynamoDB"
  })
}

# ── 4. API Gateway Service Budget ─────────────────────────────────────────────
resource "aws_budgets_budget" "apigateway" {
  name              = "${var.project_name}-${var.environment}-service-apigateway"
  budget_type       = "COST"
  limit_amount      = tostring(var.apigateway_budget_usd)
  limit_unit        = "USD"
  time_unit         = "MONTHLY"
  time_period_start = "2026-01-01_00:00"

  cost_filter {
    name   = "Service"
    values = ["Amazon API Gateway"]
  }

  notification {
    comparison_operator       = "GREATER_THAN"
    threshold                 = 80
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_sns_topic_arns = [var.alarm_sns_topics.warning]
  }

  tags = merge(var.tags, local.mandatory_finops_tags, {
    BudgetType = "Service"
    Service    = "APIGateway"
  })
}

# ── 5. CloudFront Service Budget ──────────────────────────────────────────────
resource "aws_budgets_budget" "cloudfront" {
  name              = "${var.project_name}-${var.environment}-service-cloudfront"
  budget_type       = "COST"
  limit_amount      = tostring(var.cloudfront_budget_usd)
  limit_unit        = "USD"
  time_unit         = "MONTHLY"
  time_period_start = "2026-01-01_00:00"

  cost_filter {
    name   = "Service"
    values = ["Amazon CloudFront"]
  }

  notification {
    comparison_operator       = "GREATER_THAN"
    threshold                 = 80
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_sns_topic_arns = [var.alarm_sns_topics.warning]
  }

  tags = merge(var.tags, local.mandatory_finops_tags, {
    BudgetType = "Service"
    Service    = "CloudFront"
  })
}

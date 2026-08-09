
# ──────────────────────────────────────────────────────────────────────────────
# Contributor Insights – Rules
# Identifies which specific dimensions (partition keys, routes, callers)
# are consuming the most resources without requiring manual Logs Insights runs.
# ──────────────────────────────────────────────────────────────────────────────

# ── DynamoDB Hot Partition Detection (per table) ──────────────────────────────
resource "aws_cloudwatch_contributor_insight_rule" "dynamodb_hot_partitions" {
  for_each = var.dynamodb_tables

  rule_name  = "${var.project_name}-${var.environment}-ddb-hot-partitions-${each.key}"
  rule_state = "ENABLED"

  rule_definition = jsonencode({
    Schema = {
      Name    = "CloudWatchLogRule"
      Version = 1
    }
    AggregateOn = "Count"
    Contribution = {
      Filters = []
      Keys    = ["$.TableName", "$.PartitionKey"]
    }
    LogFormat     = "JSON"
    LogGroupNames = ["/aws/dynamodb/tables"]
    
  })

  tags = merge(var.tags, {
    Environment = var.environment
    Service     = "DynamoDB"
    Category    = "Database"
    ManagedBy   = "Terraform"
    Project     = var.project_name
  })

  lifecycle {
    ignore_changes = [tags]
  }
}

# ── DynamoDB Throttled Requests (per table) ───────────────────────────────────
resource "aws_cloudwatch_contributor_insight_rule" "dynamodb_throttled" {
  for_each = var.dynamodb_tables

  rule_name  = "${var.project_name}-${var.environment}-ddb-throttled-${each.key}"
  rule_state = "ENABLED"

  rule_definition = jsonencode({
    Schema = {
      Name    = "CloudWatchLogRule"
      Version = 1
    }
    AggregateOn = "Count"
    Contribution = {
      Filters = [
        {
          Match     = "$.errorCode"
          IsPresent = true
        }
      ]
      Keys = ["$.TableName", "$.errorCode"]
    }
    LogFormat     = "JSON"
    LogGroupNames = ["/aws/dynamodb/tables"]
    
  })

  tags = merge(var.tags, {
    Environment = var.environment
    Service     = "DynamoDB"
    Category    = "Database"
    ManagedBy   = "Terraform"
    Project     = var.project_name
  })

  lifecycle {
    ignore_changes = [tags]
  }
}

# ── Lambda Top Errors (across all functions) ──────────────────────────────────
resource "aws_cloudwatch_contributor_insight_rule" "lambda_top_errors" {
  for_each = var.lambda_functions

  rule_name  = "${var.project_name}-${var.environment}-lambda-top-errors-${each.key}"
  rule_state = "ENABLED"

  rule_definition = jsonencode({
    Schema = {
      Name    = "CloudWatchLogRule"
      Version = 1
    }
    AggregateOn = "Count"
    Contribution = {
      Filters = [
        {
          Match = "$.level"
          In    = ["error"]
        }
      ]
      Keys = ["$.service", "$.errorName"]
    }
    LogFormat     = "JSON"
    LogGroupNames = [each.value.log_group_name]
    
  })

  tags = merge(var.tags, {
    Environment = var.environment
    Service     = "Lambda"
    Category    = "Compute"
    ManagedBy   = "Terraform"
    Project     = var.project_name
  })

  lifecycle {
    ignore_changes = [tags]
  }
}

# ── API Gateway Top Routes ────────────────────────────────────────────────────
# Tracks request count by route + method from the API Gateway access log group
resource "aws_cloudwatch_contributor_insight_rule" "api_top_routes" {
  rule_name  = "${var.project_name}-${var.environment}-api-top-routes"
  rule_state = "ENABLED"

  rule_definition = jsonencode({
    Schema = {
      Name    = "CloudWatchLogRule"
      Version = 1
    }
    AggregateOn = "Count"
    Contribution = {
      Filters = []
      Keys    = ["$.method", "$.endpoint"]
    }
    LogFormat = "JSON"
    LogGroupNames = [
      for k, v in var.lambda_functions : v.log_group_name
    ]
    
  })

  tags = merge(var.tags, {
    Environment = var.environment
    Service     = "APIGateway"
    Category    = "API"
    ManagedBy   = "Terraform"
    Project     = var.project_name
  })

  lifecycle {
    ignore_changes = [tags]
  }
}

# ── API Gateway Top Status Codes ──────────────────────────────────────────────
# Quickly highlights whether failures are dominated by 4XX or 5XX
resource "aws_cloudwatch_contributor_insight_rule" "api_top_status_codes" {
  rule_name  = "${var.project_name}-${var.environment}-api-top-status-codes"
  rule_state = "ENABLED"

  rule_definition = jsonencode({
    Schema = {
      Name    = "CloudWatchLogRule"
      Version = 1
    }
    AggregateOn = "Count"
    Contribution = {
      Filters = [
        {
          Match     = "$.statusCode"
          IsPresent = true
        }
      ]
      Keys = ["$.statusCode", "$.method", "$.endpoint"]
    }
    LogFormat = "JSON"
    LogGroupNames = [
      for k, v in var.lambda_functions : v.log_group_name
    ]
    
  })

  tags = merge(var.tags, {
    Environment = var.environment
    Service     = "APIGateway"
    Category    = "API"
    ManagedBy   = "Terraform"
    Project     = var.project_name
  })

  lifecycle {
    ignore_changes = [tags]
  }
}

# ── API Gateway Top Callers (by IP / user) ────────────────────────────────────
resource "aws_cloudwatch_contributor_insight_rule" "api_top_callers" {
  rule_name  = "${var.project_name}-${var.environment}-api-top-callers"
  rule_state = "ENABLED"

  rule_definition = jsonencode({
    Schema = {
      Name    = "CloudWatchLogRule"
      Version = 1
    }
    AggregateOn = "Count"
    Contribution = {
      Filters = []
      Keys    = ["$.userId", "$.service"]
    }
    LogFormat = "JSON"
    LogGroupNames = [
      for k, v in var.lambda_functions : v.log_group_name
    ]
    
  })

  tags = merge(var.tags, {
    Environment = var.environment
    Service     = "APIGateway"
    Category    = "API"
    ManagedBy   = "Terraform"
    Project     = var.project_name
  })

  lifecycle {
    ignore_changes = [tags]
  }
}


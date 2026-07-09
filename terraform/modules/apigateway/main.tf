locals {
  # Centralize the API naming and tag shape so environments stay consistent.
  base_tags = {
    Name        = var.api_name
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Region      = var.aws_region
  }

  merged_tags = merge(local.base_tags, var.tags)
}

# HTTP API is the core API Gateway resource for FreshMart.
resource "aws_apigatewayv2_api" "this" {
  name          = var.api_name
  protocol_type = "HTTP"
  description   = var.description
  tags          = local.merged_tags

  # Configure CORS once at the API layer for every route.
  cors_configuration {
    allow_credentials = var.cors_allow_credentials
    allow_headers     = var.cors_allow_headers
    allow_methods     = var.cors_allow_methods
    allow_origins     = var.cors_allow_origins
    expose_headers    = var.cors_expose_headers
    max_age           = var.cors_max_age
  }
}

# Explicit /v1 stage keeps the public URL predictable.
resource "aws_apigatewayv2_stage" "this" {
  api_id      = aws_apigatewayv2_api.this.id
  name        = var.stage_name
  auto_deploy = true
  tags        = local.merged_tags
}

# Optional JWT authorizer placeholder remains disabled unless explicitly enabled.
resource "aws_apigatewayv2_authorizer" "jwt" {
  count = var.jwt_authorizer_enabled ? 1 : 0

  api_id           = aws_apigatewayv2_api.this.id
  name             = var.jwt_authorizer_name
  authorizer_type  = "JWT"
  identity_sources = var.jwt_identity_sources

  jwt_configuration {
    audience = var.jwt_audience
    issuer   = var.jwt_issuer
  }
}

# Each route gets its own Lambda integration so the mapping stays explicit.
resource "aws_apigatewayv2_integration" "this" {
  for_each = var.routes

  api_id                 = aws_apigatewayv2_api.this.id
  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  integration_uri        = var.lambdas[each.value.lambda_key].invoke_arn
  payload_format_version = "2.0"
}

# HTTP routes are declared centrally and fan out to the service Lambdas.
resource "aws_apigatewayv2_route" "this" {
  for_each = var.routes

  api_id    = aws_apigatewayv2_api.this.id
  route_key = "${each.value.method} ${each.value.path}"
  target    = "integrations/${aws_apigatewayv2_integration.this[each.key].id}"

  authorization_type   = each.value.authorization_type
  authorizer_id        = each.value.authorization_type == "JWT" ? aws_apigatewayv2_authorizer.jwt[0].id : null
  authorization_scopes = length(each.value.authorization_scopes) > 0 ? each.value.authorization_scopes : null

  lifecycle {
    precondition {
      condition     = contains(keys(var.lambdas), each.value.lambda_key)
      error_message = "Each route must reference a valid lambda_key."
    }

    precondition {
      condition     = each.value.authorization_type != "JWT" || var.jwt_authorizer_enabled
      error_message = "JWT routes require jwt_authorizer_enabled to be true."
    }
  }
}

# Explicit Lambda invoke permission per route keeps the API surface scoped.
resource "aws_lambda_permission" "this" {
  for_each = var.routes

  statement_id  = "${each.key}-invoke"
  action        = "lambda:InvokeFunction"
  function_name = var.lambdas[each.value.lambda_key].function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.this.execution_arn}/${aws_apigatewayv2_stage.this.name}/${each.value.method}${each.value.path}"
}

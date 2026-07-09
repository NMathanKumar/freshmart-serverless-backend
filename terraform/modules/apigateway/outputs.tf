output "api_id" {
  description = "HTTP API ID."
  value       = aws_apigatewayv2_api.this.id
}

output "api_endpoint" {
  description = "HTTP API endpoint."
  value       = aws_apigatewayv2_api.this.api_endpoint
}

output "stage_url" {
  description = "Fully qualified stage URL."
  value       = "https://${aws_apigatewayv2_api.this.id}.execute-api.${var.aws_region}.amazonaws.com/${aws_apigatewayv2_stage.this.name}"
}

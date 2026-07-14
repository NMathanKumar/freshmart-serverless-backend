output "vpc_id" {
  description = "VPC ID."
  value       = aws_vpc.this.id
}

output "vpc_arn" {
  description = "VPC ARN."
  value       = aws_vpc.this.arn
}

output "public_subnet_ids" {
  description = "Public subnet IDs."
  value       = [for subnet in aws_subnet.public : subnet.id]
}

output "private_subnet_ids" {
  description = "Private subnet IDs."
  value       = [for subnet in aws_subnet.private : subnet.id]
}

output "lambda_security_group_id" {
  description = "Lambda security group ID."
  value       = aws_security_group.lambda.id
}

output "endpoint_security_group_id" {
  description = "Interface endpoint security group ID."
  value       = aws_security_group.endpoints.id
}

output "nat_gateway_id" {
  description = "NAT gateway ID."
  value       = aws_nat_gateway.this.id
}

output "internet_gateway_id" {
  description = "Internet gateway ID."
  value       = aws_internet_gateway.this.id
}

output "vpc_endpoint_ids" {
  description = "VPC endpoint IDs keyed by endpoint alias."
  value = {
    for name, endpoint in aws_vpc_endpoint.gateway : name => endpoint.id
  }
}

output "interface_vpc_endpoint_ids" {
  description = "Interface VPC endpoint IDs keyed by endpoint alias."
  value = {
    for name, endpoint in aws_vpc_endpoint.interface : name => endpoint.id
  }
}

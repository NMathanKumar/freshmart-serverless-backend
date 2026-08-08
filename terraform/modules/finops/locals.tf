locals {
  mandatory_finops_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Owner       = "Platform Engineering"
    CostCenter  = "Engineering"
    Category    = "FinOps"
  }
}

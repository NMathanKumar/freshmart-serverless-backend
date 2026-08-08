data "aws_caller_identity" "current" {}

resource "aws_s3_bucket" "canary_artifacts" {
  bucket        = "${var.project_name}-${var.environment}-synthetics-artifacts-${data.aws_caller_identity.current.account_id}"
  force_destroy = var.environment != "prod"

  tags = merge(var.tags, {
    Environment = var.environment
    ManagedBy   = "Terraform"
    Project     = var.project_name
    Category    = "Synthetics"
  })
}

resource "aws_s3_bucket_public_access_block" "canary_artifacts" {
  bucket = aws_s3_bucket.canary_artifacts.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "canary_artifacts" {
  bucket = aws_s3_bucket.canary_artifacts.id

  rule {
    id     = "canary-artifact-retention"
    status = "Enabled"
    filter {}

    expiration {
      days = var.canary_artifact_retention_days
    }
  }
}


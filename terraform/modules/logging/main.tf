resource "aws_s3_bucket" "logging" {
  bucket        = var.bucket_name
  force_destroy = var.force_destroy

  tags = merge(
    var.tags,
    {
      Name        = var.bucket_name
      Environment = var.environment
      Project     = var.project_name
    }
  )
}

resource "aws_s3_bucket_ownership_controls" "logging" {
  bucket = aws_s3_bucket.logging.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_public_access_block" "logging" {
  bucket = aws_s3_bucket.logging.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_acl" "logging" {
  depends_on = [
    aws_s3_bucket_ownership_controls.logging,
    aws_s3_bucket_public_access_block.logging,
  ]

  bucket = aws_s3_bucket.logging.id
  access_control_policy {
    grant {
      grantee {
        type = "Group"
        uri  = "http://acs.amazonaws.com/groups/s3/LogDelivery"
      }
      permission = "READ_ACP"
    }
    grant {
      grantee {
        type = "Group"
        uri  = "http://acs.amazonaws.com/groups/s3/LogDelivery"
      }
      permission = "WRITE"
    }
    owner {
      id = data.aws_canonical_user_id.current.id
    }
  }
}

data "aws_canonical_user_id" "current" {}

resource "aws_s3_bucket_versioning" "logging" {
  bucket = aws_s3_bucket.logging.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "logging" {
  bucket = aws_s3_bucket.logging.id

  rule {
    id     = "log-retention"
    status = "Enabled"

    expiration {
      days = 180
    }

    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }
}

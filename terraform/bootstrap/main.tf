# =============================================================================
# FreshMart Terraform State Backend Bootstrap
# =============================================================================
#
# PURPOSE:
#   Provisions the S3 bucket used as the Terraform remote state backend for all
#   FreshMart environments (dev, qa, prod).
#
# LOCKING:
#   Uses Terraform's native S3 locking (use_lockfile = true), available since
#   Terraform 1.10. No DynamoDB table is required or created.
#   Locking is implemented via S3 conditional writes on a companion .tflock
#   object stored alongside each state file in the same bucket.
#
# BOOTSTRAP STATE:
#   This configuration intentionally uses a LOCAL Terraform backend.
#   It creates the infrastructure that other environments will use as their
#   remote backend. It cannot use a backend that does not yet exist.
#   After a successful apply, the bootstrap state (terraform.tfstate) must be
#   kept safe — ideally committed to a secure location or left in place.
#   Do NOT run terraform destroy after bootstrapping.
#
# ONE-TIME OPERATION:
#   This is a one-time bootstrap. After apply, no regular CI/CD pipeline should
#   target this directory. Changes here require careful human review.
#
# STATE LAYOUT (after bootstrap apply):
#   s3://freshmart-terraform-state/
#     freshmart/dev/terraform.tfstate
#     freshmart/dev/terraform.tfstate.tflock
#     freshmart/qa/terraform.tfstate
#     freshmart/qa/terraform.tfstate.tflock
#     freshmart/prod/terraform.tfstate
#     freshmart/prod/terraform.tfstate.tflock
# =============================================================================

data "aws_caller_identity" "current" {}

# -----------------------------------------------------------------------------
# 1. S3 Bucket — Terraform State Store
# -----------------------------------------------------------------------------
resource "aws_s3_bucket" "terraform_state" {
  bucket = var.state_bucket_name

  # Prevent accidental destruction of the state bucket.
  # terraform destroy will fail unless this is explicitly overridden.
  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Name    = var.state_bucket_name
    Purpose = "terraform-state-backend"
  }
}

# -----------------------------------------------------------------------------
# 2. Versioning — Retain all historical state revisions
# -----------------------------------------------------------------------------
resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  versioning_configuration {
    status = "Enabled"
  }
}

# -----------------------------------------------------------------------------
# 3. Server-Side Encryption — AES-256 at rest
#    Uses S3-managed keys (SSE-S3) — sufficient for state files.
#    Can be upgraded to SSE-KMS if compliance requires CMK management.
# -----------------------------------------------------------------------------
resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# -----------------------------------------------------------------------------
# 4. Block Public Access — All four axes blocked
# -----------------------------------------------------------------------------
resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# -----------------------------------------------------------------------------
# 5. Bucket Ownership Controls — BucketOwnerEnforced
#    Disables ACLs entirely. Object ownership is enforced at the bucket level.
#    Required for modern AWS accounts (ACL enforcement deprecated).
# -----------------------------------------------------------------------------
resource "aws_s3_bucket_ownership_controls" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }

  # Ownership controls must be set after public access block
  depends_on = [aws_s3_bucket_public_access_block.terraform_state]
}

# -----------------------------------------------------------------------------
# 6. Bucket Policy — Enforce TLS / deny HTTP access
#    All state reads and writes must use HTTPS.
# -----------------------------------------------------------------------------
resource "aws_s3_bucket_policy" "terraform_state_tls" {
  bucket = aws_s3_bucket.terraform_state.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "DenyInsecureTransport"
        Effect    = "Deny"
        Principal = "*"
        Action    = "s3:*"
        Resource = [
          aws_s3_bucket.terraform_state.arn,
          "${aws_s3_bucket.terraform_state.arn}/*"
        ]
        Condition = {
          Bool = {
            "aws:SecureTransport" = "false"
          }
        }
      }
    ]
  })

  # Policy must be applied after public access block and ownership controls
  depends_on = [
    aws_s3_bucket_public_access_block.terraform_state,
    aws_s3_bucket_ownership_controls.terraform_state
  ]
}

# -----------------------------------------------------------------------------
# 7. GitHub Actions OIDC Authentication & IAM Execution Roles
# -----------------------------------------------------------------------------
module "github_oidc" {
  source = "../modules/github-oidc"

  github_org_repo      = "NMathanKumar/freshmart-serverless-backend"
  create_oidc_provider = true
  aws_region           = var.aws_region
}


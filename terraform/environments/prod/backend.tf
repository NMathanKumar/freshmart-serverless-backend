# terraform/environments/prod/backend.tf
#
# Remote state backend for the PROD environment.
# State bucket provisioned by terraform/bootstrap — do not modify this file manually.
# Locking: S3 native locking (use_lockfile = true) — no DynamoDB required.
#
# PRODUCTION — treat with care.
# - Never run terraform apply -auto-approve against this environment.
# - Always run terraform plan and inspect before apply.
# - Prod state migration requires explicit human approval.
#
# To migrate existing local state to this backend:
#   terraform init -migrate-state
#
# This file is committed to version control — it contains no secrets.
terraform {
  backend "s3" {
    bucket       = "freshmart-terraform-state"
    key          = "freshmart/prod/terraform.tfstate"
    region       = "ap-southeast-1"
    use_lockfile = true
    encrypt      = true
  }
}

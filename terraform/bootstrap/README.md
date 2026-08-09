# terraform/bootstrap/README.md
#
# FreshMart Terraform Bootstrap
#
# ONE-TIME OPERATION — READ BEFORE RUNNING
#
# This directory bootstraps the Terraform remote state infrastructure.
# It must be run ONCE before any environment (dev/qa/prod) is initialized
# with a remote backend.
#
# WHAT IT CREATES:
#   - S3 bucket: freshmart-terraform-state
#     - Versioning enabled
#     - AES-256 encryption at rest
#     - All public access blocked
#     - BucketOwnerEnforced (ACLs disabled)
#     - TLS-only bucket policy
#
# LOCKING MECHANISM:
#   Native S3 locking (use_lockfile = true) — available in Terraform >= 1.10.
#   No DynamoDB table is created or required.
#
# HOW TO RUN (one time only, with AWS credentials for account 769044546162):
#
#   cd terraform/bootstrap
#   terraform init
#   terraform plan          # Review carefully — expect only 5 resources
#   terraform apply         # Only after plan review and human approval
#
# AFTER APPLY:
#   1. Note the output values (bucket name, ARN)
#   2. Create backend.tf in each environment using the output snippet
#   3. Run terraform init -migrate-state in each environment
#   4. Do NOT run terraform destroy on this directory
#
# STATE OF THIS BOOTSTRAP:
#   Intentionally uses a LOCAL backend (terraform.tfstate in this directory).
#   Keep this file safe. It is not migrated to the remote backend it creates.

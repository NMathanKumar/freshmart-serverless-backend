terraform {
  # Bootstrap uses a LOCAL backend intentionally.
  # The remote S3 backend cannot be used here because this configuration
  # is what creates the remote backend infrastructure.
  # This is a one-time bootstrap — do not migrate this state to S3.
  #
  # After bootstrap apply, ALL other environments (dev/qa/prod) will use
  # the S3 backend provisioned here.

  required_version = ">= 1.8.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "freshmart"
      ManagedBy   = "terraform"
      Component   = "terraform-bootstrap"
      Environment = "global"
    }
  }
}

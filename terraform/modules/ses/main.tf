# ==============================================================================
# FreshMart - AWS SES Reusable Terraform Module
# Manages SES domain/email identities, DKIM, configuration sets, and event destinations
# ==============================================================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0.0"
    }
  }
}

locals {
  is_domain_identity = var.domain_name != null && var.domain_name != ""
  is_email_identity  = var.email_address != null && var.email_address != ""

  # Identity identifier used in naming
  identity_name = local.is_domain_identity ? var.domain_name : (local.is_email_identity ? var.email_address : "freshmart-${var.environment}")

  configuration_set_name = coalesce(var.configuration_set_name, "${var.project_name}-${var.environment}-email-config")

  common_tags = merge(
    var.tags,
    {
      Module      = "SES"
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  )
}

# ------------------------------------------------------------------------------
# 1. SES Domain Identity (Used when a custom domain like freshmart.com is configured)
# ------------------------------------------------------------------------------
resource "aws_ses_domain_identity" "domain" {
  count  = local.is_domain_identity ? 1 : 0
  domain = var.domain_name
}

resource "aws_ses_domain_dkim" "dkim" {
  count  = local.is_domain_identity && var.enable_dkim ? 1 : 0
  domain = aws_ses_domain_identity.domain[0].domain
}

resource "aws_ses_domain_mail_from" "mail_from" {
  count                  = local.is_domain_identity && var.mail_from_subdomain != null ? 1 : 0
  domain                 = aws_ses_domain_identity.domain[0].domain
  mail_from_domain       = "${var.mail_from_subdomain}.${aws_ses_domain_identity.domain[0].domain}"
  behavior_on_mx_failure = var.behavior_on_mx_failure
}

# ------------------------------------------------------------------------------
# 2. SES Email Identity (Used when verifying specific sender addresses)
# ------------------------------------------------------------------------------
resource "aws_ses_email_identity" "email" {
  count = local.is_email_identity && !local.is_domain_identity ? 1 : 0
  email = var.email_address
}

# ------------------------------------------------------------------------------
# 3. SES Configuration Set (For delivery tracking, metrics, reputation monitoring)
# ------------------------------------------------------------------------------
resource "aws_ses_configuration_set" "this" {
  count = var.enable_configuration_set ? 1 : 0
  name  = local.configuration_set_name

  reputation_metrics_enabled = var.reputation_metrics_enabled
  sending_enabled            = var.sending_enabled

  delivery_options {
    tls_policy = var.tls_policy
  }
}

# ------------------------------------------------------------------------------
# 4. SES Event Destination to CloudWatch (For bounces, complaints, deliveries)
# ------------------------------------------------------------------------------
resource "aws_ses_event_destination" "cloudwatch" {
  count                  = var.enable_configuration_set && var.enable_cloudwatch_events ? 1 : 0
  name                   = "${local.configuration_set_name}-cloudwatch"
  configuration_set_name = aws_ses_configuration_set.this[0].name
  enabled                = true
  matching_types         = var.event_matching_types

  cloudwatch_destination {
    default_value  = "default"
    dimension_name = "ses_event_type"
    value_source   = "messageTag"
  }
}

# ------------------------------------------------------------------------------
# 5. SES Event Destination to SNS Topic (For automated bounce/complaint processing)
# ------------------------------------------------------------------------------
resource "aws_ses_event_destination" "sns" {
  count                  = var.enable_configuration_set && var.sns_topic_arn != null ? 1 : 0
  name                   = "${local.configuration_set_name}-sns"
  configuration_set_name = aws_ses_configuration_set.this[0].name
  enabled                = true
  matching_types         = var.event_matching_types

  sns_destination {
    topic_arn = var.sns_topic_arn
  }
}

# ------------------------------------------------------------------------------
# 6. SES Identity Notification Topics (Direct SNS topic association for bounce/complaint)
# ------------------------------------------------------------------------------
resource "aws_ses_identity_notification_topic" "bounce" {
  count                    = var.sns_topic_arn != null ? 1 : 0
  topic_arn                = var.sns_topic_arn
  notification_type        = "Bounce"
  identity                 = local.is_domain_identity ? aws_ses_domain_identity.domain[0].domain : (local.is_email_identity ? aws_ses_email_identity.email[0].email : var.email_address)
  include_original_headers = false
}

resource "aws_ses_identity_notification_topic" "complaint" {
  count                    = var.sns_topic_arn != null ? 1 : 0
  topic_arn                = var.sns_topic_arn
  notification_type        = "Complaint"
  identity                 = local.is_domain_identity ? aws_ses_domain_identity.domain[0].domain : (local.is_email_identity ? aws_ses_email_identity.email[0].email : var.email_address)
  include_original_headers = false
}

# Disaster Recovery

## Backup
- DynamoDB Point-in-Time Recovery (PITR) is enabled for production tables.
- Infrastructure as Code (Terraform) ensures repeatable environments.

## Recovery
1. Restore DynamoDB tables from PITR.
2. Re-apply Terraform to a new region if necessary.
3. Update Route53/CloudFront origins.
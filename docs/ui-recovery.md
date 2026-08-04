# FreshMart UI Recovery Guide

This document contains full details for restoring the exact production UI for Customer Web and Admin Web in less than 10 minutes.

---

## 1. Environment & Infrastructure Summary

* **Git Tag**: ui-production-v1
* **Backup Branch**: ui-production-backup
* **Commit Hash**: 6f916cb
* **CloudFront Distribution ID**: E1ZJQ37X0661FO
* **Unified Domain**: d3rk877kxrrv7b.cloudfront.net
* **Customer Web URL**: https://d3rk877kxrrv7b.cloudfront.net/
* **Admin Web URL**: https://d3rk877kxrrv7b.cloudfront.net/admin/
* **Customer S3 Bucket**: freshmart-prod-customer-web-769044546162
* **Admin S3 Bucket**: freshmart-prod-admin-web-769044546162
* **Cognito User Pool ID**: ap-southeast-1_RXGKIq89c
* **Cognito App Client ID**: 5qu1i66q07tqf4v7g3m2e8c201

---

## 2. Fast 10-Minute Disaster Recovery Procedure

If the UI is ever accidentally altered or degraded, follow these steps to restore:

### Step 1: Checkout the Git Tag
\\\ash
git checkout ui-production-v1
\\\

### Step 2: Build Customer & Admin Web Apps
\\\ash
npm run build --workspace=@freshmart/customer-web
npx vite build --prefix apps/admin-web
\\\

### Step 3: Deploy to AWS S3 & Invalidate CloudFront Cache
\\\ash
# Sync Customer Web
aws s3 sync apps/customer-web/dist s3://freshmart-prod-customer-web-769044546162

# Sync Admin Web under /admin/ prefix
aws s3 sync apps/admin-web/dist s3://freshmart-prod-admin-web-769044546162/admin

# Invalidate CloudFront Cache
aws cloudfront create-invalidation --distribution-id E1ZJQ37X0661FO --paths "/*"
\\\

---

## 3. Local Backup Archives

* **Directory**: /backups/ui-production/
* **Zip File**: /backups/ui-production.zip

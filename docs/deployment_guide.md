# Deployment Guide

## Prerequisites
- AWS CLI configured
- Node.js 22+
- Terraform v1.5+

## Deployment Steps
1. Run `npm ci`
2. Run `npm run build`
3. Run `npm run package`
4. Run `terraform apply` in `terraform/environments/dev`
5. Run `npm run deploy:web`
6. Verify with `npm run test:smoke:deployment`
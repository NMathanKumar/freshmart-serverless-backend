# FreshMart AWS SES Transactional Email Architecture & Production Guide

## 1. Overview
FreshMart utilizes **Amazon Simple Email Service (SES)** alongside **Amazon EventBridge**, **Amazon SQS**, and **AWS Lambda** to deliver real-time, asynchronous transactional emails (order confirmations, status updates, delivery receipts, account security alerts) directly to customers.

---

## 2. End-to-End Architecture Flow

```text
Customer
   │ (Places Order / Checkout)
   ▼
Customer Web (React / Vite)
   │ (POST /v1/orders)
   ▼
API Gateway
   │
   ▼
Order Service Lambda
   │ (Persists Order to DynamoDB)
   ▼
EventBridge Bus (freshmart-dev-events)
   │ (Event: OrderPlaced.v1 / order.placed)
   ▼
SQS Queue (freshmart-dev-notification-processing) & Direct EventBridge Target
   │ (Asynchronous Event Trigger)
   ▼
Notification Service Lambda
   │ (Idempotency Guard via DynamoDB -> Renders HTML/Text Multipart Email)
   ▼
AWS Simple Email Service (SES) [ap-southeast-1]
   │ (Dispatches to recipient)
   ▼
Customer Email Inbox (Gmail, Outlook, Yahoo, Custom Domains)
   │
   ▼ (In case of Bounce / Complaint)
SES Event Publishing -> SNS Topic -> SQS / Notification Lambda -> Address Suppression
```

---

## 3. Key Design Principles & Guardrails

1. **Zero Customer Verification Required in Production**:
   - In Production Access, **customers NEVER need to verify or activate their email addresses with AWS SES**.
   - Only the FreshMart sender identity / domain must be verified.
2. **Asynchronous & Non-Blocking**:
   - Order creation and payment confirmation never synchronously wait on SES delivery.
   - If SES experiences a transient throttling or network hiccup, the order remains 100% successful in DynamoDB while SQS/Lambda retries delivery with exponential backoff (1s, 2s, 4s, 8s).
3. **Idempotency Guard**:
   - Every event has a unique `eventId` / `orderId`.
   - The notification service locks processed events in DynamoDB (`IDEMPOTENCY#<eventId>`), preventing duplicate emails on Lambda/SQS retries.
4. **Least-Privilege Security**:
   - Lambda execution roles are granted narrow SES permissions (`ses:SendEmail`, `ses:SendRawEmail`, `ses:GetSendQuota`) scoped strictly to the verified SES identity ARN.
   - Frontend web applications never communicate directly with SES and have no access to AWS credentials.
   - Customer PII and full email bodies are never logged to CloudWatch.
5. **Anti-Spam & Bounce Management**:
   - Real-time handlers for `ses.bounce` and `ses.complaint`.
   - Hard bounces are automatically flagged and suppressed from future dispatches to protect domain reputation.

---

## 4. Terraform SES Module (`terraform/modules/ses`)

The reusable SES Terraform module manages:
- `aws_ses_email_identity`: For environment-specific sender email verification.
- `aws_ses_domain_identity`: For custom domain verification (e.g. `freshmart.com`).
- `aws_ses_domain_dkim`: For generating 3 CNAME DKIM DNS tokens.
- `aws_ses_configuration_set`: For delivery tracking, reputation metrics, and TLS enforcement.
- `aws_ses_event_destination`: For routing bounce, complaint, reject, and delivery metrics to CloudWatch and SNS.

### Environment Inputs:
| Variable | Dev Default | Prod Default | Description |
| :--- | :--- | :--- | :--- |
| `ses_from_email_address` | `nmathankumar020@gmail.com` | `no-reply@freshmart.com` | Sender address |
| `ses_domain_name` | `null` | `freshmart.com` | Verified domain |
| `enable_ses_dkim` | `true` | `true` | DKIM token generation |
| `enable_configuration_set` | `true` | `true` | Delivery tracking |

---

## 5. Moving AWS SES from Sandbox to Production Access

Amazon SES accounts start in **Sandbox Mode** in each AWS region. In Sandbox mode, emails can only be delivered to verified identities. 

### Step-by-Step Production Access Request:

1. Open the [AWS SES Account Dashboard (ap-southeast-1)](https://ap-southeast-1.console.aws.amazon.com/ses/home?region=ap-southeast-1#/account-dashboard).
2. Click **Request production access** (or "Edit details" under Sandbox status).
3. Submit the following details:
   - **Mail Type**: `Transactional`
   - **Website URL**: `https://freshmart.dev` (or deployed CloudFront URL)
   - **Use Case Description**:
     ```text
     We are requesting AWS SES Production Access for FreshMart, an e-commerce grocery and quick-commerce delivery platform.

     1. Email Types:
     - Order Confirmation receipts (with item breakdown, total amounts, and payment IDs)
     - Order status transitions (Preparing, Packed & Ready, Out for Delivery, Delivered)
     - Account security notifications (Password reset links, login security notices)

     2. Recipient Acquisition & Opt-in:
     - All emails are strictly transactional and sent only to registered customers who actively place orders or register accounts on our website.
     - No purchased lists, marketing blasts, or cold outreach.

     3. Bounce and Complaint Handling:
     - Integrated with EventBridge and SNS to monitor SES bounces and complaints. Hard bounces are suppressed immediately.

     4. Sending Volume:
     - Initial: 100–300 emails/day.
     - Scaling peak: 1,000–5,000 emails/day.
     ```
4. Review terms and click **Submit Request**.

---

## 6. DNS Authentication (SPF, DKIM, DMARC)

When using a verified domain (e.g. `freshmart.com`), configure the following DNS records in Route53 / DNS provider:

1. **DKIM (3 CNAME records)**:
   - Name: `<token1>._domainkey.freshmart.com` ➔ Target: `<token1>.dkim.amazonses.com`
   - Name: `<token2>._domainkey.freshmart.com` ➔ Target: `<token2>.dkim.amazonses.com`
   - Name: `<token3>._domainkey.freshmart.com` ➔ Target: `<token3>.dkim.amazonses.com`
2. **SPF (TXT record)**:
   - Name: `freshmart.com` ➔ Value: `v=spf1 include:amazonses.com ~all`
3. **DMARC (TXT record)**:
   - Name: `_dmarc.freshmart.com` ➔ Value: `v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@freshmart.com`

---

## 7. Verification & Troubleshooting Commands

```bash
# 1. Check SES Identity Verification
aws ses get-identity-verification-attributes --identities "no-reply@freshmart.com" "nmathankumar597@gmail.com"

# 2. Check SES Account Sandbox / Production Status
aws sesv2 get-account

# 3. Check SES Sending Quota
aws ses get-send-quota

# 4. Run Automated Test Suite
npm test --workspace=@freshmart/notification-service

# 5. Validate Terraform Across Environments
cd terraform/environments/dev && terraform validate
cd ../qa && terraform validate
cd ../prod && terraform validate
```

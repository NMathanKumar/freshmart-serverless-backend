# FreshMart Business Metrics

This document serves as the single source of truth for all business metrics emitted by the FreshMart serverless backend via CloudWatch Embedded Metric Format (EMF).

## Overview

All business metrics are emitted to the **`FreshMart/Business`** CloudWatch namespace.
Metrics use structured JSON logging (EMF) which are asynchronously ingested by CloudWatch Logs, avoiding synchronous API calls and extra IAM permissions.

### Common Dimensions

Every metric includes the following standard dimensions:
- `Service`: The microservice emitting the metric (e.g., `order-service`)
- `Environment`: Deployment environment (e.g., `dev`, `prod`)
- `EventType`: Logical grouping (e.g., `order`, `payment`, `cart`, `auth`, `product`, `inventory`)
- `MetricVersion`: Schema version (currently `1`)

## Metrics Catalog

| Metric | Source Service | Description | Unit | Dashboard Section | Alarms |
| ------ | -------------- | ----------- | ---- | ----------------- | ------ |
| **`OrderPlaced`** | `order-service` | A customer successfully placed a new order. | Count | Executive KPIs / Sales Funnel | ZeroOrders (Business Hrs) |
| **`OrderRevenue`** | `order-service` | Total revenue for the order. | None | Executive KPIs | RevenueDrop |
| **`OrderItemCount`** | `order-service` | Total number of items in the order. | Count | Executive KPIs (AOV derived) | |
| **`OrderCancelled`** | `order-service` | An order was cancelled. | Count | - | |
| **`PaymentCreated`** | `payment-service` | A new payment intent/transaction was created. | Count | Sales Funnel | |
| **`PaymentSucceeded`** | `payment-service` | Payment was successfully confirmed. | Count | Executive KPIs | |
| **`PaymentFailed`** | `payment-service` | Payment attempt failed. | Count | Operations | PaymentFailureSpike |
| **`PaymentRefunded`** | `payment-service` | Payment was refunded to the customer. | Count | Operations | |
| **`PaymentAmount`** | `payment-service` | Monetary amount of successful payment. | None | - | |
| **`PaymentProcessingTime`** | `payment-service` | Time taken to process the payment gateway request. | Milliseconds | - | |
| **`CartViewed`** | `cart-service` | A customer viewed their cart. | Count | Customer Activity | |
| **`CartItemAdded`** | `cart-service` | An item was added to the cart. | Count | Sales Funnel | FunnelDegradation |
| **`CartItemRemoved`** | `cart-service` | An item was removed from the cart. | Count | Customer Activity | |
| **`UserRegistered`** | `auth-service` | A new user successfully registered. | Count | Customer Activity | |
| **`UserLogin`** | `auth-service` | User successfully authenticated. | Count | Customer Activity | |
| **`LoginFailed`** | `auth-service` | Authentication failure. | Count | Operations | LoginFailureSpike |
| **`TokenRefreshed`** | `auth-service` | User refreshed their session token. | Count | - | |
| **`PasswordResetRequested`** | `auth-service` | Forgot password flow initiated. | Count | - | |
| **`PasswordResetCompleted`** | `auth-service` | Forgot password flow completed. | Count | - | |
| **`ProductViewed`** | `product-service` | A specific product detail page was fetched. | Count | Customer Activity | |
| **`ProductsListed`** | `product-service` | A product listing or category page was viewed. | Count | - | |
| **`ProductSearched`** | `product-service` | A product search query was executed. | Count | Sales Funnel | |
| **`SearchResultCount`** | `product-service` | Number of results returned by a search. | Count | - | |
| **`SearchNoResults`** | `product-service` | A search query returned zero results. | Count | Operations | SearchNoResultsSpike |
| **`InventoryUpdated`** | `inventory-service` | Stock was manually or automatically adjusted. | Count | Operations | |
| **`LowStockAlert`** | `inventory-service` | Inventory for a product fell below the minimum threshold. | Count | Operations | LowStockHourly |

## Optional Dimensions

In addition to the standard dimensions, specific metrics may emit optional dimensions when the data is available. These allow for deeper filtering and analysis:

| Dimension | Associated Metrics | Source | Notes |
| --------- | ------------------ | ------ | ----- |
| **`PaymentMethod`** | Payment metrics | `payment-service` | Tracks the payment gateway or method used (e.g., `stripe`, `paypal`). |
| **`OrderChannel`** | Order metrics | `order-service` | Tracks the origin of the order (e.g., `Web`, `Mobile`, `Admin`). |
| **`Category`** | Product metrics | `product-service` | Product category grouping. |
| **`Currency`** | Financial metrics | `order-service`, `payment-service` | Set to `SGD` by default. |
| **`Threshold`** | `LowStockAlert` | `inventory-service` | The configured low-stock threshold at the time of the alert. |

*Note: High-cardinality dimensions such as `UserId`, `OrderId`, `ProductId`, or `CartId` are explicitly avoided to control CloudWatch Metric costs and query performance.*

## Dashboard

The `freshmart-<env>-business` dashboard is automatically provisioned via Terraform and is divided into four sections:
1. **Executive KPIs**: Top-level revenue, orders, and payment success rates.
2. **Customer Activity**: User registrations, logins, and engagement.
3. **Sales Funnel**: E-commerce conversion flow from search to order placement.
4. **Operations**: Actionable errors such as payment failures, zero search results, and stock warnings.

## Alarms

Business-critical alarms trigger notifications to the `customer_events` SNS topic.

| Alarm | Condition | Severity |
| ----- | --------- | -------- |
| **PaymentFailureSpike** | >5 failures in 5 min | Critical |
| **LoginFailureSpike** | >10 failures in 5 min | Medium |
| **SearchNoResultsSpike** | >20 zero-result searches in 5 min | Medium |
| **LowStockAlerts** | >3 products below threshold in 1 hour | High |
| **RevenueDrop** | Dynamic drop based on 24h average | Critical |
| **ZeroOrdersBusinessHours** | 0 orders for 6 consecutive hours (08:00-22:00 SGT) | High |
| **FunnelDegradation** | Add-to-cart to Order ratio < 60% for 30 min | High |

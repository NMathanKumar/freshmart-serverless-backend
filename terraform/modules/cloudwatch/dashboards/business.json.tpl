{
  "widgets": [
    {
      "type": "text",
      "x": 0,
      "y": 0,
      "width": 24,
      "height": 1,
      "properties": {
"region": "${region}",
        "markdown": "[Executive](#dashboards:name=FreshMart-${environment}-Executive) | [Business](#dashboards:name=FreshMart-${environment}-Business) | [Operations](#dashboards:name=FreshMart-${environment}-Operations) | [FinOps](#dashboards:name=FreshMart-${environment}-FinOps) | [SLA](#dashboards:name=FreshMart-${environment}-SLA)"
      }
    },
    {
      "type": "text",
      "x": 0,
      "y": 1,
      "width": 24,
      "height": 2,
      "properties": {
"region": "${region}",
        "markdown": "## ?? Business Intelligence & E-Commerce Metrics\n> **Orders, Conversion Volume, Checkout Success, and Customer Traffic Analytics**"
      }
    },
    {
      "type": "metric",
      "x": 0,
      "y": 3,
      "width": 8,
      "height": 6,
      "properties": {
"region": "${region}",
        "title": "Daily Completed Orders Volume",
        "stat": "Sum",
        "period": 86400,
        "view": "singleValue",
        "metrics": [
          [ "FreshMart/${environment}/Orders", "CompletedOrderCount", { "label": "Orders Completed (24h)" } ]
        ]
      }
    },
    {
      "type": "metric",
      "x": 8,
      "y": 3,
      "width": 8,
      "height": 6,
      "properties": {
"region": "${region}",
        "title": "Cart Additions & Checkout Conversion Volume",
        "stat": "Sum",
        "period": 86400,
        "view": "timeSeries",
        "stacked": false,
        "metrics": [
          [ "FreshMart/${environment}/Cart", "ItemAddedCount", { "label": "Items Added to Cart" } ],
          [ "FreshMart/${environment}/Orders", "CompletedOrderCount", { "label": "Orders Placed" } ]
        ]
      }
    },
    {
      "type": "metric",
      "x": 16,
      "y": 3,
      "width": 8,
      "height": 6,
      "properties": {
"region": "${region}",
        "title": "Payment Success vs Failure Count",
        "stat": "Sum",
        "period": 86400,
        "view": "timeSeries",
        "stacked": true,
        "metrics": [
          [ "FreshMart/${environment}/Payments", "PaymentSuccessCount", { "label": "Payment Successes" } ],
          [ "FreshMart/${environment}/Payments", "PaymentFailureCount", { "label": "Payment Failures" } ]
        ]
      }
    }
  ]
}

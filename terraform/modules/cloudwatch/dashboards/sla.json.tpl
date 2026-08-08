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
        "markdown": "[Operations](#dashboards:name=FreshMart-${environment}-Operations) | [SLA & Error Budget](#dashboards:name=FreshMart-${environment}-SLA) | [Synthetics](#dashboards:name=FreshMart-${environment}-Synthetics) | [API](#dashboards:name=FreshMart-${environment}-API) | [Lambda](#dashboards:name=FreshMart-${environment}-Lambda) | [Database](#dashboards:name=FreshMart-${environment}-Database)"
      }
    },
    {
      "type": "metric",
      "x": 0,
      "y": 1,
      "width": 8,
      "height": 6,
      "properties": {
"region": "${region}",
        "title": "System Availability SLO (%) — Target: 99.9%",
        "view": "singleValue",
        "sparkline": true,
        "metrics": [
          [ { "expression": "(1 - (m2 / IF(m1 > 0, m1, 1))) * 100", "label": "System Availability %", "id": "e1" } ],
          [ "AWS/ApiGateway", "Count", "ApiId", "${api_id}", "Stage", "${api_stage_name}", { "id": "m1", "visible": false, "stat": "Sum" } ],
          [ "AWS/ApiGateway", "5XXError", "ApiId", "${api_id}", "Stage", "${api_stage_name}", { "id": "m2", "visible": false, "stat": "Sum" } ]
        ]
      }
    },
    {
      "type": "metric",
      "x": 8,
      "y": 1,
      "width": 8,
      "height": 6,
      "properties": {
"region": "${region}",
        "title": "Error Budget Remaining (%) — Target: 99.9% SLO",
        "view": "singleValue",
        "sparkline": true,
        "metrics": [
          [ { "expression": "100 - (((100 - e1) / 0.1) * 100)", "label": "Error Budget Remaining %", "id": "eb" } ],
          [ { "expression": "(1 - (m2 / IF(m1 > 0, m1, 1))) * 100", "label": "Availability", "id": "e1", "visible": false } ],
          [ "AWS/ApiGateway", "Count", "ApiId", "${api_id}", "Stage", "${api_stage_name}", { "id": "m1", "visible": false, "stat": "Sum" } ],
          [ "AWS/ApiGateway", "5XXError", "ApiId", "${api_id}", "Stage", "${api_stage_name}", { "id": "m2", "visible": false, "stat": "Sum" } ]
        ]
      }
    },
    {
      "type": "metric",
      "x": 16,
      "y": 1,
      "width": 8,
      "height": 6,
      "properties": {
"region": "${region}",
        "title": "Synthetics Canary Success Rate (%)",
        "view": "singleValue",
        "sparkline": true,
        "metrics": [
          [ "CloudWatchSynthetics", "SuccessPercent", { "stat": "Average", "period": 300 } ]
        ]
      }
    },
    {
      "type": "text",
      "x": 0,
      "y": 7,
      "width": 24,
      "height": 1,
      "properties": {
"region": "${region}",
        "markdown": "# Service Level Objectives (SLOs) & Latency Targets"
      }
    },
    {
      "type": "metric",
      "x": 0,
      "y": 8,
      "width": 12,
      "height": 6,
      "properties": {
"region": "${region}",
        "title": "API Latency SLO — P95 (<500ms) & P99 (<1000ms)",
        "view": "timeSeries",
        "stacked": false,
        "stat": "p95",
        "period": 300,
        "metrics": [
          [ "AWS/ApiGateway", "Latency", "ApiId", "${api_id}", "Stage", "${api_stage_name}", { "stat": "p95", "label": "P95 Latency (ms)" } ],
          [ "AWS/ApiGateway", "Latency", "ApiId", "${api_id}", "Stage", "${api_stage_name}", { "stat": "p99", "label": "P99 Latency (ms)" } ]
        ]
      }
    },
    {
      "type": "metric",
      "x": 12,
      "y": 8,
      "width": 12,
      "height": 6,
      "properties": {
"region": "${region}",
        "title": "Error Budget Burn Rate (Hourly Loss)",
        "view": "timeSeries",
        "stacked": false,
        "period": 3600,
        "metrics": [
          [ "AWS/ApiGateway", "5XXError", "ApiId", "${api_id}", "Stage", "${api_stage_name}", { "stat": "Sum", "label": "5XX Error Count (1h)" } ]
        ]
      }
    }
  ]
}

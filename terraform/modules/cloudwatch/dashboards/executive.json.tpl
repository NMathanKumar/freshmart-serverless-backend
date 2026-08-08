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
        "markdown": "[Executive Command Center](#dashboards:name=FreshMart-${environment}-Executive) | [Operations](#dashboards:name=FreshMart-${environment}-Operations) | [Security](#dashboards:name=FreshMart-${environment}-Security) | [FinOps](#dashboards:name=FreshMart-${environment}-FinOps) | [SLA](#dashboards:name=FreshMart-${environment}-SLA) | [Synthetics](#dashboards:name=FreshMart-${environment}-Synthetics)"
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
        "markdown": "# ?? FreshMart Executive Command Center\n> **Unified Platform Health, Reliability SLO, Security Posture, Financial Governance, & Customer Journey Status**"
      }
    },
    {
      "type": "metric",
      "x": 0,
      "y": 3,
      "width": 6,
      "height": 5,
      "properties": {
"region": "${region}",
        "title": "System Availability (SLO Target: 99.9%)",
        "view": "singleValue",
        "sparkline": true,
        "metrics": [
          [ { "expression": "(1 - (m2 / IF(m1 > 0, m1, 1))) * 100", "label": "Availability %", "id": "e1" } ],
          [ "AWS/ApiGateway", "Count", "ApiId", "${api_id}", "Stage", "${api_stage_name}", { "id": "m1", "visible": false, "stat": "Sum" } ],
          [ "AWS/ApiGateway", "5XXError", "ApiId", "${api_id}", "Stage", "${api_stage_name}", { "id": "m2", "visible": false, "stat": "Sum" } ]
        ]
      }
    },
    {
      "type": "metric",
      "x": 6,
      "y": 3,
      "width": 6,
      "height": 5,
      "properties": {
"region": "${region}",
        "title": "Error Budget Remaining (%)",
        "view": "singleValue",
        "sparkline": true,
        "metrics": [
          [ { "expression": "100 - (((100 - e1) / 0.1) * 100)", "label": "Error Budget %", "id": "eb" } ],
          [ { "expression": "(1 - (m2 / IF(m1 > 0, m1, 1))) * 100", "label": "Availability", "id": "e1", "visible": false } ],
          [ "AWS/ApiGateway", "Count", "ApiId", "${api_id}", "Stage", "${api_stage_name}", { "id": "m1", "visible": false, "stat": "Sum" } ],
          [ "AWS/ApiGateway", "5XXError", "ApiId", "${api_id}", "Stage", "${api_stage_name}", { "id": "m2", "visible": false, "stat": "Sum" } ]
        ]
      }
    },
    {
      "type": "metric",
      "x": 12,
      "y": 3,
      "width": 6,
      "height": 5,
      "properties": {
"region": "${region}",
        "title": "Synthetic Canaries Pass Rate (%)",
        "view": "singleValue",
        "sparkline": true,
        "metrics": [
          [ "CloudWatchSynthetics", "SuccessPercent", { "stat": "Average", "label": "Canary Pass Rate" } ]
        ]
      }
    },
    {
      "type": "metric",
      "x": 18,
      "y": 3,
      "width": 6,
      "height": 5,
      "properties": {
"region": "${region}",
        "title": "Daily Platform Requests Volume",
        "view": "singleValue",
        "sparkline": true,
        "metrics": [
          [ "AWS/ApiGateway", "Count", "ApiId", "${api_id}", "Stage", "${api_stage_name}", { "stat": "Sum", "period": 86400, "label": "24h Requests" } ]
        ]
      }
    },
    {
      "type": "alarm",
      "x": 0,
      "y": 8,
      "width": 24,
      "height": 4,
      "properties": {
"region": "${region}",
        "title": "Executive Platform Composite Alarms",
        "alarms": [
          "arn:aws:cloudwatch:${region}:${account_id}:alarm:${project_name}-${environment}-Composite-Platform-Failure-Critical",
          "arn:aws:cloudwatch:${region}:${account_id}:alarm:${project_name}-${environment}-Composite-API-Failure-Critical",
          "arn:aws:cloudwatch:${region}:${account_id}:alarm:${project_name}-${environment}-Composite-Database-Failure-Critical",
          "arn:aws:cloudwatch:${region}:${account_id}:alarm:${project_name}-${environment}-Composite-Messaging-Failure-Critical"
        ]
      }
    }
  ]
}

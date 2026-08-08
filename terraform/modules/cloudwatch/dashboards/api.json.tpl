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
    "markdown": "[Operations](#dashboards:name=FreshMart-${environment}-Operations) | [API](#dashboards:name=FreshMart-${environment}-API) | [Lambda](#dashboards:name=FreshMart-${environment}-Lambda) | [Database](#dashboards:name=FreshMart-${environment}-Database) | [Messaging](#dashboards:name=FreshMart-${environment}-Messaging)"
  }
},
{
    "type": "alarm",
    "x": 0,
    "y": 1,
    "width": 24,
    "height": 3,
    "properties": {
"region": "${region}",
      "title": "API Alarms",
      "alarms": [
        "arn:aws:cloudwatch:${region}:${account_id}:alarm:${project_name}-${environment}-ApiGateway-API-5XXRate-Critical",
        "arn:aws:cloudwatch:${region}:${account_id}:alarm:${project_name}-${environment}-ApiGateway-API-RequestDrop-Critical",
        "arn:aws:cloudwatch:${region}:${account_id}:alarm:${project_name}-${environment}-ApiGateway-API-4XXRate-Warning",
        "arn:aws:cloudwatch:${region}:${account_id}:alarm:${project_name}-${environment}-ApiGateway-API-IntegrationLatency-Warning"
      ]
    }
  },

    { "type": "text", "x": 0, "y": 4, "width": 24, "height": 1, "properties": {
"region": "${region}", "markdown": "# API SLOs" } },
    { "type": "metric", "x": 0, "y": 5, "width": 6, "height": 6, "properties": {
"region": "${region}",
        "metrics": [
          [ { "expression": "(1 - (m2 / IF(m1 > 0, m1, 1))) * 100", "label": "Availability %", "id": "e1" } ],
          [ "AWS/ApiGateway", "Count", "ApiId", "${api_id}", "Stage", "${api_stage_name}", { "id": "m1", "visible": false, "stat": "Sum" } ],
          [ ".", "5XXError", ".", ".", ".", ".", { "id": "m2", "visible": false, "stat": "Sum" } ]
        ],
        "view": "singleValue", "region": "${region}", "period": ${period}, "title": "ðŸŸ¢ API Availability %"
    } },
    { "type": "metric", "x": 6, "y": 5, "width": 6, "height": 6, "properties": {
"region": "${region}",
        "metrics": [ [ "AWS/ApiGateway", "Latency", "ApiId", "${api_id}", "Stage", "${api_stage_name}", { "stat": "p95" } ] ],
        "view": "singleValue", "region": "${region}", "period": ${period}, "title": "âš¡ p95 Latency (ms)"
    } },
    { "type": "metric", "x": 12, "y": 5, "width": 6, "height": 6, "properties": {
"region": "${region}",
        "metrics": [
          [ { "expression": "(m2 / IF(m1 > 0, m1, 1)) * 100", "label": "5XX Rate %", "id": "e1" } ],
          [ "AWS/ApiGateway", "Count", "ApiId", "${api_id}", "Stage", "${api_stage_name}", { "id": "m1", "visible": false, "stat": "Sum" } ],
          [ ".", "5XXError", ".", ".", ".", ".", { "id": "m2", "visible": false, "stat": "Sum" } ]
        ],
        "view": "singleValue", "region": "${region}", "period": ${period}, "title": "âŒ 5XX Rate %"
    } },
    { "type": "metric", "x": 18, "y": 5, "width": 6, "height": 6, "properties": {
"region": "${region}",
        "metrics": [
          [ { "expression": "m1 / ${period}", "label": "Requests/Second", "id": "e1" } ],
          [ "AWS/ApiGateway", "Count", "ApiId", "${api_id}", "Stage", "${api_stage_name}", { "id": "m1", "visible": false, "stat": "Sum" } ]
        ],
        "view": "singleValue", "region": "${region}", "period": ${period}, "title": "ðŸ“¶ Requests/Second"
    } },
    { "type": "text", "x": 0, "y": 11, "width": 24, "height": 1, "properties": {
"region": "${region}", "markdown": "# Error Analysis" } },
    { "type": "metric", "x": 0, "y": 12, "width": 12, "height": 6, "properties": {
"region": "${region}",
        "metrics": [ [ "AWS/ApiGateway", "5XXError", "ApiId", "${api_id}", "Stage", "${api_stage_name}", { "stat": "Sum" } ] ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "5XX Errors Over Time"
    } },
    { "type": "metric", "x": 12, "y": 12, "width": 12, "height": 6, "properties": {
"region": "${region}",
        "metrics": [ [ "AWS/ApiGateway", "4XXError", "ApiId", "${api_id}", "Stage", "${api_stage_name}", { "stat": "Sum" } ] ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "4XX Errors Over Time"
    } },
    { "type": "metric", "x": 0, "y": 18, "width": 12, "height": 6, "properties": {
"region": "${region}",
        "metrics": [
          [ { "expression": "(m2 / IF(m1 > 0, m1, 1)) * 100", "label": "5XX Rate %", "id": "e1" } ],
          [ "AWS/ApiGateway", "Count", "ApiId", "${api_id}", "Stage", "${api_stage_name}", { "id": "m1", "visible": false, "stat": "Sum" } ],
          [ ".", "5XXError", ".", ".", ".", ".", { "id": "m2", "visible": false, "stat": "Sum" } ]
        ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "5XX Error Rate % Trend"
    } },
    { "type": "metric", "x": 12, "y": 18, "width": 12, "height": 6, "properties": {
"region": "${region}",
        "metrics": [
          [ { "expression": "(m2 / IF(m1 > 0, m1, 1)) * 100", "label": "4XX Rate %", "id": "e1" } ],
          [ "AWS/ApiGateway", "Count", "ApiId", "${api_id}", "Stage", "${api_stage_name}", { "id": "m1", "visible": false, "stat": "Sum" } ],
          [ ".", "4XXError", ".", ".", ".", ".", { "id": "m2", "visible": false, "stat": "Sum" } ]
        ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "4XX Error Rate % Trend"
    } },
    { "type": "text", "x": 0, "y": 24, "width": 24, "height": 1, "properties": {
"region": "${region}", "markdown": "# Latency Analysis" } },
    { "type": "metric", "x": 0, "y": 25, "width": 12, "height": 6, "properties": {
"region": "${region}",
        "metrics": [
          [ "AWS/ApiGateway", "Latency", "ApiId", "${api_id}", "Stage", "${api_stage_name}", { "stat": "p50" } ],
          [ ".", ".", ".", ".", ".", ".", { "stat": "p95" } ],
          [ ".", ".", ".", ".", ".", ".", { "stat": "p99" } ]
        ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "Latency â€“ p50 / p95 / p99"
    } },
    { "type": "metric", "x": 12, "y": 25, "width": 12, "height": 6, "properties": {
"region": "${region}",
        "metrics": [ [ "AWS/ApiGateway", "IntegrationLatency", "ApiId", "${api_id}", "Stage", "${api_stage_name}", { "stat": "p95" } ] ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "Integration Latency"
    } },
    { "type": "text", "x": 0, "y": 31, "width": 24, "height": 1, "properties": {
"region": "${region}", "markdown": "# Traffic" } },
    { "type": "metric", "x": 0, "y": 32, "width": 24, "height": 6, "properties": {
"region": "${region}",
        "metrics": [ [ "AWS/ApiGateway", "Count", "ApiId", "${api_id}", "Stage", "${api_stage_name}", { "stat": "Sum" } ] ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "API Request Volume"
    } }
  ]
}
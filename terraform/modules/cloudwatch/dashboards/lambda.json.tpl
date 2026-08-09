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
      "title": "Compute Alarms",
      "alarms": [
%{ for idx, key in keys(lambdas) ~}
        "arn:aws:cloudwatch:${region}:${account_id}:alarm:${project_name}-${environment}-Lambda-Compute-ErrorRate-Critical-${key}",
        "arn:aws:cloudwatch:${region}:${account_id}:alarm:${project_name}-${environment}-Lambda-Compute-IteratorAge-Critical-${key}"%{ if idx != length(keys(lambdas)) - 1 },%{ endif }
%{ endfor ~}
      ]
    }
  },

    {
      "type": "text", "x": 0, "y": 4, "width": 24, "height": 1,
      "properties": {
"region": "${region}", "markdown": "# Lambda Fleet Overview" }
    },
    {
      "type": "metric", "x": 0, "y": 5, "width": 12, "height": 6,
      "properties": {
"region": "${region}",
        "metrics": [
%{ for key, fn in lambdas ~}
          [ "AWS/Lambda", "Errors", "FunctionName", "${fn.function_name}", { "stat": "Sum", "label": "${key}" } ]%{ if key != keys(lambdas)[length(lambdas)-1] },%{ endif }
%{ endfor ~}
        ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "Lambda Errors â€“ All Services"
      }
    },
    {
      "type": "metric", "x": 12, "y": 5, "width": 12, "height": 6,
      "properties": {
"region": "${region}",
        "metrics": [
          [ { "expression": "SUM(METRICS('errors')) / IF(SUM(METRICS('invocations')) > 0, SUM(METRICS('invocations')), 1) * 100", "label": "Fleet Error Rate %", "id": "e1" } ]
%{ for key, fn in lambdas ~}
          ,[ "AWS/Lambda", "Errors", "FunctionName", "${fn.function_name}", { "id": "errors${replace(key, "-", "")}", "visible": false, "stat": "Sum" } ]
          ,[ "AWS/Lambda", "Invocations", "FunctionName", "${fn.function_name}", { "id": "invocations${replace(key, "-", "")}", "visible": false, "stat": "Sum" } ]
%{ endfor ~}
        ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "Lambda Fleet Error Rate %"
      }
    }
%{ for idx, key in keys(lambdas) ~}
    ,
    { "type": "text", "x": 0, "y": ${idx * 14 + 7}, "width": 24, "height": 1, "properties": {
"region": "${region}", "markdown": "## ${key} Service" } },
    { "type": "metric", "x": 0, "y": ${idx * 14 + 8}, "width": 6, "height": 6, "properties": {
"region": "${region}",
        "metrics": [ [ "AWS/Lambda", "Invocations", "FunctionName", "${lambdas[key].function_name}", { "stat": "Sum" } ] ],
        "view": "singleValue", "region": "${region}", "period": ${period}, "title": "Invocations"
    } },
    { "type": "metric", "x": 6, "y": ${idx * 14 + 8}, "width": 6, "height": 6, "properties": {
"region": "${region}",
        "metrics": [ [ "AWS/Lambda", "Errors", "FunctionName", "${lambdas[key].function_name}", { "stat": "Sum" } ] ],
        "view": "singleValue", "region": "${region}", "period": ${period}, "title": "Errors"
    } },
    { "type": "metric", "x": 12, "y": ${idx * 14 + 8}, "width": 6, "height": 6, "properties": {
"region": "${region}",
        "metrics": [
          [ { "expression": "(m2 / IF(m1 > 0, m1, 1)) * 100", "label": "Error Rate %", "id": "e1" } ],
          [ "AWS/Lambda", "Invocations", "FunctionName", "${lambdas[key].function_name}", { "id": "m1", "visible": false, "stat": "Sum" } ],
          [ ".", "Errors", ".", ".", { "id": "m2", "visible": false, "stat": "Sum" } ]
        ],
        "view": "singleValue", "region": "${region}", "period": ${period}, "title": "Error Rate %"
    } },
    { "type": "metric", "x": 18, "y": ${idx * 14 + 8}, "width": 6, "height": 6, "properties": {
"region": "${region}",
        "metrics": [ [ "AWS/Lambda", "Throttles", "FunctionName", "${lambdas[key].function_name}", { "stat": "Sum" } ] ],
        "view": "singleValue", "region": "${region}", "period": ${period}, "title": "Throttles"
    } },
    { "type": "metric", "x": 0, "y": ${idx * 14 + 14}, "width": 12, "height": 6, "properties": {
"region": "${region}",
        "metrics": [
          [ "AWS/Lambda", "Duration", "FunctionName", "${lambdas[key].function_name}", { "stat": "p50", "label": "p50" } ],
          [ ".", ".", ".", ".", { "stat": "p95", "label": "p95" } ],
          [ ".", ".", ".", ".", { "stat": "p99", "label": "p99" } ]
        ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "Duration (ms)"
    } },
    { "type": "metric", "x": 12, "y": ${idx * 14 + 14}, "width": 12, "height": 6, "properties": {
"region": "${region}",
        "metrics": [ [ "AWS/Lambda", "ConcurrentExecutions", "FunctionName", "${lambdas[key].function_name}", { "stat": "Maximum" } ] ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "Concurrent Executions"
    } }
%{ endfor ~}
  ]
}
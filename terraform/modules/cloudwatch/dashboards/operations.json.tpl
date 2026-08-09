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
  "width": 16,
  "height": 3,
  "properties": {
"region": "${region}",
    "title": "Platform Composite Alarms",
    "alarms": [
      "arn:aws:cloudwatch:${region}:${account_id}:alarm:${project_name}-${environment}-Composite-Platform-Failure-Critical",
      "arn:aws:cloudwatch:${region}:${account_id}:alarm:${project_name}-${environment}-Composite-API-Failure-Critical",
      "arn:aws:cloudwatch:${region}:${account_id}:alarm:${project_name}-${environment}-Composite-Database-Failure-Critical",
      "arn:aws:cloudwatch:${region}:${account_id}:alarm:${project_name}-${environment}-Composite-Messaging-Failure-Critical"
    ]
  }
},
{
  "type": "text",
  "x": 16,
  "y": 1,
  "width": 8,
  "height": 3,
  "properties": {
"region": "${region}",
    "markdown": "## ðŸš€ Deployment Metadata\n| Field | Value |\n|---|---|\n| **Environment** | `${environment}` |\n| **Region** | `${region}` |\n| **Account** | `${account_id}` |\n| **Project** | `${project_name}` |\n\n> âš ï¸ During incidents: note the **Deployment Time** and check if a recent release correlates with the issue."
  }
},

    { "type": "text", "x": 0, "y": 4, "width": 24, "height": 1, "properties": {
"region": "${region}", "markdown": "# Platform Health Overview" } },
    { "type": "text", "x": 0, "y": 5, "width": 24, "height": 1, "properties": {
"region": "${region}", "markdown": "# Traffic & Availability" } },
    { "type": "metric", "x": 0, "y": 6, "width": 12, "height": 6, "properties": {
"region": "${region}",
        "metrics": [
          [ { "expression": "(1 - (m2 / IF(m1 > 0, m1, 1))) * 100", "label": "Availability %", "id": "e1" } ],
          [ "AWS/ApiGateway", "Count", "ApiId", "${api_id}", "Stage", "${api_stage_name}", { "id": "m1", "visible": false, "stat": "Sum" } ],
          [ ".", "5XXError", ".", ".", ".", ".", { "id": "m2", "visible": false, "stat": "Sum" } ]
        ],
        "view": "singleValue", "region": "${region}", "period": ${period}, "title": "API Availability %"
    } },
    { "type": "metric", "x": 12, "y": 6, "width": 12, "height": 6, "properties": {
"region": "${region}",
        "metrics": [
%{ for key, cf in cloudfront_distributions ~}
          [ "AWS/CloudFront", "Requests", "DistributionId", "${cf.distribution_id}", "Region", "Global", { "stat": "Sum", "label": "${key} CF" } ]%{ if key != keys(cloudfront_distributions)[length(cloudfront_distributions)-1] },%{ endif }
%{ endfor ~}
        ],
        "view": "timeSeries", "region": "us-east-1", "period": ${period}, "title": "CloudFront Requests"
    } },
    { "type": "metric", "x": 0, "y": 12, "width": 6, "height": 6, "properties": {
"region": "${region}",
        "metrics": [
          [ { "expression": "m1 / ${period}", "label": "RPS", "id": "e1" } ],
          [ "AWS/ApiGateway", "Count", "ApiId", "${api_id}", "Stage", "${api_stage_name}", { "id": "m1", "visible": false, "stat": "Sum" } ]
        ],
        "view": "singleValue", "region": "${region}", "period": ${period}, "title": "API RPS"
    } },
    { "type": "metric", "x": 6, "y": 12, "width": 6, "height": 6, "properties": {
"region": "${region}",
        "metrics": [
%{ for key, cf in cloudfront_distributions ~}
          [ "AWS/CloudFront", "4xxErrorRate", "DistributionId", "${cf.distribution_id}", "Region", "Global", { "stat": "Average", "label": "${key}" } ]%{ if key != keys(cloudfront_distributions)[length(cloudfront_distributions)-1] },%{ endif }
%{ endfor ~}
        ],
        "view": "singleValue", "region": "us-east-1", "period": ${period}, "title": "CF 4XX Rate %"
    } },
    { "type": "metric", "x": 12, "y": 12, "width": 6, "height": 6, "properties": {
"region": "${region}",
        "metrics": [
%{ for key, cf in cloudfront_distributions ~}
          [ "AWS/CloudFront", "5xxErrorRate", "DistributionId", "${cf.distribution_id}", "Region", "Global", { "stat": "Average", "label": "${key}" } ]%{ if key != keys(cloudfront_distributions)[length(cloudfront_distributions)-1] },%{ endif }
%{ endfor ~}
        ],
        "view": "singleValue", "region": "us-east-1", "period": ${period}, "title": "CF 5XX Rate %"
    } },
    { "type": "text", "x": 0, "y": 18, "width": 24, "height": 1, "properties": {
"region": "${region}", "markdown": "# API Gateway" } },
    { "type": "metric", "x": 0, "y": 19, "width": 12, "height": 6, "properties": {
"region": "${region}",
        "metrics": [ [ "AWS/ApiGateway", "5XXError", "ApiId", "${api_id}", "Stage", "${api_stage_name}", { "stat": "Sum" } ] ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "API 5XX Errors"
    } },
    { "type": "metric", "x": 12, "y": 19, "width": 12, "height": 6, "properties": {
"region": "${region}",
        "metrics": [ [ "AWS/ApiGateway", "Latency", "ApiId", "${api_id}", "Stage", "${api_stage_name}", { "stat": "p95" } ] ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "API p95 Latency"
    } },
    { "type": "text", "x": 0, "y": 25, "width": 24, "height": 1, "properties": {
"region": "${region}", "markdown": "# Lambda Fleet" } },
    { "type": "metric", "x": 0, "y": 26, "width": 12, "height": 6, "properties": {
"region": "${region}",
        "metrics": [
%{ for key, fn in lambdas ~}
          [ "AWS/Lambda", "Errors", "FunctionName", "${fn.function_name}", { "stat": "Sum", "label": "${key}" } ]%{ if key != keys(lambdas)[length(lambdas)-1] },%{ endif }
%{ endfor ~}
        ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "Lambda Errors (All)"
    } },
    { "type": "metric", "x": 12, "y": 26, "width": 12, "height": 6, "properties": {
"region": "${region}",
        "metrics": [
          [ { "expression": "SUM(METRICS('errors')) / IF(SUM(METRICS('invocations')) > 0, SUM(METRICS('invocations')), 1) * 100", "label": "Fleet Error Rate %", "id": "e1" } ]
%{ for key, fn in lambdas ~}
          ,[ "AWS/Lambda", "Errors", "FunctionName", "${fn.function_name}", { "id": "errors${replace(key, "-", "")}", "visible": false, "stat": "Sum" } ]
          ,[ "AWS/Lambda", "Invocations", "FunctionName", "${fn.function_name}", { "id": "invocations${replace(key, "-", "")}", "visible": false, "stat": "Sum" } ]
%{ endfor ~}
        ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "Lambda Error Rate %"
    } },
    { "type": "text", "x": 0, "y": 32, "width": 24, "height": 1, "properties": {
"region": "${region}", "markdown": "# Database" } },
    { "type": "metric", "x": 0, "y": 33, "width": 12, "height": 6, "properties": {
"region": "${region}",
        "metrics": [
%{ for key, t in tables ~}
          [ "AWS/DynamoDB", "ReadThrottleEvents", "TableName", "${t.table_name}", { "stat": "Sum", "label": "${key}" } ]%{ if key != keys(tables)[length(tables)-1] },%{ endif }
%{ endfor ~}
        ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "DDB Read Throttle"
    } },
    { "type": "metric", "x": 12, "y": 33, "width": 12, "height": 6, "properties": {
"region": "${region}",
        "metrics": [
%{ for key, t in tables ~}
          [ "AWS/DynamoDB", "WriteThrottleEvents", "TableName", "${t.table_name}", { "stat": "Sum", "label": "${key}" } ]%{ if key != keys(tables)[length(tables)-1] },%{ endif }
%{ endfor ~}
        ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "DDB Write Throttle"
    } },
    { "type": "text", "x": 0, "y": 39, "width": 24, "height": 1, "properties": {
"region": "${region}", "markdown": "# Messaging & Events" } },
    { "type": "metric", "x": 0, "y": 40, "width": 12, "height": 6, "properties": {
"region": "${region}",
        "metrics": [
%{ for key, q in dlqs ~}
          [ "AWS/SQS", "ApproximateNumberOfMessagesVisible", "QueueName", "${q.queue_name}", { "stat": "Sum", "label": "${key}" } ]%{ if key != keys(dlqs)[length(dlqs)-1] },%{ endif }
%{ endfor ~}
        ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "SQS DLQ Depth"
    } },
    { "type": "metric", "x": 12, "y": 40, "width": 12, "height": 6, "properties": {
"region": "${region}",
        "metrics": [ [ "AWS/Events", "FailedInvocations", "EventBusName", "${eventbridge_bus_name}", { "stat": "Sum" } ] ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "EventBridge Failed"
    } },
    { "type": "metric", "x": 0, "y": 46, "width": 12, "height": 6, "properties": {
"region": "${region}",
        "metrics": [
%{ for key, t in topics ~}
          [ "AWS/SNS", "NumberOfNotificationsFailed", "TopicName", "${t.topic_name}", { "stat": "Sum", "label": "${key}" } ]%{ if key != keys(topics)[length(topics)-1] },%{ endif }
%{ endfor ~}
        ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "SNS Failed"
    } },
    { "type": "metric", "x": 12, "y": 46, "width": 12, "height": 6, "properties": {
"region": "${region}",
        "metrics": [
%{ for key, q in queues ~}
          [ "AWS/SQS", "ApproximateNumberOfMessagesVisible", "QueueName", "${q.queue_name}", { "stat": "Average", "label": "${key}" } ]%{ if key != keys(queues)[length(queues)-1] },%{ endif }
%{ endfor ~}
        ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "SQS Queue Depth"
    } }
  ]
}
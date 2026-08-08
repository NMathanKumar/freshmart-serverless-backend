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
      "title": "Database Alarms",
      "alarms": [
        %{ for key, table in tables ~}
        "arn:aws:cloudwatch:${region}:${account_id}:alarm:${project_name}-${environment}-DynamoDB-Database-SystemErrors-Critical-${key}",
        %{ endfor ~}
        "arn:aws:cloudwatch:${region}:${account_id}:alarm:${project_name}-${environment}-Composite-Database-Failure-Critical"
      ]
    }
  },

    { "type": "text", "x": 0, "y": 4, "width": 24, "height": 1, "properties": {
"region": "${region}", "markdown": "# DynamoDB Tables Overview" } },
    { "type": "metric", "x": 0, "y": 5, "width": 12, "height": 6, "properties": {
"region": "${region}",
        "metrics": [
%{ for key, t in tables ~}
          [ "AWS/DynamoDB", "ReadThrottleEvents", "TableName", "${t.table_name}", { "stat": "Sum", "label": "${key}" } ]%{ if key != keys(tables)[length(tables)-1] },%{ endif }
%{ endfor ~}
        ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "Read Throttles (All Tables)"
    } },
    { "type": "metric", "x": 12, "y": 5, "width": 12, "height": 6, "properties": {
"region": "${region}",
        "metrics": [
%{ for key, t in tables ~}
          [ "AWS/DynamoDB", "WriteThrottleEvents", "TableName", "${t.table_name}", { "stat": "Sum", "label": "${key}" } ]%{ if key != keys(tables)[length(tables)-1] },%{ endif }
%{ endfor ~}
        ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "Write Throttles (All Tables)"
    } }
%{ for idx, key in keys(tables) ~}
    ,
    { "type": "text", "x": 0, "y": ${idx * 14 + 7}, "width": 24, "height": 1, "properties": {
"region": "${region}", "markdown": "## Table: ${key}" } },
    { "type": "metric", "x": 0, "y": ${idx * 14 + 8}, "width": 6, "height": 6, "properties": {
"region": "${region}",
        "metrics": [ [ "AWS/DynamoDB", "ConsumedReadCapacityUnits", "TableName", "${tables[key].table_name}", { "stat": "Sum" } ] ],
        "view": "singleValue", "region": "${region}", "period": ${period}, "title": "Read CU"
    } },
    { "type": "metric", "x": 6, "y": ${idx * 14 + 8}, "width": 6, "height": 6, "properties": {
"region": "${region}",
        "metrics": [ [ "AWS/DynamoDB", "ConsumedWriteCapacityUnits", "TableName", "${tables[key].table_name}", { "stat": "Sum" } ] ],
        "view": "singleValue", "region": "${region}", "period": ${period}, "title": "Write CU"
    } },
    { "type": "metric", "x": 12, "y": ${idx * 14 + 8}, "width": 6, "height": 6, "properties": {
"region": "${region}",
        "metrics": [ [ "AWS/DynamoDB", "ReadThrottleEvents", "TableName", "${tables[key].table_name}", { "stat": "Sum" } ] ],
        "view": "singleValue", "region": "${region}", "period": ${period}, "title": "Read Throttles"
    } },
    { "type": "metric", "x": 18, "y": ${idx * 14 + 8}, "width": 6, "height": 6, "properties": {
"region": "${region}",
        "metrics": [ [ "AWS/DynamoDB", "WriteThrottleEvents", "TableName", "${tables[key].table_name}", { "stat": "Sum" } ] ],
        "view": "singleValue", "region": "${region}", "period": ${period}, "title": "Write Throttles"
    } },
    { "type": "metric", "x": 0, "y": ${idx * 14 + 14}, "width": 12, "height": 6, "properties": {
"region": "${region}",
        "metrics": [
          [ "AWS/DynamoDB", "SuccessfulRequestLatency", "TableName", "${tables[key].table_name}", "Operation", "GetItem", { "stat": "Average", "label": "GetItem" } ],
          [ ".", ".", ".", ".", "Operation", "Query", { "stat": "Average", "label": "Query" } ]
        ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "Latency"
    } },
    { "type": "metric", "x": 12, "y": ${idx * 14 + 14}, "width": 12, "height": 6, "properties": {
"region": "${region}",
        "metrics": [ [ "AWS/DynamoDB", "SystemErrors", "TableName", "${tables[key].table_name}", { "stat": "Sum" } ] ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "System Errors"
    } }
%{ endfor ~}
  ]
}
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
      "title": "Messaging Alarms",
      "alarms": [
        "arn:aws:cloudwatch:${region}:${account_id}:alarm:${project_name}-${environment}-EventBridge-Messaging-FailedInvocations-Critical",
        "arn:aws:cloudwatch:${region}:${account_id}:alarm:${project_name}-${environment}-Composite-Messaging-Failure-Critical"
      ]
    }
  },

    { "type": "text", "x": 0, "y": 4, "width": 24, "height": 1, "properties": {
"region": "${region}", "markdown": "# Dead Letter Queues" } },
    { "type": "metric", "x": 0, "y": 5, "width": 24, "height": 6, "properties": {
"region": "${region}",
        "metrics": [
%{ for key, q in dlqs ~}
          [ "AWS/SQS", "ApproximateNumberOfMessagesVisible", "QueueName", "${q.queue_name}", { "stat": "Sum", "label": "${key}" } ]%{ if key != keys(dlqs)[length(dlqs)-1] },%{ endif }
%{ endfor ~}
        ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "DLQ Depth", "stacked": true
    } },
    { "type": "text", "x": 0, "y": 11, "width": 24, "height": 1, "properties": {
"region": "${region}", "markdown": "# SQS Queues" } },
    { "type": "metric", "x": 0, "y": 12, "width": 12, "height": 6, "properties": {
"region": "${region}",
        "metrics": [
%{ for key, q in queues ~}
          [ "AWS/SQS", "ApproximateNumberOfMessagesVisible", "QueueName", "${q.queue_name}", { "stat": "Average", "label": "${key}" } ]%{ if key != keys(queues)[length(queues)-1] },%{ endif }
%{ endfor ~}
        ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "Queue Depth (All)"
    } },
    { "type": "metric", "x": 12, "y": 12, "width": 12, "height": 6, "properties": {
"region": "${region}",
        "metrics": [
%{ for key, q in queues ~}
          [ "AWS/SQS", "ApproximateAgeOfOldestMessage", "QueueName", "${q.queue_name}", { "stat": "Maximum", "label": "${key}" } ]%{ if key != keys(queues)[length(queues)-1] },%{ endif }
%{ endfor ~}
        ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "Oldest Message Age"
    } },
    { "type": "metric", "x": 0, "y": 18, "width": 12, "height": 6, "properties": {
"region": "${region}",
        "metrics": [
%{ for key, q in queues ~}
          [ "AWS/SQS", "NumberOfMessagesSent", "QueueName", "${q.queue_name}", { "stat": "Sum", "label": "${key}" } ]%{ if key != keys(queues)[length(queues)-1] },%{ endif }
%{ endfor ~}
        ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "Messages Sent"
    } },
    { "type": "metric", "x": 12, "y": 18, "width": 12, "height": 6, "properties": {
"region": "${region}",
        "metrics": [
%{ for key, q in queues ~}
          [ "AWS/SQS", "NumberOfMessagesDeleted", "QueueName", "${q.queue_name}", { "stat": "Sum", "label": "${key}" } ]%{ if key != keys(queues)[length(queues)-1] },%{ endif }
%{ endfor ~}
        ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "Messages Deleted"
    } },
    { "type": "text", "x": 0, "y": 24, "width": 24, "height": 1, "properties": {
"region": "${region}", "markdown": "# SNS Topics" } },
    { "type": "metric", "x": 0, "y": 25, "width": 12, "height": 6, "properties": {
"region": "${region}",
        "metrics": [
%{ for key, t in topics ~}
          [ "AWS/SNS", "NumberOfMessagesPublished", "TopicName", "${t.topic_name}", { "stat": "Sum", "label": "${key}" } ]%{ if key != keys(topics)[length(topics)-1] },%{ endif }
%{ endfor ~}
        ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "Messages Published"
    } },
    { "type": "metric", "x": 12, "y": 25, "width": 12, "height": 6, "properties": {
"region": "${region}",
        "metrics": [
%{ for key, t in topics ~}
          [ "AWS/SNS", "NumberOfNotificationsFailed", "TopicName", "${t.topic_name}", { "stat": "Sum", "label": "${key}" } ]%{ if key != keys(topics)[length(topics)-1] },%{ endif }
%{ endfor ~}
        ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "Failed Notifications"
    } },
    { "type": "text", "x": 0, "y": 31, "width": 24, "height": 1, "properties": {
"region": "${region}", "markdown": "# EventBridge" } },
    { "type": "metric", "x": 0, "y": 32, "width": 12, "height": 6, "properties": {
"region": "${region}",
        "metrics": [ [ "AWS/Events", "MatchedEvents", "EventBusName", "${eventbridge_bus_name}", { "stat": "Sum" } ] ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "Matched Events"
    } },
    { "type": "metric", "x": 12, "y": 32, "width": 12, "height": 6, "properties": {
"region": "${region}",
        "metrics": [ [ "AWS/Events", "FailedInvocations", "EventBusName", "${eventbridge_bus_name}", { "stat": "Sum" } ] ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "Failed Invocations"
    } },
    { "type": "metric", "x": 0, "y": 38, "width": 12, "height": 6, "properties": {
"region": "${region}",
        "metrics": [ [ "AWS/Events", "DeadLetterInvocations", "EventBusName", "${eventbridge_bus_name}", { "stat": "Sum" } ] ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "Dead-Lettered Events"
    } },
    { "type": "metric", "x": 12, "y": 38, "width": 12, "height": 6, "properties": {
"region": "${region}",
        "metrics": [ [ "AWS/Events", "ThrottledRules", "EventBusName", "${eventbridge_bus_name}", { "stat": "Sum" } ] ],
        "view": "timeSeries", "region": "${region}", "period": ${period}, "title": "Throttled Rules"
    } }
  ]
}
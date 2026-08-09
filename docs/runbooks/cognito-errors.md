# Runbook: cognito-errors

## Overview
This runbook provides mitigation steps for the cognito-errors alarm.

## Triage Steps
1. Open CloudWatch Logs for the affected service.
2. Check AWS X-Ray traces for bottlenecks.
3. Review recent deployments.

## Mitigation
- If it's a known downstream issue, await resolution.
- If it's a code bug, revert the latest deployment.
- If it's a capacity issue, increase limits (e.g. DynamoDB RCUs/WCUs or API GW Quotas).


## CloudWatch Dashboard Links
- [Operations Dashboard](https://console.aws.amazon.com/cloudwatch/home#dashboards:name=FreshMart-prod-Operations)
- [API Dashboard](https://console.aws.amazon.com/cloudwatch/home#dashboards:name=FreshMart-prod-API)
- [Lambda Dashboard](https://console.aws.amazon.com/cloudwatch/home#dashboards:name=FreshMart-prod-Lambda)
- [Database Dashboard](https://console.aws.amazon.com/cloudwatch/home#dashboards:name=FreshMart-prod-Database)
- [Messaging Dashboard](https://console.aws.amazon.com/cloudwatch/home#dashboards:name=FreshMart-prod-Messaging)
- [Logs Insights](https://console.aws.amazon.com/cloudwatch/home#logsV2:logs-insights)
- [X-Ray Service Map](https://console.aws.amazon.com/xray/home#service-map)
- [Contributor Insights](https://console.aws.amazon.com/cloudwatch/home#contributorInsights)

# # -- AWS Cost Anomaly Monitor --------------------------------------------------
# resource "aws_ce_anomaly_monitor" "service_monitor" {
#   name              = "${var.project_name}-${var.environment}-cost-anomaly-monitor"
#   monitor_type      = "DIMENSIONAL"
#   monitor_dimension = "SERVICE"
# 
#   tags = merge(var.tags, local.mandatory_finops_tags, {
#     Purpose = "CostAnomalyDetection"
#   })
# }
# 
# # -- AWS Cost Anomaly Subscription ---------------------------------------------
# resource "aws_ce_anomaly_subscription" "service_subscription" {
#   name      = "${var.project_name}-${var.environment}-cost-anomaly-subscription"
#   frequency = "IMMEDIATE"
#   monitor_arn_list = [
#     aws_ce_anomaly_monitor.service_monitor.arn
#   ]
# 
#   subscriber {
#     type    = "SNS"
#     address = var.alarm_sns_topics.warning
#   }
# 
#   threshold_expression {
#     dimension {
#       key           = "ANOMALY_TOTAL_IMPACT_PERCENTAGE"
#       values        = ["20"] # 20% cost anomaly spike trigger
#       match_options = ["GREATER_THAN_OR_EQUAL"]
#     }
#   }
# 
#   tags = merge(var.tags, local.mandatory_finops_tags, {
#     Purpose = "CostAnomalySubscription"
#   })
# }

data "aws_ssm_parameter" "log_level" {
  name       = "/${var.project_name}/monitoring/log-level"
  depends_on = [module.ssm]
}

data "aws_ssm_parameter" "error_threshold" {
  name       = "/${var.project_name}/monitoring/error-threshold"
  depends_on = [module.ssm]
}

data "aws_ssm_parameter" "latency_threshold" {
  name       = "/${var.project_name}/monitoring/latency-threshold"
  depends_on = [module.ssm]
}

data "aws_ssm_parameter" "cache_hit_threshold" {
  name       = "/${var.project_name}/monitoring/cache-hit-threshold"
  depends_on = [module.ssm]
}

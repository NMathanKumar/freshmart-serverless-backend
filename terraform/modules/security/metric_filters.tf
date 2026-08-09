# ── 1. Brute Force Failed Login Filter ─────────────────────────────────────────
resource "aws_cloudwatch_log_metric_filter" "brute_force" {
  name           = "${var.project_name}-${var.environment}-auth-brute-force"
  log_group_name = var.auth_log_group_name

  pattern = "{ ($.level = \"warn\" || $.level = \"error\") && ($.message = \"*Invalid credentials*\" || $.message = \"*Failed login*\") }"

  metric_transformation {
    name          = "FailedLoginCount"
    namespace     = "FreshMart/${var.environment}/Security"
    value         = "1"
    default_value = "0"
    unit          = "Count"
  }
}

# ── 2. Unauthorized 401/403 Surges Filter ─────────────────────────────────────
resource "aws_cloudwatch_log_metric_filter" "unauthorized_access" {
  name           = "${var.project_name}-${var.environment}-unauthorized-access"
  log_group_name = var.auth_log_group_name

  pattern = "{ ($.statusCode = 401 || $.statusCode = 403) }"

  metric_transformation {
    name          = "UnauthorizedAccessCount"
    namespace     = "FreshMart/${var.environment}/Security"
    value         = "1"
    default_value = "0"
    unit          = "Count"
  }
}

# ── 3. Admin Privilege Elevation Filter ───────────────────────────────────────
resource "aws_cloudwatch_log_metric_filter" "privilege_elevation" {
  name           = "${var.project_name}-${var.environment}-admin-privilege-elevation"
  log_group_name = var.auth_log_group_name

  pattern = "{ $.message = \"*Forbidden: Admin access required*\" || $.message = \"*Unauthorized role*\" }"

  metric_transformation {
    name          = "PrivilegeElevationAttemptCount"
    namespace     = "FreshMart/${var.environment}/Security"
    value         = "1"
    default_value = "0"
    unit          = "Count"
  }
}

locals {
  common_tags = merge(
    {
      project      = var.project_name
      environment  = var.environment
      managed_by   = "terraform"
      architecture = "serverless-microservices"
    },
    var.tags
  )

  service_names = [
    "auth-service",
    "user-service",
    "catalog-service",
    "inventory-service",
    "cart-service",
    "order-service",
    "category-service",
    "cms-service",
    "analytics-service",
    "wishlist-service",
    "promotions-service",
    "brand-service",
    "search-service",
    "notification-service",
    "customer-bff-service",
    "admin-bff-service",
    "review-service",
    "coupon-service",
    "iam-service"
  ]

  eventbridge_bus_name = "${var.project_name}-${var.environment}-events"
  api_name             = "${var.project_name}-${var.environment}-api"

  dynamodb_tables = {
    for service_name in local.service_names :
    service_name => {
      table_name             = "${var.project_name}-${var.environment}-${service_name}"
      partition_key          = "pk"
      sort_key               = "sk"
      ttl_enabled            = false
      ttl_attribute          = null
      point_in_time_recovery = true
      deletion_protection    = true
      stream_enabled         = true
      stream_view_type       = "NEW_AND_OLD_IMAGES"
      tags                   = { service = service_name }
      global_secondary_indexes = lookup({
        auth-service = [
          { name = "gsi1", partition_key = "gsi1pk", sort_key = "gsi1sk" }
        ]
        user-service = []
        catalog-service = [
          { name = "gsi1", partition_key = "gsi1pk", sort_key = "gsi1sk" },
          { name = "gsi2", partition_key = "gsi2pk", sort_key = "gsi2sk" },
          { name = "gsi3", partition_key = "gsi3pk", sort_key = "gsi3sk" }
        ]
        inventory-service = [
          { name = "gsi1", partition_key = "gsi1pk", sort_key = "gsi1sk" },
          { name = "gsi2", partition_key = "gsi2pk", sort_key = "gsi2sk" },
          { name = "gsi3", partition_key = "gsi3pk", sort_key = "gsi3sk" }
        ]
        cart-service = [
          { name = "gsi1", partition_key = "gsi1pk", sort_key = "gsi1sk" }
        ]
        order-service = [
          { name = "gsi1", partition_key = "gsi1pk", sort_key = "gsi1sk" },
          { name = "gsi2", partition_key = "gsi2pk", sort_key = "gsi2sk" },
          { name = "gsi3", partition_key = "gsi3pk", sort_key = "gsi3sk" }
        ]
        category-service = [
          { name = "gsi1", partition_key = "gsi1pk", sort_key = "gsi1sk" },
          { name = "gsi2", partition_key = "gsi2pk", sort_key = "gsi2sk" }
        ]
        review-service = [
          { name = "gsi1", partition_key = "gsi1pk", sort_key = "gsi1sk" },
          { name = "gsi2", partition_key = "gsi2pk", sort_key = "gsi2sk" }
        ]
        coupon-service = [
          { name = "gsi1", partition_key = "gsi1pk", sort_key = "gsi1sk" },
          { name = "gsi2", partition_key = "gsi2pk", sort_key = "gsi2sk" }
        ]
        iam-service = []
        cms-service = [
          { name = "gsi1", partition_key = "gsi1pk", sort_key = "gsi1sk" },
          { name = "gsi2", partition_key = "gsi2pk", sort_key = "gsi2sk" },
          { name = "gsi3", partition_key = "gsi3pk", sort_key = "gsi3sk" }
        ]
        analytics-service = [
          { name = "gsi1", partition_key = "gsi1pk", sort_key = "gsi1sk" },
          { name = "gsi2", partition_key = "gsi2pk", sort_key = "gsi2sk" }
        ]
        wishlist-service = [
          { name = "gsi1", partition_key = "gsi1pk", sort_key = "gsi1sk" }
        ]
        promotions-service = [
          { name = "gsi1", partition_key = "gsi1pk", sort_key = "gsi1sk" },
          { name = "gsi2", partition_key = "gsi2pk", sort_key = "gsi2sk" }
        ]
        brand-service = [
          { name = "gsi1", partition_key = "gsi1pk", sort_key = "gsi1sk" },
          { name = "gsi2", partition_key = "gsi2pk", sort_key = "gsi2sk" }
        ]
        search-service = [
          { name = "gsi1", partition_key = "gsi1pk", sort_key = "gsi1sk" }
        ]
        notification-service = [
          { name = "gsi1", partition_key = "gsi1pk", sort_key = "gsi1sk" }
        ]
        customer-bff-service = []
        admin-bff-service    = []
      }, service_name, [])
    }
  }

  iam_roles = {
    for service_name in local.service_names :
    service_name => {
      service_name = service_name
      dynamodb_table_permissions = [{
        table_arn = module.dynamodb[service_name].table_arn
        actions = [
          "dynamodb:BatchGetItem",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:UpdateItem"
        ]
      }]
      allow_sns_publish = contains([
        "notification-service"
      ], service_name)
      sns_topic_arns = contains([
        "notification-service"
      ], service_name) ? values(module.sns.topic_arns) : []
      allow_sqs_send_message = false
      sqs_queue_arns         = []
      allow_s3_object_access = contains([
        "catalog-service",
        "cms-service",
        "brand-service"
      ], service_name)
      s3_object_arns = contains([
        "catalog-service",
        "cms-service",
        "brand-service"
      ], service_name) ? [module.s3.object_arn] : []
      allow_eventbridge_put_events = contains([
        "auth-service",
        "catalog-service",
        "inventory-service",
        "cart-service",
        "order-service",
        "cms-service",
        "analytics-service",
        "wishlist-service",
        "promotions-service",
        "brand-service",
        "search-service",
        "notification-service"
      ], service_name)
      eventbridge_bus_names = contains([
        "auth-service",
        "catalog-service",
        "inventory-service",
        "cart-service",
        "order-service",
        "cms-service",
        "analytics-service",
        "wishlist-service",
        "promotions-service",
        "brand-service",
        "search-service",
        "notification-service"
      ], service_name) ? [module.eventbridge.bus_name] : []
      allow_eventbridge_read = contains([
        "analytics-service",
        "admin-bff-service",
        "notification-service"
      ], service_name)
      allow_cognito_user_pool_access = service_name == "auth-service"
      cognito_user_pool_arns         = [module.cognito.user_pool_arn]
      eventbridge_rule_name_prefixes = ["${var.project_name}-${var.environment}"]
      tags                           = { service = service_name }
    }
  }

  lambda_functions = {
    for service_name in local.service_names :
    service_name => {
      service_name                   = service_name
      function_name                  = "${var.project_name}-${var.environment}-${service_name}"
      description                    = "FreshMart ${service_name} Lambda."
      filename                       = "${path.module}/../../../artifacts/${service_name}.zip"
      runtime                        = "nodejs22.x"
      handler                        = "dist/index.handler"
      timeout                        = 30
      memory_size                    = contains(["customer-bff-service", "admin-bff-service", "analytics-service"], service_name) ? 1024 : 512
      architecture                   = "arm64"
      role_arn                       = module.iam[service_name].role_arn
      tracing_mode                   = "Active"
      publish                        = true
      dead_letter_config             = { target_arn = module.sqs.dlq_arn[service_name] }
      reserved_concurrent_executions = null
      ephemeral_storage              = null
      layers                         = []
      log_retention_in_days          = 30
      subnet_ids                     = []
      security_group_ids             = []
      log_group_kms_key_id           = "alias/aws/logs"
      permissions                    = []
      tags                           = { service = service_name }
      environment_variables = {
        AWS_NODEJS_CONNECTION_REUSE_ENABLED = "1"
        AWS_REGION                          = var.aws_region
        EVENT_BUS_NAME                      = module.eventbridge.bus_name
        COGNITO_USER_POOL_ID                = module.cognito.user_pool_id
        COGNITO_APP_CLIENT_ID               = module.cognito.user_pool_client_id
        CORS_ALLOWED_ORIGINS                = join(",", var.allowed_origins)
        TABLE_NAME                          = module.dynamodb[service_name].table_name
        AUTH_TABLE_NAME                     = module.dynamodb["auth-service"].table_name
        USER_TABLE_NAME                     = module.dynamodb["user-service"].table_name
        CUSTOMER_CATALOG_API_URL            = module.apigateway.stage_url
        CUSTOMER_CATEGORY_API_URL           = module.apigateway.stage_url
        CUSTOMER_CART_API_URL               = module.apigateway.stage_url
        CUSTOMER_ORDER_API_URL              = module.apigateway.stage_url
        CUSTOMER_USER_API_URL               = module.apigateway.stage_url
        CUSTOMER_WISHLIST_API_URL           = module.apigateway.stage_url
        CUSTOMER_NOTIFICATION_API_URL       = module.apigateway.stage_url
        CUSTOMER_PROMOTIONS_API_URL         = module.apigateway.stage_url
        CUSTOMER_COUPON_API_URL             = module.apigateway.stage_url
        ADMIN_ANALYTICS_API_URL             = module.apigateway.stage_url
        ADMIN_INVENTORY_API_URL             = module.apigateway.stage_url
        ADMIN_ORDER_API_URL                 = module.apigateway.stage_url
        ADMIN_CATALOG_API_URL               = module.apigateway.stage_url
        ADMIN_USER_API_URL                  = module.apigateway.stage_url
        ADMIN_CMS_API_URL                   = module.apigateway.stage_url
        ADMIN_PROMOTIONS_API_URL            = module.apigateway.stage_url
        ADMIN_COUPON_API_URL                = module.apigateway.stage_url
        IAM_TABLE_NAME                      = module.dynamodb["iam-service"].table_name
      }
    }
  }

  api_gateway_lambdas = {
    for service_name, lambda_module in module.lambda :
    service_name => {
      function_name = lambda_module.function_name
      function_arn  = lambda_module.function_arn
      invoke_arn    = lambda_module.invoke_arn
    }
  }

  api_gateway_routes = {
    auth_register    = { method = "POST", path = "/api/v1/auth/register", lambda_key = "auth-service", authorization_type = "NONE", authorization_scopes = [] }
    auth_login       = { method = "POST", path = "/api/v1/auth/login", lambda_key = "auth-service", authorization_type = "NONE", authorization_scopes = [] }
    auth_refresh     = { method = "POST", path = "/api/v1/auth/refresh-token", lambda_key = "auth-service", authorization_type = "NONE", authorization_scopes = [] }
    auth_logout      = { method = "POST", path = "/api/v1/auth/logout", lambda_key = "auth-service", authorization_type = "JWT", authorization_scopes = [] }
    auth_me          = { method = "GET", path = "/api/v1/auth/me", lambda_key = "auth-service", authorization_type = "JWT", authorization_scopes = [] }
    user_profile     = { method = "GET", path = "/api/v1/users/profile", lambda_key = "user-service", authorization_type = "JWT", authorization_scopes = [] }
    catalog_list     = { method = "GET", path = "/api/v1/catalog/products", lambda_key = "catalog-service", authorization_type = "JWT", authorization_scopes = [] }
    inventory_get    = { method = "GET", path = "/api/v1/inventory/items", lambda_key = "inventory-service", authorization_type = "JWT", authorization_scopes = [] }
    cart_get         = { method = "GET", path = "/api/v1/cart", lambda_key = "cart-service", authorization_type = "JWT", authorization_scopes = [] }
    order_list       = { method = "GET", path = "/api/v1/orders", lambda_key = "order-service", authorization_type = "JWT", authorization_scopes = [] }
    category_list    = { method = "GET", path = "/api/v1/categories", lambda_key = "category-service", authorization_type = "JWT", authorization_scopes = [] }
    review_list      = { method = "GET", path = "/api/v1/reviews", lambda_key = "review-service", authorization_type = "JWT", authorization_scopes = [] }
    cms_list         = { method = "GET", path = "/api/v1/cms/pages", lambda_key = "cms-service", authorization_type = "JWT", authorization_scopes = [] }
    analytics_get    = { method = "GET", path = "/api/v1/analytics/snapshots", lambda_key = "analytics-service", authorization_type = "JWT", authorization_scopes = [] }
    wishlist_get     = { method = "GET", path = "/api/v1/wishlist/{customerId}", lambda_key = "wishlist-service", authorization_type = "JWT", authorization_scopes = [] }
    promotions_get   = { method = "GET", path = "/api/v1/promotions", lambda_key = "promotions-service", authorization_type = "JWT", authorization_scopes = [] }
    brand_get        = { method = "GET", path = "/api/v1/brands", lambda_key = "brand-service", authorization_type = "JWT", authorization_scopes = [] }
    search_get       = { method = "GET", path = "/api/v1/search", lambda_key = "search-service", authorization_type = "JWT", authorization_scopes = [] }
    notification_get = { method = "GET", path = "/api/v1/notifications/{recipientUserId}", lambda_key = "notification-service", authorization_type = "JWT", authorization_scopes = [] }
    customer_home    = { method = "GET", path = "/api/v1/customer/home", lambda_key = "customer-bff-service", authorization_type = "JWT", authorization_scopes = [] }
    customer_bff_api = { method = "ANY", path = "/api/v1/customer/{proxy+}", lambda_key = "customer-bff-service", authorization_type = "NONE", authorization_scopes = [] }
    customer_bff_v1  = { method = "ANY", path = "/customer/{proxy+}", lambda_key = "customer-bff-service", authorization_type = "NONE", authorization_scopes = [] }
    admin_dash       = { method = "GET", path = "/api/v1/admin/dashboard", lambda_key = "admin-bff-service", authorization_type = "JWT", authorization_scopes = [] }
    admin_bff_api    = { method = "ANY", path = "/api/v1/admin/{proxy+}", lambda_key = "admin-bff-service", authorization_type = "JWT", authorization_scopes = [] }
    admin_bff_v1     = { method = "ANY", path = "/v1/admin/{proxy+}", lambda_key = "admin-bff-service", authorization_type = "JWT", authorization_scopes = [] }
    coupon_admin     = { method = "ANY", path = "/api/v1/admin/coupons/{proxy+}", lambda_key = "coupon-service", authorization_type = "JWT", authorization_scopes = [] }
    coupon_validate  = { method = "POST", path = "/api/v1/coupons/validate", lambda_key = "coupon-service", authorization_type = "JWT", authorization_scopes = [] }
    coupon_redeem    = { method = "POST", path = "/api/v1/coupons/redeem", lambda_key = "coupon-service", authorization_type = "JWT", authorization_scopes = [] }
    iam_roles_get    = { method = "GET", path = "/api/v1/iam/roles", lambda_key = "iam-service", authorization_type = "JWT", authorization_scopes = [] }
    iam_perms_get    = { method = "GET", path = "/api/v1/iam/permissions", lambda_key = "iam-service", authorization_type = "JWT", authorization_scopes = [] }
    iam_roles_put    = { method = "PUT", path = "/api/v1/iam/roles/{roleName}/permissions", lambda_key = "iam-service", authorization_type = "JWT", authorization_scopes = [] }
  }

  sns_topics = {
    notifications = {
      name         = "${var.project_name}-${var.environment}-notifications"
      display_name = "FreshMart Notifications"
    }
    ops = {
      name         = "${var.project_name}-${var.environment}-ops"
      display_name = "FreshMart Ops"
    }
  }

  sqs_queues = {
    for service_name in local.service_names :
    service_name => {
      name                       = "${var.project_name}-${var.environment}-${service_name}"
      visibility_timeout_seconds = 60
      max_receive_count          = 5
      dlq_name                   = "${var.project_name}-${var.environment}-${service_name}-dlq"
      sns_topic_keys             = service_name == "notification-service" ? ["notifications"] : []
    }
  }

  eventbridge_lambda_targets = {
    analytics = {
      function_name = module.lambda["analytics-service"].function_name
      function_arn  = module.lambda["analytics-service"].function_arn
    }
    admin = {
      function_name = module.lambda["admin-bff-service"].function_name
      function_arn  = module.lambda["admin-bff-service"].function_arn
    }
    notification = {
      function_name = module.lambda["notification-service"].function_name
      function_arn  = module.lambda["notification-service"].function_arn
    }
  }

  eventbridge_rules = {
    analytics_projections = {
      description          = "Feed order, cart, and catalog changes into analytics."
      detail_type_prefixes = ["freshmart.order", "freshmart.cart", "freshmart.catalog"]
      sources              = ["freshmart.order", "freshmart.cart", "freshmart.catalog"]
      target_lambda_keys   = ["analytics"]
    }
    admin_dashboard = {
      description          = "Project key business events into admin read models."
      detail_type_prefixes = ["freshmart.order", "freshmart.inventory"]
      sources              = ["freshmart.order", "freshmart.inventory"]
      target_lambda_keys   = ["admin"]
    }
    notifications = {
      description          = "Publish customer-facing notifications on order and promotion events."
      detail_type_prefixes = ["freshmart.order", "freshmart.promotions"]
      sources              = ["freshmart.order", "freshmart.promotions"]
      target_lambda_keys   = ["notification"]
    }
  }

  cloudwatch_lambda_functions = {
    for service_name, lambda_module in module.lambda :
    service_name => {
      function_name  = lambda_module.function_name
      log_group_name = lambda_module.log_group_name
    }
  }

  cloudwatch_dynamodb_tables = {
    for service_name, table_module in module.dynamodb :
    service_name => {
      table_name = table_module.table_name
    }
  }
}

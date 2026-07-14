locals {
  # Standard environment label used in names and tags.
  environment_name = var.environment

  # Shared tags for every table instantiated in this environment.
  common_tags = {
    Project     = var.project_name
    Environment = local.environment_name
    ManagedBy   = "Terraform"
    Owner       = var.owner
    CostCenter  = var.cost_center
  }

  # Table-level defaults keep the table map concise and readable.
  dynamodb_table_defaults = {
    point_in_time_recovery   = true
    deletion_protection      = var.environment == "prod"
    sort_key                 = null
    ttl_enabled              = false
    ttl_attribute            = null
    stream_enabled           = false
    stream_view_type         = "NEW_AND_OLD_IMAGES"
    global_secondary_indexes = []
    tags                     = {}
  }

  # FreshMart DynamoDB topology for the dev environment.
  dynamodb_tables = {
    auth_users = merge(local.dynamodb_table_defaults, {
      table_name    = "${var.project_name}-${local.environment_name}-auth-users"
      partition_key = "PK"
      sort_key      = "SK"
      ttl_enabled   = true
      ttl_attribute = "ttl"
      global_secondary_indexes = [
        {
          name            = "EmailIndex"
          partition_key   = "GSI1PK"
          sort_key        = "GSI1SK"
          projection_type = "ALL"
        },
      ]
    })

    user_profiles = merge(local.dynamodb_table_defaults, {
      table_name    = "${var.project_name}-${local.environment_name}-user-profiles"
      partition_key = "pk"
      sort_key      = "sk"
    })

    products = merge(local.dynamodb_table_defaults, {
      table_name    = "${var.project_name}-${local.environment_name}-products"
      partition_key = "productId"
      global_secondary_indexes = [
        {
          name            = "category-index"
          partition_key   = "category"
          projection_type = "ALL"
        },
        {
          name            = "brand-index"
          partition_key   = "brand"
          projection_type = "ALL"
        },
        {
          name            = "status-index"
          partition_key   = "status"
          projection_type = "ALL"
        },
      ]
    })

    catalog_items = merge(local.dynamodb_table_defaults, {
      table_name    = "${var.project_name}-${local.environment_name}-catalog-items"
      partition_key = "PK"
      sort_key      = "SK"
      global_secondary_indexes = [
        {
          name            = "CategoryIndex"
          partition_key   = "CategoryPK"
          sort_key        = "CategorySK"
          projection_type = "ALL"
        },
        {
          name            = "AvailabilityIndex"
          partition_key   = "AvailabilityPK"
          sort_key        = "AvailabilitySK"
          projection_type = "ALL"
        },
      ]
    })

    admin = merge(local.dynamodb_table_defaults, {
      table_name    = "${var.project_name}-${local.environment_name}-admin"
      partition_key = "pk"
      sort_key      = "sk"
      global_secondary_indexes = [
        {
          name            = "gsi1"
          partition_key   = "gsi1pk"
          sort_key        = "gsi1sk"
          projection_type = "ALL"
        },
        {
          name            = "gsi2"
          partition_key   = "gsi2pk"
          sort_key        = "gsi2sk"
          projection_type = "ALL"
        },
      ]
    })

    inventory = merge(local.dynamodb_table_defaults, {
      table_name    = "${var.project_name}-${local.environment_name}-inventory"
      partition_key = "productId"
      global_secondary_indexes = [
        {
          name            = "warehouse-index"
          partition_key   = "warehouseId"
          projection_type = "ALL"
        },
        {
          name            = "stockStatus-index"
          partition_key   = "stockStatus"
          projection_type = "ALL"
        },
      ]
    })

    carts = merge(local.dynamodb_table_defaults, {
      table_name    = "${var.project_name}-${local.environment_name}-carts"
      partition_key = "userId"
      sort_key      = "productId"
    })

    orders = merge(local.dynamodb_table_defaults, {
      table_name    = "${var.project_name}-${local.environment_name}-orders"
      partition_key = "orderId"
      global_secondary_indexes = [
        {
          name            = "customer-index"
          partition_key   = "customerId"
          projection_type = "ALL"
        },
        {
          name            = "status-index"
          partition_key   = "status"
          projection_type = "ALL"
        },
        {
          name            = "createdDate-index"
          partition_key   = "createdDate"
          projection_type = "ALL"
        },
      ]
    })

    payments = merge(local.dynamodb_table_defaults, {
      table_name    = "${var.project_name}-${local.environment_name}-payments"
      partition_key = "paymentId"
      global_secondary_indexes = [
        {
          name            = "order-index"
          partition_key   = "orderId"
          projection_type = "ALL"
        },
        {
          name            = "status-index"
          partition_key   = "status"
          projection_type = "ALL"
        },
      ]
    })

    notifications = merge(local.dynamodb_table_defaults, {
      table_name    = "${var.project_name}-${local.environment_name}-notifications"
      partition_key = "pk"
      sort_key      = "sk"
      global_secondary_indexes = [
        {
          name            = "gsi1"
          partition_key   = "gsi1pk"
          sort_key        = "gsi1sk"
          projection_type = "ALL"
        },
        {
          name            = "gsi2"
          partition_key   = "gsi2pk"
          sort_key        = "gsi2sk"
          projection_type = "ALL"
        },
      ]
    })

    analytics = merge(local.dynamodb_table_defaults, {
      table_name    = "${var.project_name}-${local.environment_name}-analytics"
      partition_key = "pk"
      sort_key      = "sk"
      global_secondary_indexes = [
        {
          name            = "gsi1"
          partition_key   = "gsi1pk"
          sort_key        = "gsi1sk"
          projection_type = "ALL"
        },
        {
          name            = "gsi2"
          partition_key   = "gsi2pk"
          sort_key        = "gsi2sk"
          projection_type = "ALL"
        },
      ]
    })
  }

  # Common IAM action sets keep per-service role definitions compact.
  iam_dynamodb_rw_actions = [
    "dynamodb:BatchGetItem",
    "dynamodb:BatchWriteItem",
    "dynamodb:ConditionCheckItem",
    "dynamodb:DeleteItem",
    "dynamodb:DescribeTable",
    "dynamodb:GetItem",
    "dynamodb:PutItem",
    "dynamodb:Query",
    "dynamodb:Scan",
    "dynamodb:TransactWriteItems",
    "dynamodb:UpdateItem",
  ]

  iam_dynamodb_ro_actions = [
    "dynamodb:BatchGetItem",
    "dynamodb:DescribeTable",
    "dynamodb:GetItem",
    "dynamodb:Query",
    "dynamodb:Scan",
  ]

  iam_eventbridge_bus_name = local.eventbridge_bus_name
  cognito_issuer           = "https://cognito-idp.${var.aws_region}.amazonaws.com/${module.cognito.user_pool_id}"
  cognito_jwks_url         = "${local.cognito_issuer}/.well-known/jwks.json"

  # IAM role matrix for all FreshMart services in this environment.
  iam_roles = {
    auth = {
      service_name = "auth-service"
      tags         = { Service = "Auth Service" }
      dynamodb_table_permissions = [
        {
          table_arn = module.dynamodb["auth_users"].table_arn
          actions   = local.iam_dynamodb_rw_actions
        }
      ]
      allow_eventbridge_put_events   = true
      eventbridge_bus_names          = [local.iam_eventbridge_bus_name]
      allow_eventbridge_read         = false
      allow_cognito_user_pool_access = true
      cognito_user_pool_arns         = [module.cognito.user_pool_arn]
      eventbridge_rule_name_prefixes = []
    }

    product = {
      service_name = "product-service"
      tags         = { Service = "Product Service" }
      dynamodb_table_permissions = [
        {
          table_arn = module.dynamodb["products"].table_arn
          actions   = local.iam_dynamodb_rw_actions
        }
      ]
      allow_eventbridge_put_events   = true
      eventbridge_bus_names          = [local.iam_eventbridge_bus_name]
      allow_eventbridge_read         = false
      eventbridge_rule_name_prefixes = []
    }

    inventory = {
      service_name = "inventory-service"
      tags         = { Service = "Inventory Service" }
      dynamodb_table_permissions = [
        {
          table_arn = module.dynamodb["inventory"].table_arn
          actions   = local.iam_dynamodb_rw_actions
        },
        {
          table_arn = module.dynamodb["products"].table_arn
          actions   = local.iam_dynamodb_ro_actions
        },
      ]
      allow_eventbridge_put_events   = true
      eventbridge_bus_names          = [local.iam_eventbridge_bus_name]
      allow_eventbridge_read         = false
      eventbridge_rule_name_prefixes = []
    }

    cart = {
      service_name = "cart-service"
      tags         = { Service = "Cart Service" }
      dynamodb_table_permissions = [
        {
          table_arn = module.dynamodb["carts"].table_arn
          actions   = local.iam_dynamodb_rw_actions
        },
        {
          table_arn = module.dynamodb["products"].table_arn
          actions   = local.iam_dynamodb_ro_actions
        },
        {
          table_arn = module.dynamodb["inventory"].table_arn
          actions   = local.iam_dynamodb_ro_actions
        },
      ]
      allow_eventbridge_put_events   = true
      eventbridge_bus_names          = [local.iam_eventbridge_bus_name]
      allow_eventbridge_read         = false
      eventbridge_rule_name_prefixes = []
    }

    order = {
      service_name = "order-service"
      tags         = { Service = "Order Service" }
      dynamodb_table_permissions = [
        {
          table_arn = module.dynamodb["orders"].table_arn
          actions   = local.iam_dynamodb_rw_actions
        },
        {
          table_arn = module.dynamodb["carts"].table_arn
          actions   = local.iam_dynamodb_ro_actions
        },
        {
          table_arn = module.dynamodb["inventory"].table_arn
          actions   = local.iam_dynamodb_ro_actions
        },
        {
          table_arn = module.dynamodb["products"].table_arn
          actions   = local.iam_dynamodb_ro_actions
        },
      ]
      allow_eventbridge_put_events   = true
      eventbridge_bus_names          = [local.iam_eventbridge_bus_name]
      allow_eventbridge_read         = false
      eventbridge_rule_name_prefixes = []
      allow_sns_publish              = true
      sns_topic_arns = [
        module.sns.topic_arns["order_ready"],
      ]
    }

    payment = {
      service_name = "payment-service"
      tags         = { Service = "Payment Service" }
      dynamodb_table_permissions = [
        {
          table_arn = module.dynamodb["payments"].table_arn
          actions   = local.iam_dynamodb_rw_actions
        },
        {
          table_arn = module.dynamodb["orders"].table_arn
          actions   = local.iam_dynamodb_ro_actions
        },
      ]
      allow_eventbridge_put_events   = true
      eventbridge_bus_names          = [local.iam_eventbridge_bus_name]
      allow_eventbridge_read         = false
      eventbridge_rule_name_prefixes = []
    }

    notification = {
      service_name = "notification-service"
      tags         = { Service = "Notification Service" }
      dynamodb_table_permissions = [
        {
          table_arn = module.dynamodb["notifications"].table_arn
          actions   = local.iam_dynamodb_rw_actions
        },
      ]
      allow_eventbridge_put_events   = true
      eventbridge_bus_names          = [local.iam_eventbridge_bus_name]
      allow_eventbridge_read         = false
      eventbridge_rule_name_prefixes = []
      allow_sns_publish              = true
      sns_topic_arns = [
        module.sns.topic_arns["notification"],
        module.sns.topic_arns["low_stock"],
        module.sns.topic_arns["order_placed"],
        module.sns.topic_arns["payment_success"],
        module.sns.topic_arns["report"],
      ]
      allow_sqs_send_message = true
      sqs_queue_arns = [
        module.sqs.queue_arn["notification"],
        module.sqs.queue_arn["inventory_events"],
        module.sqs.queue_arn["analytics"],
      ]
      allow_s3_object_access = true
      s3_object_arns         = [module.s3.object_arn]
    }

    menu = {
      service_name = "menu-service"
      tags         = { Service = "Menu Service" }
      dynamodb_table_permissions = [
        {
          table_arn = module.dynamodb["catalog_items"].table_arn
          actions   = local.iam_dynamodb_rw_actions
        }
      ]
      allow_eventbridge_put_events   = true
      eventbridge_bus_names          = [local.iam_eventbridge_bus_name]
      allow_eventbridge_read         = false
      eventbridge_rule_name_prefixes = []
      allow_sns_publish              = true
      sns_topic_arns = [
        module.sns.topic_arns["low_stock"],
        module.sns.topic_arns["order_placed"],
        module.sns.topic_arns["payment_success"],
        module.sns.topic_arns["report"],
      ]
      allow_sqs_send_message = true
      sqs_queue_arns = [
        module.sqs.queue_arn["inventory_events"],
        module.sqs.queue_arn["analytics"],
      ]
      allow_s3_object_access = true
      s3_object_arns         = [module.s3.object_arn]
    }

    analytics = {
      service_name = "analytics-service"
      tags         = { Service = "Analytics Service" }
      dynamodb_table_permissions = [
        {
          table_arn = module.dynamodb["analytics"].table_arn
          actions   = local.iam_dynamodb_rw_actions
        },
      ]
      allow_eventbridge_put_events   = true
      eventbridge_bus_names          = [local.iam_eventbridge_bus_name]
      allow_eventbridge_read         = false
      eventbridge_rule_name_prefixes = []
    }

    admin = {
      service_name = "admin-service"
      tags         = { Service = "Admin Service" }
      dynamodb_table_permissions = [
        {
          table_arn = module.dynamodb["admin"].table_arn
          actions   = local.iam_dynamodb_rw_actions
        }
      ]
      allow_eventbridge_put_events   = true
      eventbridge_bus_names          = [local.iam_eventbridge_bus_name]
      allow_eventbridge_read         = false
      eventbridge_rule_name_prefixes = []
      allow_s3_object_access         = true
      s3_object_arns                 = [module.s3.object_arn]
    }

    user = {
      service_name = "user-service"
      tags         = { Service = "User Service" }
      dynamodb_table_permissions = [
        {
          table_arn = module.dynamodb["user_profiles"].table_arn
          actions   = local.iam_dynamodb_rw_actions
        }
      ]
      allow_eventbridge_put_events   = false
      eventbridge_bus_names          = []
      allow_eventbridge_read         = false
      eventbridge_rule_name_prefixes = []
    }
  }

  # Lambda packaging lives outside the module so the ZIP path stays configurable.
  lambda_package_root     = coalesce(var.lambda_package_root, abspath("${path.root}/../../../services"))
  lambda_package_filename = var.lambda_package_filename

  # Common runtime settings keep the per-service Lambda definitions concise.
  lambda_common_settings = {
    runtime                        = "nodejs22.x"
    timeout                        = 30
    memory_size                    = 512
    architecture                   = "x86_64"
    publish                        = true
    tracing_mode                   = "Active"
    log_retention_in_days          = 30
    log_group_kms_key_id           = null
    reserved_concurrent_executions = null
    dead_letter_config             = null
    ephemeral_storage              = null
    layers                         = []
    permissions                    = []
    tags                           = { Component = "Lambda" }
    subnet_ids                     = module.network.private_subnet_ids
    security_group_ids             = [module.network.lambda_security_group_id]
  }

  lambda_common_environment = {
    NODE_ENV                    = var.environment
    LOG_LEVEL                   = var.lambda_log_level
    API_VERSION                 = "v1"
    INTERNAL_SERVICE_TOKEN      = var.internal_service_token
    COGNITO_REGION              = var.aws_region
    COGNITO_USER_POOL_ID        = module.cognito.user_pool_id
    COGNITO_USER_POOL_CLIENT_ID = module.cognito.user_pool_client_id
    COGNITO_USER_POOL_ISSUER    = local.cognito_issuer
    COGNITO_JWKS_URL            = local.cognito_jwks_url
    COGNITO_HOSTED_UI_DOMAIN    = coalesce(module.cognito.user_pool_domain, "")
    COGNITO_GROUP_ADMINS        = module.cognito.group_names["admins"]
    COGNITO_GROUP_STAFF         = module.cognito.group_names["staff"]
    COGNITO_GROUP_CUSTOMERS     = module.cognito.group_names["customers"]
    COGNITO_MFA_CONFIGURATION   = "OPTIONAL"
  }

  # FreshMart Lambda topology for the dev environment.
  lambda_functions = {
    auth = merge(local.lambda_common_settings, {
      function_name = "${var.project_name}-${local.environment_name}-auth-service"
      service_name  = "auth-service"
      description   = "FreshMart auth service Lambda."
      filename      = "${local.lambda_package_root}/auth-service/${local.lambda_package_filename}"
      handler       = "src/lambda.handler"
      role_arn      = module.iam["auth"].role_arn
      environment_variables = merge(local.lambda_common_environment, {
        SERVICE_NAME         = "auth-service"
        AWS_EVENT_BUS_NAME   = local.eventbridge_bus_name
        AWS_EVENT_SOURCE     = "auth-service"
        DDB_TABLE_AUTH_USERS = module.dynamodb["auth_users"].table_name
      })
    })

    product = merge(local.lambda_common_settings, {
      function_name = "${var.project_name}-${local.environment_name}-product-service"
      service_name  = "product-service"
      description   = "FreshMart product service Lambda."
      filename      = "${local.lambda_package_root}/product-service/${local.lambda_package_filename}"
      handler       = "src/lambda.handler"
      role_arn      = module.iam["product"].role_arn
      environment_variables = merge(local.lambda_common_environment, {
        SERVICE_NAME       = "product-service"
        AWS_EVENT_BUS_NAME = local.eventbridge_bus_name
        AWS_EVENT_SOURCE   = "product-service"
        DDB_TABLE_PRODUCTS = module.dynamodb["products"].table_name
      })
    })

    menu = merge(local.lambda_common_settings, {
      function_name = "${var.project_name}-${local.environment_name}-menu-service"
      service_name  = "menu-service"
      description   = "FreshMart menu service Lambda."
      filename      = "${local.lambda_package_root}/menu-service/${local.lambda_package_filename}"
      handler       = "src/lambda.handler"
      role_arn      = module.iam["menu"].role_arn
      environment_variables = merge(local.lambda_common_environment, {
        SERVICE_NAME            = "menu-service"
        AWS_EVENT_BUS_NAME      = local.eventbridge_bus_name
        AWS_EVENT_SOURCE        = "menu-service"
        DDB_TABLE_CATALOG_ITEMS = module.dynamodb["catalog_items"].table_name
      })
    })

    inventory = merge(local.lambda_common_settings, {
      function_name = "${var.project_name}-${local.environment_name}-inventory-service"
      service_name  = "inventory-service"
      description   = "FreshMart inventory service Lambda."
      filename      = "${local.lambda_package_root}/inventory-service/${local.lambda_package_filename}"
      handler       = "src/lambda.handler"
      role_arn      = module.iam["inventory"].role_arn
      environment_variables = merge(local.lambda_common_environment, {
        SERVICE_NAME        = "inventory-service"
        AWS_EVENT_BUS_NAME  = local.eventbridge_bus_name
        AWS_EVENT_SOURCE    = "inventory-service"
        DDB_TABLE_INVENTORY = module.dynamodb["inventory"].table_name
        DDB_TABLE_PRODUCTS  = module.dynamodb["products"].table_name
      })
    })

    cart = merge(local.lambda_common_settings, {
      function_name = "${var.project_name}-${local.environment_name}-cart-service"
      service_name  = "cart-service"
      description   = "FreshMart cart service Lambda."
      filename      = "${local.lambda_package_root}/cart-service/${local.lambda_package_filename}"
      handler       = "src/lambda.handler"
      role_arn      = module.iam["cart"].role_arn
      environment_variables = merge(local.lambda_common_environment, {
        SERVICE_NAME        = "cart-service"
        AWS_EVENT_BUS_NAME  = local.eventbridge_bus_name
        AWS_EVENT_SOURCE    = "cart-service"
        TAX_PERCENTAGE      = "5"
        DDB_TABLE_CARTS     = module.dynamodb["carts"].table_name
        DDB_TABLE_PRODUCTS  = module.dynamodb["products"].table_name
        DDB_TABLE_INVENTORY = module.dynamodb["inventory"].table_name
      })
    })

    admin = merge(local.lambda_common_settings, {
      function_name = "${var.project_name}-${local.environment_name}-admin-service"
      service_name  = "admin-service"
      description   = "FreshMart admin service Lambda."
      filename      = "${local.lambda_package_root}/admin-service/${local.lambda_package_filename}"
      handler       = "src/lambda.handler"
      role_arn      = module.iam["admin"].role_arn
      environment_variables = merge(local.lambda_common_environment, {
        SERVICE_NAME       = "admin-service"
        AWS_EVENT_BUS_NAME = local.eventbridge_bus_name
        AWS_EVENT_SOURCE   = "admin-service"
        DDB_TABLE_ADMIN    = module.dynamodb["admin"].table_name
      })
    })

    user = merge(local.lambda_common_settings, {
      function_name = "${var.project_name}-${local.environment_name}-user-service"
      service_name  = "user-service"
      description   = "FreshMart user service Lambda."
      filename      = "${local.lambda_package_root}/user-service/${local.lambda_package_filename}"
      handler       = "src/lambda.handler"
      role_arn      = module.iam["user"].role_arn
      environment_variables = merge(local.lambda_common_environment, {
        SERVICE_NAME            = "user-service"
        DDB_TABLE_USER_PROFILES = module.dynamodb["user_profiles"].table_name
      })
    })

    order = merge(local.lambda_common_settings, {
      function_name = "${var.project_name}-${local.environment_name}-order-service"
      service_name  = "order-service"
      description   = "FreshMart order service Lambda."
      filename      = "${local.lambda_package_root}/order-service/${local.lambda_package_filename}"
      handler       = "src/lambda.handler"
      role_arn      = module.iam["order"].role_arn
      environment_variables = merge(local.lambda_common_environment, {
        SERVICE_NAME                  = "order-service"
        AWS_EVENT_BUS_NAME            = local.eventbridge_bus_name
        AWS_EVENT_SOURCE              = "order-service"
        DDB_TABLE_ORDERS              = module.dynamodb["orders"].table_name
        DDB_TABLE_CARTS               = module.dynamodb["carts"].table_name
        DDB_TABLE_INVENTORY           = module.dynamodb["inventory"].table_name
        DDB_TABLE_PRODUCTS            = module.dynamodb["products"].table_name
        AWS_SNS_ORDER_READY_TOPIC_ARN = module.sns.topic_arns["order_ready"]
      })
    })

    payment = merge(local.lambda_common_settings, {
      function_name = "${var.project_name}-${local.environment_name}-payment-service"
      service_name  = "payment-service"
      description   = "FreshMart payment service Lambda."
      filename      = "${local.lambda_package_root}/payment-service/${local.lambda_package_filename}"
      handler       = "src/lambda.handler"
      role_arn      = module.iam["payment"].role_arn
      environment_variables = merge(local.lambda_common_environment, {
        SERVICE_NAME       = "payment-service"
        AWS_EVENT_BUS_NAME = local.eventbridge_bus_name
        AWS_EVENT_SOURCE   = "payment-service"
        DDB_TABLE_PAYMENTS = module.dynamodb["payments"].table_name
        DDB_TABLE_ORDERS   = module.dynamodb["orders"].table_name
      })
    })

    notification = merge(local.lambda_common_settings, {
      function_name = "${var.project_name}-${local.environment_name}-notification-service"
      service_name  = "notification-service"
      description   = "FreshMart notification service Lambda."
      filename      = "${local.lambda_package_root}/notification-service/${local.lambda_package_filename}"
      handler       = "src/lambda.handler"
      role_arn      = module.iam["notification"].role_arn
      environment_variables = merge(local.lambda_common_environment, {
        SERVICE_NAME                      = "notification-service"
        AWS_EVENT_BUS_NAME                = local.eventbridge_bus_name
        AWS_EVENT_SOURCE                  = "notification-service"
        DDB_TABLE_NOTIFICATIONS           = module.dynamodb["notifications"].table_name
        AWS_S3_BUCKET                     = module.s3.bucket_name
        AWS_SNS_NOTIFICATION_TOPIC_ARN    = module.sns.topic_arns["notification"]
        AWS_SNS_LOW_STOCK_TOPIC_ARN       = module.sns.topic_arns["low_stock"]
        AWS_SNS_ORDER_PLACED_TOPIC_ARN    = module.sns.topic_arns["order_placed"]
        AWS_SNS_PAYMENT_SUCCESS_TOPIC_ARN = module.sns.topic_arns["payment_success"]
        AWS_SNS_REPORT_TOPIC_ARN          = module.sns.topic_arns["report"]
        AWS_SQS_NOTIFICATION_QUEUE_URL    = module.sqs.queue_url["notification"]
        AWS_SQS_NOTIFICATION_DLQ_URL      = module.sqs.dlq_url["notification"]
        AWS_SQS_INVENTORY_QUEUE_URL       = module.sqs.queue_url["inventory_events"]
        AWS_SQS_INVENTORY_DLQ_URL         = module.sqs.dlq_url["inventory_events"]
        AWS_SQS_ANALYTICS_QUEUE_URL       = module.sqs.queue_url["analytics"]
        AWS_SQS_ANALYTICS_DLQ_URL         = module.sqs.dlq_url["analytics"]
      })
    })

    analytics = merge(local.lambda_common_settings, {
      function_name = "${var.project_name}-${local.environment_name}-analytics-service"
      service_name  = "analytics-service"
      description   = "FreshMart analytics service Lambda."
      filename      = "${local.lambda_package_root}/analytics-service/${local.lambda_package_filename}"
      handler       = "src/lambda.handler"
      role_arn      = module.iam["analytics"].role_arn
      environment_variables = merge(local.lambda_common_environment, {
        SERVICE_NAME                      = "analytics-service"
        AWS_EVENT_BUS_NAME                = local.eventbridge_bus_name
        AWS_EVENT_SOURCE                  = "analytics-service"
        DDB_TABLE_ANALYTICS               = module.dynamodb["analytics"].table_name
        AWS_S3_BUCKET                     = module.s3.bucket_name
        AWS_SNS_LOW_STOCK_TOPIC_ARN       = module.sns.topic_arns["low_stock"]
        AWS_SNS_ORDER_PLACED_TOPIC_ARN    = module.sns.topic_arns["order_placed"]
        AWS_SNS_PAYMENT_SUCCESS_TOPIC_ARN = module.sns.topic_arns["payment_success"]
        AWS_SNS_REPORT_TOPIC_ARN          = module.sns.topic_arns["report"]
        AWS_SQS_INVENTORY_QUEUE_URL       = module.sqs.queue_url["inventory_events"]
        AWS_SQS_INVENTORY_DLQ_URL         = module.sqs.dlq_url["inventory_events"]
        AWS_SQS_ANALYTICS_QUEUE_URL       = module.sqs.queue_url["analytics"]
        AWS_SQS_ANALYTICS_DLQ_URL         = module.sqs.dlq_url["analytics"]
      })
    })
  }

  # API Gateway uses the Lambda outputs directly so integrations stay decoupled.
  api_name = "${var.project_name}-${local.environment_name}-api"

  api_gateway_lambdas = {
    for name, fn in module.lambda : name => {
      function_name = fn.function_name
      function_arn  = fn.function_arn
      invoke_arn    = fn.invoke_arn
    }
  }

  # Route definitions are centralized once and reused by the HTTP API module.
  api_gateway_routes = {
    auth_register = {
      method     = "POST"
      path       = "/auth/register"
      lambda_key = "auth"
    }
    auth_login = {
      method     = "POST"
      path       = "/auth/login"
      lambda_key = "auth"
    }
    auth_refresh = {
      method     = "POST"
      path       = "/auth/refresh"
      lambda_key = "auth"
    }
    auth_logout = {
      method     = "POST"
      path       = "/auth/logout"
      lambda_key = "auth"
    }
    auth_me = {
      method             = "GET"
      path               = "/auth/me"
      lambda_key         = "auth"
      authorization_type = "JWT"
    }

    products_list = {
      method     = "GET"
      path       = "/products"
      lambda_key = "product"
    }
    products_get = {
      method     = "GET"
      path       = "/products/{id}"
      lambda_key = "product"
    }
    products_create = {
      method     = "POST"
      path       = "/products"
      lambda_key = "product"
    }
    products_update = {
      method     = "PUT"
      path       = "/products/{id}"
      lambda_key = "product"
    }
    products_delete = {
      method     = "DELETE"
      path       = "/products/{id}"
      lambda_key = "product"
    }

    menu_search = {
      method     = "GET"
      path       = "/menu/search"
      lambda_key = "menu"
    }
    menu_list = {
      method     = "GET"
      path       = "/menu"
      lambda_key = "menu"
    }
    menu_get = {
      method     = "GET"
      path       = "/menu/{id}"
      lambda_key = "menu"
    }
    menu_create = {
      method     = "POST"
      path       = "/menu"
      lambda_key = "menu"
    }
    menu_update = {
      method     = "PATCH"
      path       = "/menu/{id}"
      lambda_key = "menu"
    }
    menu_availability = {
      method     = "PATCH"
      path       = "/menu/{id}/availability"
      lambda_key = "menu"
    }
    menu_delete = {
      method     = "DELETE"
      path       = "/menu/{id}"
      lambda_key = "menu"
    }

    inventory_list = {
      method     = "GET"
      path       = "/inventory"
      lambda_key = "inventory"
    }
    inventory_update = {
      method     = "PUT"
      path       = "/inventory/{productId}"
      lambda_key = "inventory"
    }
    cart_get = {
      method     = "GET"
      path       = "/cart"
      lambda_key = "cart"
    }
    cart_create = {
      method     = "POST"
      path       = "/cart"
      lambda_key = "cart"
    }
    cart_delete = {
      method     = "DELETE"
      path       = "/cart/{productId}"
      lambda_key = "cart"
    }
    orders_create = {
      method     = "POST"
      path       = "/orders"
      lambda_key = "order"
    }
    orders_get = {
      method     = "GET"
      path       = "/orders/{orderId}"
      lambda_key = "order"
    }
    orders_cancel = {
      method     = "PUT"
      path       = "/orders/{orderId}/cancel"
      lambda_key = "order"
    }
    payments_create = {
      method     = "POST"
      path       = "/payments"
      lambda_key = "payment"
    }
    payments_get = {
      method     = "GET"
      path       = "/payments/{paymentId}"
      lambda_key = "payment"
    }

    admin_health = {
      method     = "GET"
      path       = "/admin/health"
      lambda_key = "admin"
    }
    admin_dashboard = {
      method     = "GET"
      path       = "/admin/dashboard"
      lambda_key = "admin"
    }
    admin_config_get = {
      method     = "GET"
      path       = "/admin/config"
      lambda_key = "admin"
    }
    admin_config_put = {
      method     = "PUT"
      path       = "/admin/config"
      lambda_key = "admin"
    }
    admin_audit = {
      method     = "GET"
      path       = "/admin/audit"
      lambda_key = "admin"
    }
  }

  # EventBridge wiring keeps the shared bus, rules, and consumers centralized.
  eventbridge_bus_name = "${var.project_name}-events"

  eventbridge_lambda_targets = {
    notification = {
      function_name = module.lambda["notification"].function_name
      function_arn  = module.lambda["notification"].function_arn
    }
    analytics = {
      function_name = module.lambda["analytics"].function_name
      function_arn  = module.lambda["analytics"].function_arn
    }
  }

  eventbridge_rules = {
    auth = {
      description          = "Match FreshMart auth domain events."
      sources              = ["auth-service"]
      detail_type_prefixes = ["UserRegistered"]
      target_lambda_keys   = ["notification", "analytics"]
    }
    product = {
      description          = "Match FreshMart product domain events."
      sources              = ["product-service"]
      detail_type_prefixes = ["Product"]
      target_lambda_keys   = ["notification", "analytics"]
    }
    menu = {
      description          = "Match FreshMart menu domain events."
      sources              = ["menu-service"]
      detail_type_prefixes = ["Food"]
      target_lambda_keys   = ["notification", "analytics"]
    }
    inventory = {
      description          = "Match FreshMart inventory domain events."
      sources              = ["inventory-service"]
      detail_type_prefixes = ["Inventory"]
      target_lambda_keys   = ["notification", "analytics"]
    }
    cart = {
      description          = "Match FreshMart cart domain events."
      sources              = ["cart-service"]
      detail_type_prefixes = ["Cart"]
      target_lambda_keys   = ["notification", "analytics"]
    }
    order = {
      description          = "Match FreshMart order domain events."
      sources              = ["order-service"]
      detail_type_prefixes = ["Order"]
      target_lambda_keys   = ["notification", "analytics"]
    }
    payment = {
      description          = "Match FreshMart payment domain events."
      sources              = ["payment-service"]
      detail_type_prefixes = ["Payment"]
      target_lambda_keys   = ["notification", "analytics"]
    }
    admin = {
      description          = "Match FreshMart admin domain events."
      sources              = ["admin-service"]
      detail_type_prefixes = ["Admin"]
      target_lambda_keys   = ["notification", "analytics"]
    }
  }

  # CloudWatch wiring centralizes observability inputs for the reusable module.
  cloudwatch_lambda_functions = {
    for name, fn in module.lambda : name => {
      function_name  = fn.function_name
      log_group_name = fn.log_group_name
    }
  }

  cloudwatch_dynamodb_tables = {
    for name, table in module.dynamodb : name => {
      table_name = table.table_name
    }
  }

  cloudwatch_api_id         = module.apigateway.api_id
  cloudwatch_api_stage_name = "v1"

  # SNS topics provide reusable notification targets across environments.
  sns_topics = {
    low_stock = {
      name = "${var.project_name}-${local.environment_name}-low-stock"
    }
    order_placed = {
      name = "${var.project_name}-${local.environment_name}-order-placed"
    }
    order_ready = {
      name = "${var.project_name}-${local.environment_name}-order-ready"
    }
    order_events = {
      name = "${var.project_name}-${local.environment_name}-order-events"
    }
    payment_events = {
      name = "${var.project_name}-${local.environment_name}-payment-events"
    }
    payment_success = {
      name = "${var.project_name}-${local.environment_name}-payment-success"
    }
    notification = {
      name = "${var.project_name}-${local.environment_name}-notification"
    }
    report = {
      name = "${var.project_name}-${local.environment_name}-report"
    }
  }

  # SQS queues provide durable workflow buffers and optional SNS fan-in.
  sqs_queues = {
    inventory_events = {
      name                      = "${var.project_name}-${local.environment_name}-inventory-events"
      sns_topic_keys            = ["low_stock"]
      receive_wait_time_seconds = 20
    }
    order_processing = {
      name                      = "${var.project_name}-${local.environment_name}-order-processing"
      sns_topic_keys            = ["order_events"]
      receive_wait_time_seconds = 20
    }
    payment_processing = {
      name                      = "${var.project_name}-${local.environment_name}-payment-processing"
      sns_topic_keys            = ["payment_events"]
      receive_wait_time_seconds = 20
    }
    analytics = {
      name                      = "${var.project_name}-${local.environment_name}-analytics"
      receive_wait_time_seconds = 20
    }
    notification = {
      name                      = "${var.project_name}-${local.environment_name}-notification"
      sns_topic_keys            = ["notification"]
      receive_wait_time_seconds = 20
    }
  }
}

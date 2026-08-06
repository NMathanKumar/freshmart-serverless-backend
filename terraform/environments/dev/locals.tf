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
        {
          name            = "gsi3"
          partition_key   = "gsi3pk"
          sort_key        = "gsi3sk"
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

    coupon = merge(local.dynamodb_table_defaults, {
      table_name    = "${var.project_name}-${local.environment_name}-coupon"
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

    warehouses = merge(local.dynamodb_table_defaults, {
      table_name    = "${var.project_name}-${local.environment_name}-warehouses"
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
      allow_sqs_receive_message      = true
      sqs_queue_arns                 = [module.sqs.queue_arn["inventory_processing"]]
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
          actions   = local.iam_dynamodb_rw_actions
        },
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
      allow_sns_publish              = false
      sns_topic_arns                 = []
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
      allow_sns_publish              = false
      sns_topic_arns = [
      ]
      allow_sqs_receive_message = true
      sqs_queue_arns            = [module.sqs.queue_arn["notification_processing"]]
      allow_s3_object_access    = true
      s3_object_arns            = [module.s3.object_arn]
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
      allow_sns_publish              = false
      sns_topic_arns                 = []
      allow_sqs_receive_message      = true
      sqs_queue_arns                 = [module.sqs.queue_arn["inventory_processing"]]
      allow_s3_object_access         = true
      s3_object_arns                 = [module.s3.object_arn]
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
      allow_sqs_receive_message      = true
      sqs_queue_arns                 = [module.sqs.queue_arn["analytics_processing"]]
    }

    coupon = {
      service_name = "coupon-service"
      tags         = { Service = "Coupon Service" }
      dynamodb_table_permissions = [
        {
          table_arn = module.dynamodb["coupon"].table_arn
          actions   = local.iam_dynamodb_rw_actions
        },
      ]
      allow_eventbridge_put_events   = true
      eventbridge_bus_names          = [local.iam_eventbridge_bus_name]
      allow_eventbridge_read         = false
      eventbridge_rule_name_prefixes = []
    }

    warehouse = {
      service_name = "warehouse-service"
      tags         = { Service = "Warehouse Service" }
      dynamodb_table_permissions = [
        {
          table_arn = module.dynamodb["warehouses"].table_arn
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
        },
        {
          table_arn = module.dynamodb["orders"].table_arn
          actions   = local.iam_dynamodb_rw_actions
        },
        {
          table_arn = module.dynamodb["products"].table_arn
          actions   = local.iam_dynamodb_rw_actions
        },
        {
          table_arn = module.dynamodb["inventory"].table_arn
          actions   = local.iam_dynamodb_rw_actions
        },
        {
          table_arn = module.dynamodb["carts"].table_arn
          actions   = local.iam_dynamodb_rw_actions
        },
        {
          table_arn = module.dynamodb["payments"].table_arn
          actions   = local.iam_dynamodb_rw_actions
        },
        {
          table_arn = module.dynamodb["catalog_items"].table_arn
          actions   = local.iam_dynamodb_rw_actions
        },
        {
          table_arn = module.dynamodb["user_profiles"].table_arn
          actions   = local.iam_dynamodb_rw_actions
        },
        {
          table_arn = module.dynamodb["analytics"].table_arn
          actions   = local.iam_dynamodb_rw_actions
        },
        {
          table_arn = module.dynamodb["warehouses"].table_arn
          actions   = local.iam_dynamodb_rw_actions
        },
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

    customer_bff = {
      service_name = "customer-bff-service"
      tags         = { Service = "Customer BFF Service" }
      dynamodb_table_permissions = [
        {
          table_arn = module.dynamodb["products"].table_arn
          actions   = local.iam_dynamodb_ro_actions
        },
        {
          table_arn = module.dynamodb["catalog_items"].table_arn
          actions   = local.iam_dynamodb_ro_actions
        },
        {
          table_arn = module.dynamodb["carts"].table_arn
          actions   = local.iam_dynamodb_rw_actions
        },
        {
          table_arn = module.dynamodb["orders"].table_arn
          actions   = local.iam_dynamodb_rw_actions
        },
        {
          table_arn = module.dynamodb["user_profiles"].table_arn
          actions   = local.iam_dynamodb_rw_actions
        },
        {
          table_arn = module.dynamodb["notifications"].table_arn
          actions   = local.iam_dynamodb_rw_actions
        }
      ]
      allow_eventbridge_put_events   = true
      eventbridge_bus_names          = [local.iam_eventbridge_bus_name]
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
        SERVICE_NAME        = "order-service"
        AWS_EVENT_BUS_NAME  = local.eventbridge_bus_name
        AWS_EVENT_SOURCE    = "order-service"
        DDB_TABLE_ORDERS    = module.dynamodb["orders"].table_name
        DDB_TABLE_CARTS     = module.dynamodb["carts"].table_name
        DDB_TABLE_INVENTORY = module.dynamodb["inventory"].table_name
        DDB_TABLE_PRODUCTS  = module.dynamodb["products"].table_name
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
        SERVICE_NAME            = "notification-service"
        AWS_EVENT_BUS_NAME      = local.eventbridge_bus_name
        AWS_EVENT_SOURCE        = "notification-service"
        DDB_TABLE_NOTIFICATIONS = module.dynamodb["notifications"].table_name
        AWS_S3_BUCKET           = module.s3.bucket_name
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
        SERVICE_NAME        = "analytics-service"
        AWS_EVENT_BUS_NAME  = local.eventbridge_bus_name
        AWS_EVENT_SOURCE    = "analytics-service"
        DDB_TABLE_ANALYTICS = module.dynamodb["analytics"].table_name
        AWS_S3_BUCKET       = module.s3.bucket_name
      })
    })

    coupon = merge(local.lambda_common_settings, {
      function_name = "${var.project_name}-${local.environment_name}-coupon-service"
      service_name  = "coupon-service"
      description   = "FreshMart coupon service Lambda."
      filename      = "${local.lambda_package_root}/coupon-service/${local.lambda_package_filename}"
      handler       = "src/lambda.handler"
      role_arn      = module.iam["coupon"].role_arn
      environment_variables = merge(local.lambda_common_environment, {
        SERVICE_NAME       = "coupon-service"
        AWS_EVENT_BUS_NAME = local.eventbridge_bus_name
        AWS_EVENT_SOURCE   = "coupon-service"
        DDB_TABLE_COUPON   = module.dynamodb["coupon"].table_name
      })
    })

    warehouse = merge(local.lambda_common_settings, {
      function_name = "${var.project_name}-${local.environment_name}-warehouse-service"
      service_name  = "warehouse-service"
      description   = "FreshMart warehouse service Lambda."
      filename      = "${local.lambda_package_root}/warehouse-service/${local.lambda_package_filename}"
      handler       = "src/lambda.handler"
      role_arn      = module.iam["warehouse"].role_arn
      environment_variables = merge(local.lambda_common_environment, {
        SERVICE_NAME         = "warehouse-service"
        AWS_EVENT_BUS_NAME   = local.eventbridge_bus_name
        AWS_EVENT_SOURCE     = "warehouse-service"
        DDB_TABLE_WAREHOUSES = module.dynamodb["warehouses"].table_name
      })
    })

    customer_bff = merge(local.lambda_common_settings, {
      function_name = "${var.project_name}-${local.environment_name}-customer-bff-service"
      service_name  = "customer-bff-service"
      description   = "FreshMart customer bff service Lambda."
      filename      = "${local.lambda_package_root}/customer-bff-service/${local.lambda_package_filename}"
      handler       = "src/lambda.handler"
      role_arn      = module.iam["customer_bff"].role_arn
      environment_variables = merge(local.lambda_common_environment, {
        SERVICE_NAME                  = "customer-bff-service"
        AWS_EVENT_BUS_NAME            = local.eventbridge_bus_name
        AWS_EVENT_SOURCE              = "customer-bff-service"
        COGNITO_APP_CLIENT_ID         = module.cognito.user_pool_client_id
        CUSTOMER_CATALOG_API_URL      = "https://${module.apigateway.api_id}.execute-api.${var.aws_region}.amazonaws.com/v1"
        CUSTOMER_CATEGORY_API_URL     = "https://${module.apigateway.api_id}.execute-api.${var.aws_region}.amazonaws.com/v1"
        CUSTOMER_CART_API_URL         = "https://${module.apigateway.api_id}.execute-api.${var.aws_region}.amazonaws.com/v1"
        CUSTOMER_ORDER_API_URL        = "https://${module.apigateway.api_id}.execute-api.${var.aws_region}.amazonaws.com/v1"
        CUSTOMER_USER_API_URL         = "https://${module.apigateway.api_id}.execute-api.${var.aws_region}.amazonaws.com/v1"
        CUSTOMER_WISHLIST_API_URL     = "https://${module.apigateway.api_id}.execute-api.${var.aws_region}.amazonaws.com/v1"
        CUSTOMER_NOTIFICATION_API_URL = "https://${module.apigateway.api_id}.execute-api.${var.aws_region}.amazonaws.com/v1"
        CUSTOMER_PROMOTIONS_API_URL   = "https://${module.apigateway.api_id}.execute-api.${var.aws_region}.amazonaws.com/v1"
        CUSTOMER_COUPON_API_URL       = "https://${module.apigateway.api_id}.execute-api.${var.aws_region}.amazonaws.com/v1"
        DDB_TABLE_PRODUCTS            = module.dynamodb["products"].table_name
        DDB_TABLE_CATALOG_ITEMS       = module.dynamodb["catalog_items"].table_name
        DDB_TABLE_CARTS               = module.dynamodb["carts"].table_name
        DDB_TABLE_ORDERS              = module.dynamodb["orders"].table_name
        DDB_TABLE_USER_PROFILES       = module.dynamodb["user_profiles"].table_name
        DDB_TABLE_NOTIFICATIONS       = module.dynamodb["notifications"].table_name
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
    auth_verify_email_request = {
      method             = "POST"
      path               = "/auth/verification/email/request"
      lambda_key         = "auth"
      authorization_type = "JWT"
    }
    auth_verify_email_confirm = {
      method             = "POST"
      path               = "/auth/verification/email/confirm"
      lambda_key         = "auth"
      authorization_type = "JWT"
    }
    auth_forgot_password = {
      method     = "POST"
      path       = "/auth/forgot-password"
      lambda_key = "auth"
    }
    auth_confirm_password = {
      method     = "POST"
      path       = "/auth/confirm-password"
      lambda_key = "auth"
    }
    auth_change_password = {
      method             = "POST"
      path               = "/auth/change-password"
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
      method             = "POST"
      path               = "/products"
      lambda_key         = "product"
      authorization_type = "JWT"
    }
    products_update = {
      method             = "PUT"
      path               = "/products/{id}"
      lambda_key         = "product"
      authorization_type = "JWT"
    }
    products_delete = {
      method             = "DELETE"
      path               = "/products/{id}"
      lambda_key         = "product"
      authorization_type = "JWT"
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
      method             = "POST"
      path               = "/menu"
      lambda_key         = "menu"
      authorization_type = "JWT"
    }
    menu_update = {
      method             = "PATCH"
      path               = "/menu/{id}"
      lambda_key         = "menu"
      authorization_type = "JWT"
    }
    menu_availability = {
      method             = "PATCH"
      path               = "/menu/{id}/availability"
      lambda_key         = "menu"
      authorization_type = "JWT"
    }
    menu_delete = {
      method             = "DELETE"
      path               = "/menu/{id}"
      lambda_key         = "menu"
      authorization_type = "JWT"
    }

    inventory_list = {
      method     = "GET"
      path       = "/inventory"
      lambda_key = "inventory"
    }
    inventory_update = {
      method             = "PUT"
      path               = "/inventory/{productId}"
      lambda_key         = "inventory"
      authorization_type = "JWT"
    }
    cart_get = {
      method             = "GET"
      path               = "/cart"
      lambda_key         = "cart"
      authorization_type = "JWT"
    }
    cart_create = {
      method             = "POST"
      path               = "/cart"
      lambda_key         = "cart"
      authorization_type = "JWT"
    }
    cart_delete = {
      method             = "DELETE"
      path               = "/cart/{productId}"
      lambda_key         = "cart"
      authorization_type = "JWT"
    }
    cart_add_items = {
      method             = "POST"
      path               = "/cart/items"
      lambda_key         = "cart"
      authorization_type = "JWT"
    }
    cart_update_item = {
      method             = "PATCH"
      path               = "/cart/items/{productId}"
      lambda_key         = "cart"
      authorization_type = "JWT"
    }
    cart_delete_item = {
      method             = "DELETE"
      path               = "/cart/items/{productId}"
      lambda_key         = "cart"
      authorization_type = "JWT"
    }
    orders_list = {
      method             = "GET"
      path               = "/orders"
      lambda_key         = "order"
      authorization_type = "JWT"
    }
    orders_create = {
      method             = "POST"
      path               = "/orders"
      lambda_key         = "order"
      authorization_type = "JWT"
    }
    orders_get = {
      method             = "GET"
      path               = "/orders/{orderId}"
      lambda_key         = "order"
      authorization_type = "JWT"
    }
    orders_cancel = {
      method             = "PUT"
      path               = "/orders/{orderId}/cancel"
      lambda_key         = "order"
      authorization_type = "JWT"
    }
    payments_create = {
      method             = "POST"
      path               = "/payments"
      lambda_key         = "payment"
      authorization_type = "JWT"
    }
    payments_get = {
      method             = "GET"
      path               = "/payments/{paymentId}"
      lambda_key         = "payment"
      authorization_type = "JWT"
    }

    admin_health = {
      method     = "GET"
      path       = "/admin/health"
      lambda_key = "admin"
    }
    admin_dashboard = {
      method             = "GET"
      path               = "/admin/dashboard"
      lambda_key         = "admin"
      authorization_type = "JWT"
    }
    admin_config_get = {
      method             = "GET"
      path               = "/admin/config"
      lambda_key         = "admin"
      authorization_type = "JWT"
    }
    admin_config_put = {
      method             = "PUT"
      path               = "/admin/config"
      lambda_key         = "admin"
      authorization_type = "JWT"
    }
    admin_audit = {
      method             = "GET"
      path               = "/admin/audit"
      lambda_key         = "admin"
      authorization_type = "JWT"
    }

    customer_home_get = {
      method             = "GET"
      path               = "/customer/home"
      lambda_key         = "customer_bff"
      authorization_type = "NONE"
    }
    customer_categories_get = {
      method             = "GET"
      path               = "/customer/categories"
      lambda_key         = "customer_bff"
      authorization_type = "NONE"
    }
    customer_product_get = {
      method             = "GET"
      path               = "/customer/products/{productId}"
      lambda_key         = "customer_bff"
      authorization_type = "NONE"
    }
    customer_cart_get = {
      method             = "GET"
      path               = "/customer/cart"
      lambda_key         = "customer_bff"
      authorization_type = "JWT"
    }
    customer_checkout_get = {
      method             = "GET"
      path               = "/customer/checkout"
      lambda_key         = "customer_bff"
      authorization_type = "JWT"
    }

    user_profile_get = {
      method             = "GET"
      path               = "/users/profile"
      lambda_key         = "user"
      authorization_type = "JWT"
    }
    user_profile_put = {
      method             = "PUT"
      path               = "/users/profile"
      lambda_key         = "user"
      authorization_type = "JWT"
    }
    user_addresses_post = {
      method             = "POST"
      path               = "/users/addresses"
      lambda_key         = "user"
      authorization_type = "JWT"
    }
    coupon_admin = {
      method             = "ANY"
      path               = "/admin/coupons/{proxy+}"
      lambda_key         = "coupon"
      authorization_type = "JWT"
    }
    coupon_validate = {
      method             = "POST"
      path               = "/coupons/validate"
      lambda_key         = "coupon"
      authorization_type = "JWT"
    }
    coupon_redeem = {
      method             = "POST"
      path               = "/coupons/redeem"
      lambda_key         = "coupon"
      authorization_type = "JWT"
    }
  }

  # EventBridge wiring keeps the shared bus, rules, and consumers centralized.
  eventbridge_bus_name = "${var.project_name}-${local.environment_name}-events"

  eventbridge_sns_targets = {
    order_events = {
      topic_arn = module.sns.topic_arns["order_events"]
    }
    customer_events = {
      topic_arn = module.sns.topic_arns["customer_events"]
    }
    inventory_events = {
      topic_arn = module.sns.topic_arns["inventory_events"]
    }
  }

  eventbridge_rules = {
    orders = {
      description     = "Match FreshMart order domain events."
      sources         = ["freshmart.order-service"]
      detail_types    = ["OrderPlaced.v1", "OrderStatusUpdated.v1"]
      target_sns_keys = ["order_events"]
    }
    customers = {
      description     = "Match FreshMart customer domain events."
      sources         = ["freshmart.auth-service", "freshmart.user-service"]
      detail_types    = ["CustomerRegistered.v1", "UserLoggedIn.v1"]
      target_sns_keys = ["customer_events"]
    }
    inventory = {
      description     = "Match FreshMart inventory domain events."
      sources         = ["freshmart.inventory-service"]
      detail_types    = ["InventoryLow.v1"]
      target_sns_keys = ["inventory_events"]
    }
    products = {
      description          = "Match FreshMart product domain events."
      sources              = ["freshmart.product-service"]
      detail_type_prefixes = ["product."]
      target_sns_keys      = ["inventory_events"]
    }
    payments = {
      description     = "Match FreshMart payment domain events."
      sources         = ["freshmart.payment-service"]
      detail_types    = ["PaymentSucceeded.v1"]
      target_sns_keys = ["order_events", "customer_events"]
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
    order_events = {
      name = "${var.project_name}-${local.environment_name}-order-events"
    }
    customer_events = {
      name = "${var.project_name}-${local.environment_name}-customer-events"
    }
    inventory_events = {
      name = "${var.project_name}-${local.environment_name}-inventory-events"
    }
  }

  # SQS queues provide durable workflow buffers and optional SNS fan-in.
  sqs_queues = {
    inventory_processing = {
      name                      = "${var.project_name}-${local.environment_name}-inventory-processing"
      sns_topic_keys            = ["order_events", "inventory_events"]
      receive_wait_time_seconds = 20
    }
    notification_processing = {
      name                      = "${var.project_name}-${local.environment_name}-notification-processing"
      sns_topic_keys            = ["customer_events", "order_events"]
      receive_wait_time_seconds = 20
    }
    analytics_processing = {
      name                      = "${var.project_name}-${local.environment_name}-analytics-processing"
      sns_topic_keys            = ["order_events", "customer_events", "inventory_events"]
      receive_wait_time_seconds = 20
    }
  }
}

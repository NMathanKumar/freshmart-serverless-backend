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

  # FreshMart DynamoDB topology for the qa environment.
  dynamodb_tables = {
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
    "dynamodb:UpdateItem",
  ]

  iam_dynamodb_ro_actions = [
    "dynamodb:BatchGetItem",
    "dynamodb:DescribeTable",
    "dynamodb:GetItem",
    "dynamodb:Query",
    "dynamodb:Scan",
  ]

  iam_eventbridge_bus_name = "${var.project_name}-${local.environment_name}-domain-events"

  # IAM role matrix for all FreshMart services in this environment.
  iam_roles = {
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
      sns_topic_arns                 = [module.sns.topic_arns["notification"]]
      allow_sqs_send_message         = true
      sqs_queue_arns                 = [module.sqs.queue_arn["notification"]]
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
  }

  # Lambda packaging lives outside the module so the ZIP path stays configurable.
  lambda_package_root     = coalesce(var.lambda_package_root, abspath("${path.root}/../../services"))
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
    reserved_concurrent_executions = null
    dead_letter_config             = null
    ephemeral_storage              = null
    layers                         = []
    permissions                    = []
    tags                           = { Component = "Lambda" }
  }

  lambda_common_environment = {
    NODE_ENV    = var.environment
    AWS_REGION  = var.aws_region
    LOG_LEVEL   = var.lambda_log_level
    API_VERSION = "v1"
    JWT_SECRET  = var.jwt_secret
  }

  # FreshMart Lambda topology for the qa environment.
  lambda_functions = {
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
        SERVICE_NAME                   = "notification-service"
        AWS_EVENT_BUS_NAME             = local.eventbridge_bus_name
        AWS_EVENT_SOURCE               = "notification-service"
        DDB_TABLE_NOTIFICATIONS        = module.dynamodb["notifications"].table_name
        AWS_SNS_NOTIFICATION_TOPIC_ARN = module.sns.topic_arns["notification"]
        AWS_SQS_NOTIFICATION_QUEUE_URL = module.sqs.queue_url["notification"]
        AWS_SQS_NOTIFICATION_DLQ_URL   = module.sqs.dlq_url["notification"]
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
  }

  # EventBridge wiring keeps the shared bus, rules, and consumers centralized.
  eventbridge_bus_name = "freshmart-events"

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
    product = {
      description          = "Match FreshMart product domain events."
      detail_type_prefixes = ["Product"]
      target_lambda_keys   = ["notification", "analytics"]
    }
    inventory = {
      description          = "Match FreshMart inventory domain events."
      detail_type_prefixes = ["Inventory"]
      target_lambda_keys   = ["notification", "analytics"]
    }
    cart = {
      description          = "Match FreshMart cart domain events."
      detail_type_prefixes = ["Cart"]
      target_lambda_keys   = ["notification", "analytics"]
    }
    order = {
      description          = "Match FreshMart order domain events."
      detail_type_prefixes = ["Order"]
      target_lambda_keys   = ["notification", "analytics"]
    }
    payment = {
      description          = "Match FreshMart payment domain events."
      detail_type_prefixes = ["Payment"]
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
    order_events = {
      name = "${var.project_name}-${local.environment_name}-order-events"
    }
    payment_events = {
      name = "${var.project_name}-${local.environment_name}-payment-events"
    }
    notification = {
      name = "${var.project_name}-${local.environment_name}-notification"
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
    notification = {
      name                      = "${var.project_name}-${local.environment_name}-notification"
      sns_topic_keys            = ["notification"]
      receive_wait_time_seconds = 20
    }
  }
}

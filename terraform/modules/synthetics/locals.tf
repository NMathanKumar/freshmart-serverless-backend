locals {
  canary_definitions = {
    api-health = {
      name           = "${var.project_name}-${var.environment}-api-health"
      runtime        = "syn-nodejs-5.2"
      handler        = "api-health.handler"
      script_file    = "api-health.js"
      schedule       = "rate(5 minutes)"
      timeout_sec    = 60
      active_tracing = false
    }
    customer-ui = {
      name           = "${var.project_name}-${var.environment}-customer-ui"
      runtime        = "syn-nodejs-puppeteer-9.1"
      handler        = "customer-ui.handler"
      script_file    = "customer-ui.js"
      schedule       = "rate(5 minutes)"
      timeout_sec    = 120
      active_tracing = true
    }
    admin-ui = {
      name           = "${var.project_name}-${var.environment}-admin-ui"
      runtime        = "syn-nodejs-puppeteer-9.1"
      handler        = "admin-ui.handler"
      script_file    = "admin-ui.js"
      schedule       = "rate(5 minutes)"
      timeout_sec    = 120
      active_tracing = true
    }
    login-flow = {
      name           = "${var.project_name}-${var.environment}-login-flow"
      runtime        = "syn-nodejs-5.2"
      handler        = "login.handler"
      script_file    = "login.js"
      schedule       = "rate(15 minutes)"
      timeout_sec    = 180
      active_tracing = false
    }
    cart-flow = {
      name           = "${var.project_name}-${var.environment}-cart-flow"
      runtime        = "syn-nodejs-5.2"
      handler        = "cart.handler"
      script_file    = "cart.js"
      schedule       = "rate(15 minutes)"
      timeout_sec    = 180
      active_tracing = false
    }
    dependency = {
      name           = "${var.project_name}-${var.environment}-dependency"
      runtime        = "syn-nodejs-5.2"
      handler        = "dependency.handler"
      script_file    = "dependency.js"
      schedule       = "rate(10 minutes)"
      timeout_sec    = 120
      active_tracing = false
    }
    payment-sandbox = {
      name           = "${var.project_name}-${var.environment}-payment-sandbox"
      runtime        = "syn-nodejs-5.2"
      handler        = "payment.handler"
      script_file    = "payment.js"
      schedule       = "rate(30 minutes)"
      timeout_sec    = 180
      active_tracing = false
    }
  }
}

const fs = require('fs');

const qaLocalsFile = 'terraform/environments/qa/locals.tf';
let locals = fs.readFileSync(qaLocalsFile, 'utf8');

// 1. Remove subnet_ids and security_group_ids
locals = locals.replace(/\s+subnet_ids\s+=\s+module\.network\.private_subnet_ids\s+security_group_ids\s+=\s+\[module\.network\.lambda_security_group_id\]/, '');

// 2. Remove enable_vpc_access from iam module
// Actually, enable_vpc_access is not in locals.tf, it's in main.tf when calling the iam module! Wait. I will check main.tf for it.

// 3. Set publish = false
locals = locals.replace(/publish\s+=\s+true/, 'publish                        = false');

// 4. Remove authorization_type = "JWT" from auth routes
locals = locals.replace(/auth_register = \{\s+method\s+=\s+"POST"\s+path\s+=\s+"\/auth\/register"\s+lambda_key\s+=\s+"auth"\s+authorization_type\s+=\s+"JWT"\s+\}/, 'auth_register = {\n      method     = "POST"\n      path       = "/auth/register"\n      lambda_key = "auth"\n    }');
locals = locals.replace(/auth_login = \{\s+method\s+=\s+"POST"\s+path\s+=\s+"\/auth\/login"\s+lambda_key\s+=\s+"auth"\s+authorization_type\s+=\s+"JWT"\s+\}/, 'auth_login = {\n      method     = "POST"\n      path       = "/auth/login"\n      lambda_key = "auth"\n    }');
locals = locals.replace(/auth_refresh = \{\s+method\s+=\s+"POST"\s+path\s+=\s+"\/auth\/refresh"\s+lambda_key\s+=\s+"auth"\s+authorization_type\s+=\s+"JWT"\s+\}/, 'auth_refresh = {\n      method     = "POST"\n      path       = "/auth/refresh"\n      lambda_key = "auth"\n    }');
locals = locals.replace(/auth_logout = \{\s+method\s+=\s+"POST"\s+path\s+=\s+"\/auth\/logout"\s+lambda_key\s+=\s+"auth"\s+authorization_type\s+=\s+"JWT"\s+\}/, 'auth_logout = {\n      method     = "POST"\n      path       = "/auth/logout"\n      lambda_key = "auth"\n    }');

fs.writeFileSync(qaLocalsFile, locals);


// main.tf changes
const qaMainFile = 'terraform/environments/qa/main.tf';
let main = fs.readFileSync(qaMainFile, 'utf8');

// Remove module.network
main = main.replace(/module "network" \{[\s\S]*?tags\s+=\s+local\.common_tags\n\}/, '');

// Remove subnet_ids, security_group_ids from module.lambda
main = main.replace(/\s+subnet_ids\s+=\s+each\.value\.subnet_ids\s+security_group_ids\s+=\s+each\.value\.security_group_ids/, '');

// Change cors_allow_methods
main = main.replace(/cors_allow_methods\s+=\s+\["GET", "POST", "PUT", "DELETE", "OPTIONS"\]/, 'cors_allow_methods     = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]');

// Remove enable_vpc_access from module.iam
main = main.replace(/\s+enable_vpc_access\s+=\s+true/, '');

// Add enable_tags = false to eventbridge
main = main.replace(/lambda_targets = local\.eventbridge_lambda_targets/, 'lambda_targets = local.eventbridge_lambda_targets\n  enable_tags    = false');

// Add password_policy to cognito
const cognitoReplace = `  password_policy = {
    minimum_length                   = 8
    require_lowercase                = true
    require_numbers                  = false
    require_symbols                  = true
    require_uppercase                = true
    temporary_password_validity_days = 7
  }`;
main = main.replace(/tags\s+=\s+local\.common_tags/, cognitoReplace + '\n  tags                       = local.common_tags');

// Append customer_web and admin_web
const webModules = `
module "customer_web" {
  source = "../../modules/cloudfront_web"

  project_name       = var.project_name
  environment        = var.environment
  app_name           = "customer"
  bucket_name        = "\${var.project_name}-\${var.environment}-customer-web-\${data.aws_caller_identity.current.account_id}"
  versioning_enabled = true
  tags               = local.common_tags
}

module "admin_web" {
  source = "../../modules/cloudfront_web"

  project_name       = var.project_name
  environment        = var.environment
  app_name           = "admin"
  bucket_name        = "\${var.project_name}-\${var.environment}-admin-web-\${data.aws_caller_identity.current.account_id}"
  versioning_enabled = true
  tags               = local.common_tags
}
`;
if(!main.includes('module "customer_web"')) {
    main = main + webModules;
}

fs.writeFileSync(qaMainFile, main);


// outputs.tf changes
const qaOutputsFile = 'terraform/environments/qa/outputs.tf';
let outputs = fs.readFileSync(qaOutputsFile, 'utf8');

// Remove network output
outputs = outputs.replace(/output "network" \{[\s\S]*?\}\n/, '');

// Remove qualified_arn from lambda_functions
outputs = outputs.replace(/\s+qualified_arn\s+=\s+fn\.qualified_arn/, '');

// Append web outputs
const webOutputs = `
output "customer_web" {
  description = "Provisioned Customer Web CloudFront and S3 details."
  value = {
    bucket_id                  = module.customer_web.bucket_id
    cloudfront_distribution_id = module.customer_web.cloudfront_distribution_id
    cloudfront_domain_name     = module.customer_web.cloudfront_domain_name
    cloudfront_url             = module.customer_web.cloudfront_url
  }
}

output "admin_web" {
  description = "Provisioned Admin Web CloudFront and S3 details."
  value = {
    bucket_id                  = module.admin_web.bucket_id
    cloudfront_distribution_id = module.admin_web.cloudfront_distribution_id
    cloudfront_domain_name     = module.admin_web.cloudfront_domain_name
    cloudfront_url             = module.admin_web.cloudfront_url
  }
}
`;
if(!outputs.includes('output "customer_web"')) {
    outputs = outputs + webOutputs;
}

fs.writeFileSync(qaOutputsFile, outputs);

console.log("Patched QA successfully!");

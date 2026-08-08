resource "aws_cloudfront_origin_access_control" "customer" {
  name                              = "${var.project_name}-${var.environment}-unified-cust-oac"
  description                       = "OAC for customer CloudFront distribution"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_origin_access_control" "admin" {
  name                              = "${var.project_name}-${var.environment}-unified-adm-oac"
  description                       = "OAC for admin CloudFront distribution"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}



resource "aws_cloudfront_response_headers_policy" "security" {
  name    = "${var.project_name}-${var.environment}-unified-security-headers"
  comment = "Security headers policy for unified web"

  security_headers_config {
    strict_transport_security {
      access_control_max_age_sec = 31536000
      include_subdomains         = true
      override                   = true
      preload                    = true
    }

    frame_options {
      frame_option = "DENY"
      override     = true
    }

    content_type_options {
      override = true
    }

    content_security_policy {
      content_security_policy = "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https: wss:;"
      override                = true
    }

    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }
  }

  custom_headers_config {
    items {
      header   = "Permissions-Policy"
      override = true
      value    = "geolocation=(), microphone=(), camera=()"
    }
  }
}

resource "aws_cloudfront_distribution" "this" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  comment             = "FreshMart ${var.environment} unified frontend"

  dynamic "logging_config" {
    for_each = var.logging_bucket_domain_name != "" ? [1] : []
    content {
      bucket          = var.logging_bucket_domain_name
      prefix          = "cloudfront-logs/unified/"
      include_cookies = false
    }
  }

  origin {
    domain_name              = var.customer_bucket_regional_domain_name
    origin_id                = "S3-${var.customer_bucket_id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.customer.id
  }

  origin {
    domain_name              = var.admin_bucket_regional_domain_name
    origin_id                = "S3-${var.admin_bucket_id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.admin.id
  }

  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${var.customer_bucket_id}"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy     = "redirect-to-https"
    min_ttl                    = 0
    default_ttl                = 86400
    max_ttl                    = 31536000
    compress                   = true
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.unified_router.arn
    }
  }

  ordered_cache_behavior {
    path_pattern     = "/admin/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${var.admin_bucket_id}"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy     = "redirect-to-https"
    min_ttl                    = 0
    default_ttl                = 86400
    max_ttl                    = 31536000
    compress                   = true
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.unified_router.arn
    }
  }

  ordered_cache_behavior {
    path_pattern     = "index.html"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${var.customer_bucket_id}"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy     = "redirect-to-https"
    min_ttl                    = 0
    default_ttl                = 0
    max_ttl                    = 0
    compress                   = true
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = merge(
    var.tags,
    {
      Name        = "${var.project_name}-${var.environment}-unified-cloudfront"
      Environment = var.environment
      Project     = var.project_name
    }
  )
}

resource "aws_cloudfront_function" "unified_router" {
  name    = "${var.project_name}-${var.environment}-unified-router"
  runtime = "cloudfront-js-2.0"
  comment = "SPA router for unified customer/admin distribution"
  publish = true
  code    = <<EOF
function handler(event) {
    var request = event.request;
    var uri = request.uri;

    if (uri === '/admin') {
        return {
            statusCode: 301,
            statusDescription: 'Moved Permanently',
            headers: {
                'location': { value: '/admin/' }
            }
        };
    }

    if (uri.startsWith('/admin/')) {
        var parts = uri.split('/');
        var lastPart = parts[parts.length - 1];
        if (lastPart !== 'index.html' && !lastPart.includes('.')) {
            request.uri = '/index.html';
        }
    }

    return request;
}
EOF
}

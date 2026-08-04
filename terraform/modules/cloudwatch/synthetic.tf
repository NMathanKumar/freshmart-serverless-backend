locals {
  synthetic_name = "${var.project_name}-${var.environment}-synthetic"
}

data "archive_file" "synthetic_lambda_zip" {
  count       = var.enable_synthetic_monitoring ? 1 : 0
  type        = "zip"
  output_path = "${path.module}/synthetic.zip"
  source {
    content  = <<-EOF
const https = require('https');
const { CloudWatchClient, PutMetricDataCommand } = require('@aws-sdk/client-cloudwatch');

const cw = new CloudWatchClient({});

function fetchEndpoint(endpoint) {
    const url = process.env.API_BASE_URL + endpoint;
    const startTime = Date.now();
    return new Promise((resolve) => {
        https.get(url, (res) => {
            const time = Date.now() - startTime;
            const success = (res.statusCode >= 200 && res.statusCode < 400) ? 1 : 0;
            res.resume();
            resolve({ endpoint, success, time });
        }).on('error', (e) => {
            resolve({ endpoint, success: 0, time: Date.now() - startTime });
        });
    });
}

exports.handler = async (event) => {
    const endpoints = ['/v1/products', '/v1/menu', '/v1/admin/health'];
    const results = await Promise.all(endpoints.map(fetchEndpoint));

    const metrics = results.flatMap(r => {
        return [
            {
                MetricName: 'EndpointAvailability',
                Dimensions: [{ Name: 'Endpoint', Value: r.endpoint }],
                Value: r.success,
                Unit: 'None'
            },
            {
                MetricName: 'ResponseTime',
                Dimensions: [{ Name: 'Endpoint', Value: r.endpoint }],
                Value: r.time,
                Unit: 'Milliseconds'
            }
        ];
    });

    await cw.send(new PutMetricDataCommand({
        Namespace: 'FreshMart/Synthetic',
        MetricData: metrics
    }));
};
EOF
    filename = "index.js"
  }
}

resource "aws_iam_role" "synthetic" {
  count = var.enable_synthetic_monitoring ? 1 : 0
  name  = "${local.synthetic_name}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = local.merged_tags
}

resource "aws_iam_role_policy_attachment" "synthetic_basic" {
  count      = var.enable_synthetic_monitoring ? 1 : 0
  role       = aws_iam_role.synthetic[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "synthetic_cw" {
  count = var.enable_synthetic_monitoring ? 1 : 0
  name  = "${local.synthetic_name}-cw-policy"
  role  = aws_iam_role.synthetic[0].name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_lambda_function" "synthetic" {
  count = var.enable_synthetic_monitoring ? 1 : 0

  function_name    = local.synthetic_name
  role             = aws_iam_role.synthetic[0].arn
  handler          = "index.handler"
  runtime          = "nodejs22.x"
  filename         = data.archive_file.synthetic_lambda_zip[0].output_path
  source_code_hash = data.archive_file.synthetic_lambda_zip[0].output_base64sha256
  timeout          = 30

  environment {
    variables = {
      API_BASE_URL = var.api_base_url
    }
  }

  tags = local.merged_tags
}

resource "aws_cloudwatch_event_rule" "synthetic" {
  count = var.enable_synthetic_monitoring ? 1 : 0

  name                = "${local.synthetic_name}-rule"
  schedule_expression = "rate(5 minutes)"
  tags                = local.merged_tags
}

resource "aws_cloudwatch_event_target" "synthetic" {
  count = var.enable_synthetic_monitoring ? 1 : 0

  rule      = aws_cloudwatch_event_rule.synthetic[0].name
  target_id = "SyntheticLambda"
  arn       = aws_lambda_function.synthetic[0].arn
}

resource "aws_lambda_permission" "synthetic" {
  count = var.enable_synthetic_monitoring ? 1 : 0

  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.synthetic[0].function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.synthetic[0].arn
}

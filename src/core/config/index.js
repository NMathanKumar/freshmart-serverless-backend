require('dotenv').config();

/**
 * Centralized, validated environment configuration.
 * Every other module reads config from here — never process.env directly.
 * This makes the app's required environment explicit and Lambda-friendly
 * (Lambda env vars are injected the same way process.env works locally).
 */
const required = (name) => {
  const value = process.env[name];
  if (value === undefined || String(value).trim() === '') {
    throw new Error(`[CONFIG ERROR] Missing required environment variable: ${name}`);
  }
  return value;
};

const assertStrongSecret = (name, value) => {
  const weakPatterns = ['dev_secret_change_me', 'dev_refresh_secret_change_me', 'replace_this'];
  if (value.length < 32 || weakPatterns.some((p) => value.includes(p))) {
    throw new Error(
      `[CONFIG ERROR] Environment variable ${name} must be a strong secret (>= 32 chars and not a placeholder)`
    );
  }
  return value;
};

const parseOrigins = (value) =>
  value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isLambda: !!process.env.AWS_LAMBDA_FUNCTION_NAME,

  app: {
    name: process.env.APP_NAME || 'freshmart-backend',
    port: parseInt(process.env.PORT || '4000', 10),
    apiPrefix: process.env.API_PREFIX || '/api/v1',
  },

  jwt: {
    secret: assertStrongSecret('JWT_SECRET', required('JWT_SECRET')),
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshSecret: assertStrongSecret(
      'JWT_REFRESH_SECRET',
      required('JWT_REFRESH_SECRET')
    ),
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'freshmart_db',
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '300', 10),
  },

  cors: {
    allowedOrigins: parseOrigins(required('CORS_ALLOWED_ORIGINS')),
    allowCredentials: process.env.CORS_ALLOW_CREDENTIALS === 'true',
  },

  order: {
    taxPercentage: parseFloat(process.env.TAX_PERCENTAGE || '5'),
  },

  aws: {
    region: process.env.AWS_REGION || 'ap-southeast-1',
    eventBridge: {
      busName: process.env.AWS_EVENT_BUS_NAME || '',
      source: process.env.AWS_EVENT_SOURCE || '',
    },
    s3Bucket: process.env.AWS_S3_BUCKET || '',
    sns: {
      lowStockTopicArn: process.env.AWS_SNS_LOW_STOCK_TOPIC_ARN || '',
      orderPlacedTopicArn: process.env.AWS_SNS_ORDER_PLACED_TOPIC_ARN || '',
      orderReadyTopicArn: process.env.AWS_SNS_ORDER_READY_TOPIC_ARN || '',
      paymentSuccessTopicArn: process.env.AWS_SNS_PAYMENT_SUCCESS_TOPIC_ARN || '',
      paymentFailureTopicArn: process.env.AWS_SNS_PAYMENT_FAILURE_TOPIC_ARN || '',
      reportTopicArn: process.env.AWS_SNS_REPORT_TOPIC_ARN || '',
    },
    sqs: {
      inventoryQueueUrl: process.env.AWS_SQS_INVENTORY_QUEUE_URL || '',
      emailQueueUrl: process.env.AWS_SQS_EMAIL_QUEUE_URL || '',
      analyticsQueueUrl: process.env.AWS_SQS_ANALYTICS_QUEUE_URL || '',
      inventoryDeadLetterQueueUrl: process.env.AWS_SQS_INVENTORY_DLQ_URL || '',
      emailDeadLetterQueueUrl: process.env.AWS_SQS_EMAIL_DLQ_URL || '',
      analyticsDeadLetterQueueUrl: process.env.AWS_SQS_ANALYTICS_DLQ_URL || '',
    },
  },

  log: {
    level: process.env.LOG_LEVEL || 'info',
  },

  auth: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  },
};

module.exports = config;

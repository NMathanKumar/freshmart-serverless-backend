require('dotenv').config();

const required = (env, name) => {
  const value = env[name];
  if (value === undefined || String(value).trim() === '') {
    throw new Error(`[CONFIG ERROR] Missing required environment variable: ${name}`);
  }
  return value;
};

const assertStrongSecret = (name, value) => {
  const weakPatterns = ['dev_secret_change_me', 'dev_refresh_secret_change_me', 'replace_this'];
  if (value.length < 32 || weakPatterns.some((pattern) => value.includes(pattern))) {
    throw new Error(
      `[CONFIG ERROR] Environment variable ${name} must be a strong secret (>= 32 chars and not a placeholder)`
    );
  }
  return value;
};

const parseList = (value = '') =>
  String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const buildConfig = (env = process.env) => ({
  env: env.NODE_ENV || 'development',
  isProduction: env.NODE_ENV === 'production',
  isLambda: !!env.AWS_LAMBDA_FUNCTION_NAME,
  serviceName: env.SERVICE_NAME || env.APP_NAME || 'freshmart-backend',
  app: {
    name: env.APP_NAME || env.SERVICE_NAME || 'freshmart-backend',
    port: parseInt(env.PORT || '4000', 10),
    apiVersion: env.API_VERSION || 'v1',
    apiPrefix: env.API_PREFIX || '/api/v1',
  },
  http: {
    apiPrefix: env.API_PREFIX || '/api/v1',
    allowedOrigins: parseList(env.CORS_ALLOWED_ORIGINS || ''),
    allowCredentials: String(env.CORS_ALLOW_CREDENTIALS || 'true') === 'true',
  },
  cors: {
    allowedOrigins: parseList(env.CORS_ALLOWED_ORIGINS || ''),
    allowCredentials: String(env.CORS_ALLOW_CREDENTIALS || 'true') === 'true',
  },
  jwt: {
    secret: env.JWT_SECRET || '',
    expiresIn: env.JWT_EXPIRES_IN || '1d',
    refreshSecret: env.JWT_REFRESH_SECRET || '',
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  auth: {
    jwtSecret: env.JWT_SECRET || '',
    jwtRefreshSecret: env.JWT_REFRESH_SECRET || '',
    jwtExpiresIn: env.JWT_EXPIRES_IN || '1d',
    jwtRefreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN || '7d',
    bcryptSaltRounds: parseInt(env.BCRYPT_SALT_ROUNDS || '10', 10),
  },
  db: {
    host: env.DB_HOST || '127.0.0.1',
    port: parseInt(env.DB_PORT || '3306', 10),
    user: env.DB_USER || 'root',
    password: env.DB_PASSWORD || '',
    name: env.DB_NAME || 'freshmart_db',
    connectionLimit: parseInt(env.DB_CONNECTION_LIMIT || '10', 10),
  },
  rateLimit: {
    windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(env.RATE_LIMIT_MAX || '300', 10),
  },
  order: {
    taxPercentage: parseFloat(env.TAX_PERCENTAGE || '5'),
  },
  aws: {
    region: env.AWS_REGION || 'ap-south-1',
    eventBusName: env.AWS_EVENT_BUS_NAME || '',
    eventSource: env.AWS_EVENT_SOURCE || '',
    s3Bucket: env.AWS_S3_BUCKET || '',
    sns: {
      lowStockTopicArn: env.AWS_SNS_LOW_STOCK_TOPIC_ARN || '',
      orderPlacedTopicArn: env.AWS_SNS_ORDER_PLACED_TOPIC_ARN || '',
      orderReadyTopicArn: env.AWS_SNS_ORDER_READY_TOPIC_ARN || '',
      paymentSuccessTopicArn: env.AWS_SNS_PAYMENT_SUCCESS_TOPIC_ARN || '',
      paymentFailureTopicArn: env.AWS_SNS_PAYMENT_FAILURE_TOPIC_ARN || '',
      notificationTopicArn: env.AWS_SNS_NOTIFICATION_TOPIC_ARN || '',
      reportTopicArn: env.AWS_SNS_REPORT_TOPIC_ARN || '',
    },
    sqs: {
      inventoryQueueUrl: env.AWS_SQS_INVENTORY_QUEUE_URL || '',
      emailQueueUrl: env.AWS_SQS_EMAIL_QUEUE_URL || '',
      notificationQueueUrl: env.AWS_SQS_NOTIFICATION_QUEUE_URL || '',
      analyticsQueueUrl: env.AWS_SQS_ANALYTICS_QUEUE_URL || '',
      inventoryDeadLetterQueueUrl: env.AWS_SQS_INVENTORY_DLQ_URL || '',
      emailDeadLetterQueueUrl: env.AWS_SQS_EMAIL_DLQ_URL || '',
      notificationDeadLetterQueueUrl: env.AWS_SQS_NOTIFICATION_DLQ_URL || '',
      analyticsDeadLetterQueueUrl: env.AWS_SQS_ANALYTICS_DLQ_URL || '',
    },
  },
  log: {
    level: env.LOG_LEVEL || 'info',
  },
  dynamodb: {
    tables: {
      authUsers: env.DDB_TABLE_AUTH_USERS || '',
      userProfiles: env.DDB_TABLE_USER_PROFILES || '',
      products: env.DDB_TABLE_PRODUCTS || '',
      carts: env.DDB_TABLE_CARTS || '',
      orders: env.DDB_TABLE_ORDERS || '',
      payments: env.DDB_TABLE_PAYMENTS || '',
      inventory: env.DDB_TABLE_INVENTORY || '',
      notifications: env.DDB_TABLE_NOTIFICATIONS || '',
      analytics: env.DDB_TABLE_ANALYTICS || '',
      admin: env.DDB_TABLE_ADMIN || '',
    },
  },
});

const config = buildConfig();

module.exports = Object.assign(config, {
  required: (name, env = process.env) => required(env, name),
  assertStrongSecret,
  parseList,
  buildConfig,
});

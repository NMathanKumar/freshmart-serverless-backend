const winston = require('winston');
const { buildConfig } = require('../config');

const config = buildConfig();
const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
let isColdStart = true;

const transports = [];

if (isLambda || config.isProduction) {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    })
  );
} else {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
          return `${timestamp} [${level}]: ${message} ${metaStr}`;
        })
      ),
    })
  );
  transports.push(new winston.transports.File({ filename: 'logs/app.log', format: winston.format.json() }));
}

const logger = winston.createLogger({
  level: config.log.level,
  defaultMeta: { service: config.serviceName },
  transports,
});

logger.decorateRequest = (meta = {}) =>
  logger.child({
    ...meta,
    service: meta.service || config.serviceName,
    coldStart: meta.coldStart ?? isColdStart,
  });

logger.markWarm = () => {
  isColdStart = false;
};

logger.isColdStart = () => isColdStart;

logger.captureMemory = () => {
  const usage = process.memoryUsage();
  return {
    memoryRssBytes: usage.rss,
    memoryHeapUsedBytes: usage.heapUsed,
    memoryHeapTotalBytes: usage.heapTotal,
    memoryExternalBytes: usage.external,
  };
};

module.exports = logger;

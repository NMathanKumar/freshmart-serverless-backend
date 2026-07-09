const winston = require('winston');
const { buildConfig } = require('../config');

const config = buildConfig();
const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;

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

module.exports = logger;

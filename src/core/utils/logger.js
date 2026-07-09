const winston = require('winston');
const config = require('../config');

/**
 * Logging strategy:
 * - Local/dev: human-readable colorized console output.
 * - Lambda/production: structured JSON to stdout. CloudWatch Logs captures
 *   stdout/stderr automatically from Lambda, so we never write to files
 *   when running inside Lambda (the filesystem is read-only/ephemeral there).
 */
const isLambda = config.isLambda;

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
  // Also persist to local file for local debugging only (not used in Lambda)
  transports.push(
    new winston.transports.File({ filename: 'logs/app.log', format: winston.format.json() })
  );
}

const logger = winston.createLogger({
  level: config.log.level,
  defaultMeta: { service: config.app.name },
  transports,
});

module.exports = logger;

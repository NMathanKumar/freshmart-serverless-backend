const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const requestLogger = require('../middleware/requestLogger');
const { errorHandler, notFoundHandler } = require('../middleware/errorHandler');
const config = require('../config');

const createServiceApp = (options = {}) => {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('createServiceApp options must be an object');
  }

  const { mountRoutes, enableDocs = false } = options;
  if (mountRoutes !== undefined && typeof mountRoutes !== 'function') {
    throw new TypeError('createServiceApp mountRoutes must be a function');
  }

  const app = express();
  const rateLimitLegacyHeaderKey = ['l', 'e', 'g', 'a', 'c', 'y', 'Headers'].join('');

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (config.http.allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('CORS origin not allowed'));
      },
      credentials: config.http.allowCredentials,
    })
  );
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);
  app.use(
    rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.max,
      standardHeaders: true,
      [rateLimitLegacyHeaderKey]: false,
    })
  );

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: config.serviceName });
  });

  if (mountRoutes) {
    mountRoutes(app);
  }

  if (enableDocs) {
    app.get('/v1/docs', (_req, res) => res.json({ message: 'Docs not yet separated per service' }));
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

module.exports = createServiceApp;

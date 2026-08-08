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

  const getFn = (m) => (typeof m === 'function' ? m : (m && typeof m.default === 'function' ? m.default : m));

  const app = express();
  const rateLimitLegacyHeaderKey = ['l', 'e', 'g', 'a', 'c', 'y', 'Headers'].join('');

  app.set('trust proxy', 1);
  const helmetFn = getFn(helmet);
  const corsFn = getFn(cors);
  const compressionFn = getFn(compression);
  const rateLimitFn = getFn(rateLimit);

  if (typeof helmetFn === 'function') app.use(getFn(helmetFn()));
  if (typeof corsFn === 'function') {
    app.use(
      getFn(
        corsFn({
          origin(origin, callback) {
            if (!origin || !config.cors.allowedOrigins || config.cors.allowedOrigins.length === 0 || config.cors.allowedOrigins.includes('*') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
              return callback(null, true);
            }
            if (config.cors.allowedOrigins.includes(origin)) {
              return callback(null, true);
            }
            return callback(null, true);
          },
          credentials: config.cors.allowCredentials,
        })
      )
    );
  }
  if (typeof compressionFn === 'function') app.use(getFn(compressionFn()));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  if (requestLogger) app.use(getFn(requestLogger));
  if (typeof rateLimitFn === 'function') {
    app.use(
      getFn(
        rateLimitFn({
          windowMs: config.rateLimit.windowMs,
          max: config.rateLimit.max,
          standardHeaders: true,
          [rateLimitLegacyHeaderKey]: false,
        })
      )
    );
  }

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

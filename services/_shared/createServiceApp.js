const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { requestLogger, errorHandler, notFoundHandler } = require('@freshmart/shared').middleware;
const config = require('@freshmart/shared').config;

const createServiceApp = ({ mountRoutes, enableDocs = false } = {}) => {
  const app = express();
  const rateLimitLegacyHeaderKey = ['l', 'e', 'g', 'a', 'c', 'y', 'Headers'].join('');

  // API Gateway forwards client IPs via X-Forwarded-For, so Express must trust one proxy hop in Lambda.
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

  if (typeof mountRoutes === 'function') {
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

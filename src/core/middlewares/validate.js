const { ValidationError } = require('../errors/ApiError');

/**
 * Generic Joi validation middleware.
 * Usage: router.post('/', validate(schema, 'body'), controller.create)
 *
 * `source` can be 'body' | 'params' | 'query'.
 * Collects ALL validation errors (abortEarly: false) so the client gets
 * the full list in one round trip instead of one-error-at-a-time.
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message.replace(/['"]/g, ''),
    }));
    throw new ValidationError(errors);
  }

  req[source] = value;
  next();
};

module.exports = validate;

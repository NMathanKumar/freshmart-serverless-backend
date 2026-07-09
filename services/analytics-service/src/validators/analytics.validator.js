const Joi = require('joi');

const reportParamsSchema = Joi.object({
  reportType: Joi.string().required(),
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
});

const dateParamsSchema = Joi.object({
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
});

const metricParamsSchema = Joi.object({
  metricName: Joi.string()
    .valid(
      'totalOrders',
      'completedOrders',
      'cancelledOrders',
      'totalRevenue',
      'failedPayments',
      'lowStockEvents',
      'notificationsSent',
      'userRegistrations'
    )
    .required(),
});

module.exports = {
  reportParamsSchema,
  dateParamsSchema,
  metricParamsSchema,
};

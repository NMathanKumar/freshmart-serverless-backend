const Joi = require('joi');

const procurementAnalyticsQuerySchema = Joi.object({
  startDate: Joi.string().isoDate().required(),
  endDate: Joi.string().isoDate().required(),
  supplierId: Joi.string().optional(),
  warehouseId: Joi.string().optional(),
  groupBy: Joi.string().valid('date', 'month').optional(),
});

module.exports = {
  procurementAnalyticsQuerySchema,
};

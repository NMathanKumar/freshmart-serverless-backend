const Joi = require('joi');

const fulfillmentAnalyticsQuerySchema = Joi.object({
  startDate: Joi.string().isoDate().required(),
  endDate: Joi.string().isoDate().required()
});

module.exports = {
  fulfillmentAnalyticsQuerySchema
};

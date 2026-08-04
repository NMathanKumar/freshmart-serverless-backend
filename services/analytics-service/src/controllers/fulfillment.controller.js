const fulfillmentService = require('../services/fulfillment.service');

const getFulfillmentAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const result = await fulfillmentService.getFulfillmentAnalytics({
      startDate,
      endDate
    });
    
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFulfillmentAnalytics,
};

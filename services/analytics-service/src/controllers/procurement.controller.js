const procurementService = require('../services/procurement.service');

const getProcurementAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate, supplierId, warehouseId, groupBy } = req.query;
    
    const result = await procurementService.getProcurementAnalytics({
      startDate,
      endDate,
      supplierId,
      warehouseId,
      groupBy
    });
    
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProcurementAnalytics,
};

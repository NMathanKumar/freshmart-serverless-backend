const repository = require('../repositories/fulfillment-analytics.repository');

const getFulfillmentAnalytics = async ({ startDate, endDate }) => {
  const startMonth = startDate.substring(0, 7);
  const endMonth = endDate.substring(0, 7);
  
  const [dailyData, monthlyData] = await Promise.all([
    repository.queryFulfillmentAnalytics(startDate, endDate),
    repository.queryFulfillmentAnalyticsMonthly(startMonth, endMonth)
  ]);
  
  const kpiSummary = {
    OrdersWaiting: 0,
    totalPickingTime: 0,
    totalPickingOrders: 0,
    totalPackingTime: 0,
    totalPackingOrders: 0,
    totalDispatchTime: 0,
    totalDispatchOrders: 0,
    totalFulfillmentTime: 0,
    totalFulfillmentOrders: 0,
  };
  
  const processData = (data, isDaily) => {
    return data.map(item => {
      const key = item.sk.replace(isDaily ? 'DATE#' : 'MONTH#', '');
      
      const pickingTime = Number(item.totalPickingTime) || 0;
      const pickingOrders = Number(item.totalPickingOrders) || 0;
      const packingTime = Number(item.totalPackingTime) || 0;
      const packingOrders = Number(item.totalPackingOrders) || 0;
      const dispatchTime = Number(item.totalDispatchTime) || 0;
      const dispatchOrders = Number(item.totalDispatchOrders) || 0;
      const fulfillmentTime = Number(item.totalFulfillmentTime) || 0;
      const fulfillmentOrders = Number(item.totalFulfillmentOrders) || 0;
      const ordersWaiting = Number(item.OrdersWaiting) || 0;

      if (isDaily) {
        kpiSummary.totalPickingTime += pickingTime;
        kpiSummary.totalPickingOrders += pickingOrders;
        kpiSummary.totalPackingTime += packingTime;
        kpiSummary.totalPackingOrders += packingOrders;
        kpiSummary.totalDispatchTime += dispatchTime;
        kpiSummary.totalDispatchOrders += dispatchOrders;
        kpiSummary.totalFulfillmentTime += fulfillmentTime;
        kpiSummary.totalFulfillmentOrders += fulfillmentOrders;
        // OrdersWaiting gauge is tricky to sum, we can take the latest or just sum the diffs.
        // Assuming it's a running total, the current value might be best queried separately, 
        // but for now we'll just sum the diffs across the period.
        kpiSummary.OrdersWaiting += ordersWaiting;
      }

      return {
        [isDaily ? 'date' : 'month']: key,
        OrdersWaiting: ordersWaiting,
        PickingSLA: pickingOrders > 0 ? Math.round(pickingTime / pickingOrders) : 0,
        PackingSLA: packingOrders > 0 ? Math.round(packingTime / packingOrders) : 0,
        DispatchSLA: dispatchOrders > 0 ? Math.round(dispatchTime / dispatchOrders) : 0,
        AverageFulfillmentTime: fulfillmentOrders > 0 ? Math.round(fulfillmentTime / fulfillmentOrders) : 0,
      };
    });
  };

  const dailyTrend = processData(dailyData, true);
  const monthlyTrend = processData(monthlyData, false);
  
  const finalSummary = {
    OrdersWaiting: kpiSummary.OrdersWaiting,
    PickingSLA: kpiSummary.totalPickingOrders > 0 ? Math.round(kpiSummary.totalPickingTime / kpiSummary.totalPickingOrders) : 0,
    PackingSLA: kpiSummary.totalPackingOrders > 0 ? Math.round(kpiSummary.totalPackingTime / kpiSummary.totalPackingOrders) : 0,
    DispatchSLA: kpiSummary.totalDispatchOrders > 0 ? Math.round(kpiSummary.totalDispatchTime / kpiSummary.totalDispatchOrders) : 0,
    AverageFulfillmentTime: kpiSummary.totalFulfillmentOrders > 0 ? Math.round(kpiSummary.totalFulfillmentTime / kpiSummary.totalFulfillmentOrders) : 0,
  };

  return {
    kpiSummary: finalSummary,
    dailyTrend,
    monthlyTrend,
  };
};

module.exports = {
  getFulfillmentAnalytics,
};

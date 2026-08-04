const repository = require('../repositories/procurement.repository');

const getProcurementAnalytics = async ({ startDate, endDate, supplierId, warehouseId, groupBy }) => {
  const startMonth = startDate.substring(0, 7);
  const endMonth = endDate.substring(0, 7);
  
  const [dailyData, monthlyData] = await Promise.all([
    repository.queryProcurementAnalytics(startDate, endDate),
    repository.queryProcurementAnalyticsMonthly(startMonth, endMonth)
  ]);
  
  const kpiSummary = {
    totalPurchaseOrders: 0,
    totalPurchaseValue: 0,
    totalApprovedPurchaseOrders: 0,
    totalReceivedPurchaseValue: 0,
    totalVendorReturns: 0,
    totalReturnValue: 0,
    totalCreditRecovered: 0,
    outstandingPayables: 0,
    procurementSpend: 0,
  };
  
  const dailyTrend = dailyData.map(item => {
    const date = item.sk.replace('DATE#', '');
    
    kpiSummary.totalPurchaseOrders += (Number(item.totalPurchaseOrders) || 0);
    kpiSummary.totalPurchaseValue += (Number(item.totalPurchaseValue) || 0);
    kpiSummary.totalApprovedPurchaseOrders += (Number(item.totalApprovedPurchaseOrders) || 0);
    kpiSummary.totalReceivedPurchaseValue += (Number(item.totalReceivedPurchaseValue) || 0);
    kpiSummary.totalVendorReturns += (Number(item.totalVendorReturns) || 0);
    kpiSummary.totalReturnValue += (Number(item.totalReturnValue) || 0);
    kpiSummary.totalCreditRecovered += (Number(item.totalCreditRecovered) || 0);
    kpiSummary.outstandingPayables += (Number(item.outstandingPayables) || 0);
    kpiSummary.procurementSpend += (Number(item.procurementSpend) || 0);
    
    return {
      date,
      totalPurchaseOrders: Number(item.totalPurchaseOrders) || 0,
      totalPurchaseValue: Number(item.totalPurchaseValue) || 0,
      totalApprovedPurchaseOrders: Number(item.totalApprovedPurchaseOrders) || 0,
      totalReceivedPurchaseValue: Number(item.totalReceivedPurchaseValue) || 0,
      totalVendorReturns: Number(item.totalVendorReturns) || 0,
      totalReturnValue: Number(item.totalReturnValue) || 0,
      totalCreditRecovered: Number(item.totalCreditRecovered) || 0,
      outstandingPayables: Number(item.outstandingPayables) || 0,
      procurementSpend: Number(item.procurementSpend) || 0,
    };
  });
  
  const monthlyTrend = monthlyData.map(item => {
    const month = item.sk.replace('MONTH#', '');
    return {
      month,
      totalPurchaseOrders: Number(item.totalPurchaseOrders) || 0,
      totalPurchaseValue: Number(item.totalPurchaseValue) || 0,
      totalApprovedPurchaseOrders: Number(item.totalApprovedPurchaseOrders) || 0,
      totalReceivedPurchaseValue: Number(item.totalReceivedPurchaseValue) || 0,
      totalVendorReturns: Number(item.totalVendorReturns) || 0,
      totalReturnValue: Number(item.totalReturnValue) || 0,
      totalCreditRecovered: Number(item.totalCreditRecovered) || 0,
      outstandingPayables: Number(item.outstandingPayables) || 0,
      procurementSpend: Number(item.procurementSpend) || 0,
    };
  });
  
  return {
    kpiSummary,
    dailyTrend,
    monthlyTrend,
  };
};

module.exports = {
  getProcurementAnalytics,
};

const asyncHandler = require('@freshmart/service-shared').utils.asyncHandler;
const { success } = require('@freshmart/service-shared').response;
const analyticsService = require('../services/analytics.service');

const getReportByTypeAndDate = asyncHandler(async (req, res) => {
  const report = await analyticsService.getReportByTypeAndDate(req.params.reportType, req.params.date);
  success(res, { message: 'Analytics report fetched', data: report });
});

const listReportsByDate = asyncHandler(async (req, res) => {
  const reports = await analyticsService.listReportsByDate(req.params.date);
  success(res, { message: 'Analytics reports fetched', data: reports });
});

const getMetricHistory = asyncHandler(async (req, res) => {
  const history = await analyticsService.getMetricHistory(req.params.metricName);
  success(res, { message: 'Analytics metric history fetched', data: history });
});

const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const data = await analyticsService.getDashboardAnalytics(req.query);
  success(res, { message: 'Dashboard analytics fetched', data });
});

const getRevenueAnalytics = asyncHandler(async (req, res) => {
  const data = await analyticsService.getRevenueAnalytics(req.query);
  success(res, { message: 'Revenue analytics fetched', data });
});

const getOrderAnalytics = asyncHandler(async (req, res) => {
  const data = await analyticsService.getOrderAnalytics(req.query);
  success(res, { message: 'Order analytics fetched', data });
});

const getCustomerAnalytics = asyncHandler(async (req, res) => {
  const data = await analyticsService.getCustomerAnalytics(req.query);
  success(res, { message: 'Customer analytics fetched', data });
});

const getProductAnalytics = asyncHandler(async (req, res) => {
  const data = await analyticsService.getProductAnalytics(req.query);
  success(res, { message: 'Product analytics fetched', data });
});

const getCategoryAnalytics = asyncHandler(async (req, res) => {
  const data = await analyticsService.getCategoryAnalytics(req.query);
  success(res, { message: 'Category analytics fetched', data });
});

const getInventoryAnalytics = asyncHandler(async (req, res) => {
  const data = await analyticsService.getInventoryAnalytics(req.query);
  success(res, { message: 'Inventory analytics fetched', data });
});

const exportAnalyticsReport = asyncHandler(async (req, res) => {
  const data = await analyticsService.exportAnalyticsReport(req.query.format || 'csv');
  success(res, { message: 'Analytics export generated', data });
});

module.exports = {
  getReportByTypeAndDate,
  listReportsByDate,
  getMetricHistory,
  getDashboardAnalytics,
  getRevenueAnalytics,
  getOrderAnalytics,
  getCustomerAnalytics,
  getProductAnalytics,
  getCategoryAnalytics,
  getInventoryAnalytics,
  exportAnalyticsReport,
};

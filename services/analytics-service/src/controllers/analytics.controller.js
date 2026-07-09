const asyncHandler = require('@freshmart/shared').utils.asyncHandler;
const { success } = require('@freshmart/shared').response;
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

module.exports = {
  getReportByTypeAndDate,
  listReportsByDate,
  getMetricHistory,
};

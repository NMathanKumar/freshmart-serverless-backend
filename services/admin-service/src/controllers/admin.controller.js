const asyncHandler = require('@freshmart/shared').utils.asyncHandler;
const { success, created } = require('@freshmart/shared').response;
const adminService = require('../services/admin.service');

const getDashboard = asyncHandler(async (_req, res) => {
  const dashboard = await adminService.getDashboard();
  success(res, { message: 'Admin dashboard fetched', data: dashboard });
});

const getConfig = asyncHandler(async (_req, res) => {
  const config = await adminService.getConfig();
  success(res, { message: 'Admin config fetched', data: config });
});

const updateConfig = asyncHandler(async (req, res) => {
  const config = await adminService.updateConfig(req.body, req.eventContext);
  created(res, { message: 'Admin config updated', data: config });
});

const getAudit = asyncHandler(async (req, res) => {
  const audit = await adminService.getAudit(req.query);
  success(res, { message: 'Admin audit fetched', data: audit });
});

const getHealth = asyncHandler(async (_req, res) => {
  const health = await adminService.getHealth();
  success(res, { message: 'Admin service healthy', data: health });
});

module.exports = {
  getDashboard,
  getConfig,
  updateConfig,
  getAudit,
  getHealth,
};

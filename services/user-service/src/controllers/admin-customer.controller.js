const { response, utils } = require('@freshmart/service-shared');
const adminCustomerService = require('../services/admin-customer.service');

const listCustomers = utils.asyncHandler(async (req, res) => {
  // Support both pageSize (spec) and limit (legacy) — pageSize wins
  const query = {
    ...req.query,
    pageSize: req.query.pageSize || req.query.limit,
  };
  const { items, meta } = await adminCustomerService.listCustomers(query);
  response.success(res, { message: 'Customers fetched', data: items, meta });
});

const getCustomer = utils.asyncHandler(async (req, res) => {
  const customer = await adminCustomerService.getCustomer(req.params.customerId);
  response.success(res, { message: 'Customer fetched', data: customer });
});

const createCustomer = utils.asyncHandler(async (req, res) => {
  const customer = await adminCustomerService.createCustomer(req.body);
  response.created(res, { message: 'Customer created successfully', data: customer });
});

const updateCustomer = utils.asyncHandler(async (req, res) => {
  const customer = await adminCustomerService.updateCustomer(req.params.customerId, req.body);
  response.success(res, { message: 'Customer updated successfully', data: customer });
});

const updateStatus = utils.asyncHandler(async (req, res) => {
  const customer = await adminCustomerService.updateStatus(req.params.customerId, req.body.status);
  response.success(res, { message: `Customer status updated to '${customer.status}'`, data: customer });
});

module.exports = { createCustomer, getCustomer, listCustomers, updateCustomer, updateStatus };

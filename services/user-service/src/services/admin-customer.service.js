const { errors, utils } = require('@freshmart/service-shared');
const adminCustomerRepository = require('../repositories/admin-customer.repository');
const { VALID_STATUSES } = require('../repositories/admin-customer.repository');

const { NotFoundError, ValidationError, ConflictError } = errors;

// Allowed transitions: from -> [to, ...]
const ALLOWED_TRANSITIONS = {
  ACTIVE: ['INACTIVE', 'BLOCKED'],
  INACTIVE: ['ACTIVE', 'BLOCKED'],
  BLOCKED: ['ACTIVE', 'INACTIVE'],
  null: ['ACTIVE', 'INACTIVE', 'BLOCKED'],
};

const createAdminCustomerService = ({ repository = adminCustomerRepository } = {}) => {
  const listCustomers = async (query) => {
    const result = await repository.list(query);
    return {
      items: result.items,
      meta: {
        ...utils.pagination.buildMeta({ total: result.total, page: result.page, limit: result.pageSize }),
        pageSize: result.pageSize,
        summary: result.summary,
      },
    };
  };

  const getCustomer = async (customerId) => {
    const customer = await repository.findById(customerId);
    if (!customer) throw new NotFoundError(`Customer '${customerId}' not found`);
    return customer;
  };

  const updateStatus = async (customerId, newStatus) => {
    const customer = await repository.findById(customerId);
    if (!customer) throw new NotFoundError(`Customer '${customerId}' not found`);

    const currentStatus = customer.status || null;
    const allowed = ALLOWED_TRANSITIONS[currentStatus] || VALID_STATUSES;

    if (!allowed.includes(newStatus)) {
      throw new ConflictError(
        `Transition from '${currentStatus}' to '${newStatus}' is not permitted`
      );
    }

    const updated = await repository.updateStatus(customerId, newStatus);
    if (!updated) throw new NotFoundError(`Customer '${customerId}' not found`);

    return { ...customer, status: newStatus, updatedAt: updated.updatedAt };
  };

  const createCustomer = async (data) => {
    return repository.createCustomer(data);
  };

  const updateCustomer = async (customerId, data) => {
    return repository.updateCustomer(customerId, data);
  };

  return { createCustomer, getCustomer, listCustomers, updateCustomer, updateStatus };
};

const service = createAdminCustomerService();

module.exports = service;
module.exports.createAdminCustomerService = createAdminCustomerService;
module.exports.ALLOWED_TRANSITIONS = ALLOWED_TRANSITIONS;

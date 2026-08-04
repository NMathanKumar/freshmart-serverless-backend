const adminRepository = require('../repositories/admin.repository');
const { createEntityService } = require('./entity.service');

const ENTITY_TYPE = 'SUPPLIER';

const ALLOWED_TRANSITIONS = {
  ACTIVE: ['INACTIVE', 'BLOCKED'],
  INACTIVE: ['ACTIVE', 'BLOCKED'],
  BLOCKED: ['ACTIVE', 'INACTIVE'],
};

const createSupplierService = ({ repository = adminRepository } = {}) => {
  const base = createEntityService({
    entityType: ENTITY_TYPE,
    idPrefix: 'SUP',
    repository,
    searchFields: ['name', 'companyName', 'email', 'contactPerson', 'gstNumber', 'panNumber', 'supplierCode', 'city', 'state'],
    allowedTransitions: ALLOWED_TRANSITIONS,
  });

  return base;
};

const service = createSupplierService();
module.exports = service;
module.exports.createSupplierService = createSupplierService;
module.exports.ENTITY_TYPE = ENTITY_TYPE;
module.exports.ALLOWED_TRANSITIONS = ALLOWED_TRANSITIONS;

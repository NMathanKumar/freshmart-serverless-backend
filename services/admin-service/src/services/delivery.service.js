const adminRepository = require('../repositories/admin.repository');
const { createEntityService, buildList } = require('./entity.service');
const { errors, utils } = require('@freshmart/service-shared');
const { ConflictError } = errors;
const { genId } = utils.id;

const ENTITY_TYPE = 'DELIVERY';

const ALLOWED_TRANSITIONS = {
  ASSIGNED: ['PACKED', 'CANCELLED'],
  PACKED: ['OUT_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

const createDeliveryService = ({ repository = adminRepository } = {}) => {
  const base = createEntityService({
    entityType: ENTITY_TYPE,
    idPrefix: 'DEL',
    repository,
    searchFields: ['orderId', 'driverName', 'trackingNumber'],
    allowedTransitions: ALLOWED_TRANSITIONS,
  });

  const list = async (query = {}) => {
    const all = await repository.listByEntityType(ENTITY_TYPE);
    const { driverId, ...rest } = query;
    return buildList(all, {
      ...rest,
      searchFields: ['orderId', 'driverName', 'trackingNumber'],
      extraFilter: driverId ? (item) => item.data?.driverId === driverId : undefined,
    });
  };

  const create = async (data, createdBy = 'admin') => {
    const id = genId('DEL');
    return repository.createEntity({
      entityType: ENTITY_TYPE,
      itemId: id,
      data: {
        ...data,
        trackingNumber: `TRK-${id.split('_')[1]?.slice(0, 8).toUpperCase() || Date.now()}`,
        statusHistory: [{ status: 'ASSIGNED', timestamp: new Date().toISOString() }],
      },
      status: 'ASSIGNED',
      createdBy,
    });
  };

  const updateStatus = async (id, { status, note }) => {
    const current = await base.getById(id);
    const allowed = ALLOWED_TRANSITIONS[current.status] || [];
    if (!allowed.includes(status)) {
      throw new ConflictError(`Cannot transition delivery from '${current.status}' to '${status}'`);
    }
    const history = [...(current.data?.statusHistory || []), { status, timestamp: new Date().toISOString(), note: note || null }];
    return repository.saveEntity({
      entityType: ENTITY_TYPE,
      itemId: id,
      data: { ...current.data, statusHistory: history },
      status,
      createdBy: current.createdBy || 'admin',
    });
  };

  const assignDriver = async (id, { driverId, driverName, driverPhone }) => {
    const current = await base.getById(id);
    if (current.status === 'DELIVERED' || current.status === 'CANCELLED') {
      throw new ConflictError(`Cannot assign driver to delivery in status '${current.status}'`);
    }
    return repository.saveEntity({
      entityType: ENTITY_TYPE,
      itemId: id,
      data: { ...current.data, driverId, driverName: driverName || null, driverPhone: driverPhone || null },
      status: current.status,
      createdBy: current.createdBy || 'admin',
    });
  };

  const cancel = async (id, { reason } = {}) => {
    const current = await base.getById(id);
    const allowed = ALLOWED_TRANSITIONS[current.status] || [];
    if (!allowed.includes('CANCELLED')) {
      throw new ConflictError(`Delivery '${id}' cannot be cancelled in status '${current.status}'`);
    }
    const history = [...(current.data?.statusHistory || []), { status: 'CANCELLED', timestamp: new Date().toISOString(), reason: reason || null }];
    return repository.saveEntity({
      entityType: ENTITY_TYPE,
      itemId: id,
      data: { ...current.data, statusHistory: history, cancelReason: reason || null },
      status: 'CANCELLED',
      createdBy: current.createdBy || 'admin',
    });
  };

  const getStatistics = async () => {
    const all = await repository.listByEntityType(ENTITY_TYPE);
    return {
      total: all.length,
      assigned: all.filter((i) => i.status === 'ASSIGNED').length,
      packed: all.filter((i) => i.status === 'PACKED').length,
      outForDelivery: all.filter((i) => i.status === 'OUT_FOR_DELIVERY').length,
      delivered: all.filter((i) => i.status === 'DELIVERED').length,
      cancelled: all.filter((i) => i.status === 'CANCELLED').length,
    };
  };

  return { ...base, list, create, updateStatus, assignDriver, cancel, getStatistics };
};

const service = createDeliveryService();
module.exports = service;
module.exports.createDeliveryService = createDeliveryService;
module.exports.ENTITY_TYPE = ENTITY_TYPE;
module.exports.ALLOWED_TRANSITIONS = ALLOWED_TRANSITIONS;

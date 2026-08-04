const adminRepository = require('../repositories/admin.repository');
const { createEntityService } = require('./entity.service');
const { errors, utils } = require('@freshmart/service-shared');
const { ConflictError, NotFoundError, ValidationError } = errors;

const ENTITY_TYPE = 'PURCHASE_ORDER';

const { publishAdminEvent } = require('../events/publisher');

const publishEvent = (eventName, payload) => {
  return publishAdminEvent(eventName, payload).catch(err => {
    require('@freshmart/service-shared').logger.error(`Failed to publish ${eventName}`, err);
  });
};

const ALLOWED_TRANSITIONS = {
  DRAFT: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['ORDERED', 'CANCELLED'],
  REJECTED: ['DRAFT', 'CANCELLED'],
  ORDERED: ['PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'],
  PARTIALLY_RECEIVED: ['PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'],
  RECEIVED: [],
  CANCELLED: [],
};

const normalizeNumber = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };

const computeSubtotal = (items = []) =>
  items.reduce((sum, item) => sum + normalizeNumber(item.unitPrice) * normalizeNumber(item.quantityOrdered), 0);

const computeTotal = (data) => {
  const subtotal = data.subtotal ?? computeSubtotal(data.items);
  const tax = normalizeNumber(data.tax);
  const shipping = normalizeNumber(data.shippingCost);
  const discount = normalizeNumber(data.discount);
  return Math.max(0, subtotal + tax + shipping - discount);
};

const generatePoNumber = async (repository) => {
  if (typeof repository.getNextSequence !== 'function') {
    return utils.id.genId('PO'); // Fallback if not available
  }
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const seq = await repository.getNextSequence(`PO_${dateStr}`);
  const paddedSeq = String(seq).padStart(6, '0');
  return `PO-${dateStr}-${paddedSeq}`;
};

/**
 * Call the inventory service's increase endpoint for each received item.
 */
const increaseInventory = async (productId, warehouseId, quantity) => {
  const baseUrl = process.env.INVENTORY_SERVICE_URL || process.env.MENU_SERVICE_URL || '';
  if (!baseUrl) return null;
  try {
    const res = await fetch(
      `${baseUrl.replace(/\/+$/, '')}/v1/inventory/${encodeURIComponent(productId)}/increase`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-service-token': process.env.INTERNAL_SERVICE_TOKEN || '',
        },
        body: JSON.stringify({ quantity, warehouseId }),
      }
    );
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Inventory increase failed for ${productId}: ${res.status} ${text}`);
    }
    return res.json().catch(() => null);
  } catch (err) {
    require('@freshmart/service-shared').logger.warn('Inventory increase call failed', {
      productId, warehouseId, quantity, error: err.message,
    });
    return null;
  }
};

const createPurchaseOrderService = ({ repository = adminRepository, inventoryIncrease = increaseInventory } = {}) => {
  const base = createEntityService({
    entityType: ENTITY_TYPE,
    idPrefix: 'PO',
    repository,
    searchFields: ['supplierName', 'supplierId', 'poNumber'],
    allowedTransitions: ALLOWED_TRANSITIONS,
  });

  const create = async (data, createdBy = 'admin') => {
    // Validate dates
    if (data.expectedDeliveryDate && data.orderDate && new Date(data.expectedDeliveryDate) < new Date(data.orderDate)) {
      throw new ValidationError("expectedDeliveryDate cannot be before orderDate");
    }

    const id = utils.id.genId('PO');
    const poNumber = await generatePoNumber(repository);
    
    const items = (data.items || []).map(item => ({
      ...item,
      quantityReceived: 0,
      lineTotal: normalizeNumber(item.unitPrice) * normalizeNumber(item.quantityOrdered)
    }));

    const enrichedData = { ...data, items };
    enrichedData.subtotal = computeSubtotal(items);
    enrichedData.totalAmount = computeTotal(enrichedData);
    enrichedData.poNumber = poNumber;

    const created = await repository.createEntity({
      entityType: ENTITY_TYPE,
      itemId: id,
      data: enrichedData,
      status: 'DRAFT',
      createdBy,
    });
    publishEvent('PurchaseOrderCreated', created);
    return created;
  };

  const update = async (id, data, updatedBy = 'admin') => {
    const current = await base.getById(id);
    
    // Block editing if it's already approved/ordered, unless it's moving back to draft
    if (!['DRAFT', 'SUBMITTED', 'REJECTED'].includes(current.status)) {
      throw new ConflictError(`Purchase order '${id}' cannot be edited in status '${current.status}'`);
    }

    if (data.expectedDeliveryDate && data.orderDate && new Date(data.expectedDeliveryDate) < new Date(data.orderDate)) {
      throw new ValidationError("expectedDeliveryDate cannot be before orderDate");
    }

    let items = current.data.items;
    if (data.items) {
      items = data.items.map(item => ({
        ...item,
        quantityReceived: item.quantityReceived || 0,
        lineTotal: normalizeNumber(item.unitPrice) * normalizeNumber(item.quantityOrdered)
      }));
    }

    const mergedData = { ...current.data, ...data, items };
    mergedData.subtotal = computeSubtotal(items);
    mergedData.totalAmount = computeTotal(mergedData);

    return repository.saveEntity({
      entityType: ENTITY_TYPE,
      itemId: id,
      data: mergedData,
      status: current.status,
      createdBy: current.createdBy || updatedBy,
    });
  };

  const updateStatus = async (id, newStatus, actor = 'admin', metadata = {}) => {
    const current = await base.getById(id);
    const allowed = ALLOWED_TRANSITIONS[current.status] || [];
    
    if (!allowed.includes(newStatus)) {
      throw new ConflictError(`Cannot transition PO from '${current.status}' to '${newStatus}'`);
    }

    const data = { ...current.data, ...metadata };

    if (newStatus === 'APPROVED') {
      data.approvalStatus = 'APPROVED';
      data.approvedBy = actor;
      data.approvedAt = new Date().toISOString();
    } else if (newStatus === 'REJECTED') {
      data.approvalStatus = 'REJECTED';
      data.rejectedBy = actor;
      data.rejectedAt = new Date().toISOString();
    }

    const updated = await repository.saveEntity({
      entityType: ENTITY_TYPE,
      itemId: id,
      data,
      status: newStatus,
      createdBy: current.createdBy,
    });

    if (newStatus === 'SUBMITTED') {
      publishEvent('PurchaseOrderSubmitted', updated);
    } else if (newStatus === 'APPROVED') {
      publishEvent('PurchaseOrderApproved', updated);
    }

    return updated;
  };

  const receive = async (id, { warehouseId, receivedItems = [], notes } = {}, actor = 'admin') => {
    if (!warehouseId) throw new ValidationError("warehouseId is required for receiving items");
    const current = await base.getById(id);
    if (!['ORDERED', 'PARTIALLY_RECEIVED'].includes(current.status)) {
      throw new ConflictError(`PO '${id}' must be in ORDERED or PARTIALLY_RECEIVED status to receive items (current: '${current.status}')`);
    }

    let allFullyReceived = true;

    // Process receipts
    const updatedItems = (current.data?.items || []).map((item) => {
      const receipt = receivedItems.find((r) => r.productId === item.productId);
      const newlyReceived = receipt ? normalizeNumber(receipt.receivedQuantity) : 0;
      const totalReceived = (normalizeNumber(item.quantityReceived) + newlyReceived);
      
      if (totalReceived < normalizeNumber(item.quantityOrdered)) {
        allFullyReceived = false;
      }
      
      return { ...item, quantityReceived: totalReceived };
    });

    // Update inventory synchronously for newly received quantities
    await Promise.all(
      receivedItems.map(({ productId, receivedQuantity }) =>
        receivedQuantity > 0 ? inventoryIncrease(productId, warehouseId, receivedQuantity) : Promise.resolve(null)
      )
    );

    const newStatus = allFullyReceived ? 'RECEIVED' : 'PARTIALLY_RECEIVED';
    const timestamp = new Date().toISOString();
    
    const receiptHistory = current.data.receiptHistory || [];
    receiptHistory.push({
      receivedAt: timestamp,
      receivedBy: actor,
      notes,
      items: receivedItems
    });

    const updated = await repository.saveEntity({
      entityType: ENTITY_TYPE,
      itemId: id,
      data: {
        ...current.data,
        items: updatedItems,
        receiptHistory,
        actualDeliveryDate: newStatus === 'RECEIVED' ? timestamp : current.data.actualDeliveryDate,
      },
      status: newStatus,
      createdBy: current.createdBy,
    });

    publishEvent('PurchaseOrderReceived', updated);
    return updated;
  };

  const cancel = async (id, { reason } = {}, actor = 'admin') => {
    const current = await base.getById(id);
    const allowed = ALLOWED_TRANSITIONS[current.status] || [];
    if (!allowed.includes('CANCELLED')) {
      throw new ConflictError(`Purchase order '${id}' cannot be cancelled in status '${current.status}'`);
    }
    return repository.saveEntity({
      entityType: ENTITY_TYPE,
      itemId: id,
      data: { ...current.data, cancelReason: reason || null, cancelledBy: actor, cancelledAt: new Date().toISOString() },
      status: 'CANCELLED',
      createdBy: current.createdBy,
    });
  };

  const autoGeneratePurchaseOrders = async (items, context = {}) => {
    const supplierGroups = {};
    for (const item of items) {
      if (!item.warehouseId) throw new ValidationError("warehouseId is required on all items for autoGeneratePurchaseOrders");
      const key = `${item.supplierId}#${item.warehouseId}`;
      if (!supplierGroups[key]) {
        supplierGroups[key] = { supplierId: item.supplierId, warehouseId: item.warehouseId, items: [] };
      }
      supplierGroups[key].items.push(item);
    }

    const createdDrafts = [];
    
    for (const group of Object.values(supplierGroups)) {
      const { supplierId, warehouseId, items: supplierItems } = group;
      let supplier;
      try {
        supplier = await repository.getEntity('SUPPLIER', supplierId);
      } catch (err) {
        if (err.name === 'NotFoundError' || err.statusCode === 404) {
          require('@freshmart/service-shared').logger?.warn(`Supplier ${supplierId} not found. Skipping auto-generate.`);
          continue;
        }
        throw err;
      }
      
      if (!supplier || !supplier.data) {
        require('@freshmart/service-shared').logger?.warn(`Supplier ${supplierId} not found. Skipping auto-generate.`);
        continue;
      }
      
      const leadTimeDays = supplier.data?.leadTimeDays || 7;
      const orderDate = new Date();
      const expectedDeliveryDate = new Date(orderDate);
      expectedDeliveryDate.setDate(orderDate.getDate() + leadTimeDays);
      
      const poItems = supplierItems.map(item => ({
        productId: item.productId,
        quantityOrdered: item.recommendedQty,
        unitPrice: item.unitCost,
      }));
      
      const poData = {
        supplierId,
        warehouseId,
        supplierName: supplier.data?.name || 'Unknown Supplier',
        orderDate: orderDate.toISOString(),
        expectedDeliveryDate: expectedDeliveryDate.toISOString(),
        items: poItems,
      };
      
      const actor = context.user || 'SYSTEM';
      const created = await create(poData, actor);
      createdDrafts.push(created);
    }
    
    return createdDrafts;
  };

  return { ...base, create, update, updateStatus, receive, cancel, autoGeneratePurchaseOrders };
};

const service = createPurchaseOrderService();
module.exports = service;
module.exports.createPurchaseOrderService = createPurchaseOrderService;
module.exports.ENTITY_TYPE = ENTITY_TYPE;
module.exports.ALLOWED_TRANSITIONS = ALLOWED_TRANSITIONS;
module.exports.computeSubtotal = computeSubtotal;
module.exports.computeTotal = computeTotal;

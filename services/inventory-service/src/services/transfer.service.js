const { randomUUID } = require('crypto');
const { errors } = require('@freshmart/service-shared');
const { BadRequestError, ConflictError, NotFoundError } = errors;
const transferRepo = require('../repositories/transfer.repository');
const inventoryRepo = require('../repositories/inventory.repository');
const { publishInventoryUpdated } = require('../events/publisher');

// Mock publisher for Transfer events as per prompt: "Prepare event publishing hooks."
const publishEvent = (eventName, payload) => {
  console.log(`[EVENT] ${eventName}`, JSON.stringify(payload));
  // In the future, this would send to SNS/EventBridge
};

const getTransferOrThrow = async (id) => {
  const transfer = await transferRepo.getTransfer(id);
  if (!transfer) throw new NotFoundError(`Transfer ${id} not found`);
  return transfer;
};

const createTransfer = async (data, context = {}) => {
  if (data.sourceWarehouseId === data.destinationWarehouseId) {
    throw new BadRequestError('Source and destination warehouses cannot be the same');
  }

  // Pre-fill item quantities
  const items = data.items.map(item => ({
    ...item,
    reservedQty: 0,
    dispatchedQty: 0,
    receivedQty: 0,
    remainingQty: item.requestedQty,
  }));

  const transfer = await transferRepo.createTransfer({
    ...data,
    items,
    requestedBy: context.userId || 'SYSTEM',
  });

  publishEvent('TransferRequested', transfer);
  return transfer;
};

const submitTransfer = async (id, data, context = {}) => {
  const transfer = await getTransferOrThrow(id);
  if (transfer.status !== 'DRAFT') {
    throw new ConflictError(`Cannot submit transfer in status ${transfer.status}`);
  }

  const updated = await transferRepo.saveTransfer(id, {
    status: 'REQUESTED',
    statusHistory: [
      ...(transfer.statusHistory || []),
      { status: 'REQUESTED', changedBy: context.userId || 'SYSTEM', changedAt: new Date().toISOString(), remarks: 'Submitted for approval' }
    ]
  }, transfer.version);

  publishEvent('TransferRequested', updated);
  return updated;
};

const resolveApprovalLevel = (totalQuantity) => {
  if (totalQuantity <= 100) return 'AUTO';
  if (totalQuantity <= 500) return 'WAREHOUSE_MANAGER';
  return 'OPERATIONS_MANAGER';
};

const computeStatus = (currentStock, minimumStock) => {
  const stock = Number(currentStock);
  const min = Number(minimumStock);
  if (stock <= 0) return 'OUT_OF_STOCK';
  if (stock <= min) return 'LOW_STOCK';
  return 'ACTIVE';
};

const buildInventoryUpdate = (inventory, currentStockDelta, reservedStockDelta) => {
  const nextCurrent = Number(inventory.currentStock) + currentStockDelta;
  const nextReserved = Number(inventory.reservedStock || 0) + reservedStockDelta;
  const nextAvailable = Math.max(nextCurrent - nextReserved, 0);
  const nextVersion = Number(inventory.version || 0) + 1;
  const status = computeStatus(nextCurrent, inventory.minimumStock || 10);
  const now = new Date().toISOString();

  if (nextCurrent < 0) {
    throw new BadRequestError(`Negative inventory prevented for product ${inventory.productId}`);
  }

  return {
    ...inventoryRepo.key(inventory.productId, inventory.warehouseId),
    pk: `PRODUCT#${inventory.productId}`,
    sk: `WAREHOUSE#${inventory.warehouseId}`,
    ...inventory,
    currentStock: nextCurrent,
    reservedStock: nextReserved,
    availableStock: nextAvailable,
    status,
    isLowStock: status !== 'ACTIVE',
    version: nextVersion,
    updatedAt: now,
  };
};

const buildMovement = (productId, warehouseId, movementType, quantity, beforeQty, afterQty, reason, referenceId, context) => {
  const now = new Date().toISOString();
  const uuid = randomUUID();
  const movementId = `MVT_${uuid.replace(/-/g, '')}`;

  return {
    pk: `PRODUCT#${productId}`,
    sk: `MOVEMENT#${now}#${uuid}`,
    movementId,
    movementNumber: movementId,
    productId,
    warehouseId,
    movementType,
    quantity,
    beforeQuantity: beforeQty,
    afterQuantity: afterQty,
    reason,
    status: 'COMPLETED',
    referenceType: 'TRANSFER',
    referenceId,
    createdBy: context.userId || 'SYSTEM',
    createdAt: now,
    updatedAt: now,
    transactionId: context.transactionId || randomUUID(),
    gsi1pk: warehouseId,
    gsi1sk: now,
    gsi2pk: movementType,
    gsi2sk: now,
    gsi3pk: referenceId,
    gsi3sk: now,
  };
};

const approveTransfer = async (id, context = {}) => {
  const transfer = await getTransferOrThrow(id);
  if (!['DRAFT', 'REQUESTED'].includes(transfer.status)) {
    throw new ConflictError(`Cannot approve transfer in status ${transfer.status}`);
  }

  // Load inventories to reserve from source warehouse
  const inventories = await Promise.all(transfer.items.map(i => inventoryRepo.loadInventory(i.productId, transfer.sourceWarehouseId)));
  const inventoryMap = new Map(inventories.filter(Boolean).map(i => [i.productId, i]));

  const transactItems = [];
  const updatedItems = transfer.items.map(item => {
    const inv = inventoryMap.get(item.productId);
    if (!inv) throw new BadRequestError(`Product ${item.productId} not found in inventory`);
    
    // Check available stock (can we reserve?)
    // Prompt says "Approved transfers SHALL reserve inventory."
    // Prevent overselling.
    if (inv.availableStock < item.requestedQty) {
      throw new ConflictError(`Insufficient available stock for product ${item.productId}. Available: ${inv.availableStock}, Requested: ${item.requestedQty}`);
    }

    // Build inventory update (Reserve stock)
    const nextInv = buildInventoryUpdate(inv, 0, item.requestedQty);
    
    transactItems.push({
      Put: {
        TableName: transferRepo.tableName(),
        Item: nextInv,
        ConditionExpression: '#version = :expectedVersion',
        ExpressionAttributeNames: { '#version': 'version' },
        ExpressionAttributeValues: { ':expectedVersion': inv.version || 0 },
      }
    });

    return { ...item, reservedQty: item.requestedQty };
  });

  const now = new Date().toISOString();
  const nextVersion = Number(transfer.version || 0) + 1;
  const level = resolveApprovalLevel(transfer.totalQuantity);

  const updatedTransfer = {
    ...transferRepo.key(id),
    ...transfer,
    status: 'APPROVED',
    approvalStatus: 'APPROVED',
    approvalLevel: level,
    approvedBy: context.userId || 'SYSTEM',
    approvedAt: now,
    items: updatedItems,
    version: nextVersion,
    updatedAt: now,
    gsi3pk: 'APPROVED',
    gsi3sk: transfer.createdAt,
    statusHistory: [
      ...(transfer.statusHistory || []),
      { status: 'APPROVED', changedBy: context.userId || 'SYSTEM', changedAt: now, remarks: `Approved at level ${level}` }
    ]
  };

  transactItems.push({
    Put: {
      TableName: transferRepo.tableName(),
      Item: updatedTransfer,
      ConditionExpression: '#version = :expectedVersion',
      ExpressionAttributeNames: { '#version': 'version' },
      ExpressionAttributeValues: { ':expectedVersion': transfer.version || 0 },
    }
  });

  await transferRepo.executeTransaction(transactItems);
  publishEvent('TransferApproved', updatedTransfer);
  return updatedTransfer;
};

const rejectTransfer = async (id, payload, context = {}) => {
  const transfer = await getTransferOrThrow(id);
  if (!['DRAFT', 'REQUESTED'].includes(transfer.status)) {
    throw new ConflictError(`Cannot reject transfer in status ${transfer.status}`);
  }

  const updated = await transferRepo.saveTransfer(id, {
    status: 'REJECTED',
    approvalStatus: 'REJECTED',
    rejectedBy: context.userId || 'SYSTEM',
    rejectionReason: payload.rejectionReason,
    statusHistory: [
      ...(transfer.statusHistory || []),
      { status: 'REJECTED', changedBy: context.userId || 'SYSTEM', changedAt: new Date().toISOString(), remarks: payload.rejectionReason }
    ]
  }, transfer.version);

  publishEvent('TransferRejected', updated);
  return updated;
};

const dispatchTransfer = async (id, payload, context = {}) => {
  const transfer = await getTransferOrThrow(id);
  if (transfer.status !== 'APPROVED') {
    throw new ConflictError(`Cannot dispatch transfer. Must be APPROVED (current: ${transfer.status})`);
  }

  // Map payload dispatch items
  const dispatchMap = new Map(payload.items.map(i => [i.productId, i.dispatchedQty]));

  const inventories = await Promise.all(transfer.items.map(i => inventoryRepo.loadInventory(i.productId, transfer.sourceWarehouseId)));
  const inventoryMap = new Map(inventories.filter(Boolean).map(i => [i.productId, i]));

  const transactItems = [];
  const updatedItems = transfer.items.map(item => {
    const dispatchQty = dispatchMap.get(item.productId) || 0;
    if (dispatchQty > item.reservedQty) {
      throw new ConflictError(`Cannot dispatch ${dispatchQty} for ${item.productId} (Reserved: ${item.reservedQty})`);
    }

    const inv = inventoryMap.get(item.productId);
    if (!inv) throw new BadRequestError(`Product ${item.productId} not found in inventory`);

    // 1 Update source inventory (decrease current, decrease reserved)
    const nextInv = buildInventoryUpdate(inv, -dispatchQty, -dispatchQty);

    transactItems.push({
      Put: {
        TableName: transferRepo.tableName(),
        Item: nextInv,
        ConditionExpression: '#version = :expectedVersion',
        ExpressionAttributeNames: { '#version': 'version' },
        ExpressionAttributeValues: { ':expectedVersion': inv.version || 0 },
      }
    });

    // 3 Create TRANSFER_OUT ledger
    if (dispatchQty > 0) {
      transactItems.push({
        Put: {
          TableName: transferRepo.tableName(),
          Item: buildMovement(item.productId, transfer.sourceWarehouseId, 'TRANSFER_OUT', dispatchQty, inv.currentStock, nextInv.currentStock, 'TRANSFER', transfer.transferNumber, context),
          ConditionExpression: 'attribute_not_exists(pk)',
        }
      });
    }

    return { 
      ...item, 
      dispatchedQty: dispatchQty,
      remainingQty: item.requestedQty - dispatchQty 
    };
  });

  const now = new Date().toISOString();
  const nextVersion = Number(transfer.version || 0) + 1;

  const updatedTransfer = {
    ...transferRepo.key(id),
    ...transfer,
    ...payload,
    status: 'IN_TRANSIT',
    dispatchedBy: context.userId || 'SYSTEM',
    actualDispatchDate: now,
    items: updatedItems,
    version: nextVersion,
    updatedAt: now,
    gsi3pk: 'IN_TRANSIT',
    gsi3sk: transfer.createdAt,
    statusHistory: [
      ...(transfer.statusHistory || []),
      { status: 'IN_TRANSIT', changedBy: context.userId || 'SYSTEM', changedAt: now, remarks: payload.dispatchRemarks || 'Dispatched' }
    ]
  };

  transactItems.push({
    Put: {
      TableName: transferRepo.tableName(),
      Item: updatedTransfer,
      ConditionExpression: '#version = :expectedVersion',
      ExpressionAttributeNames: { '#version': 'version' },
      ExpressionAttributeValues: { ':expectedVersion': transfer.version || 0 },
    }
  });

  await transferRepo.executeTransaction(transactItems);
  publishEvent('TransferDispatched', updatedTransfer);
  return updatedTransfer;
};

const receiveTransfer = async (id, payload, context = {}) => {
  const transfer = await getTransferOrThrow(id);
  if (!['IN_TRANSIT', 'PARTIALLY_RECEIVED'].includes(transfer.status)) {
    throw new ConflictError(`Cannot receive transfer in status ${transfer.status}`);
  }

  const receiveMap = new Map(payload.items.map(i => [i.productId, i.receivedQty]));
  
  const inventories = await Promise.all(transfer.items.map(i => inventoryRepo.loadInventory(i.productId, transfer.destinationWarehouseId)));
  const inventoryMap = new Map(inventories.filter(Boolean).map(i => [i.productId, i]));

  const transactItems = [];
  let allFullyReceived = true;

  const updatedItems = transfer.items.map(item => {
    const newlyReceivedQty = receiveMap.get(item.productId) || 0;
    const totalReceived = (item.receivedQty || 0) + newlyReceivedQty;

    if (totalReceived > item.dispatchedQty) {
      throw new ConflictError(`Cannot receive ${totalReceived} for ${item.productId} (Dispatched: ${item.dispatchedQty})`);
    }

    if (totalReceived < item.dispatchedQty) {
      allFullyReceived = false;
    }

    let inv = inventoryMap.get(item.productId);
    if (!inv) {
      // Destination warehouse might not have inventory record yet for this product.
      // So we must initialize it if missing. But transactWrite needs the item.
      inv = {
        productId: item.productId,
        warehouseId: transfer.destinationWarehouseId,
        currentStock: 0,
        minimumStock: 10,
        reservedStock: 0,
        version: 0,
        isLowStock: true,
      };
    }

    // 1 Increase destination inventory
    const nextInv = buildInventoryUpdate(inv, newlyReceivedQty, 0);

    transactItems.push({
      Put: {
        TableName: transferRepo.tableName(),
        Item: nextInv,
        ConditionExpression: inv.inventoryId ? '#version = :expectedVersion' : 'attribute_not_exists(pk)',
        ExpressionAttributeNames: inv.inventoryId ? { '#version': 'version' } : undefined,
        ExpressionAttributeValues: inv.inventoryId ? { ':expectedVersion': inv.version || 0 } : undefined,
      }
    });

    // 2 Create TRANSFER_IN ledger
    if (newlyReceivedQty > 0) {
      transactItems.push({
        Put: {
          TableName: transferRepo.tableName(),
          Item: buildMovement(item.productId, transfer.destinationWarehouseId, 'TRANSFER_IN', newlyReceivedQty, inv.currentStock, nextInv.currentStock, 'TRANSFER', transfer.transferNumber, context),
          ConditionExpression: 'attribute_not_exists(pk)',
        }
      });
    }

    return { 
      ...item, 
      receivedQty: totalReceived,
      remainingQty: item.dispatchedQty - totalReceived 
    };
  });

  const now = new Date().toISOString();
  const nextVersion = Number(transfer.version || 0) + 1;
  const newStatus = allFullyReceived ? 'RECEIVED' : 'PARTIALLY_RECEIVED';

  const updatedTransfer = {
    ...transferRepo.key(id),
    ...transfer,
    ...payload,
    status: newStatus,
    receivedBy: context.userId || 'SYSTEM',
    actualArrivalDate: newStatus === 'RECEIVED' ? now : transfer.actualArrivalDate,
    items: updatedItems,
    version: nextVersion,
    updatedAt: now,
    gsi3pk: newStatus,
    gsi3sk: transfer.createdAt,
    statusHistory: [
      ...(transfer.statusHistory || []),
      { status: newStatus, changedBy: context.userId || 'SYSTEM', changedAt: now, remarks: payload.receivingRemarks || 'Received' }
    ]
  };

  transactItems.push({
    Put: {
      TableName: transferRepo.tableName(),
      Item: updatedTransfer,
      ConditionExpression: '#version = :expectedVersion',
      ExpressionAttributeNames: { '#version': 'version' },
      ExpressionAttributeValues: { ':expectedVersion': transfer.version || 0 },
    }
  });

  await transferRepo.executeTransaction(transactItems);
  
  if (newStatus === 'RECEIVED') {
    publishEvent('TransferReceived', updatedTransfer);
    publishEvent('TransferCompleted', updatedTransfer);
  } else {
    publishEvent('TransferPartiallyReceived', updatedTransfer);
  }
  
  return updatedTransfer;
};

const cancelTransfer = async (id, payload, context = {}) => {
  const transfer = await getTransferOrThrow(id);
  if (!['DRAFT', 'REQUESTED', 'APPROVED'].includes(transfer.status)) {
    throw new ConflictError(`Cannot cancel transfer in status ${transfer.status}`);
  }

  const transactItems = [];
  
  // If approved, we need to un-reserve the inventory
  if (transfer.status === 'APPROVED') {
    const inventories = await Promise.all(transfer.items.map(i => inventoryRepo.loadInventory(i.productId, transfer.sourceWarehouseId)));
    const inventoryMap = new Map(inventories.filter(Boolean).map(i => [i.productId, i]));

    for (const item of transfer.items) {
      if (item.reservedQty > 0) {
        const inv = inventoryMap.get(item.productId);
        if (inv) {
          const nextInv = buildInventoryUpdate(inv, 0, -item.reservedQty);
          transactItems.push({
            Put: {
              TableName: transferRepo.tableName(),
              Item: nextInv,
              ConditionExpression: '#version = :expectedVersion',
              ExpressionAttributeNames: { '#version': 'version' },
              ExpressionAttributeValues: { ':expectedVersion': inv.version || 0 },
            }
          });
        }
      }
    }
  }

  const now = new Date().toISOString();
  const nextVersion = Number(transfer.version || 0) + 1;

  const updatedTransfer = {
    ...transferRepo.key(id),
    ...transfer,
    status: 'CANCELLED',
    version: nextVersion,
    updatedAt: now,
    gsi3pk: 'CANCELLED',
    gsi3sk: transfer.createdAt,
    statusHistory: [
      ...(transfer.statusHistory || []),
      { status: 'CANCELLED', changedBy: context.userId || 'SYSTEM', changedAt: now, remarks: payload.cancelReason }
    ]
  };

  transactItems.push({
    Put: {
      TableName: transferRepo.tableName(),
      Item: updatedTransfer,
      ConditionExpression: '#version = :expectedVersion',
      ExpressionAttributeNames: { '#version': 'version' },
      ExpressionAttributeValues: { ':expectedVersion': transfer.version || 0 },
    }
  });

  await transferRepo.executeTransaction(transactItems);
  publishEvent('TransferCancelled', updatedTransfer);
  return updatedTransfer;
};

module.exports = {
  createTransfer,
  submitTransfer,
  approveTransfer,
  rejectTransfer,
  dispatchTransfer,
  receiveTransfer,
  cancelTransfer,
};

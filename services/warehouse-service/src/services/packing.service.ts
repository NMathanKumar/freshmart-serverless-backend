import { adminRepository } from '../repositories/admin.repository.js';
import { DomainError } from '@freshmart/platform-core';
import { v4 as uuidv4 } from 'uuid';

export class PackingService {
  async createPackage(fulfillmentId: string, dimensions: any, weight: number, labels: string[]) {
    if (!fulfillmentId || !dimensions || weight <= 0) {
      throw new DomainError('Fulfillment ID, dimensions, and positive weight are required', 400);
    }

    // Validation: prevent packing before picking is completed
    const pickList = await adminRepository.getEntity('PICK_LIST', fulfillmentId);
    if (!pickList) {
      throw new DomainError(`Pick list for fulfillment ${fulfillmentId} not found. Cannot pack.`, 404);
    }

    if (pickList.data.status !== 'COMPLETED') {
      throw new DomainError('Cannot pack before picking is completed', 409);
    }

    const packageId = uuidv4();
    const data = {
      fulfillmentId,
      dimensions,
      weight,
      labels: labels || [],
      status: 'PACKED',
      inspectionStatus: 'PENDING'
    };

    const result = await adminRepository.createEntity('PACKAGE', packageId, data, 'PACKED');
    return result;
  }

  async qualityInspection(packageId: string, status: string, inspectorId: string) {
    if (!packageId || !status || !inspectorId) {
      throw new DomainError('Package ID, status, and inspector ID are required', 400);
    }

    const validStatuses = ['PASSED', 'FAILED'];
    if (!validStatuses.includes(status)) {
      throw new DomainError('Status must be either PASSED or FAILED', 400);
    }

    const pkg = await adminRepository.getEntity('PACKAGE', packageId);
    if (!pkg) {
      throw new DomainError(`Package with ID ${packageId} not found`, 404);
    }

    if (pkg.data.inspectionStatus !== 'PENDING') {
      throw new DomainError('Package has already been inspected', 409);
    }

    pkg.data.inspectionStatus = status;
    pkg.data.inspectorId = inspectorId;
    pkg.data.inspectionDate = new Date().toISOString();

    if (status === 'PASSED') {
      pkg.data.status = 'READY_FOR_DISPATCH';
    } else {
      pkg.data.status = 'REJECTED';
    }

    const result = await adminRepository.saveEntity('PACKAGE', packageId, pkg.data, pkg.data.status);
    return result;
  }
}

export const packingService = new PackingService();

import type { ApiEnvelope, InventorySummary, InventoryUpdateRequest, ForecastSummary, ForecastItem, ReplenishmentSuggestion, ReplenishmentReport, Reservation } from '../contracts/domain.js';
import { ApiClient } from '../http/create-api-client.js';

export interface MovementSummary {
  movementId: string;
  movementNumber: string;
  productId: string;
  sku: string;
  warehouseId: string;
  movementType: string;
  quantity: number;
  beforeQuantity: number;
  afterQuantity: number;
  reason: string;
  status: string;
  referenceType: string;
  referenceId: string;
  remarks: string;
  createdBy: string;
  approvedBy: string | null;
  createdAt: string;
  updatedAt: string;
  transactionId: string;
}

export interface InventoryAdjustmentPayload {
  amount: number;
  reason?: string;
  warehouseId?: string;
  referenceType?: string;
  referenceId?: string;
  remarks?: string;
  movementType?: string;
}

export class InventoryClient {
  constructor(private readonly client: ApiClient) {}

  listInventory(page = 1, limit = 100, warehouseId?: string, config?: any) {
    return this.client.request<ApiEnvelope<InventorySummary[]>>({
      ...config,
      method: 'GET',
      url: '/v1/inventory',
      params: { page, limit, warehouse: warehouseId }
    });
  }

  getInventory(productId: string, warehouseId?: string) {
    return this.client.request<ApiEnvelope<InventorySummary>>({
      method: 'GET',
      url: `/v1/inventory/${encodeURIComponent(productId)}`,
      params: warehouseId ? { warehouseId } : undefined
    });
  }

  createInventory(payload: Partial<InventorySummary>) {
    return this.client.request<ApiEnvelope<InventorySummary>>({
      method: 'POST',
      url: '/v1/inventory',
      data: payload
    });
  }

  updateInventory(productId: string, payload: InventoryUpdateRequest) {
    return this.client.request<ApiEnvelope<InventorySummary>>({
      method: 'PUT',
      url: `/v1/inventory/${encodeURIComponent(productId)}`,
      data: payload
    });
  }

  updateStock(productId: string, currentStock: number) {
    return this.client.request<ApiEnvelope<InventorySummary>>({
      method: 'PATCH',
      url: `/v1/inventory/${encodeURIComponent(productId)}/stock`,
      data: { currentStock }
    });
  }

  deleteInventory(productId: string) {
    return this.client.request<ApiEnvelope<null>>({
      method: 'DELETE',
      url: `/v1/inventory/${encodeURIComponent(productId)}`
    });
  }

  getLowStock() {
    return this.client.request<ApiEnvelope<InventorySummary[]>>({
      method: 'GET',
      url: '/v1/inventory/alerts/low-stock'
    });
  }

  listAllMovements(params?: { page?: number; limit?: number; warehouseId?: string; movementType?: string }) {
    return this.client.request<ApiEnvelope<MovementSummary[]>>({
      method: 'GET',
      url: '/v1/inventory/movements',
      params
    });
  }

  getInventoryHistory(productId: string, params?: { page?: number; limit?: number; warehouseId?: string; movementType?: string }) {
    return this.client.request<ApiEnvelope<MovementSummary[]>>({
      method: 'GET',
      url: `/v1/inventory/${encodeURIComponent(productId)}/movements`,
      params
    });
  }

  adjustStock(productId: string, payload: InventoryAdjustmentPayload) {
    return this.client.request<ApiEnvelope<InventorySummary>>({
      method: 'POST',
      url: `/v1/inventory/${encodeURIComponent(productId)}/adjustment`,
      data: payload
    });
  }

  adjustDamage(productId: string, payload: InventoryAdjustmentPayload) {
    return this.client.request<ApiEnvelope<InventorySummary>>({
      method: 'POST',
      url: `/v1/inventory/${encodeURIComponent(productId)}/damage`,
      data: payload
    });
  }

  adjustExpired(productId: string, payload: InventoryAdjustmentPayload) {
    return this.client.request<ApiEnvelope<InventorySummary>>({
      method: 'POST',
      url: `/v1/inventory/${encodeURIComponent(productId)}/expired`,
      data: payload
    });
  }

  adjustCycleCount(productId: string, payload: InventoryAdjustmentPayload) {
    return this.client.request<ApiEnvelope<InventorySummary>>({
      method: 'POST',
      url: `/v1/inventory/${encodeURIComponent(productId)}/cycle-count`,
      data: payload
    });
  }

  adjustReturn(productId: string, payload: InventoryAdjustmentPayload) {
    return this.client.request<ApiEnvelope<InventorySummary>>({
      method: 'POST',
      url: `/v1/inventory/${encodeURIComponent(productId)}/return`,
      data: payload
    });
  }

  approveAdjustment(productId: string, movementId: string, remarks?: string) {
    return this.client.request<ApiEnvelope<InventorySummary>>({
      method: 'PATCH',
      url: `/v1/inventory/${encodeURIComponent(productId)}/movements/${encodeURIComponent(movementId)}/approve`,
      data: { remarks }
    });
  }

  rejectAdjustment(productId: string, movementId: string, remarks?: string) {
    return this.client.request<ApiEnvelope<InventorySummary>>({
      method: 'PATCH',
      url: `/v1/inventory/${encodeURIComponent(productId)}/movements/${encodeURIComponent(movementId)}/reject`,
      data: { remarks }
    });
  }

  // Stock Transfer Operations
  createTransfer(payload: any) {
    return this.client.request<ApiEnvelope<any>>({
      method: 'POST',
      url: '/v1/inventory/transfers',
      data: payload
    });
  }

  listTransfers(params?: { page?: number; limit?: number; sourceWarehouseId?: string; destinationWarehouseId?: string; status?: string }) {
    return this.client.request<ApiEnvelope<any>>({
      method: 'GET',
      url: '/v1/inventory/transfers',
      params
    });
  }

  getTransfer(id: string) {
    return this.client.request<ApiEnvelope<any>>({
      method: 'GET',
      url: `/v1/inventory/transfers/${encodeURIComponent(id)}`
    });
  }

  submitTransfer(id: string) {
    return this.client.request<ApiEnvelope<any>>({
      method: 'PUT',
      url: `/v1/inventory/transfers/${encodeURIComponent(id)}/submit`
    });
  }

  approveTransfer(id: string) {
    return this.client.request<ApiEnvelope<any>>({
      method: 'PUT',
      url: `/v1/inventory/transfers/${encodeURIComponent(id)}/approve`
    });
  }

  rejectTransfer(id: string, rejectionReason: string) {
    return this.client.request<ApiEnvelope<any>>({
      method: 'PUT',
      url: `/v1/inventory/transfers/${encodeURIComponent(id)}/reject`,
      data: { rejectionReason }
    });
  }

  dispatchTransfer(id: string, payload: any) {
    return this.client.request<ApiEnvelope<any>>({
      method: 'PUT',
      url: `/v1/inventory/transfers/${encodeURIComponent(id)}/dispatch`,
      data: payload
    });
  }

  receiveTransfer(id: string, payload: any) {
    return this.client.request<ApiEnvelope<any>>({
      method: 'PUT',
      url: `/v1/inventory/transfers/${encodeURIComponent(id)}/receive`,
      data: payload
    });
  }

  cancelTransfer(id: string, cancelReason: string) {
    return this.client.request<ApiEnvelope<any>>({
      method: 'PUT',
      url: `/v1/inventory/transfers/${encodeURIComponent(id)}/cancel`,
      data: { cancelReason }
    });
  }

  getForecast(warehouseId?: string) {
    return this.client.request<ApiEnvelope<ForecastSummary>>({ method: 'GET', url: '/v1/inventory/forecast', params: warehouseId ? { warehouseId } : undefined });
  }
  getForecastByProduct(productId: string, warehouseId?: string) {
    return this.client.request<ApiEnvelope<ForecastItem>>({ method: 'GET', url: `/v1/inventory/forecast/${encodeURIComponent(productId)}`, params: warehouseId ? { warehouseId } : undefined });
  }
  getReplenishmentSuggestions() {
    return this.client.request<ApiEnvelope<ReplenishmentSuggestion[]>>({ method: 'GET', url: '/v1/inventory/replenishment' });
  }
  runAutoReplenishment() {
    return this.client.request<ApiEnvelope<ReplenishmentReport>>({ method: 'POST', url: '/v1/inventory/jobs/run-replenishment' });
  }

  // Reservation operations
  reserveStock(payload: Partial<Reservation>) {
    return this.client.request<ApiEnvelope<Reservation>>({
      method: 'POST',
      url: '/v1/inventory/reservations',
      data: payload
    });
  }

  commitStock(reservationId: string) {
    return this.client.request<ApiEnvelope<Reservation>>({
      method: 'POST',
      url: `/v1/inventory/reservations/${encodeURIComponent(reservationId)}/commit`
    });
  }

  releaseReservation(reservationId: string) {
    return this.client.request<ApiEnvelope<Reservation>>({
      method: 'POST',
      url: `/v1/inventory/reservations/${encodeURIComponent(reservationId)}/release`
    });
  }
}

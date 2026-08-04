import { DeliveryService } from '../services/DeliveryService.js';
import { DynamoDeliveryRepository } from '../repositories/DynamoDeliveryRepository.js';

interface OrderPackedDetail {
  orderId: string;
  shippingAddress: string;
  customerName?: string;
  [key: string]: any;
}

export const handler = async (event: { 'detail-type': string; detail: OrderPackedDetail }) => {
  if (event['detail-type'] !== 'OrderPacked.v1') {
    return;
  }

  const tableName = process.env.TABLE_NAME ?? 'freshmart-delivery';
  const service = new DeliveryService(new DynamoDeliveryRepository(tableName));
  
  const { orderId, shippingAddress, customerName } = event.detail;
  
  await service.createDelivery({
    orderId,
    recipientName: customerName || 'Unknown',
    deliveryAddress: shippingAddress
  });
};

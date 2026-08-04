export type DeliveryStatus = 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';

export interface Delivery {
  deliveryId: string;
  orderId: string;
  partnerId?: string;
  status: DeliveryStatus;
  recipientName: string;
  deliveryAddress: string;
  createdAt?: string;
  updatedAt?: string;
}

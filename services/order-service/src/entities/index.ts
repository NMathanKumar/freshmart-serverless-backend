export type OrderStatus = 'CREATED' | 'CONFIRMED' | 'PACKED' | 'READY' | 'COMPLETED' | 'CANCELLED';

export interface OrderLine {
  sku: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  orderId: string;
  customerId: string;
  status: OrderStatus;
  items: OrderLine[];
  currency: string;
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}
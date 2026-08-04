export interface OrderItemView {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderSummaryView {
  orderId: string;
  orderDate: string;
  orderStatus: string;
  orderStatusLabel: string;
  paymentStatus: string;
  paymentStatusLabel: string;
  totalAmount: number;
  subtotal: number;
  tax: number;
  discount: number;
  totalItems: number;
  totalQuantity: number;
  deliveryAddress?: string;
  pickupTime?: string;
  items: OrderItemView[];
  itemsPreview: OrderItemView[];
  remainingItems: number;
}

export interface OrderDetailView extends OrderSummaryView {}

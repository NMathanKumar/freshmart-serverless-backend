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
  paymentId?: string;
  status?: string;
  totalAmount: number;
  grandTotal?: number;
  subtotal: number;
  itemSubtotal?: number;
  deliveryFee?: number;
  platformFee?: number;
  tax: number;
  taxes?: number;
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

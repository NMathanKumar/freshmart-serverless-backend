export interface CartLine {
  sku: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Cart {
  customerId: string;
  items: CartLine[];
  couponCodes: string[];
  updatedAt: string;
}
export interface ProductVariant {
  variantId: string;
  name: string;
  sku: string;
  price: number;
  currency: string;
  attributes: Record<string, string>;
}

export interface CatalogProduct {
  productId: string;
  name: string;
  slug: string;
  brand: string;
  sku: string;
  categoryId: string;
  subcategoryId?: string;
  description: string;
  specifications: Record<string, string>;
  images: string[];
  variants: ProductVariant[];
  weightInGrams?: number;
  dimensions?: { length: number; width: number; height: number };
  rating: number;
  availability: 'IN_STOCK' | 'OUT_OF_STOCK' | 'PREORDER';
  discountPercentage?: number;
  inventoryReference: string;
  createdAt: string;
  updatedAt: string;
}
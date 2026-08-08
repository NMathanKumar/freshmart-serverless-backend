import { freshmartSdk } from '../../../lib/sdk';
import { Logger } from '@/shared/utils/logger';

export interface ProductModel {
  id: string;
  name: string;
  category: string;
  sku: string;
  price: number;
  formattedPrice: string;
  stock: number;
  reservedStock: number;
  available: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  image: string;
  images: string[];
  description?: string;
  brand?: string;
  createdAt?: string;
}

export interface ProductListParams {
  category?: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
  signal?: AbortSignal;
}

export interface CreateProductInput {
  productName: string;
  category: string;
  price: number;
  stock: number;
  sku?: string;
  images?: string[];
  description?: string;
  brand?: string;
  available?: boolean;
}

const AWS_S3_BUCKET_NAME = 'freshmart-dev-assets-769044546162';
const AWS_REGION = 'ap-southeast-1';

const DEFAULT_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80';

export class ProductService {
  async listProducts(params: ProductListParams = {}): Promise<ProductModel[]> {
    const res = await freshmartSdk.catalog.listProducts({
      category: params.category === 'All Categories' ? undefined : params.category,
      cursor: params.cursor,
      limit: params.limit || 50,
    }, { signal: params.signal });
    
    const data = (res?.data || (res as any)?.items || (Array.isArray(res) ? res : [])) as any[];
    
    let mapped: ProductModel[] = data.map((p) => {
      const priceVal = Number(p.price) || 0;
      const isAvailable = p.available !== false;
      const idStr = p.productId || p.id || `PROD_${Math.random().toString(36).substring(2, 10)}`;
      const nameStr = p.productName || p.name || 'Product Item';
      const skuStr = p.sku || `SKU-${idStr.substring(0, 6).toUpperCase()}`;

      let imagesArr: string[] = [];
      if (Array.isArray(p.images) && p.images.length > 0) {
        imagesArr = p.images;
      } else if (p.image) {
        imagesArr = [p.image];
      } else {
        imagesArr = [DEFAULT_FALLBACK_IMAGE];
      }

      return {
        id: idStr,
        name: nameStr,
        category: p.category || 'Fresh Produce',
        sku: skuStr,
        price: priceVal,
        formattedPrice: `₹${priceVal.toFixed(2)}`,
        stock: Number(p.stock ?? 0),
        reservedStock: 0,
        available: isAvailable,
        status: isAvailable ? ('ACTIVE' as const) : ('INACTIVE' as const),
        image: imagesArr[0],
        images: imagesArr,
        description: p.description || '',
        brand: p.brand || '',
        createdAt: p.createdAt || new Date().toISOString(),
      };
    });

    if (params.search && params.search.trim().length > 0) {
      const query = params.search.toLowerCase();
      mapped = mapped.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.id.toLowerCase().includes(query)
      );
    }

    if (params.category && params.category !== 'All Categories') {
      mapped = mapped.filter((p) => p.category.toLowerCase() === params.category!.toLowerCase());
    }

    if (params.status && params.status !== 'All Status') {
      mapped = mapped.filter((p) => p.status === params.status!.toUpperCase());
    }

    return mapped;
  }

  async getProduct(productId: string): Promise<ProductModel> {
    const list = await this.listProducts();
    const found = list.find((p) => p.id === productId);
    if (!found) {
        throw new Error("Product not found");
    }
    return found;
  }

  async createProduct(input: CreateProductInput): Promise<ProductModel> {
    const finalImages =
      input.images && input.images.length > 0 ? input.images : [DEFAULT_FALLBACK_IMAGE];

    const res = await freshmartSdk.catalog.createProduct({
      productName: input.productName,
      category: input.category,
      price: input.price,
      stock: input.stock,
      available: input.available ?? true,
      description: input.description,
      brand: input.brand,
      images: finalImages,
    });
    
    const newId = (res as any)?.data?.productId || (res as any)?.data?.id || `PROD_${Date.now()}`;
    return {
      id: newId,
      name: input.productName,
      category: input.category,
      sku: input.sku || `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      price: input.price,
      formattedPrice: `₹${input.price.toFixed(2)}`,
      stock: input.stock,
      reservedStock: 0,
      available: input.available ?? true,
      status: (input.available ?? true) ? 'ACTIVE' : 'INACTIVE',
      image: finalImages[0],
      images: finalImages,
      description: input.description || '',
      brand: input.brand || '',
      createdAt: new Date().toISOString(),
    };
  }

  async updateProduct(productId: string, input: Partial<CreateProductInput>): Promise<ProductModel> {
    await freshmartSdk.catalog.updateProduct(productId, {
      productName: input.productName,
      category: input.category,
      price: input.price,
      stock: input.stock,
      available: input.available,
      description: input.description,
      brand: input.brand,
      images: input.images,
    });
    
    return this.getProduct(productId);
  }

  async deleteProduct(productId: string): Promise<void> {
    await freshmartSdk.catalog.deleteProduct(productId);
  }

  async uploadProductImage(fileName: string, _contentType: string): Promise<{ uploadUrl: string; imageUrl: string }> {
    const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const objectKey = `catalog/products/${Date.now()}_${cleanName}`;
    const imageUrl = `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${objectKey}`;
    return { uploadUrl: imageUrl, imageUrl };
  }

  async uploadImageToS3(file: File): Promise<string> {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const objectKey = `catalog/products/${Date.now()}_${cleanFileName}`;
    const s3ObjectUrl = `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${objectKey}`;

    try {
      await fetch(s3ObjectUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'image/jpeg',
        },
        body: file,
      });
      return s3ObjectUrl;
    } catch (err) {
      Logger.warn('S3 HTTP PUT warning, returning S3 URL', { error: err, module: 'product.service' });
    }

    return s3ObjectUrl;
  }
}

export const productService = new ProductService();

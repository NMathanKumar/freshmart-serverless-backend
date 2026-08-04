import { DynamoRepository, type TableEntity } from '@freshmart/platform-core';
import type { Brand } from '../entities/index.js';

type BrandRecord = TableEntity & Brand;

export interface BrandRepository {
  list(): Promise<Brand[]>;
  getById(brandId: string): Promise<Brand | null>;
  save(brand: Brand): Promise<Brand>;
}

export class DynamoBrandRepository implements BrandRepository {
  private readonly repository: DynamoRepository<BrandRecord>;
  constructor(tableName = process.env.TABLE_NAME ?? 'freshmart-brand-service') {
    this.repository = new DynamoRepository<BrandRecord>(tableName);
  }
  async list(): Promise<Brand[]> { return this.repository.queryByIndex('gsi1', 'gsi1pk', 'ENTITY#BRAND', 'gsi1sk'); }
  async getById(brandId: string): Promise<Brand | null> {
    const item = await this.repository.get(`BRAND#${brandId}`, 'METADATA');
    return item ? (item as Brand) : null;
  }
  async save(brand: Brand): Promise<Brand> {
    await this.repository.put({
      pk: `BRAND#${brand.brandId}`,
      sk: 'METADATA',
      gsi1pk: 'ENTITY#BRAND',
      gsi1sk: brand.slug,
      gsi2pk: `SLUG#${brand.slug}`,
      gsi2sk: 'METADATA',
      ...brand
    });
    return brand;
  }
}

export class InMemoryBrandRepository implements BrandRepository {
  private readonly brands = new Map<string, Brand>();
  async list(): Promise<Brand[]> { return [...this.brands.values()]; }
  async getById(brandId: string): Promise<Brand | null> { return this.brands.get(brandId) ?? null; }
  async save(brand: Brand): Promise<Brand> { this.brands.set(brand.brandId, brand); return brand; }
}

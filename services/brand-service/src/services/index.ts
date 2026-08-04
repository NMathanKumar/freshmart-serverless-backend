import { randomUUID } from 'node:crypto';
import { DomainError } from '@freshmart/platform-core';
import type { UpsertBrandDto } from '../dtos/index.js';
import type { Brand } from '../entities/index.js';
import type { BrandRepository } from '../repositories/index.js';

export class BrandService {
  constructor(private readonly repository: BrandRepository) {}
  async list(): Promise<Brand[]> { return this.repository.list(); }
  async getById(brandId: string): Promise<Brand> {
    const brand = await this.repository.getById(brandId);
    if (!brand) throw new DomainError('Brand not found.', 404);
    return brand;
  }
  async upsert(input: UpsertBrandDto): Promise<Brand> {
    const now = new Date().toISOString();
    return this.repository.save({
      brandId: input.brandId ?? randomUUID(),
      createdAt: now,
      updatedAt: now,
      ...input
    });
  }
}

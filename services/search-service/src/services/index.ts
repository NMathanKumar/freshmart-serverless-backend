import { randomUUID } from 'node:crypto';
import type { UpsertSearchDocumentDto } from '../dtos/index.js';
import type { SearchDocument } from '../entities/index.js';
import type { SearchRepository } from '../repositories/index.js';

export class SearchService {
  constructor(private readonly repository: SearchRepository) {}
  async search(term: string): Promise<SearchDocument[]> { return this.repository.search(term); }
  async upsert(input: UpsertSearchDocumentDto): Promise<SearchDocument> {
    return this.repository.save({
      documentId: input.documentId ?? randomUUID(),
      updatedAt: new Date().toISOString(),
      ...input
    });
  }
}

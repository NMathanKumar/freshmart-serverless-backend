import { DynamoRepository, type TableEntity } from '@freshmart/platform-core';
import type { SearchDocument } from '../entities/index.js';

type SearchRecord = TableEntity & SearchDocument;

export interface SearchRepository {
  search(term: string): Promise<SearchDocument[]>;
  save(document: SearchDocument): Promise<SearchDocument>;
}

export class DynamoSearchRepository implements SearchRepository {
  private readonly repository: DynamoRepository<SearchRecord>;
  constructor(tableName = process.env.TABLE_NAME ?? 'freshmart-search-service') {
    this.repository = new DynamoRepository<SearchRecord>(tableName);
  }
  async search(term: string): Promise<SearchDocument[]> {
    return this.repository.queryByIndex('gsi1', 'gsi1pk', `TERM#${term.trim().toLowerCase()}`, 'gsi1sk', { scanIndexForward: false });
  }
  async save(document: SearchDocument): Promise<SearchDocument> {
    await this.repository.put({
      pk: `DOC#${document.documentId}`,
      sk: 'METADATA',
      gsi1pk: `TERM#${document.searchTerm.trim().toLowerCase()}`,
      gsi1sk: `${String(document.score).padStart(8, '0')}#${document.documentId}`,
      ...document
    });
    return document;
  }
}

export class InMemorySearchRepository implements SearchRepository {
  private readonly docs = new Map<string, SearchDocument>();
  async search(term: string): Promise<SearchDocument[]> {
    return [...this.docs.values()].filter((doc) => doc.searchTerm.toLowerCase() === term.toLowerCase());
  }
  async save(document: SearchDocument): Promise<SearchDocument> { this.docs.set(document.documentId, document); return document; }
}

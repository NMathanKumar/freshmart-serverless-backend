export interface SearchDocument {
  documentId: string;
  documentType: 'product' | 'brand' | 'category' | 'cms';
  title: string;
  slug: string;
  summary?: string;
  searchTerm: string;
  score: number;
  updatedAt: string;
}

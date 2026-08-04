export interface Category {
  categoryId: string;
  parentCategoryId?: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
  productCount: number;
  sortOrder: number;
  isActive: boolean; // Legacy field, to be migrated away later
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}
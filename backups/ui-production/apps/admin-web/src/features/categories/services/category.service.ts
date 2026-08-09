import { freshmartSdk } from '../../../lib/sdk';
import type { AdminCategory } from '@freshmart/api-sdk';

export interface CategoryModel {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  status: 'ACTIVE' | 'INACTIVE';
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryListParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  status?: string;
}

export class CategoryService {
  async listCategories(params: CategoryListParams = {}): Promise<CategoryModel[]> {
    const res = await freshmartSdk.admin.listCategories({
      search: params.search,
      status: params.status,
      page: params.page || 1,
      limit: params.limit || 50,
    });
    
    const items = (res?.data || (res as any)?.items || (Array.isArray(res) ? res : [])) as AdminCategory[];

    const mapped = items.map((cat) => {
      const isStatusActive = cat.status === 'ACTIVE' || cat.status === 'active';
      return {
        id: cat.adminItemId,
        name: cat.data?.name || 'Category',
        slug: cat.data?.slug || cat.data?.name?.toLowerCase().replace(/\s+/g, '-') || 'category',
        description: cat.data?.description || '',
        productCount: cat.data?.productCount || 0,
        status: isStatusActive ? ('ACTIVE' as const) : ('INACTIVE' as const),
        image: cat.data?.imageUrl || '',
        createdAt: cat.createdAt || new Date().toISOString(),
        updatedAt: cat.updatedAt || new Date().toISOString(),
      };
    });

    let filtered = mapped;
    if (params.search && params.search.trim().length > 0) {
      const query = params.search.toLowerCase();
      filtered = filtered.filter(
        (cat) => cat.name.toLowerCase().includes(query) || cat.slug.toLowerCase().includes(query)
      );
    }

    if (params.status && params.status !== 'All Status') {
      const st = params.status;
      filtered = filtered.filter((cat) => cat.status === st.toUpperCase());
    }

    return filtered;
  }

  async getCategory(categoryId: string): Promise<CategoryModel> {
    const res = await freshmartSdk.admin.getCategory(categoryId);
    const cat = res.data;
    return {
      id: cat.adminItemId,
      name: cat.data?.name || '',
      slug: cat.data?.slug || '',
      description: cat.data?.description || '',
      productCount: cat.data?.productCount || 0,
      status: cat.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
      image: cat.data?.imageUrl || '',
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    };
  }

  async createCategory(input: CreateCategoryInput): Promise<CategoryModel> {
    const res = await freshmartSdk.admin.createCategory({
      name: input.name,
      slug: input.slug,
      description: input.description,
      imageUrl: input.imageUrl,
      parentId: input.parentId,
      status: input.status
    });
    const cat = res.data;
    return {
      id: cat.adminItemId,
      name: cat.data?.name || input.name,
      slug: cat.data?.slug || input.slug || input.name.toLowerCase().replace(/\s+/g, '-'),
      description: cat.data?.description || input.description || '',
      productCount: 0,
      status: cat.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
      image: cat.data?.imageUrl || input.imageUrl || '',
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    };
  }

  async updateCategory(categoryId: string, input: Partial<CreateCategoryInput>): Promise<CategoryModel> {
    const res = await freshmartSdk.admin.updateCategory(categoryId, input);
    const cat = res.data;
    return {
      id: cat.adminItemId,
      name: cat.data?.name || '',
      slug: cat.data?.slug || '',
      description: cat.data?.description || '',
      productCount: cat.data?.productCount || 0,
      status: cat.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
      image: cat.data?.imageUrl || '',
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    };
  }

  async deleteCategory(categoryId: string): Promise<void> {
    await freshmartSdk.admin.deleteCategory(categoryId);
  }

  async uploadCategoryImage(fileName: string, contentType: string): Promise<{ uploadUrl: string; imageUrl: string }> {
    const res = await freshmartSdk.admin.uploadCategoryImage(fileName, contentType);
    return res.data;
  }
}

export const categoryService = new CategoryService();

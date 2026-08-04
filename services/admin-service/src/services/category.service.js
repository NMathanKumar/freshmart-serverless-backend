const { utils, errors } = require('@freshmart/service-shared');
const CATEGORY_SERVICE_URL = process.env.CATEGORY_SERVICE_URL || 'http://localhost:3000/api/v1/categories';

const ENTITY_TYPE = 'CATEGORY';

const mapToAdminCategory = (cat) => ({
  adminItemId: cat.categoryId,
  entityType: ENTITY_TYPE,
  data: {
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    imageUrl: cat.imageUrl,
    parentId: cat.parentCategoryId,
    productCount: cat.productCount || 0
  },
  status: cat.status || (cat.isActive ? 'ACTIVE' : 'INACTIVE'),
  createdAt: cat.createdAt,
  updatedAt: cat.updatedAt,
  createdBy: cat.createdBy,
  updatedBy: cat.updatedBy
});

const createCategoryService = () => {
  const getHeaders = (userId) => ({
    'Content-Type': 'application/json',
    ...(userId && { 'X-Admin-User-Id': userId })
  });

  const list = async (query = {}) => {
    // In a real proxy, we'd pass the query string correctly.
    const url = new URL(CATEGORY_SERVICE_URL);
    // category-service doesn't natively support all admin generic filters,
    // so we fetch all and filter in-memory if needed, or update category-service to handle it.
    // For now, we fetch all categories.
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch categories from category-service');
    const data = await response.json();
    const items = data.data || [];
    
    // Convert to AdminCategory format
    const adminItems = items.map(mapToAdminCategory);
    return {
      items: adminItems,
      page: 1,
      limit: adminItems.length,
      total: adminItems.length,
      totalPages: 1
    };
  };

  const getById = async (id) => {
    const response = await fetch(`${CATEGORY_SERVICE_URL}/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (response.status === 404) throw new errors.NotFoundError('Category not found');
    if (!response.ok) throw new Error('Failed to fetch category');
    const data = await response.json();
    return mapToAdminCategory(data.data);
  };

  const create = async (payload, userId) => {
    const response = await fetch(CATEGORY_SERVICE_URL, {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify({
        name: payload.data?.name || payload.name,
        slug: payload.data?.slug || payload.slug,
        description: payload.data?.description || payload.description,
        imageUrl: payload.data?.imageUrl || payload.imageUrl,
        parentCategoryId: payload.data?.parentId || payload.parentId,
        status: payload.status || 'ACTIVE'
      })
    });
    if (!response.ok) throw new Error('Failed to create category');
    const data = await response.json();
    return mapToAdminCategory(data.data);
  };

  const update = async (id, payload, userId) => {
    const response = await fetch(`${CATEGORY_SERVICE_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(userId),
      body: JSON.stringify({
        name: payload.data?.name || payload.name,
        slug: payload.data?.slug || payload.slug,
        description: payload.data?.description || payload.description,
        imageUrl: payload.data?.imageUrl || payload.imageUrl,
        parentCategoryId: payload.data?.parentId || payload.parentId,
        status: payload.status
      })
    });
    if (!response.ok) throw new Error('Failed to update category');
    const data = await response.json();
    return mapToAdminCategory(data.data);
  };

  const remove = async (id, userId) => {
    const response = await fetch(`${CATEGORY_SERVICE_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(userId)
    });
    if (!response.ok) throw new Error('Failed to delete category');
    return true;
  };

  return { list, getById, create, update, remove };
};

const service = createCategoryService();
module.exports = service;
module.exports.createCategoryService = createCategoryService;
module.exports.ENTITY_TYPE = ENTITY_TYPE;

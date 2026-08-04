const { utils, errors } = require('@freshmart/service-shared');
const { NotFoundError, ConflictError } = errors;
const { genId } = utils.id;

const normalizeNumber = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };

/**
 * Build a generic paginated list from all entities of a given type.
 * Filtering, searching, and sorting happen in-memory because the admin table
 * stores all domain data in the `data` field and has no per-field GSIs.
 */
const buildList = (items, {
  page = 1,
  limit = 20,
  search = '',
  status,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  searchFields = ['name'],
  extraFilter,
} = {}) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const normalizedSearch = String(search || '').trim().toLowerCase();
  const direction = sortOrder === 'asc' ? 1 : -1;

  let filtered = items
    .filter((item) => !status || item.status === status)
    .filter((item) => {
      if (!normalizedSearch) return true;
      return searchFields.some((field) => {
        const value = field.includes('.')
          ? field.split('.').reduce((obj, key) => obj?.[key], item.data)
          : (item.data?.[field] ?? item[field]);
        return String(value || '').toLowerCase().includes(normalizedSearch);
      });
    });

  if (extraFilter) filtered = filtered.filter(extraFilter);

  filtered.sort((a, b) => {
    const aVal = a.data?.[sortBy] ?? a[sortBy] ?? '';
    const bVal = b.data?.[sortBy] ?? b[sortBy] ?? '';
    if (sortBy === 'productCount' || sortBy === 'usageCount') {
      return (normalizeNumber(aVal) - normalizeNumber(bVal)) * direction;
    }
    return String(aVal).localeCompare(String(bVal)) * direction;
  });

  const total = filtered.length;
  const start = (safePage - 1) * safeLimit;
  return {
    items: filtered.slice(start, start + safeLimit),
    ...utils.pagination.buildMeta({ total, page: safePage, limit: safeLimit }),
  };
};

/**
 * Create a generic CRUD service for an admin entity type.
 */
const createEntityService = ({
  entityType,
  idPrefix,
  repository,
  searchFields = ['name'],
  allowedTransitions = null,
  statusField = 'status',
}) => {
  const list = async (query = {}) => {
    const all = await repository.listByEntityType(entityType);
    return buildList(all, { ...query, searchFields });
  };

  const getById = async (id) => {
    const item = await repository.getEntity(entityType, id);
    if (!item) throw new NotFoundError(`${entityType} '${id}' not found`);
    return item;
  };

  const create = async (data, createdBy = 'admin') => {
    const id = genId(idPrefix);
    return repository.createEntity({ entityType, itemId: id, data, status: data[statusField] || 'ACTIVE', createdBy });
  };

  const update = async (id, data) => {
    const current = await getById(id);
    const merged = { ...current.data, ...data };
    return repository.saveEntity({
      entityType,
      itemId: id,
      data: merged,
      status: merged[statusField] || current.status,
      createdBy: current.createdBy || 'admin',
    });
  };

  const remove = async (id) => {
    await getById(id);
    return repository.deleteEntity(entityType, id);
  };

  const updateStatus = async (id, newStatus) => {
    const current = await getById(id);
    if (allowedTransitions) {
      const allowed = allowedTransitions[current.status] || [];
      if (!allowed.includes(newStatus)) {
        throw new ConflictError(`Transition from '${current.status}' to '${newStatus}' is not permitted`);
      }
    }
    return repository.saveEntity({
      entityType,
      itemId: id,
      data: { ...current.data, [statusField]: newStatus },
      status: newStatus,
      createdBy: current.createdBy || 'admin',
    });
  };

  return { list, getById, create, update, remove, updateStatus };
};

module.exports = { createEntityService, buildList };

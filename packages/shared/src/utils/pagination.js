const { PAGINATION } = require('../constants');

const getPagination = (page = 1, limit = PAGINATION.DEFAULT_LIMIT) => {
  const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  const pageSize = Math.min(
    Math.max(parseInt(limit, 10) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MIN_LIMIT),
    PAGINATION.MAX_LIMIT
  );
  const offset = (currentPage - 1) * pageSize;

  return {
    page: currentPage,
    limit: pageSize,
    offset,
  };
};

const buildMeta = ({ total = 0, page = 1, limit = PAGINATION.DEFAULT_LIMIT }) => {
  const normalized = getPagination(page, limit);
  const totalPages = Math.max(Math.ceil(total / normalized.limit), 1);

  return {
    page: normalized.page,
    limit: normalized.limit,
    total,
    totalPages,
  };
};

module.exports = { getPagination, buildMeta };

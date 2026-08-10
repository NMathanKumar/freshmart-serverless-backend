const { GetCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { aws, constants } = require('@freshmart/service-shared');

const ORDER_STATUSES = Object.values(constants.ORDER_STATUS);

const normalizeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const collectPages = async (client, Command, params) => {
  const items = [];
  let exclusiveStartKey;
  do {
    const result = await client.send(new Command({ ...params, ExclusiveStartKey: exclusiveStartKey }));
    items.push(...(result.Items || []));
    exclusiveStartKey = result.LastEvaluatedKey;
  } while (exclusiveStartKey);
  return items;
};

const resolveTables = (tables = aws.config.dynamodb.tables || {}) => {
  const ordersTable = tables.orders || process.env.DDB_TABLE_ORDERS || 'freshmart-dev-orders';
  const userProfilesTable = tables.userProfiles || process.env.DDB_TABLE_USER_PROFILES || process.env.DDB_TABLE_USERS || 'freshmart-dev-user-profiles';
  return { orders: ordersTable, userProfiles: userProfilesTable };
};

const normalizeCustomer = (profile, userId) => ({
  customerId: userId,
  name: profile?.name || null,
  email: profile?.email || null,
  phone: profile?.phone || null,
  avatarUrl: profile?.avatarUrl || null,
  addresses: Array.isArray(profile?.addresses)
    ? profile.addresses
    : profile?.address
      ? [profile.address]
      : [],
});

const normalizeOrder = (item, customer) => ({
  orderId: item.orderId,
  customer: normalizeCustomer(customer, item.userId),
  items: Array.isArray(item.items) ? item.items : [],
  itemsCount: Array.isArray(item.items)
    ? item.items.reduce((total, orderItem) => total + normalizeNumber(orderItem.quantity), 0)
    : 0,
  itemImages: Array.isArray(item.items)
    ? item.items.map((orderItem) => orderItem.imageUrl).filter(Boolean).slice(0, 3)
    : [],
  subtotal: normalizeNumber(item.subtotal),
  tax: normalizeNumber(item.tax),
  discount: normalizeNumber(item.discount),
  totalAmount: normalizeNumber(item.totalAmount),
  paymentStatus: item.paymentStatus || null,
  paymentMethod: null,
  orderStatus: item.orderStatus,
  deliveryStatus: null,
  pickupTime: item.pickupTime || null,
  shippingAddress: null,
  statusHistory: null,
  createdAt: item.createdAt || null,
  updatedAt: item.updatedAt || null,
  version: normalizeNumber(item.version),
});

const createAdminOrderRepository = ({ client = aws.documentClient, tables } = {}) => {
  const loadOrders = async (tableName) => {
    try {
      const items = await collectPages(client, ScanCommand, {
        TableName: tableName,
      });
      const validOrders = items
        .filter((item) => item && (item.orderId || item.pk?.startsWith('ORDER#')))
        .map((item) => ({
          ...item,
          orderId: item.orderId || item.pk?.replace(/^ORDER#/, ''),
          orderStatus: item.orderStatus || item.status || 'PLACED',
          createdAt: item.createdAt || item.createdDate || new Date().toISOString(),
        }));
      return Array.from(new Map(validOrders.map((order) => [order.orderId, order])).values());
    } catch (err) {
      console.warn('loadOrders failed:', err);
      return [];
    }
  };

  const loadCustomers = async (tableName) => {
    try {
      const items = await collectPages(client, ScanCommand, {
        TableName: tableName,
      });
      return items.map((item) => ({
        ...item,
        userId: item.userId || item.pk?.replace(/^USER#/, '') || item.sub,
      }));
    } catch (err) {
      console.warn('loadCustomers failed, continuing without customer profiles:', err);
      return [];
    }
  };

  const findCustomerById = async (userId) => {
    try {
      const tableNames = resolveTables(tables);
      const result = await client.send(
        new GetCommand({
          TableName: tableNames.userProfiles,
          Key: { pk: `USER#${userId}`, sk: 'PROFILE' },
        })
      );
      return result.Item || null;
    } catch (err) {
      return null;
    }
  };

  const list = async ({
    page = 1,
    limit = 20,
    search,
    status,
    paymentStatus,
    startDate,
    endDate,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = {}) => {
    const tableNames = resolveTables(tables);
    const [orders, customers] = await Promise.all([
      loadOrders(tableNames.orders),
      loadCustomers(tableNames.userProfiles),
    ]);
    const customerMap = new Map(customers.map((customer) => [customer.userId, customer]));
    const summary = {
      totalOrders: orders.length,
      pendingOrders: orders.filter((order) => order.orderStatus === constants.ORDER_STATUS.PLACED).length,
      processingOrders: orders.filter((order) =>
        [constants.ORDER_STATUS.ACCEPTED, constants.ORDER_STATUS.PREPARING, constants.ORDER_STATUS.READY].includes(order.orderStatus)
      ).length,
      deliveredOrders: orders.filter((order) => order.orderStatus === constants.ORDER_STATUS.DELIVERED).length,
      cancelledOrders: orders.filter((order) => order.orderStatus === constants.ORDER_STATUS.CANCELLED).length,
      revenue: orders
        .filter((order) => order.paymentStatus === 'SUCCESS')
        .reduce((total, order) => total + normalizeNumber(order.totalAmount), 0),
    };

    const normalizedSearch = String(search || '').trim().toLowerCase();
    const normalizedStatus = status ? String(status).trim().toUpperCase() : null;

    const filtered = orders
      .filter((order) => {
        if (!normalizedStatus || normalizedStatus === 'ALL' || normalizedStatus === 'ALL ORDERS') return true;
        const oStatus = (order.orderStatus || '').toUpperCase();
        if (normalizedStatus === 'PENDING') return oStatus === 'PLACED';
        if (normalizedStatus === 'PROCESSING') return oStatus === 'PREPARING' || oStatus === 'ACCEPTED';
        if (normalizedStatus === 'SHIPPED') return oStatus === 'READY';
        return oStatus === normalizedStatus;
      })
      .filter((order) => !paymentStatus || String(order.paymentStatus).toUpperCase() === String(paymentStatus).toUpperCase())
      .filter((order) => {
        if (!normalizedSearch) return true;
        const customer = customerMap.get(order.userId);
        const name = order.customerName || customer?.name;
        const email = order.customerEmail || customer?.email;
        return [order.orderId, order.userId, name, email, customer?.phone]
          .some((value) => String(value || '').toLowerCase().includes(normalizedSearch));
      })
      .sort((left, right) => {
        const direction = sortOrder === 'asc' ? 1 : -1;
        if (sortBy === 'totalAmount') {
          return (normalizeNumber(left.totalAmount) - normalizeNumber(right.totalAmount)) * direction;
        }
        const leftValue = String(left[sortBy] || left.createdAt || '');
        const rightValue = String(right[sortBy] || right.createdAt || '');
        return leftValue.localeCompare(rightValue) * direction;
      });

    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const start = (safePage - 1) * safeLimit;
    return {
      items: filtered
        .slice(start, start + safeLimit)
        .map((order) => normalizeOrder(order, customerMap.get(order.userId))),
      page: safePage,
      limit: safeLimit,
      total: filtered.length,
      summary,
    };
  };

  return { findCustomerById, list };
};

const repository = createAdminOrderRepository();

module.exports = repository;
module.exports.createAdminOrderRepository = createAdminOrderRepository;
module.exports.normalizeCustomer = normalizeCustomer;
module.exports.normalizeOrder = normalizeOrder;

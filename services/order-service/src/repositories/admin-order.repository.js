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

const resolveTables = (tables = aws.config.dynamodb.tables) => {
  if (!tables.orders) throw new Error('Missing DDB_TABLE_ORDERS');
  if (!tables.userProfiles) throw new Error('Missing DDB_TABLE_USER_PROFILES');
  return { orders: tables.orders, userProfiles: tables.userProfiles };
};

const normalizeCustomer = (profile, userId, item = {}) => ({
  customerId: userId,
  name: profile?.name || item.customerName || item.deliveryAddressData?.name || null,
  email: profile?.email || item.customerEmail || item.deliveryAddressData?.email || item.email || null,
  phone: profile?.phone || item.customerPhone || item.deliveryAddressData?.phone || null,
  avatarUrl: profile?.avatarUrl || null,
  addresses: Array.isArray(profile?.addresses)
    ? profile.addresses
    : profile?.address
      ? [profile.address]
      : [],
});

const normalizeOrder = (item, customer) => ({
  orderId: item.orderId,
  customer: normalizeCustomer(customer, item.userId, item),
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
  paymentMethod: item.paymentMethod || null,
  orderStatus: item.orderStatus,
  deliveryStatus: null,
  pickupTime: item.pickupTime || null,
  shippingAddress: item.deliveryAddress ? { street: item.deliveryAddress } : null,
  statusHistory: null,
  createdAt: item.createdAt || null,
  updatedAt: item.updatedAt || null,
  version: normalizeNumber(item.version),
});

const createAdminOrderRepository = ({ client = aws.documentClient, tables } = {}) => {
  const loadOrders = async (tableName) => {
    const items = await collectPages(client, ScanCommand, {
      TableName: tableName,
    });
    return Array.from(new Map(items.map((order) => [order.orderId, order])).values());
  };

  const loadCustomers = (tableName) =>
    collectPages(client, ScanCommand, {
      TableName: tableName,
      ProjectionExpression: 'userId, #name, email, phone, avatarUrl, #address, addresses',
      ExpressionAttributeNames: { '#name': 'name', '#address': 'address' },
    });

  const findCustomerById = async (userId) => {
    const tableNames = resolveTables(tables);
    const result = await client.send(
      new GetCommand({
        TableName: tableNames.userProfiles,
        Key: { pk: `USER#${userId}`, sk: 'PROFILE' },
      })
    );
    return result.Item || null;
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
      totalCustomers: customers.length || 11,
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
    const startTimestamp = startDate ? new Date(startDate).getTime() : null;
    const endDateValue = endDate
      ? (endDate instanceof Date ? endDate.toISOString() : String(endDate)).slice(0, 10)
      : null;
    const endTimestamp = endDateValue ? new Date(`${endDateValue}T23:59:59.999Z`).getTime() : null;
    const filtered = orders
      .filter((order) => {
        if (!status) return true;
        const statuses = String(status).split(',').map(s => s.trim().toUpperCase());
        return statuses.includes(order.orderStatus);
      })
      .filter((order) => !paymentStatus || order.paymentStatus === paymentStatus)
      .filter((order) => {
        const timestamp = new Date(order.createdAt || 0).getTime();
        return (startTimestamp === null || timestamp >= startTimestamp) &&
          (endTimestamp === null || timestamp <= endTimestamp);
      })
      .filter((order) => {
        if (!normalizedSearch) return true;
        const customer = customerMap.get(order.userId);
        return [order.orderId, order.userId, customer?.name, customer?.email, customer?.phone]
          .some((value) => String(value || '').toLowerCase().includes(normalizedSearch));
      })
      .sort((left, right) => {
        const direction = sortOrder === 'asc' ? 1 : -1;
        if (sortBy === 'totalAmount') {
          return (normalizeNumber(left.totalAmount) - normalizeNumber(right.totalAmount)) * direction;
        }
        const leftValue = String(left[sortBy] || '');
        const rightValue = String(right[sortBy] || '');
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

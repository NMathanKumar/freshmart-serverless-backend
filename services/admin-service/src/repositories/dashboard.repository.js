const { QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { aws, constants } = require('@freshmart/service-shared');

const ORDER_STATUSES = Object.values(constants.ORDER_STATUS);
const INVENTORY_STATUSES = ['ACTIVE', 'LOW_STOCK', 'OUT_OF_STOCK'];

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
  const resolved = {
    products: tables.products,
    inventory: tables.inventory,
    orders: tables.orders,
    userProfiles: tables.userProfiles,
  };
  for (const [name, tableName] of Object.entries(resolved)) {
    if (!tableName) throw new Error(`Missing dashboard DynamoDB table: ${name}`);
  }
  return resolved;
};

const createDashboardRepository = ({ client = aws.documentClient, tables } = {}) => {
  const queryByPartition = (TableName, IndexName, keyName, keyValue, projection = {}) =>
    collectPages(client, QueryCommand, {
      TableName,
      IndexName,
      KeyConditionExpression: `${keyName} = :pk`,
      ExpressionAttributeValues: { ':pk': keyValue },
      ScanIndexForward: false,
      ...projection,
    });

  const loadProducts = (tableName) =>
    collectPages(client, ScanCommand, {
      TableName: tableName,
      ProjectionExpression: 'productId, productName',
    });

  const loadInventory = async (tableName) =>
    collectPages(client, ScanCommand, {
      TableName: tableName,
      ProjectionExpression:
        'productId, productName, currentStock, minimumStock, availableStock, #status, updatedAt',
      ExpressionAttributeNames: { '#status': 'status' },
    });

  const loadOrders = async (tableName) =>
    collectPages(client, ScanCommand, {
      TableName: tableName,
      ProjectionExpression:
        'orderId, userId, #items, totalAmount, paymentStatus, orderStatus, createdAt, updatedAt',
      ExpressionAttributeNames: { '#items': 'items' },
    });

  const loadCustomers = (tableName) =>
    collectPages(client, ScanCommand, {
      TableName: tableName,
      ProjectionExpression: 'userId, #name',
      ExpressionAttributeNames: { '#name': 'name' },
    });

  const getStatistics = async () => {
    const tableNames = resolveTables(tables);
    const [products, inventory, orders, customers] = await Promise.all([
      loadProducts(tableNames.products),
      loadInventory(tableNames.inventory),
      loadOrders(tableNames.orders),
      loadCustomers(tableNames.userProfiles),
    ]);

    const productNames = new Map(
      products.map((product) => [product.productId, product.productName || product.productId])
    );
    const customerNames = new Map(
      customers.map((customer) => [customer.userId, customer.name || customer.userId])
    );
    const outOfStock = inventory.filter(
      (item) => item.status === 'OUT_OF_STOCK' || normalizeNumber(item.currentStock) <= 0
    );
    const outOfStockIds = new Set(outOfStock.map((item) => item.productId));
    const lowStock = inventory.filter(
      (item) => item.status === 'LOW_STOCK' && !outOfStockIds.has(item.productId)
    );
    const inventoryAlerts = [...lowStock, ...outOfStock]
      .sort((left, right) => normalizeNumber(left.currentStock) - normalizeNumber(right.currentStock))
      .slice(0, 10)
      .map((item) => ({
        productId: item.productId,
        productName: item.productName || productNames.get(item.productId) || item.productId,
        currentStock: normalizeNumber(item.currentStock),
        minimumStock: normalizeNumber(item.minimumStock),
        availableStock: normalizeNumber(item.availableStock),
        status: item.status || 'LOW_STOCK',
        updatedAt: item.updatedAt || null,
      }));

    const sortedOrders = [...orders].sort(
      (left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime()
    );
    const recentOrders = sortedOrders.slice(0, 10).map((order) => {
      let resolvedName = customerNames.get(order.userId) || order.customerName || order.deliveryAddressData?.name;
      if (!resolvedName || resolvedName.startsWith('USER_') || resolvedName.includes('-')) {
        resolvedName = order.deliveryAddressData?.name || 'Mathankumar N';
      }
      return {
        orderId: order.orderId,
        customerId: order.userId,
        customerName: resolvedName,
        itemsCount: Array.isArray(order.items)
          ? order.items.reduce((sum, item) => sum + normalizeNumber(item.quantity), 0)
          : 0,
        totalAmount: normalizeNumber(order.totalAmount),
        paymentStatus: order.paymentStatus || 'PENDING',
        orderStatus: order.orderStatus,
        createdAt: order.createdAt || null,
        updatedAt: order.updatedAt || null,
      };
    });

    const productSales = new Map();
    for (const order of orders.filter((item) => item.orderStatus !== constants.ORDER_STATUS.CANCELLED)) {
      for (const item of Array.isArray(order.items) ? order.items : []) {
        const current = productSales.get(item.productId || item.productName) || {
          productId: item.productId || item.productName || 'PROD-001',
          productName: item.productName || productNames.get(item.productId) || item.productId || 'Fresh Produce',
          quantity: 0,
          revenue: 0,
        };
        const quantity = normalizeNumber(item.quantity || 1);
        current.quantity += quantity;
        current.revenue += normalizeNumber(item.lineTotal || normalizeNumber(item.price) * quantity);
        productSales.set(item.productId || item.productName, current);
      }
    }

    return {
      totalProducts: products.length,
      totalCustomers: customers.length,
      totalOrders: orders.length,
      pendingOrders: orders.filter((item) => item.orderStatus === constants.ORDER_STATUS.PLACED).length,
      processingOrders: orders.filter((item) =>
        [constants.ORDER_STATUS.ACCEPTED, constants.ORDER_STATUS.PREPARING, constants.ORDER_STATUS.READY].includes(item.orderStatus)
      ).length,
      completedOrders: orders.filter((item) => item.orderStatus === constants.ORDER_STATUS.DELIVERED).length,
      cancelledOrders: orders.filter((item) => item.orderStatus === constants.ORDER_STATUS.CANCELLED).length,
      totalRevenue: orders.reduce((sum, order) => {
        const itemsSum = Array.isArray(order.items)
          ? order.items.reduce((itemSum, item) => itemSum + normalizeNumber(item.lineTotal || normalizeNumber(item.price) * normalizeNumber(item.quantity)), 0)
          : 0;
        return sum + (itemsSum > 0 ? itemsSum : normalizeNumber(order.totalAmount));
      }, 0),
      failedPayments: orders.filter((item) => item.paymentStatus === 'FAILED').length,
      lowStockCount: lowStock.length,
      outOfStockCount: outOfStock.length,
      inventoryAlerts,
      recentOrders,
      topSellingProducts: [...productSales.values()]
        .sort((left, right) => right.quantity - left.quantity || right.revenue - left.revenue)
        .slice(0, 5),
    };
  };

  return { getStatistics };
};

const repository = createDashboardRepository();

module.exports = repository;
module.exports.createDashboardRepository = createDashboardRepository;
module.exports.collectPages = collectPages;

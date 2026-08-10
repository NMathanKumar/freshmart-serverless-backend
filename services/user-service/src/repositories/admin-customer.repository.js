const { DeleteCommand, GetCommand, PutCommand, QueryCommand, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { aws, constants } = require('@freshmart/service-shared');

const ORDER_STATUSES = Object.values(constants.ORDER_STATUS);

// Statuses the domain supports persisting
const VALID_STATUSES = ['ACTIVE', 'INACTIVE', 'BLOCKED'];

// Customers registered within the last 30 days are considered "new"
const NEW_CUSTOMER_DAYS = 30;

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
  if (!tables.userProfiles) throw new Error('Missing DDB_TABLE_USER_PROFILES');
  if (!tables.orders) throw new Error('Missing DDB_TABLE_ORDERS');
  return { orders: tables.orders, userProfiles: tables.userProfiles };
};

const getDefaultAddress = (profile) => {
  if (profile.address) return profile.address;
  if (!Array.isArray(profile.addresses)) return null;
  return profile.addresses.find((a) => a?.isDefault) || profile.addresses[0] || null;
};

const isNewCustomer = (createdAt) => {
  if (!createdAt) return false;
  const cutoff = Date.now() - NEW_CUSTOMER_DAYS * 24 * 60 * 60 * 1000;
  return new Date(createdAt).getTime() >= cutoff;
};

const normalizeCustomer = (profile, orders = []) => {
  const paidOrders = orders.filter((o) => o.paymentStatus === 'SUCCESS');
  const lastOrderDate = orders.reduce((latest, o) => {
    if (!o.createdAt) return latest;
    return !latest || o.createdAt > latest ? o.createdAt : latest;
  }, null);

  return {
    customerId: profile.userId,
    name: profile.name || null,
    email: profile.email || null,
    phone: profile.phone || null,
    avatarUrl: profile.avatarUrl || null,
    registrationDate: profile.createdAt || null,
    updatedAt: profile.updatedAt || null,
    status: profile.status || null,
    defaultAddress: getDefaultAddress(profile),
    addresses: Array.isArray(profile.addresses)
      ? profile.addresses
      : profile.address
        ? [profile.address]
        : [],
    orderCount: orders.length,
    totalSpending: paidOrders.reduce((sum, o) => sum + normalizeNumber(o.totalAmount), 0),
    lastOrderDate,
  };
};

const normalizeCustomerDetail = (profile, orders = []) => {
  const base = normalizeCustomer(profile, orders);
  const paidOrders = orders.filter((o) => o.paymentStatus === 'SUCCESS');
  const recentOrders = [...orders]
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    .slice(0, 5)
    .map((o) => ({
      orderId: o.orderId,
      orderStatus: o.orderStatus || null,
      paymentStatus: o.paymentStatus || null,
      totalAmount: normalizeNumber(o.totalAmount),
      createdAt: o.createdAt || null,
    }));

  return {
    ...base,
    statistics: {
      orderCount: base.orderCount,
      totalSpending: base.totalSpending,
      lastOrderDate: base.lastOrderDate,
      paidOrderCount: paidOrders.length,
    },
    orderSummary: {
      total: orders.length,
      paid: paidOrders.length,
      pending: orders.filter((o) => o.paymentStatus === 'PENDING').length,
      cancelled: orders.filter((o) => o.orderStatus === 'CANCELLED').length,
    },
    recentOrders,
  };
};

const createAdminCustomerRepository = ({ client = aws.documentClient, tables } = {}) => {
  const loadProfiles = (tableName) =>
    collectPages(client, ScanCommand, {
      TableName: tableName,
      ProjectionExpression:
        'userId, #name, email, phone, avatarUrl, #address, addresses, createdAt, updatedAt, #status',
      ExpressionAttributeNames: {
        '#name': 'name',
        '#address': 'address',
        '#status': 'status',
      },
    });

  const loadOrders = async (tableName) => {
    const pages = await Promise.all(
      ORDER_STATUSES.map((status) =>
        collectPages(client, QueryCommand, {
          TableName: tableName,
          IndexName: 'gsi2',
          KeyConditionExpression: 'gsi2pk = :pk',
          ExpressionAttributeValues: { ':pk': `STATUS#${status}` },
          ScanIndexForward: false,
        })
      )
    );
    return Array.from(new Map(pages.flat().map((o) => [o.orderId, o])).values());
  };

  const loadOrdersByCustomer = (tableName, customerId) =>
    collectPages(client, QueryCommand, {
      TableName: tableName,
      IndexName: 'gsi1',
      KeyConditionExpression: 'gsi1pk = :pk',
      ExpressionAttributeValues: { ':pk': `USER#${customerId}` },
      ScanIndexForward: false,
    });

  const findById = async (customerId) => {
    const tableNames = resolveTables(tables);
    const [profileResult, orders] = await Promise.all([
      client.send(
        new GetCommand({
          TableName: tableNames.userProfiles,
          Key: { pk: `USER#${customerId}`, sk: 'PROFILE' },
        })
      ),
      loadOrdersByCustomer(tableNames.orders, customerId),
    ]);
    return profileResult.Item ? normalizeCustomerDetail(profileResult.Item, orders) : null;
  };

  const updateStatus = async (customerId, status) => {
    const tableNames = resolveTables(tables);
    const now = new Date().toISOString();
    const result = await client.send(
      new UpdateCommand({
        TableName: tableNames.userProfiles,
        Key: { pk: `USER#${customerId}`, sk: 'PROFILE' },
        UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
        ConditionExpression: 'attribute_exists(pk)',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':status': status, ':updatedAt': now },
        ReturnValues: 'ALL_NEW',
      })
    );
    return result.Attributes || null;
  };

  const list = async ({
    page = 1,
    pageSize = 20,
    search,
    status,
    sortBy = 'registrationDate',
    sortOrder = 'desc',
  } = {}) => {
    const tableNames = resolveTables(tables);
    const [profiles, orders] = await Promise.all([
      loadProfiles(tableNames.userProfiles),
      loadOrders(tableNames.orders),
    ]);

    const ordersByCustomer = new Map();
    orders.forEach((o) => {
      const current = ordersByCustomer.get(o.userId) || [];
      current.push(o);
      ordersByCustomer.set(o.userId, current);
    });

    // Deduplicate profiles by normalized email (preferring Cognito UUID IDs)
    const profilesByEmail = new Map();
    for (const p of profiles) {
      const emailKey = p.email ? p.email.trim().toLowerCase() : (p.userId || `id_${Math.random()}`);
      const existing = profilesByEmail.get(emailKey);
      const isUUID = (id) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(id);
      if (!existing) {
        profilesByEmail.set(emailKey, p);
      } else {
        const existingIsUUID = isUUID(existing.userId);
        const currentIsUUID = isUUID(p.userId);
        if (currentIsUUID && !existingIsUUID) {
          profilesByEmail.set(emailKey, { ...existing, ...p });
        } else {
          profilesByEmail.set(emailKey, { ...p, ...existing });
        }
      }
    }
    const deduplicatedProfiles = Array.from(profilesByEmail.values());

    const customers = deduplicatedProfiles.map((profile) =>
      normalizeCustomer(profile, ordersByCustomer.get(profile.userId) || [])
    );

    const summary = {
      totalCustomers: customers.length,
      activeCustomers: customers.filter((c) => c.status === 'ACTIVE').length,
      inactiveCustomers: customers.filter((c) => c.status === 'INACTIVE').length,
      newCustomers: customers.filter((c) => isNewCustomer(c.registrationDate)).length,
    };

    const normalizedSearch = String(search || '').trim().toLowerCase();
    const direction = sortOrder === 'asc' ? 1 : -1;

    const filtered = customers
      .filter((c) => !status || c.status === status)
      .filter((c) => {
        if (!normalizedSearch) return true;
        return [c.customerId, c.name, c.email, c.phone]
          .some((v) => String(v || '').toLowerCase().includes(normalizedSearch));
      })
      .sort((a, b) => {
        if (sortBy === 'orderCount' || sortBy === 'totalSpending') {
          return (normalizeNumber(a[sortBy]) - normalizeNumber(b[sortBy])) * direction;
        }
        return String(a[sortBy] || '').localeCompare(String(b[sortBy] || '')) * direction;
      });

    const safePage = Math.max(Number(page) || 1, 1);
    const safePageSize = Math.min(Math.max(Number(pageSize) || 20, 1), 100);
    const start = (safePage - 1) * safePageSize;

    return {
      items: filtered.slice(start, start + safePageSize),
      page: safePage,
      pageSize: safePageSize,
      total: filtered.length,
      summary,
    };
  };

  const createCustomer = async (data) => {
    const tableNames = resolveTables(tables);
    const now = new Date().toISOString();
    const userId = data.userId || data.customerId || `CUST_${Date.now().toString(36)}`;
    const nameVal = data.name || data.fullName || '';
    const item = {
      pk: `USER#${userId}`,
      sk: 'PROFILE',
      userId,
      name: nameVal,
      fullName: nameVal,
      email: data.email || '',
      phone: data.phone || '',
      avatarUrl: data.avatarUrl || null,
      address: data.address ? (typeof data.address === 'string' ? { line1: data.address } : data.address) : null,
      status: data.status || 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };
    await client.send(
      new PutCommand({
        TableName: tableNames.userProfiles,
        Item: item,
      })
    );
    return normalizeCustomer(item, []);
  };

  const updateCustomer = async (customerId, data) => {
    const tableNames = resolveTables(tables);
    const now = new Date().toISOString();
    const updateExpr = [];
    const names = {};
    const values = { ':updatedAt': now };

    const allProfiles = await loadProfiles(tableNames.userProfiles);
    const existingTarget = allProfiles.find((p) => p.userId === customerId);
    const emailToMatch = (data.email || existingTarget?.email || '').trim().toLowerCase();

    const targetUserIds = new Set([customerId]);
    if (emailToMatch) {
      allProfiles.forEach((p) => {
        if (p.email && p.email.trim().toLowerCase() === emailToMatch) {
          targetUserIds.add(p.userId);
        }
      });
    }

    if (data.name !== undefined || data.fullName !== undefined) {
      const nameVal = data.name !== undefined ? data.name : data.fullName;
      updateExpr.push('#name = :name', '#fullName = :fullName');
      names['#name'] = 'name';
      names['#fullName'] = 'fullName';
      values[':name'] = nameVal;
      values[':fullName'] = nameVal;
    }
    if (data.email !== undefined) {
      updateExpr.push('email = :email');
      values[':email'] = data.email;
    }
    if (data.phone !== undefined) {
      updateExpr.push('phone = :phone');
      values[':phone'] = data.phone;
    }
    if (data.avatarUrl !== undefined) {
      updateExpr.push('avatarUrl = :avatarUrl');
      values[':avatarUrl'] = data.avatarUrl;
    }
    if (data.address !== undefined) {
      updateExpr.push('#address = :address');
      names['#address'] = 'address';
      values[':address'] = typeof data.address === 'string' ? { line1: data.address } : data.address;
    }
    if (data.status !== undefined) {
      updateExpr.push('#status = :status');
      names['#status'] = 'status';
      values[':status'] = data.status;
    }
    updateExpr.push('updatedAt = :updatedAt');

    let updatedAttributes = null;
    for (const uid of targetUserIds) {
      if (!uid) continue;
      try {
        const result = await client.send(
          new UpdateCommand({
            TableName: tableNames.userProfiles,
            Key: { pk: `USER#${uid}`, sk: 'PROFILE' },
            UpdateExpression: `SET ${updateExpr.join(', ')}`,
            ExpressionAttributeNames: Object.keys(names).length > 0 ? names : undefined,
            ExpressionAttributeValues: values,
            ReturnValues: 'ALL_NEW',
          })
        );
        if (result.Attributes) {
          updatedAttributes = result.Attributes;
        }
      } catch (_) {
        // Ignored
      }
    }
    return normalizeCustomer(updatedAttributes || {}, []);
  };

  const deleteCustomer = async (customerId) => {
    const tableNames = resolveTables(tables);
    await client.send(
      new DeleteCommand({
        TableName: tableNames.userProfiles,
        Key: { pk: `USER#${customerId}`, sk: 'PROFILE' },
      })
    ).catch(() => {});
    await client.send(
      new DeleteCommand({
        TableName: tableNames.userProfiles,
        Key: { pk: `USER#${customerId}`, sk: `PROFILE#${customerId}` },
      })
    ).catch(() => {});
    return true;
  };

  return { createCustomer, deleteCustomer, findById, list, updateCustomer, updateStatus };
};

const repository = createAdminCustomerRepository();

module.exports = repository;
module.exports.createAdminCustomerRepository = createAdminCustomerRepository;
module.exports.normalizeCustomer = normalizeCustomer;
module.exports.normalizeCustomerDetail = normalizeCustomerDetail;
module.exports.VALID_STATUSES = VALID_STATUSES;

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'ap-southeast-1' });
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true }
});

const TABLES = {
  admin: 'freshmart-dev-admin',
  products: 'freshmart-dev-products',
  inventory: 'freshmart-dev-inventory',
  profiles: 'freshmart-dev-user-profiles',
  auth: 'freshmart-dev-auth-users',
  orders: 'freshmart-dev-orders'
};

async function clearTable(tableName) {
  console.log(`Clearing table ${tableName}...`);
  let lastEvaluatedKey;
  do {
    const scanResult = await docClient.send(
      new ScanCommand({
        TableName: tableName,
        ExclusiveStartKey: lastEvaluatedKey
      })
    );
    const items = scanResult.Items || [];
    if (items.length > 0) {
      for (let i = 0; i < items.length; i += 25) {
        const chunk = items.slice(i, i + 25);
        const deleteRequests = chunk.map((item) => {
          let Key = {};
          if (tableName === TABLES.admin) Key = { pk: item.pk, sk: item.sk };
          else if (tableName === TABLES.products) Key = { PK: item.PK, SK: item.SK };
          else if (tableName === TABLES.inventory) Key = { productId: item.productId };
          else if (tableName === TABLES.profiles) Key = { pk: item.pk, sk: item.sk };
          else if (tableName === TABLES.auth) Key = { PK: item.PK, SK: item.SK };
          else if (tableName === TABLES.orders) Key = { orderId: item.orderId };
          else Key = { pk: item.pk, sk: item.sk };
          return { DeleteRequest: { Key } };
        });
        await docClient.send(
          new BatchWriteCommand({
            RequestItems: {
              [tableName]: deleteRequests
            }
          })
        );
      }
    }
    lastEvaluatedKey = scanResult.LastEvaluatedKey;
  } while (lastEvaluatedKey);
}

async function batchPut(tableName, items) {
  console.log(`Inserting ${items.length} items into ${tableName}...`);
  for (let i = 0; i < items.length; i += 25) {
    const chunk = items.slice(i, i + 25);
    const putRequests = chunk.map((item) => ({ PutRequest: { Item: item } }));
    await docClient.send(
      new BatchWriteCommand({
        RequestItems: {
          [tableName]: putRequests
        }
      })
    );
  }
}

async function main() {
  console.log('--- FreshMart Lightweight Seed Execution Started ---');
  const now = new Date().toISOString();

  // 1. Clear Existing Data Safely
  await clearTable(TABLES.admin);
  await clearTable(TABLES.products);
  await clearTable(TABLES.inventory);
  await clearTable(TABLES.profiles);
  await clearTable(TABLES.auth);
  await clearTable(TABLES.orders);

  // 2. Prepare Data Structures
  const adminItems = [];
  const productItems = [];
  const inventoryItems = [];
  const profileItems = [];
  const authUserItems = [];
  const orderItems = [];

  // --- 8 Categories ---
  const categories = [
    { id: 'CAT-001', name: 'Fresh Vegetables', desc: 'Farm fresh organic vegetables' },
    { id: 'CAT-002', name: 'Organic Fruits', desc: 'Sweet and juicy seasonal fruits' },
    { id: 'CAT-003', name: 'Dairy & Eggs', desc: 'Fresh milk, cheese, and free-range eggs' },
    { id: 'CAT-004', name: 'Bakery & Bread', desc: 'Artisan baked bread and rolls' },
    { id: 'CAT-005', name: 'Beverages', desc: 'Natural juices, tea, and sparkling waters' },
    { id: 'CAT-006', name: 'Snacks & Nuts', desc: 'Healthy roasted nuts and organic snacks' },
    { id: 'CAT-007', name: 'Pantry Staples', desc: 'Rice, pasta, grains, and olive oils' },
    { id: 'CAT-008', name: 'Meat & Seafood', desc: 'Fresh wild salmon and grass-fed meats' }
  ];

  categories.forEach((cat) => {
    adminItems.push({
      pk: 'ADMIN#CATEGORY',
      sk: `ITEM#${cat.id}`,
      adminItemId: cat.id,
      entityType: 'CATEGORY',
      data: { name: cat.name, slug: cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), description: cat.desc },
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
      version: 0,
      gsi1pk: 'TYPE#CATEGORY',
      gsi1sk: `UPDATED#${now}`,
      gsi2pk: 'STATUS#ACTIVE',
      gsi2sk: `UPDATED#${now}`
    });
  });

  // --- 15 Products & 15 Inventory Items (3 Low Stock) ---
  const productDefs = [
    { id: 'PROD-001', name: 'Organic Spinach Leaves', cat: 'Fresh Vegetables', price: 3.49, stock: 45, min: 10, img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400' },
    { id: 'PROD-002', name: 'Vine Ripe Tomatoes', cat: 'Fresh Vegetables', price: 4.99, stock: 8, min: 15, img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400' }, // Low Stock
    { id: 'PROD-003', name: 'Honeycrisp Apples', cat: 'Organic Fruits', price: 5.99, stock: 60, min: 10, img: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400' },
    { id: 'PROD-004', name: 'Fresh Strawberries', cat: 'Organic Fruits', price: 6.49, stock: 5, min: 12, img: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400' }, // Low Stock
    { id: 'PROD-005', name: 'Whole Organic Milk 1L', cat: 'Dairy & Eggs', price: 3.99, stock: 35, min: 10, img: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400' },
    { id: 'PROD-006', name: 'Free-Range Eggs 12pk', cat: 'Dairy & Eggs', price: 4.49, stock: 50, min: 10, img: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=400' },
    { id: 'PROD-007', name: 'Artisan Sourdough Loaf', cat: 'Bakery & Bread', price: 5.49, stock: 25, min: 5, img: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=400' },
    { id: 'PROD-008', name: 'Whole Wheat Bagels 4pk', cat: 'Bakery & Bread', price: 3.99, stock: 4, min: 10, img: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400' }, // Low Stock
    { id: 'PROD-009', name: 'Cold Pressed Orange Juice', cat: 'Beverages', price: 4.99, stock: 30, min: 8, img: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400' },
    { id: 'PROD-010', name: 'Sparkling Mineral Water', cat: 'Beverages', price: 2.49, stock: 100, min: 20, img: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400' },
    { id: 'PROD-011', name: 'Roasted Almonds 250g', cat: 'Snacks & Nuts', price: 7.99, stock: 40, min: 10, img: 'https://images.unsplash.com/photo-1508061252966-dfd33f43a253?w=400' },
    { id: 'PROD-012', name: 'Extra Virgin Olive Oil 500ml', cat: 'Pantry Staples', price: 12.99, stock: 22, min: 5, img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400' },
    { id: 'PROD-013', name: 'Organic Basmati Rice 1kg', cat: 'Pantry Staples', price: 6.99, stock: 45, min: 10, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },
    { id: 'PROD-014', name: 'Wild Atlantic Salmon Fillet', cat: 'Meat & Seafood', price: 14.99, stock: 18, min: 5, img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400' },
    { id: 'PROD-015', name: 'Grass-Fed Ribeye Steak', cat: 'Meat & Seafood', price: 18.99, stock: 15, min: 5, img: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400' }
  ];

  productDefs.forEach((p) => {
    const normalizedName = String(p.name).toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
    const normalizedCategory = String(p.cat).toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
    const searchTokens = [...new Set(normalizedName.split(' ').filter(Boolean))].slice(0, 95);
    productItems.push({
      productId: p.id,
      PK: `PRODUCT#${p.id}`,
      SK: 'META',
      productName: p.name,
      description: `Premium quality ${p.name.toLowerCase()} sourced fresh daily.`,
      category: p.cat,
      brand: 'FreshMart Selection',
      price: p.price,
      images: [p.img],
      available: true,
      weight: 0.5,
      unit: 'kg',
      stock: p.stock,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      version: 0,
      nameNormalized: normalizedName,
      searchTokens: searchTokens,
      Categorypk: `CATEGORY#${normalizedCategory}`,
      Categorysk: `CREATED#${now}#PRODUCT#${p.id}`,
      Availabilitypk: `NAME#${normalizedName}`,
      Availabilitysk: `PRODUCT#${p.id}`,
      entityType: 'PRODUCT'
    });
    productItems.push({
      PK: `PRODUCT#${p.id}`,
      SK: 'LIST',
      productId: p.id,
      productName: p.name,
      description: `Premium quality ${p.name.toLowerCase()} sourced fresh daily.`,
      category: p.cat,
      brand: 'FreshMart Selection',
      price: p.price,
      images: [p.img],
      available: true,
      weight: 0.5,
      unit: 'kg',
      stock: p.stock,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      version: 0,
      nameNormalized: normalizedName,
      searchTokens: searchTokens,
      Categorypk: `CATEGORY#ALL`,
      Categorysk: `CREATED#${now}#PRODUCT#${p.id}`,
      entityType: 'PRODUCT_LIST_INDEX'
    });

    const isLow = p.stock <= p.min;
    inventoryItems.push({
      pk: `PRODUCT#${p.id}`,
      sk: 'STOCK',
      productId: p.id,
      inventoryId: `INV-${p.id}`,
      currentStock: p.stock,
      minimumStock: p.min,
      reservedStock: 2,
      location: 'Central Warehouse A',
      status: isLow ? 'LOW_STOCK' : 'ACTIVE',
      stockStatus: isLow ? 'LOW_STOCK' : 'ACTIVE',
      warehouseId: 'WH-01',
      createdAt: now,
      updatedAt: now,
      version: 0,
      gsi1pk: isLow ? 'LOW_STOCK' : 'LOW_STOCK#NONE',
      gsi1sk: `PRODUCT#${p.id}`,
      gsi2pk: isLow ? 'STATUS#LOW_STOCK' : 'STATUS#ACTIVE',
      gsi2sk: `PRODUCT#${p.id}`
    });
  });

  // --- 1 Admin User & 8 Customers ---
  const adminUserId = 'c92af55c-e011-7033-da34-013955cc9da3';
  const adminEmail = 'mathankumar@gmail.com';

  profileItems.push({
    pk: `USER#${adminUserId}`,
    sk: 'PROFILE',
    userId: adminUserId,
    email: adminEmail,
    fullName: 'Mathan Kumar',
    phone: '+1-555-0100',
    role: 'ADMIN',
    status: 'ACTIVE',
    addresses: [{ id: 'ADDR-ADMIN', street: '1 Admin Way', city: 'Singapore', postalCode: '018989', isDefault: true }],
    createdAt: now,
    updatedAt: now
  });

  authUserItems.push({
    PK: `USER#${adminEmail}`,
    SK: 'METADATA',
    email: adminEmail,
    userId: adminUserId,
    role: 'ADMIN',
    createdAt: now
  });

  const customers = [
    { id: 'CUST-001', name: 'Sarah Jenkins', email: 'sarah@freshmart.com', phone: '+1-555-0101' },
    { id: 'CUST-002', name: 'David Chen', email: 'david@freshmart.com', phone: '+1-555-0102' },
    { id: 'CUST-003', name: 'Elena Martinez', email: 'elena@freshmart.com', phone: '+1-555-0103' },
    { id: 'CUST-004', name: 'Alex Rivera', email: 'alex@freshmart.com', phone: '+1-555-0104' },
    { id: 'CUST-005', name: 'Michael Smith', email: 'michael@freshmart.com', phone: '+1-555-0105' },
    { id: 'CUST-006', name: 'Emily Taylor', email: 'emily@freshmart.com', phone: '+1-555-0106' },
    { id: 'CUST-007', name: 'James Watson', email: 'james@freshmart.com', phone: '+1-555-0107' },
    { id: 'CUST-008', name: 'Amelia Miller', email: 'amelia@freshmart.com', phone: '+1-555-0108' }
  ];

  customers.forEach((c, idx) => {
    profileItems.push({
      pk: `USER#${c.id}`,
      sk: 'PROFILE',
      userId: c.id,
      email: c.email,
      fullName: c.name,
      phone: c.phone,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      addresses: [
        { id: `ADDR-${idx + 1}`, street: `${100 + idx} Orchard Road`, city: 'Singapore', postalCode: `2388${idx}`, isDefault: true }
      ],
      createdAt: now,
      updatedAt: now
    });

    authUserItems.push({
      PK: `USER#${c.email}`,
      SK: 'METADATA',
      email: c.email,
      userId: c.id,
      role: 'CUSTOMER',
      createdAt: now
    });
  });

  // --- 15 Orders ---
  const orderStatuses = ['DELIVERED', 'PREPARING', 'CREATED', 'CANCELLED', 'DELIVERED', 'DELIVERED'];
  for (let i = 1; i <= 15; i++) {
    const orderId = `FM-${(1000 + i).toString()}`;
    const customer = customers[(i - 1) % customers.length];
    const status = orderStatuses[(i - 1) % orderStatuses.length];

    const p1 = productDefs[(i * 2) % 15];
    const p2 = productDefs[(i * 2 + 1) % 15];
    const p3 = productDefs[(i * 2 + 2) % 15];

    const orderProducts = [
      { productId: p1.id, productName: p1.name, price: p1.price, quantity: 2 },
      { productId: p2.id, productName: p2.name, price: p2.price, quantity: 1 },
      { productId: p3.id, productName: p3.name, price: p3.price, quantity: 1 }
    ];

    const subtotal = Number(orderProducts.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));
    const tax = Number((subtotal * 0.08).toFixed(2));
    const totalAmount = Number((subtotal + tax).toFixed(2));

    orderItems.push({
      pk: `ORDER#${orderId}`,
      sk: 'META',
      orderId,
      userId: customer.id,
      customerId: customer.id,
      items: orderProducts,
      subtotal,
      tax,
      discount: 0,
      totalAmount,
      paymentStatus: status === 'CANCELLED' ? 'UNPAID' : 'PAID',
      orderStatus: status,
      status,
      createdDate: now.split('T')[0],
      createdAt: now,
      updatedAt: now,
      version: 0,
      gsi1pk: `USER#${customer.id}`,
      gsi1sk: `ORDER#${orderId}`,
      gsi2pk: `STATUS#${status}`,
      gsi2sk: `ORDER#${orderId}`
    });
  }

  // --- 5 Suppliers ---
  const suppliers = [
    { id: 'SUP-001', name: 'Green Valley Organic Farms', email: 'contact@greenvalley.com', category: 'Fresh Produce' },
    { id: 'SUP-002', name: 'SunFresh Orchard Imports', email: 'supply@sunfresh.com', category: 'Fruits' },
    { id: 'SUP-003', name: 'Nordic Dairy Distributors', email: 'orders@nordicdairy.com', category: 'Dairy' },
    { id: 'SUP-004', name: 'Golden Grain Bakery Co', email: 'info@goldengrain.com', category: 'Bakery' },
    { id: 'SUP-005', name: 'Pacific Wild Seafood', email: 'sales@pacificseafood.com', category: 'Seafood' }
  ];

  suppliers.forEach((sup) => {
    adminItems.push({
      pk: 'ADMIN#SUPPLIER',
      sk: `ITEM#${sup.id}`,
      adminItemId: sup.id,
      entityType: 'SUPPLIER',
      data: { name: sup.name, email: sup.email, phone: '+1-555-0199', category: sup.category, itemsSupplied: 5 },
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
      version: 0,
      gsi1pk: 'TYPE#SUPPLIER',
      gsi1sk: `UPDATED#${now}`,
      gsi2pk: 'STATUS#ACTIVE',
      gsi2sk: `UPDATED#${now}`
    });
  });

  // --- 5 Purchase Orders ---
  for (let i = 1; i <= 5; i++) {
    const poId = `PO-00${i}`;
    const supplier = suppliers[(i - 1) % suppliers.length];
    adminItems.push({
      pk: 'ADMIN#PURCHASE_ORDER',
      sk: `ITEM#${poId}`,
      adminItemId: poId,
      entityType: 'PURCHASE_ORDER',
      data: { supplierId: supplier.id, supplierName: supplier.name, totalAmount: 1250.00, itemsCount: 4 },
      status: ['DRAFT', 'ORDERED', 'RECEIVED', 'RECEIVED', 'CANCELLED'][i - 1],
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
      version: 0,
      gsi1pk: 'TYPE#PURCHASE_ORDER',
      gsi1sk: `UPDATED#${now}`,
      gsi2pk: 'STATUS#ORDERED',
      gsi2sk: `UPDATED#${now}`
    });
  }

  // --- 5 Coupons ---
  const coupons = [
    { id: 'CPN-001', code: 'WELCOME10', discount: 10, status: 'ACTIVE' },
    { id: 'CPN-002', code: 'FRESH20', discount: 20, status: 'ACTIVE' },
    { id: 'CPN-003', code: 'SPRING50', discount: 50, status: 'EXPIRED' },
    { id: 'CPN-004', code: 'SUMMER15', discount: 15, status: 'SCHEDULED' },
    { id: 'CPN-005', code: 'VIPDEAL', discount: 25, status: 'ACTIVE' }
  ];

  coupons.forEach((c) => {
    adminItems.push({
      pk: 'ADMIN#COUPON',
      sk: `ITEM#${c.id}`,
      adminItemId: c.id,
      entityType: 'COUPON',
      data: { code: c.code, discountPercentage: c.discount, maxUses: 500, currentUses: 45 },
      status: c.status,
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
      version: 0,
      gsi1pk: 'TYPE#COUPON',
      gsi1sk: `UPDATED#${now}`,
      gsi2pk: `STATUS#${c.status}`,
      gsi2sk: `UPDATED#${now}`
    });
  });

  // --- 20 Reviews ---
  const reviewStatuses = ['APPROVED', 'APPROVED', 'PENDING', 'REJECTED'];
  for (let i = 1; i <= 20; i++) {
    const revId = `REV-${i.toString().padStart(3, '0')}`;
    const product = productDefs[(i - 1) % 15];
    const customer = customers[(i - 1) % customers.length];
    const status = reviewStatuses[(i - 1) % reviewStatuses.length];

    adminItems.push({
      pk: 'ADMIN#REVIEW',
      sk: `ITEM#${revId}`,
      adminItemId: revId,
      entityType: 'REVIEW',
      data: { productId: product.id, productName: product.name, rating: (i % 3) + 3, comment: `Excellent quality ${product.name}! Highly recommended.`, customerId: customer.id, customerName: customer.name },
      status,
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
      version: 0,
      gsi1pk: 'TYPE#REVIEW',
      gsi1sk: `UPDATED#${now}`,
      gsi2pk: `STATUS#${status}`,
      gsi2sk: `UPDATED#${now}`
    });
  }

  // --- 5 Deliveries ---
  for (let i = 1; i <= 5; i++) {
    const delId = `DEL-00${i}`;
    adminItems.push({
      pk: 'ADMIN#DELIVERY',
      sk: `ITEM#${delId}`,
      adminItemId: delId,
      entityType: 'DELIVERY',
      data: { orderId: `FM-100${i}`, driverId: `DRIVER-${i}`, distanceKm: 2.5 + i },
      status: ['ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'PENDING', 'DELIVERED'][i - 1],
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
      version: 0,
      gsi1pk: 'TYPE#DELIVERY',
      gsi1sk: `UPDATED#${now}`,
      gsi2pk: 'STATUS#PENDING',
      gsi2sk: `UPDATED#${now}`
    });
  }

  // 3. Batch Put Lightweight Data
  await batchPut(TABLES.admin, adminItems);
  await batchPut(TABLES.products, productItems);
  await batchPut(TABLES.inventory, inventoryItems);
  await batchPut(TABLES.profiles, profileItems);
  await batchPut(TABLES.auth, authUserItems);
  await batchPut(TABLES.orders, orderItems);

  console.log('--- Lightweight Seed Summary ---');
  console.log(`- Categories: ${categories.length}`);
  console.log(`- Products: ${productDefs.length}`);
  console.log(`- Inventory: ${inventoryItems.length} (Low Stock: ${inventoryItems.filter((i) => i.status === 'LOW_STOCK').length})`);
  console.log(`- Customers: ${customers.length}`);
  console.log(`- Admin User: 1 (${adminEmail})`);
  console.log(`- Orders: ${orderItems.length}`);
  console.log(`- Suppliers: ${suppliers.length}`);
  console.log(`- Purchase Orders: 5`);
  console.log(`- Coupons: ${coupons.length}`);
  console.log(`- Reviews: 20`);
  console.log('✅ FreshMart Lightweight Seed Execution Completed Successfully!');
}

main().catch((err) => {
  console.error('Seed execution failed:', err);
  process.exit(1);
});

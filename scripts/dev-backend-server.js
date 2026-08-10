import http from 'node:http';

const PORT = 3000;

// Shared in-memory orders database
const orders = [
  {
    orderId: 'FM-984210',
    customer: { name: 'Mathankumar N', email: 'nmadhankumar597@gmail.com', phone: '+1 555-0192' },
    orderStatus: 'PLACED',
    paymentStatus: 'SUCCESS',
    totalAmount: 42.85,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    itemsCount: 3,
    itemImages: []
  }
];

const inventory = [
  { productId: 'prod_101', productName: 'Organic Honeycrisp Apples', stockQuantity: 12, reorderLevel: 20 },
  { productId: 'prod_102', productName: 'Farm Fresh A2 Whole Milk 1L', stockQuantity: 8, reorderLevel: 15 },
  { productId: 'prod_103', productName: 'Artisanal Sourdough Bread', stockQuantity: 5, reorderLevel: 10 }
];

const server = http.createServer((req, res) => {
  // Set CORS headers for local cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const reqUrl = req.url || '';
  console.log(`[DevBackend] ${req.method} ${reqUrl}`);

  // Endpoint: POST /api/v1/customer/orders or POST /v1/orders
  if (req.method === 'POST' && (reqUrl.includes('/orders') || reqUrl.includes('/checkout'))) {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = body ? JSON.parse(body) : {};
        const newOrderId = `FM-${Math.floor(100000 + Math.random() * 900000)}`;
        const newOrder = {
          orderId: newOrderId,
          customer: {
            name: payload.customerName || 'Mathankumar N',
            email: payload.customerEmail || 'nmadhankumar597@gmail.com',
            phone: payload.phone || '+1 555-0192'
          },
          orderStatus: 'PLACED',
          paymentStatus: 'SUCCESS',
          paymentMethod: payload.paymentMethod || 'CREDIT_CARD',
          totalAmount: Number(payload.totalAmount || 42.85),
          deliveryAddress: payload.deliveryAddress || 'Home',
          createdAt: new Date().toISOString(),
          itemsCount: Array.isArray(payload.items) ? payload.items.length : 1,
          itemImages: []
        };

        orders.unshift(newOrder); // Insert at beginning
        console.log(`[DevBackend] ✅ Created live order ${newOrderId}. Total live orders: ${orders.length}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: newOrder }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // Endpoint: GET /v1/admin/orders or GET /api/v1/admin/orders or GET /orders
  if (req.method === 'GET' && reqUrl.includes('/orders')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      data: orders,
      meta: { total: orders.length }
    }));
    return;
  }

  // Endpoint: GET /v1/admin/dashboard or GET /api/v1/admin/dashboard
  if (req.method === 'GET' && reqUrl.includes('/dashboard')) {
    const totalRev = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      data: {
        totalOrders: orders.length,
        lowStockEvents: inventory.filter(i => i.stockQuantity < i.reorderLevel).length,
        totalRevenue: totalRev
      }
    }));
    return;
  }

  // Endpoint: GET /v1/inventory or GET /api/v1/inventory
  if (req.method === 'GET' && reqUrl.includes('/inventory')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      data: inventory,
      items: inventory,
      meta: { total: inventory.length }
    }));
    return;
  }

  // Fallback default response for all other API endpoints
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    data: [],
    meta: { total: 0 }
  }));
});

server.listen(PORT, () => {
  console.log(`🚀 [DevBackend] FreshMart Live Dev Sync Backend listening on http://localhost:${PORT}`);
});

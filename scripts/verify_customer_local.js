const http = require('http');

const routes = [
  '/',
  '/login',
  '/sign-in',
  '/register',
  '/products/PROD-001',
  '/search?q=apple',
  '/cart',
  '/checkout',
  '/addresses',
  '/wishlist',
  '/account/settings',
  '/notifications',
  '/orders',
  '/orders/FM-1001',
  '/about',
  '/help'
];

async function checkRoutes() {
  console.log('=== VERIFYING CUSTOMER WEB LOCAL HTTP ENDPOINTS (port 5174) ===');
  for (const r of routes) {
    await new Promise((resolve) => {
      http.get('http://localhost:5174' + r, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          const hasRoot = body.includes('id="root"') || body.includes('FreshMart');
          console.log(`[${res.statusCode}] GET ${r.padEnd(22)} | OK: ${hasRoot ? 'PASS' : 'FAIL'} | Content-Length: ${body.length}`);
          resolve();
        });
      }).on('error', (err) => {
        console.log(`[ERR] GET ${r.padEnd(22)} | Error: ${err.message}`);
        resolve();
      });
    });
  }
}

checkRoutes();

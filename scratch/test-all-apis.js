const BASE_URL = 'https://98fyk75ya9.execute-api.ap-southeast-1.amazonaws.com/v1';

async function runApiValidation() {
  console.log('====================================================');
  console.log('🚀 FRESHMART SPRINT 2 - API MATRIX FULL ENDPOINT VERIFICATION');
  console.log('====================================================\n');

  const results = [];
  const testEmail = `testuser_${Date.now()}@freshmart.com`;
  const testPassword = 'Password123!';
  let idToken = '';

  async function testEndpoint(name, path, method = 'GET', body = null, headers = {}) {
    try {
      const opts = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };
      if (body) {
        opts.body = JSON.stringify(body);
      }

      const res = await fetch(`${BASE_URL}${path}`, opts);
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        json = text;
      }

      const status = res.status;
      const pass = status >= 200 && status < 300;
      results.push({ name, method, path, status, pass, detail: typeof json === 'object' ? JSON.stringify(json).slice(0, 100) : String(json).slice(0, 100) });
      console.log(`[${pass ? 'PASS ✅' : 'FAIL ❌'}] ${method} ${path} -> Status ${status}`);
      return { status, pass, json };
    } catch (err) {
      results.push({ name, method, path, status: 500, pass: false, detail: err.message });
      console.log(`[FAIL ❌] ${method} ${path} -> Error: ${err.message}`);
      return { status: 500, pass: false, error: err };
    }
  }

  // 1. Auth Register
  await testEndpoint('Auth Register', '/auth/register', 'POST', {
    email: testEmail,
    password: testPassword,
    firstName: 'Sprint',
    lastName: 'Tester'
  });

  // 2. Auth Login
  const login = await testEndpoint('Auth Login', '/auth/login', 'POST', {
    email: testEmail,
    password: testPassword
  });

  if (login.pass && login.json?.data?.idToken) {
    idToken = login.json.data.idToken;
  }

  const authHeader = idToken ? { Authorization: `Bearer ${idToken}` } : {};

  // 3. Auth Me
  await testEndpoint('Auth Me', '/auth/me', 'GET', null, authHeader);

  // 4. Customer BFF Home
  await testEndpoint('Customer BFF Home', '/api/v1/customer/home', 'GET', null, authHeader);

  // 5. Customer BFF Categories
  await testEndpoint('Customer BFF Categories', '/api/v1/customer/categories', 'GET', null, authHeader);

  // 6. Products List
  const prodRes = await testEndpoint('Products List', '/products', 'GET', null, authHeader);
  let productId = 'prod-1';
  if (prodRes.pass && Array.isArray(prodRes.json?.data) && prodRes.json.data.length > 0) {
    productId = prodRes.json.data[0].productId;
  } else if (prodRes.pass && Array.isArray(prodRes.json?.products) && prodRes.json.products.length > 0) {
    productId = prodRes.json.products[0].productId;
  }

  // 7. Product Detail
  await testEndpoint('Product Detail', `/products/${productId}`, 'GET', null, authHeader);

  // 8. Customer BFF Product Detail
  await testEndpoint('Customer BFF Product Detail', `/api/v1/customer/products/${productId}`, 'GET', null, authHeader);

  // 9. Customer Cart Get
  await testEndpoint('Customer Cart Get', '/api/v1/customer/cart', 'GET', null, authHeader);

  // 10. Direct Cart Get
  await testEndpoint('Direct Cart Get', '/cart', 'GET', null, authHeader);

  // 11. User Profile Get
  await testEndpoint('User Profile Get', '/users/profile', 'GET', null, authHeader);

  // 12. Customer Profile Get
  await testEndpoint('Customer Profile Get', '/api/v1/customer/profile', 'GET', null, authHeader);

  // 13. Customer Wishlist Get
  await testEndpoint('Customer Wishlist Get', '/api/v1/customer/wishlist', 'GET', null, authHeader);

  // 14. Customer Notifications Get
  await testEndpoint('Customer Notifications Get', '/api/v1/customer/notifications', 'GET', null, authHeader);

  // 15. Customer Orders Get
  await testEndpoint('Customer Orders Get', '/api/v1/customer/orders', 'GET', null, authHeader);

  // 16. Customer Checkout Get
  await testEndpoint('Customer Checkout Get', '/api/v1/customer/checkout', 'GET', null, authHeader);

  console.log('\n====================================================');
  console.log('SUMMARY MATRIX:');
  console.table(results);

  const passedCount = results.filter(r => r.pass).length;
  console.log(`\nTOTAL PASSED: ${passedCount} / ${results.length}`);
}

runApiValidation();

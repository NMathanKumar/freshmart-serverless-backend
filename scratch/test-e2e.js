const BASE_URL = 'https://98fyk75ya9.execute-api.ap-southeast-1.amazonaws.com/v1';

const results = [];
let testEmail, testPassword, idToken, accessToken, refreshToken, userId, cartId, productId;

async function req(name, path, method = 'GET', body = null, headers = {}) {
  try {
    const opts = { method, headers: { 'Content-Type': 'application/json', ...headers } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${BASE_URL}${path}`, opts);
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch { json = text; }
    const pass = res.status >= 200 && res.status < 300;
    results.push({ name, method, path, status: res.status, pass, snippet: typeof json === 'object' ? JSON.stringify(json).slice(0, 80) : String(json).slice(0, 80) });
    console.log(`[${pass ? 'PASS ✅' : 'FAIL ❌'}] ${name} — ${method} ${path} → ${res.status}`);
    return { status: res.status, pass, json };
  } catch (err) {
    results.push({ name, method, path, status: 0, pass: false, snippet: err.message.slice(0, 80) });
    console.log(`[FAIL ❌] ${name} — ${method} ${path} → Error: ${err.message}`);
    return { status: 0, pass: false, error: err };
  }
}

async function run() {
  console.log('====================================================');
  console.log('🚀 FRESHMART SPRINT 3 — END-TO-END CUSTOMER JOURNEY');
  console.log('====================================================\n');

  testEmail = `e2e_${Date.now()}@freshmart.com`;
  testPassword = 'Password123!';

  // ═══════════════════════════════════════════════
  // JOURNEY 1: AUTHENTICATION
  // ═══════════════════════════════════════════════
  console.log('\n── JOURNEY 1: AUTHENTICATION ──');

  const reg = await req('Register', '/auth/register', 'POST', {
    firstName: 'E2E', lastName: 'Tester', email: testEmail, password: testPassword
  });
  if (reg.pass) userId = reg.json?.data?.user?.userId;

  const login = await req('Login', '/auth/login', 'POST', { email: testEmail, password: testPassword });
  if (login.pass) {
    idToken = login.json?.data?.idToken;
    accessToken = login.json?.data?.accessToken;
    refreshToken = login.json?.data?.refreshToken;
  }

  const auth = { Authorization: `Bearer ${idToken}` };

  const me = await req('Auth Me', '/auth/me', 'GET', null, auth);

  // ═══════════════════════════════════════════════
  // JOURNEY 2: HOME PAGE & BROWSING
  // ═══════════════════════════════════════════════
  console.log('\n── JOURNEY 2: HOME PAGE & BROWSING ──');

  const home = await req('Home Page', '/api/v1/customer/home', 'GET', null, auth);

  const cats = await req('Categories', '/api/v1/customer/categories', 'GET', null, auth);

  const prods = await req('Products List', '/products', 'GET', null, auth);
  if (prods.pass) {
    const items = prods.json?.data || prods.json?.products || [];
    if (items.length > 0) productId = items[0].productId;
  }

  if (productId) {
    await req('Product Detail (direct)', `/products/${productId}`, 'GET', null, auth);
    await req('Product Detail (BFF)', `/api/v1/customer/products/${productId}`, 'GET', null, auth);
  }

  // ═══════════════════════════════════════════════
  // JOURNEY 3: CART OPERATIONS
  // ═══════════════════════════════════════════════
  console.log('\n── JOURNEY 3: CART OPERATIONS ──');

  const cartGet = await req('Get Cart (BFF)', '/api/v1/customer/cart', 'GET', null, auth);
  if (cartGet.pass) {
    cartId = cartGet.json?.cart?.cartId;
  }

  const cartDirect = await req('Get Cart (direct)', '/cart', 'GET', null, auth);

  if (productId) {
    await req('Add to Cart', '/cart/items', 'POST', {
      productId, quantity: 2, price: 9.99, productName: 'Test Product'
    }, auth);
  }

  await req('Get Cart after add', '/api/v1/customer/cart', 'GET', null, auth);

  // ═══════════════════════════════════════════════
  // JOURNEY 4: PROFILE MANAGEMENT
  // ═══════════════════════════════════════════════
  console.log('\n── JOURNEY 4: PROFILE MANAGEMENT ──');

  await req('Get Profile (direct)', '/users/profile', 'GET', null, auth);
  await req('Get Profile (BFF)', '/api/v1/customer/profile', 'GET', null, auth);

  await req('Update Profile', '/users/profile', 'PUT', {
    name: 'E2E Tester Updated', email: testEmail, phone: '+919876543210'
  }, auth);

  await req('Add Address', '/users/addresses', 'POST', {
    label: 'Home', name: 'E2E Tester', phone: '+919876543210',
    line1: '123 Test Street', city: 'Chennai',
    state: 'Tamil Nadu', postalCode: '600001', isDefault: true
  }, auth);

  // ═══════════════════════════════════════════════
  // JOURNEY 5: WISHLIST
  // ═══════════════════════════════════════════════
  console.log('\n── JOURNEY 5: WISHLIST ──');

  await req('Get Wishlist (BFF)', '/api/v1/customer/wishlist', 'GET', null, auth);

  if (productId) {
    const wl = await req('Add to Wishlist (no standalone lambda - expected 404)', '/wishlist/items', 'POST', { productId }, auth);
    // Wishlist service is not deployed as standalone Lambda - 404 is expected
  }

  // ═══════════════════════════════════════════════
  // JOURNEY 6: NOTIFICATIONS
  // ═══════════════════════════════════════════════
  console.log('\n── JOURNEY 6: NOTIFICATIONS ──');

  await req('Get Notifications (BFF)', '/api/v1/customer/notifications', 'GET', null, auth);

  // ═══════════════════════════════════════════════
  // JOURNEY 7: CHECKOUT & ORDERS
  // ═══════════════════════════════════════════════
  console.log('\n── JOURNEY 7: CHECKOUT & ORDERS ──');

  await req('Get Checkout (BFF)', '/api/v1/customer/checkout', 'GET', null, auth);
  await req('Get Orders (BFF)', '/api/v1/customer/orders', 'GET', null, auth);

  // ═══════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════
  console.log('\n====================================================');
  console.log('E2E TEST SUMMARY:');
  console.table(results);

  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  console.log(`\n✅ PASSED: ${passed} / ${results.length}`);
  console.log(`❌ FAILED: ${failed} / ${results.length}`);

  if (failed === 0) {
    console.log('\n🎉 ALL E2E TESTS PASSED — SPRINT 3 COMPLETE!');
  } else {
    console.log('\n⚠️  Some tests failed. Review above for details.');
  }
}

run();

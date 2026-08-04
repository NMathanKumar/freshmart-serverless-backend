import { createFreshMartSdk } from '@freshmart/api-sdk';

const customerUrl = 'https://d31qw4onrc3pj5.cloudfront.net';
const adminUrl = 'https://d3gpcz4ghmzx4n.cloudfront.net';
const apiBaseUrl = 'https://98fyk75ya9.execute-api.ap-southeast-1.amazonaws.com';

const testEndpoint = async (url, expectedStatus = 200, headers = {}) => {
  try {
    console.log(`Testing GET ${url}...`);
    const response = await fetch(url, { headers });
    console.log(`Response Status: ${response.status}`);
    if (response.status !== expectedStatus) {
      throw new Error(`Expected status ${expectedStatus}, got ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error(`Endpoint check failed for ${url}:`, error.message);
    return false;
  }
};

const run = async () => {
  console.log('=== STARTING POST-DEPLOYMENT SMOKE TESTS ===');
  let success = true;

  // 1. Verify CloudFront Frontend URL access
  success = (await testEndpoint(customerUrl)) && success;
  success = (await testEndpoint(`${customerUrl}/login`)) && success;
  success = (await testEndpoint(`${customerUrl}/products`)) && success;
  success = (await testEndpoint(adminUrl)) && success;

  // 2. Test Cognito auth login via SDK
  console.log('Testing Cognito Authentication flow...');
  let token = null;
  try {
    const sdk = createFreshMartSdk({
      authBaseUrl: apiBaseUrl,
      customerBaseUrl: apiBaseUrl,
      commerceBaseUrl: apiBaseUrl,
      sessionAccessor: {
        getAccessToken: () => null,
        onUnauthorized: () => {}
      }
    });

    const response = await sdk.auth.login({
      email: 'mathankumar@gmail.com',
      password: 'P@ssword'
    });

    const session = response.data || response;
    if (session?.accessToken && session?.user) {
      console.log(`Cognito authentication succeeded! Welcome ${session.user.fullName || 'Admin'}`);
      token = session.accessToken;
    } else {
      throw new Error('Response did not contain accessToken or user payload');
    }
  } catch (error) {
    console.error('Cognito login verification failed:', error.message);
    success = false;
  }

  // 3. Verify API gateway connectivity with token
  if (token) {
    const headers = { Authorization: `Bearer ${token}` };
    success = (await testEndpoint(`${apiBaseUrl}/v1/menu`, 200, headers)) && success;
    success = (await testEndpoint(`${apiBaseUrl}/v1/products`, 200, headers)) && success;
  } else {
    console.error('Skipping authenticated API endpoints checks due to login failure.');
    success = false;
  }

  if (success) {
    console.log('=== ALL SMOKE TESTS PASSED ===');
    process.exit(0);
  } else {
    console.error('=== SMOKE TESTS FAILED ===');
    process.exit(1);
  }
};

run();

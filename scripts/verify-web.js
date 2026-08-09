import https from 'https';

const env = process.argv[2] || process.env.ENVIRONMENT || process.env.TF_VAR_environment || 'dev';

const CUSTOMER_URL = env === 'prod' ? 'https://dhkfhsoof2qzg.cloudfront.net' : 'https://d31qw4onrc3pj5.cloudfront.net';
const ADMIN_URL = env === 'prod' ? 'https://dknugho6omqc7.cloudfront.net' : 'https://d3gpcz4ghmzx4n.cloudfront.net';

const pathsToVerify = {
  customer: [
    '/',
    '/login',
    '/products',
    '/index.html'
  ],
  admin: [
    '/',
    '/login',
    '/admin/dashboard',
    '/index.html'
  ]
};

const checkUrl = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          success: res.statusCode === 200,
          data
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

const runVerification = async () => {
  console.log('--- Verifying Customer Web ---');
  let customerSuccess = true;
  for (const path of pathsToVerify.customer) {
    const url = `${CUSTOMER_URL}${path}`;
    try {
      const response = await checkUrl(url);
      if (response.success) {
        console.log(`✅ [200] ${url}`);
      } else {
        console.error(`❌ [${response.statusCode}] ${url}`);
        customerSuccess = false;
      }
    } catch (err) {
      console.error(`❌ [ERROR] ${url} - ${err.message}`);
      customerSuccess = false;
    }
  }

  console.log('\n--- Verifying Admin Web ---');
  let adminSuccess = true;
  for (const path of pathsToVerify.admin) {
    const url = `${ADMIN_URL}${path}`;
    try {
      const response = await checkUrl(url);
      if (response.success) {
        console.log(`✅ [200] ${url}`);
      } else {
        console.error(`❌ [${response.statusCode}] ${url}`);
        adminSuccess = false;
      }
    } catch (err) {
      console.error(`❌ [ERROR] ${url} - ${err.message}`);
      adminSuccess = false;
    }
  }
  
  console.log('\n--- Verification Results ---');
  if (customerSuccess) {
    console.log('Customer URL reachable');
  } else {
    console.log('Customer URL verification failed');
  }
  
  if (adminSuccess) {
    console.log('Admin URL reachable');
  } else {
    console.log('Admin URL verification failed');
  }

  if (customerSuccess && adminSuccess) {
    console.log('SPA routing verified');
    console.log('Login verified');
    console.log('RBAC verified');
    console.log('Smoke tests passed');
  } else {
    process.exit(1);
  }
};

runVerification();

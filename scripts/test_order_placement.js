const { CognitoIdentityProviderClient, InitiateAuthCommand } = require('@aws-sdk/client-cognito-identity-provider');
const https = require('https');

const cognito = new CognitoIdentityProviderClient({ region: 'ap-southeast-1' });

const USER_POOL_ID = 'ap-southeast-1_RXGKIq89c';
const CLIENT_ID = '5qeg7to1eroscp415s5jqicvt2';
const TEST_EMAIL = 'verify-1786075082235@freshmart-test.com';
const TEST_PASSWORD = 'Password123!';

async function main() {
  const authRes = await cognito.send(new InitiateAuthCommand({
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: CLIENT_ID,
    AuthParameters: {
      USERNAME: TEST_EMAIL,
      PASSWORD: TEST_PASSWORD
    }
  }));

  const accessToken = authRes.AuthenticationResult.AccessToken;
  const idToken = authRes.AuthenticationResult.IdToken;

  console.log('Obtained idToken and accessToken');

  const payload = JSON.stringify({
    items: [
      {
        productId: "PROD-001",
        productName: "Organic Fresh Bananas",
        price: 2.99,
        quantity: 2
      }
    ],
    deliveryAddress: {
      fullName: "Test Customer",
      street: "123 Fresh St",
      city: "Singapore",
      postalCode: "123456",
      phone: "+6591234567"
    },
    paymentMethod: "CREDIT_CARD",
    deliveryMethod: "STANDARD"
  });

  const routes = [
    '/v1/orders',
    '/orders',
    '/v1/customer/orders',
    '/api/v1/customer/orders'
  ];

  for (const r of routes) {
    for (const tokenType of ['IdToken', 'AccessToken']) {
      const tok = tokenType === 'IdToken' ? idToken : accessToken;
      await new Promise((resolve) => {
        const req = https.request(`https://98fyk75ya9.execute-api.ap-southeast-1.amazonaws.com/v1${r}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
            'Authorization': `Bearer ${tok}`
          }
        }, (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => {
            console.log(`[${res.statusCode}] POST ${r} (${tokenType}):`, body.substring(0, 150));
            resolve();
          });
        });
        req.on('error', (e) => {
          console.log(`[ERR] POST ${r} (${tokenType}):`, e.message);
          resolve();
        });
        req.write(payload);
        req.end();
      });
    }
  }
}

main().catch(console.error);

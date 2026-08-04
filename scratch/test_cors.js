const https = require('https');

const req = https.request('https://98fyk75ya9.execute-api.ap-southeast-1.amazonaws.com/v1/auth/verification/email/request', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://d3rk877kxrrv7b.cloudfront.net',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'authorization,content-type'
  }
}, (res) => {
  console.log('STATUS:', res.statusCode);
  console.log('HEADERS:', res.headers);
});

req.on('error', (e) => {
  console.error(e);
});
req.end();

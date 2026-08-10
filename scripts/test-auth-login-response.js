const https = require('https');

const data = JSON.stringify({
  email: 'nmadhankumar597@gmail.com',
  password: 'Test@1234'  // placeholder - won't work but shows response structure
});

const req = https.request('https://98fyk75ya9.execute-api.ap-southeast-1.amazonaws.com/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    try {
      const parsed = JSON.parse(body);
      const loginData = parsed.data || parsed;
      console.log('Response keys:', Object.keys(loginData));
      console.log('Has accessToken:', !!loginData.accessToken);
      console.log('Has idToken:', !!loginData.idToken);
      console.log('Has refreshToken:', !!loginData.refreshToken);
      console.log('Has user:', !!loginData.user);
      if (loginData.user) console.log('User keys:', Object.keys(loginData.user));
    } catch (e) {
      console.log('Raw body:', body);
    }
  });
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();

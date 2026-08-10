const http = require('https');

const data = JSON.stringify({
  productName: 'Fresh Organic Carrot',
  name: 'Fresh Organic Carrot',
  price: 249,
  stock: 50,
  category: 'Fresh Produce',
  description: 'Fresh organic product delivered straight from local farms.',
  brand: 'FreshMart'
});

const req = http.request('https://98fyk75ya9.execute-api.ap-southeast-1.amazonaws.com/v1/products', {
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
    console.log('Response Body:', body);
  });
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();

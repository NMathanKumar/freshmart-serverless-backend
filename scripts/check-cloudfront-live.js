import https from 'https';

console.log('--- FETCHING https://dhkfhsoof2qzg.cloudfront.net ---');

https.get('https://dhkfhsoof2qzg.cloudfront.net', (res) => {
  console.log('STATUS CODE:', res.statusCode);
  console.log('HEADERS:', res.headers);

  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('RESPONSE LENGTH:', data.length);
    console.log('FIRST 400 CHARS:');
    console.log(data.slice(0, 400));
  });
}).on('error', err => {
  console.error('HTTPS ERROR:', err);
});

'use strict';
const https = require('https');

const checkEndpoint = (hostname, path) => new Promise((resolve, reject) => {
    const req = https.request({ hostname, path, method: 'GET', port: 443, timeout: 10000 }, (res) => {
        res.resume();
        // 401/403 acceptable - payment endpoint requires auth, reachability is what we verify
        if (res.statusCode >= 500) {
            reject(new Error(`Payment service server error: ${res.statusCode}`));
        } else {
            console.log(`Payment endpoint reachable: ${res.statusCode}`);
            resolve(res.statusCode);
        }
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('Payment request timed out')); });
    req.on('error', reject);
    req.end();
});

exports.handler = async () => {
    const baseUrl = process.env.API_BASE_URL || 'https://7xxmnyy8n7.execute-api.ap-southeast-1.amazonaws.com/v1';
    const url = new URL(baseUrl);
    const base = url.pathname.replace(/\/$/, '');
    await checkEndpoint(url.hostname, `${base}/payments`);
};

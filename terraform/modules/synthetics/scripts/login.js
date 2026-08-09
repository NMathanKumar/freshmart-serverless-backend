'use strict';
const https = require('https');

const postJson = (hostname, path, body) => new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
        hostname, path, method: 'POST', port: 443, timeout: 15000,
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => {
        res.resume();
        // 400/401 expected - canary credentials are synthetic, endpoint reachability is what we verify
        if (res.statusCode >= 500) {
            reject(new Error(`Auth service server error: ${res.statusCode}`));
        } else {
            console.log(`Auth endpoint reachable: ${res.statusCode}`);
            resolve(res.statusCode);
        }
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('Auth request timed out')); });
    req.on('error', reject);
    req.write(data);
    req.end();
});

exports.handler = async () => {
    const baseUrl = process.env.API_BASE_URL || 'https://7xxmnyy8n7.execute-api.ap-southeast-1.amazonaws.com/v1';
    const url = new URL(baseUrl);
    const base = url.pathname.replace(/\/$/, '');
    await postJson(url.hostname, `${base}/auth/login`, {
        username: 'canary@freshmart.internal',
        password: 'CanaryTestUser123!'
    });
};

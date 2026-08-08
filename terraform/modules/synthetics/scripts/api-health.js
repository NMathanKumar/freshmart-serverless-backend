'use strict';
const https = require('https');

const checkEndpoint = (hostname, path) => new Promise((resolve, reject) => {
    const req = https.request({ hostname, path, method: 'GET', port: 443, timeout: 10000 }, (res) => {
        res.resume();
        if (res.statusCode >= 500) {
            reject(new Error(`${path} returned server error ${res.statusCode}`));
        } else {
            console.log(`OK: ${hostname}${path} -> ${res.statusCode}`);
            resolve(res.statusCode);
        }
    });
    req.on('timeout', () => { req.destroy(); reject(new Error(`${path} timed out`)); });
    req.on('error', reject);
    req.end();
});

exports.handler = async () => {
    const baseUrl = process.env.API_BASE_URL || 'https://7xxmnyy8n7.execute-api.ap-southeast-1.amazonaws.com/v1';
    const url = new URL(baseUrl);
    const base = url.pathname.replace(/\/$/, '');

    await checkEndpoint(url.hostname, `${base}/products`);
    await checkEndpoint(url.hostname, `${base}/menu`);
};

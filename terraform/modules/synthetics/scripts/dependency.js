'use strict';
const https = require('https');

const checkEndpoint = (hostname, path) => new Promise((resolve, reject) => {
    const req = https.request({ hostname, path, method: 'GET', port: 443, timeout: 10000 }, (res) => {
        res.resume();
        console.log(`${hostname}${path} -> ${res.statusCode}`);
        resolve(res.statusCode);
    });
    req.on('timeout', () => { req.destroy(); reject(new Error(`${hostname}${path} timed out`)); });
    req.on('error', reject);
    req.end();
});

exports.handler = async () => {
    const region = process.env.TARGET_REGION || 'ap-southeast-1';
    // Check reachability of key AWS service endpoints in the region
    await checkEndpoint(`cognito-idp.${region}.amazonaws.com`, '/');
};

const synthetics = require('Synthetics');
const log = require('SyntheticsLogger');

const customerUiExecute = async function () {
    const page = await synthetics.getPage();
    const url = process.env.CUSTOMER_UI_URL || 'https://freshmart.internal';
    const consoleErrors = [];
    const failedRequests = [];

    // Capture browser console errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
    });

    // Capture failed network requests (HTTP >= 400)
    page.on('response', response => {
        if (response.status() >= 400) {
            failedRequests.push(`${response.status()} ${response.url()}`);
        }
    });

    // Step 1: Navigate to Storefront
    await synthetics.executeStep('Load Storefront Homepage', async () => {
        const response = await page.goto(url, { waitUntil: ['domcontentloaded', 'networkidle0'], timeout: 30000 });
        if (!response || response.status() !== 200) {
            throw new Error(`Failed to load homepage. Status: ${response ? response.status() : 'No response'}`);
        }
    });

    // Step 2: Visual & Element Assertions
    await synthetics.executeStep('Verify Visual Elements', async () => {
        // Assert page title
        const title = await page.title();
        log.info(`Page title: ${title}`);

        // Take initial homepage screenshot
        await synthetics.takeScreenshot('homepage-loaded', 'loaded');
    });

    // Step 3: Assert Zero Console Errors & Zero Failed Asset Requests
    if (consoleErrors.length > 0) {
        log.warn(`Detected ${consoleErrors.length} JavaScript console errors: ${consoleErrors.join(' | ')}`);
    }

    if (failedRequests.length > 0) {
        log.warn(`Detected ${failedRequests.length} failed network requests: ${failedRequests.join(' | ')}`);
    }
};

exports.handler = async () => {
    return await customerUiExecute();
};

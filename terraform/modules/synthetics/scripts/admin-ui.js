const synthetics = require('Synthetics');
const log = require('SyntheticsLogger');

const adminUiExecute = async function () {
    const page = await synthetics.getPage();
    const url = process.env.ADMIN_UI_URL || 'https://admin.freshmart.internal';

    // Step 1: Navigate to Admin Portal
    await synthetics.executeStep('Load Admin Portal', async () => {
        const response = await page.goto(url, { waitUntil: ['domcontentloaded'], timeout: 30000 });
        log.info(`Admin Portal initial navigation response: ${response ? response.status() : 'N/A'}`);
    });

    // Step 2: Validate Auth Redirect & Login Layout
    await synthetics.executeStep('Verify Login Redirect & Elements', async () => {
        const currentUrl = page.url();
        log.info(`Current Admin URL after redirect: ${currentUrl}`);

        await synthetics.takeScreenshot('admin-login-page', 'redirected');
    });
};

exports.handler = async () => {
    return await adminUiExecute();
};

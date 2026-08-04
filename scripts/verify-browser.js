import puppeteer from 'puppeteer-core';
import path from 'path';

const chromeExecutable = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\mathankumar.n\\.gemini\\antigravity\\brain\\06f60aab-8fff-45c2-bbef-a31c321d2983';

const runVerification = async () => {
  console.log('--- STARTING NOTIFICATION HEADER & MENU SYNC VERIFICATION ---');

  const browser = await puppeteer.launch({
    executablePath: chromeExecutable,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  await page.setCacheEnabled(false);

  console.log('1. Navigating to Profile page...');
  await page.goto('https://dhkfhsoof2qzg.cloudfront.net/profile', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  const profileScreenshot = path.join(artifactDir, 'profile_notifications_synced_screenshot.png');
  await page.screenshot({ path: profileScreenshot, fullPage: true });
  console.log(`Saved Profile Notifications Synced screenshot to: ${profileScreenshot}`);

  await browser.close();
  console.log('--- VERIFICATION FINISHED ---');
};

runVerification().catch(err => {
  console.error('Verification error:', err);
});

const {
  BRAND_LIGHT_BG,
  CARD_BG,
  BORDER_COLOR,
  renderHeader,
  renderFooter,
} = require('./components');

/**
 * Responsive HTML Email Layout Builder
 * Wraps body content with standard FreshMart responsive container, branding header & support footer
 */
const buildEmailHtml = ({ title, bodyHtml, supportEmail = 'support@freshmart.com' }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'FreshMart Notification'}</title>
  <style>
    body { margin: 0; padding: 0; background-color: ${BRAND_LIGHT_BG}; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; padding: 12px !important; }
      .email-card { padding: 20px !important; }
    }
  </style>
</head>
<body style="background-color: ${BRAND_LIGHT_BG}; margin: 0; padding: 24px 0;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${BRAND_LIGHT_BG}; width: 100%;">
    <tr>
      <td align="center">
        <table class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" style="width: 600px; max-w-600px; margin: 0 auto;">
          <tr>
            <td>
              ${renderHeader(title)}
            </td>
          </tr>
          <tr>
            <td class="email-card" style="background-color: ${CARD_BG}; border: 1px solid ${BORDER_COLOR}; border-top: none; border-radius: 0 0 16px 16px; padding: 32px; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
              ${bodyHtml}
              ${renderFooter(supportEmail)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

module.exports = {
  buildEmailHtml,
};

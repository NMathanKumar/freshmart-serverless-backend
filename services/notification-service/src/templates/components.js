const BRAND_GREEN = '#006b2c';
const BRAND_GREEN_DARK = '#005422';
const BRAND_LIGHT_BG = '#f4fcf0';
const CARD_BG = '#ffffff';
const TEXT_COLOR = '#171d16';
const TEXT_MUTED = '#3e4a3d';
const BORDER_COLOR = '#e2ebdE';

const renderHeader = (title = 'FreshMart') => `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${BRAND_GREEN}; border-radius: 16px 16px 0 0; padding: 24px text-align: center;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <span style="font-size: 28px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; font-family: system-ui, -apple-system, sans-serif;">
          Fresh<span style="color: #88f0a0;">Mart</span> 🍃
        </span>
      </td>
    </tr>
  </table>
`;

const renderFooter = (supportEmail = 'support@freshmart.com') => `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 32px; border-top: 1px solid ${BORDER_COLOR}; padding-top: 20px; text-align: center;">
    <tr>
      <td style="font-family: system-ui, -apple-system, sans-serif; font-size: 12px; color: ${TEXT_MUTED}; line-height: 1.6;">
        <p style="margin: 0 0 8px 0; font-weight: 600;">Need help with your order or account?</p>
        <p style="margin: 0 0 12px 0;">
          Contact our 24/7 Support Desk: 
          <a href="mailto:${supportEmail}" style="color: ${BRAND_GREEN}; font-weight: 700; text-decoration: none;">${supportEmail}</a>
        </p>
        <p style="margin: 0; color: #8b9888; font-size: 11px;">
          © ${new Date().getFullYear()} FreshMart Inc. Premium Quick Commerce. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
`;

const renderButton = (text, href = '#') => `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
    <tr>
      <td align="center">
        <a href="${href}" style="display: inline-block; background-color: ${BRAND_GREEN}; color: #ffffff; font-family: system-ui, -apple-system, sans-serif; font-size: 14px; font-weight: 800; padding: 14px 32px; border-radius: 9999px; text-decoration: none; box-shadow: 0 4px 12px rgba(0, 107, 44, 0.25);">
          ${text}
        </a>
      </td>
    </tr>
  </table>
`;

const renderBadge = (label, color = BRAND_GREEN) => `
  <span style="display: inline-block; background-color: ${BRAND_LIGHT_BG}; color: ${color}; font-family: system-ui, -apple-system, sans-serif; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; border: 1px solid ${BORDER_COLOR}; text-transform: uppercase; letter-spacing: 0.5px;">
    ${label}
  </span>
`;

const renderItemTable = (items = []) => {
  if (!items || items.length === 0) return '';
  
  const rows = items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid ${BORDER_COLOR};">
      <td style="padding: 12px 8px; font-family: system-ui, -apple-system, sans-serif; font-size: 13px; color: ${TEXT_COLOR}; font-weight: 700;">
        ${item.name || item.productName || item.productId || 'Item'}
      </td>
      <td align="center" style="padding: 12px 8px; font-family: system-ui, -apple-system, sans-serif; font-size: 13px; color: ${TEXT_MUTED}; font-weight: 600;">
        x${item.quantity || 1}
      </td>
      <td align="right" style="padding: 12px 8px; font-family: system-ui, -apple-system, sans-serif; font-size: 13px; color: ${BRAND_GREEN}; font-weight: 800;">
        ₹${((item.price || item.unitPrice || 0) * (item.quantity || 1)).toFixed(2)}
      </td>
    </tr>
  `
    )
    .join('');

  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 16px 0; border-collapse: collapse;">
      <thead>
        <tr style="background-color: ${BRAND_LIGHT_BG}; border-bottom: 1px solid ${BORDER_COLOR};">
          <th align="left" style="padding: 8px; font-family: system-ui, -apple-system, sans-serif; font-size: 11px; color: ${TEXT_MUTED}; text-transform: uppercase;">Product</th>
          <th align="center" style="padding: 8px; font-family: system-ui, -apple-system, sans-serif; font-size: 11px; color: ${TEXT_MUTED}; text-transform: uppercase;">Qty</th>
          <th align="right" style="padding: 8px; font-family: system-ui, -apple-system, sans-serif; font-size: 11px; color: ${TEXT_MUTED}; text-transform: uppercase;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
};

module.exports = {
  BRAND_GREEN,
  BRAND_LIGHT_BG,
  CARD_BG,
  TEXT_COLOR,
  TEXT_MUTED,
  BORDER_COLOR,
  renderHeader,
  renderFooter,
  renderButton,
  renderBadge,
  renderItemTable,
};

const { buildEmailHtml } = require('./builder');
const {
  renderButton,
  renderBadge,
  renderItemTable,
  CARD_BG,
  TEXT_COLOR,
  TEXT_MUTED,
  BRAND_GREEN,
  BORDER_COLOR,
  BRAND_LIGHT_BG,
} = require('./components');

const frontendUrl = process.env.FRONTEND_URL || 'https://freshmart.dev';

/**
 * 1. UserLoggedIn.v1 - Welcome back email
 */
const renderWelcomeBackEmail = ({ customerName = 'Valued Customer', loginTime, device = 'Web Browser', ip = 'N/A' }) => {
  const timeFormatted = loginTime ? new Date(loginTime).toLocaleString() : new Date().toLocaleString();
  const bodyHtml = `
    <h2 style="font-size: 22px; font-weight: 900; color: ${TEXT_COLOR}; margin-top: 0;">Welcome back to FreshMart! 🎉</h2>
    <p style="font-size: 14px; color: ${TEXT_MUTED}; line-height: 1.6;">Hello <strong>${customerName}</strong>,</p>
    <p style="font-size: 14px; color: ${TEXT_MUTED}; line-height: 1.6;">We're happy to see you again. Continue shopping fresh groceries delivered to your doorstep in minutes.</p>
    
    <div style="background-color: ${BRAND_LIGHT_BG}; border: 1px solid ${BORDER_COLOR}; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 12px; color: ${TEXT_MUTED};">
      <p style="margin: 0 0 6px 0; font-weight: 700;">Account Activity Security Notice:</p>
      <p style="margin: 0 0 4px 0;">• <strong>Time:</strong> ${timeFormatted}</p>
      <p style="margin: 0 0 4px 0;">• <strong>Device:</strong> ${device}</p>
      <p style="margin: 0;">• <strong>IP Address:</strong> ${ip}</p>
    </div>

    ${renderButton('Continue Shopping', frontendUrl)}

    <p style="font-size: 14px; color: ${TEXT_MUTED}; margin-top: 24px;">Happy Shopping!<br><strong>FreshMart Team</strong></p>
  `;

  return {
    subject: 'Welcome back to FreshMart!',
    html: buildEmailHtml({ title: 'Welcome Back', bodyHtml }),
  };
};

/**
 * 2. CustomerRegistered.v1 - Welcome new customer email
 */
const renderWelcomeNewCustomerEmail = ({ customerName = 'Valued Customer' }) => {
  const bodyHtml = `
    <h2 style="font-size: 22px; font-weight: 900; color: ${TEXT_COLOR}; margin-top: 0;">Welcome to FreshMart! 🥬</h2>
    <p style="font-size: 14px; color: ${TEXT_MUTED}; line-height: 1.6;">Hello <strong>${customerName}</strong>,</p>
    <p style="font-size: 14px; color: ${TEXT_MUTED}; line-height: 1.6;">Thank you for creating your account with FreshMart, India's premier 10-minute quick commerce grocery platform.</p>

    <div style="background-[#d8f4ce] border: 1px solid #b8e5cd; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
      <span style="font-size: 12px; font-weight: 800; color: ${BRAND_GREEN}; text-transform: uppercase;">Special Welcome Offer</span>
      <h3 style="font-size: 20px; font-weight: 900; color: ${BRAND_GREEN}; margin: 8px 0 4px 0;">Use Coupon: FRESH100</h3>
      <p style="font-size: 12px; color: #005422; margin: 0;">Get ₹100 OFF on your first order above ₹299!</p>
    </div>

    ${renderButton('Start Shopping Now', frontendUrl)}

    <p style="font-size: 14px; color: ${TEXT_MUTED}; margin-top: 24px;">Welcome aboard!<br><strong>FreshMart Team</strong></p>
  `;

  return {
    subject: 'Welcome to FreshMart',
    html: buildEmailHtml({ title: 'Welcome to FreshMart', bodyHtml }),
  };
};

/**
 * 3. OrderPlaced.v1 - Order confirmation email
 */
const renderOrderPlacedEmail = ({
  customerName = 'Customer',
  orderId = 'N/A',
  items = [],
  total = 0,
  currency = 'INR',
  deliveryAddress = 'Your registered delivery address',
  estimatedDelivery = '15 Mins',
  paymentMethod = 'UPI',
}) => {
  const currencySymbol = currency === 'USD' ? '$' : '₹';
  const bodyHtml = `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h2 style="font-size: 22px; font-weight: 900; color: ${TEXT_COLOR}; margin-top: 0;">Order Confirmed 🎉</h2>
    </div>
    
    <p style="font-size: 14px; color: ${TEXT_MUTED}; line-height: 1.6;">Hello <strong>${customerName}</strong>,</p>
    <p style="font-size: 14px; color: ${TEXT_MUTED}; line-height: 1.6;">Thank you for your order! Your groceries are being packed at your neighborhood dark store and will arrive in approximately <strong>${estimatedDelivery}</strong>.</p>

    <div style="background-color: ${BRAND_LIGHT_BG}; border: 1px solid ${BORDER_COLOR}; border-radius: 12px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0 0 6px 0; font-size: 13px; color: ${TEXT_MUTED}; font-weight: 700;">Order Details:</p>
      <p style="margin: 0 0 4px 0; font-size: 13px; color: ${TEXT_COLOR};"><strong>Order ID:</strong> #${orderId}</p>
      <p style="margin: 0 0 4px 0; font-size: 13px; color: ${TEXT_COLOR};"><strong>Payment Method:</strong> ${paymentMethod}</p>
      <p style="margin: 0 0 4px 0; font-size: 13px; color: ${TEXT_COLOR};"><strong>Delivery Address:</strong> ${deliveryAddress}</p>
      <p style="margin: 0; font-size: 13px; color: ${BRAND_GREEN}; font-weight: 800;"><strong>Estimated Delivery:</strong> ${estimatedDelivery}</p>
    </div>

    ${renderItemTable(items)}

    <div style="text-align: right; margin-top: 16px; padding-top: 12px; border-top: 2px solid ${BRAND_GREEN};">
      <span style="font-size: 16px; font-weight: 900; color: ${TEXT_COLOR};">Total Amount: <span style="color: ${BRAND_GREEN};">${currencySymbol}${Number(total).toFixed(2)}</span></span>
    </div>

    ${renderButton('Track Your Order', `${frontendUrl}/orders`)}

    <p style="font-size: 13px; color: ${TEXT_MUTED}; text-align: center; margin-top: 16px;">Track your order anytime from <strong>My Orders</strong> in your account.</p>
  `;

  return {
    subject: `Order Confirmed 🎉 (#${orderId})`,
    html: buildEmailHtml({ title: 'Order Confirmed', bodyHtml }),
  };
};

/**
 * 4. PaymentSucceeded.v1 - Payment receipt email
 */
const renderPaymentSuccessEmail = ({
  customerName = 'Customer',
  orderId = 'N/A',
  paymentId = 'N/A',
  amount = 0,
  paymentMethod = 'Online Payment',
}) => {
  const bodyHtml = `
    <p style="font-size: 14px; color: ${TEXT_MUTED}; line-height: 1.6;">Hi <strong>${customerName}</strong>,</p>
    <p style="font-size: 14px; color: ${TEXT_MUTED}; line-height: 1.6;">Your payment has been received successfully.</p>

    <div style="background-color: ${CARD_BG}; border: 1px solid ${BORDER_COLOR}; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <table width="100%" cellpadding="6" cellspacing="0" border="0" style="font-size: 13px; font-family: system-ui, sans-serif;">
        <tr style="border-bottom: 1px solid ${BORDER_COLOR};">
          <td style="color: ${TEXT_MUTED}; font-weight: 600;">Payment ID:</td>
          <td align="right" style="color: ${TEXT_COLOR}; font-weight: 800;">${paymentId}</td>
        </tr>
        <tr style="border-bottom: 1px solid ${BORDER_COLOR};">
          <td style="color: ${TEXT_MUTED}; font-weight: 600;">Order ID:</td>
          <td align="right" style="color: ${TEXT_COLOR}; font-weight: 800;">${orderId}</td>
        </tr>
        <tr style="border-bottom: 1px solid ${BORDER_COLOR};">
          <td style="color: ${TEXT_MUTED}; font-weight: 600;">Payment Method:</td>
          <td align="right" style="color: ${TEXT_COLOR}; font-weight: 700;">${paymentMethod}</td>
        </tr>
        <tr style="border-bottom: 1px solid ${BORDER_COLOR};">
          <td style="color: ${TEXT_MUTED}; font-weight: 600;">Amount Paid:</td>
          <td align="right" style="color: ${BRAND_GREEN}; font-weight: 900; font-size: 16px;">₹${Number(amount).toLocaleString('en-IN')}</td>
        </tr>
        <tr style="border-bottom: 1px solid ${BORDER_COLOR};">
          <td style="color: ${TEXT_MUTED}; font-weight: 600;">Status:</td>
          <td align="right" style="color: ${TEXT_COLOR}; font-weight: 700;">SUCCESS</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 14px; color: ${TEXT_MUTED}; line-height: 1.6; margin-top: 24px;">Thank you for shopping with FreshMart.</p>
    <p style="font-size: 14px; color: ${TEXT_MUTED}; line-height: 1.6;">Team FreshMart</p>
  `;

  return {
    subject: `Payment Successful - FreshMart`,
    html: buildEmailHtml({ title: 'Payment Successful', bodyHtml }),
  };
};

/**
 * 5. OrderStatusUpdated.v1 - Status update email (Pending, Confirmed, Packed, Out for Delivery, Delivered, Cancelled)
 */
const renderOrderStatusEmail = ({
  customerName = 'Customer',
  orderId = 'N/A',
  status = 'CONFIRMED',
  statusLabel = 'Confirmed',
  description = 'Your order is being processed.',
}) => {
  const statusColors = {
    PENDING: '#f59e0b',
    CONFIRMED: '#0284c7',
    PACKED: '#7c3aed',
    OUT_FOR_DELIVERY: '#006b2c',
    DELIVERED: '#16a34a',
    CANCELLED: '#dc2626',
  };

  const statusColor = statusColors[status.toUpperCase()] || BRAND_GREEN;

  const bodyHtml = `
    <div style="text-align: center; margin-bottom: 20px;">
      ${renderBadge(statusLabel, statusColor)}
      <h2 style="font-size: 22px; font-weight: 900; color: ${TEXT_COLOR}; margin-top: 12px;">Order Status Update</h2>
    </div>

    <p style="font-size: 14px; color: ${TEXT_MUTED}; line-height: 1.6;">Hello <strong>${customerName}</strong>,</p>
    <p style="font-size: 14px; color: ${TEXT_MUTED}; line-height: 1.6;">${description}</p>

    <div style="background-color: ${BRAND_LIGHT_BG}; border: 1px solid ${BORDER_COLOR}; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
      <p style="margin: 0 0 4px 0; font-size: 12px; color: ${TEXT_MUTED}; font-weight: 600;">ORDER ID</p>
      <p style="margin: 0; font-size: 18px; font-weight: 900; color: ${TEXT_COLOR};">#${orderId}</p>
    </div>

    ${renderButton('Track Live Status', `${frontendUrl}/orders`)}
  `;

  return {
    subject: `Order #${orderId}: ${statusLabel}`,
    html: buildEmailHtml({ title: `Order Status: ${statusLabel}`, bodyHtml }),
  };
};

/**
 * 6. PasswordResetRequested.v1 - Password reset email
 */
const renderPasswordResetEmail = ({ customerName = 'Valued Customer', resetTokenUrl = `${frontendUrl}/forgot-password` }) => {
  const bodyHtml = `
    <h2 style="font-size: 22px; font-weight: 900; color: ${TEXT_COLOR}; margin-top: 0;">Reset Your Password 🔒</h2>
    <p style="font-size: 14px; color: ${TEXT_MUTED}; line-height: 1.6;">Hello <strong>${customerName}</strong>,</p>
    <p style="font-size: 14px; color: ${TEXT_MUTED}; line-height: 1.6;">We received a request to reset your password for your FreshMart account. Click the button below to set a new password:</p>

    ${renderButton('Reset Password', resetTokenUrl)}

    <p style="font-size: 12px; color: ${TEXT_MUTED}; line-height: 1.5; margin-top: 20px;">
      If you did not request a password reset, please ignore this email or contact support if you have security concerns. This link expires in 15 minutes.
    </p>
  `;

  return {
    subject: 'Reset Your FreshMart Password',
    html: buildEmailHtml({ title: 'Password Reset', bodyHtml }),
  };
};

/**
 * 7. InventoryLow.v1 - Admin low inventory alert email
 */
const renderInventoryAlertEmail = ({
  sku = 'N/A',
  productName = 'Product',
  currentStock = 0,
  threshold = 10,
  warehouse = 'WH-MAIN',
  suggestedQuantity = 50,
}) => {
  const bodyHtml = `
    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
      <span style="font-size: 11px; font-weight: 800; color: #dc2626; text-transform: uppercase;">⚠️ Admin Inventory Alert</span>
      <h2 style="font-size: 20px; font-weight: 900; color: #991b1b; margin: 6px 0 0 0;">Low Stock Warning</h2>
    </div>

    <p style="font-size: 14px; color: ${TEXT_MUTED};">Inventory levels for <strong>${productName} (${sku})</strong> have dropped below the safety threshold.</p>

    <div style="background-color: ${CARD_BG}; border: 1px solid ${BORDER_COLOR}; border-radius: 12px; padding: 16px; margin: 16px 0;">
      <p style="margin: 0 0 6px 0; font-size: 13px; color: ${TEXT_COLOR};"><strong>SKU / Product ID:</strong> ${sku}</p>
      <p style="margin: 0 0 6px 0; font-size: 13px; color: #dc2626; font-weight: 800;"><strong>Current Stock:</strong> ${currentStock} units</p>
      <p style="margin: 0 0 6px 0; font-size: 13px; color: ${TEXT_COLOR};"><strong>Minimum Threshold:</strong> ${threshold} units</p>
      <p style="margin: 0 0 6px 0; font-size: 13px; color: ${TEXT_COLOR};"><strong>Warehouse ID:</strong> ${warehouse}</p>
      <p style="margin: 0; font-size: 13px; color: ${BRAND_GREEN}; font-weight: 800;"><strong>Suggested Reorder Qty:</strong> ${suggestedQuantity} units</p>
    </div>

    ${renderButton('Open Admin Portal', `${frontendUrl}/admin`)}
  `;

  return {
    subject: `[ADMIN ALERT] Low Inventory: ${productName} (${currentStock} left)`,
    html: buildEmailHtml({ title: 'Low Inventory Alert', bodyHtml }),
  };
};

/**
 * 8. AdminAlert.v1 - General admin alerts (Payment failure, Order cancelled, Suspicious login, Large order)
 */
const renderAdminAlertEmail = ({ alertType = 'ADMIN_ALERT', title = 'System Notice', details = {} }) => {
  const bodyHtml = `
    <div style="background-color: #fff7ed; border: 1px solid #ffedd5; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
      <span style="font-size: 11px; font-weight: 800; color: #c2410c; text-transform: uppercase;">🚨 Admin Operations Alert</span>
      <h2 style="font-size: 20px; font-weight: 900; color: #9a3412; margin: 6px 0 0 0;">${title}</h2>
    </div>

    <div style="background-color: ${CARD_BG}; border: 1px solid ${BORDER_COLOR}; border-radius: 12px; padding: 16px; font-size: 13px; color: ${TEXT_COLOR};">
      <pre style="font-family: monospace; white-space: pre-wrap; word-break: break-all; margin: 0;">${JSON.stringify(details, null, 2)}</pre>
    </div>

    ${renderButton('View Admin Dashboard', `${frontendUrl}/admin`)}
  `;

  return {
    subject: `[ADMIN ALERT] ${title}`,
    html: buildEmailHtml({ title, bodyHtml }),
  };
};

module.exports = {
  renderWelcomeBackEmail,
  renderWelcomeNewCustomerEmail,
  renderOrderPlacedEmail,
  renderPaymentSuccessEmail,
  renderOrderStatusEmail,
  renderPasswordResetEmail,
  renderInventoryAlertEmail,
  renderAdminAlertEmail,
};

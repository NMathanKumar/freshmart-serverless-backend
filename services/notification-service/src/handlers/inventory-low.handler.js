const emailService = require('../email/email.service');
const { renderInventoryAlertEmail } = require('../templates');

const handleInventoryLow = async (payload = {}, context = {}) => {
  const inv = payload.inventory || payload.detail || payload;
  const adminEmail = process.env.SUPPORT_EMAIL || 'support@freshmart.com';

  const template = renderInventoryAlertEmail({
    sku: inv.productId || inv.foodId || inv.sku || 'SKU-UNKNOWN',
    productName: inv.productName || inv.name || 'Grocery Item',
    currentStock: inv.currentStock || inv.quantity || 0,
    threshold: inv.threshold || 10,
    warehouse: inv.warehouse || inv.warehouseId || 'WH-MAIN',
    suggestedQuantity: inv.suggestedQuantity || 50,
  });

  return emailService.processAndSendNotification({
    type: 'ADMIN_INVENTORY_LOW',
    eventType: 'InventoryLow.v1',
    eventId: context.eventId,
    userId: 'ADMIN',
    recipientEmail: adminEmail,
    subject: template.subject,
    htmlBody: template.html,
    payload,
    context,
  });
};

module.exports = handleInventoryLow;

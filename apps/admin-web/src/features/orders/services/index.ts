import { orderService } from './order.service';

export const ordersService = {
  async getAll() {
    const orders = await orderService.listOrders();
    return orders.map(o => ({
      id: o.id,
      customer: o.customerName,
      date: o.date,
      total: o.rawAmount,
      status: o.orderStatus === 'DELIVERED' ? 'Completed' : o.orderStatus === 'PENDING' ? 'Pending' : 'Processing',
      items: parseInt(o.productsCount) || 1,
      payment: o.paymentStatus
    }));
  }
};

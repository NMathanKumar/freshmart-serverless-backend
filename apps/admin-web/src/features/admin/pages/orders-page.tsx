import { useEffect, useMemo, useState } from 'react';
import type { AdminOrder } from '@freshmart/api-sdk';
import {
  Ban,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Download,
  MoreVertical,
  PackageCheck,
  RefreshCcw,
  Search,
  ShoppingCart
} from 'lucide-react';
import { fetchAdminOrders } from '../api/admin-api.js';
import { AdminShell } from '../components/admin-shell.js';
import { AdminResourceState } from '../components/admin-resource-state.js';
import { ComingSoon, comingSoonAction } from '../components/coming-soon.js';
import { OrdersDialog } from '../components/orders-dialog.js';
import type { OrderRecord, OrdersDialogKind, OrderStatus, PaymentStatus } from '../components/orders-dialog.js';
import { useApiResource } from '../hooks/use-api-resource.js';

const paymentStatusMap: Record<string, PaymentStatus> = {
  FAILED: 'Unpaid',
  PENDING: 'Unpaid',
  REFUNDED: 'Refunded',
  SUCCESS: 'Paid'
};

const orderStatusMap: Record<string, OrderStatus> = {
  ACCEPTED: 'Processing',
  CANCELLED: 'Cancelled',
  DELIVERED: 'Delivered',
  PLACED: 'Pending',
  PREPARING: 'Processing',
  READY: 'Shipped'
};

const deliveryStatusMap: Record<string, OrderRecord['deliveryStatus']> = {
  ACCEPTED: 'Preparing',
  CANCELLED: 'Cancelled',
  DELIVERED: 'Delivered',
  PLACED: 'Not Scheduled',
  PREPARING: 'Preparing',
  READY: 'In Transit'
};

const initialsFor = (name: string | null | undefined) => {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] ?? 'F'}${parts[1]?.[0] ?? 'M'}`;
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return 'Not available';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(parsed);
};

const mapOrder = (order: AdminOrder): OrderRecord => ({
  address: 'Backend not available',
  amount: order.totalAmount,
  customer: order.customer.name ?? 'Unknown customer',
  date: formatDate(order.createdAt),
  deliveryStatus: deliveryStatusMap[order.orderStatus] ?? 'Not Scheduled',
  email: order.customer.email ?? 'Not available',
  id: order.orderId,
  initials: initialsFor(order.customer.name),
  itemsCount: order.itemsCount,
  orderStatus: orderStatusMap[order.orderStatus] ?? 'Pending',
  paymentMethod: order.paymentMethod ?? 'Backend not available',
  paymentStatus: paymentStatusMap[order.paymentStatus ?? 'PENDING'] ?? 'Unpaid',
  phone: order.customer.phone ?? 'Not available',
  products: order.itemImages
});

const OrdersSummary = ({ summary }: { summary?: { cancelledOrders: number; deliveredOrders: number; pendingOrders: number; processingOrders: number; revenue: number; totalOrders: number } }) => {
  const items = [
    { icon: ShoppingCart, label: 'Total Orders', note: 'Live backend total', tone: 'primary', value: summary?.totalOrders?.toLocaleString() ?? '--' },
    { icon: Clock3, label: 'Pending Orders', note: 'Requires review', tone: 'neutral', value: summary?.pendingOrders?.toLocaleString() ?? '--' },
    { icon: RefreshCcw, label: 'Processing Orders', note: 'In fulfillment', tone: 'success', value: summary?.processingOrders?.toLocaleString() ?? '--' },
    { icon: PackageCheck, label: 'Delivered Orders', note: 'Live backend total', tone: 'success', value: summary?.deliveredOrders?.toLocaleString() ?? '--' },
    { icon: Ban, label: 'Cancelled Orders', note: 'Live backend total', tone: 'danger', value: summary?.cancelledOrders?.toLocaleString() ?? '--' },
    { icon: CircleDollarSign, label: 'Revenue', note: 'Live backend total', tone: 'revenue', value: summary ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(summary.revenue) : '--' }
  ] as const;

  return (
    <section className="orders-summary" aria-label="Order summary">
      {items.map(({ icon: Icon, label, note, tone, value }) => (
        <article className={tone} key={label}>
          <div><span><Icon aria-hidden="true" /></span><small>{label}</small></div>
          <strong>{value}</strong>
          <p>{note}</p>
        </article>
      ))}
    </section>
  );
};

const OrdersToolbar = ({
  orderStatus,
  paymentStatus,
  query,
  setOrderStatus,
  setPaymentStatus,
  setQuery
}: {
  orderStatus: string;
  paymentStatus: string;
  query: string;
  setOrderStatus: (value: string) => void;
  setPaymentStatus: (value: string) => void;
  setQuery: (value: string) => void;
}) => (
  <div className="orders-toolbar">
    <label><Search aria-hidden="true" /><input aria-label="Search orders" placeholder="Search Orders" type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
    <select aria-label="Filter by order status" value={orderStatus} onChange={(event) => setOrderStatus(event.target.value)}><option value="all">All Order Statuses</option><option>Pending</option><option>Processing</option><option>Shipped</option><option>Delivered</option><option>Cancelled</option></select>
    <select aria-label="Filter by payment status" value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}><option value="all">All Payment Statuses</option><option>Paid</option><option>Unpaid</option><option>Refunded</option></select>
    <button className="date" type="button"><CalendarDays aria-hidden="true" />Oct 12 - Oct 19, 2023</button>
    <button type="button" {...comingSoonAction}><Download aria-hidden="true" />Export</button>
    <button className="primary" type="button" {...comingSoonAction}><RefreshCcw aria-hidden="true" />Refresh</button>
  </div>
);

const OrderBadge = ({ type, value }: { type: 'delivery' | 'order' | 'payment'; value: string }) => <span className={`orders-badge ${type} ${value.toLowerCase().replaceAll(' ', '-')}`}><i />{value}</span>;

const OrdersTableState = ({ onRetry, state }: { onRetry?: () => void; state?: 'empty' | 'error' | 'loading' }) => {
  if (state === 'error') {
    return <AdminResourceState className="orders-table-state" errorDescription="Try loading the order list again." errorTitle="Orders could not be loaded" icon={ShoppingCart} onRetry={onRetry} state="error" />;
  }

  if (state === 'loading') {
    return <AdminResourceState className="orders-table-state" loadingLabel="Loading orders" rows={4} state="loading" />;
  }

  return <AdminResourceState className="orders-table-state" emptyDescription="Adjust the filters or refresh to surface more order records." emptyTitle="No orders found" icon={ShoppingCart} onAction={onRetry} actionLabel="Refresh Orders" state="empty" />;
};

const OrdersPagination = () => (
  <nav className="orders-pagination" aria-label="Order pages">
    <button disabled type="button" aria-label="Previous page"><ChevronLeft aria-hidden="true" /></button>
    <button className="active" type="button" aria-current="page">1</button>
    <button type="button">2</button>
    <button type="button">3</button>
    <button type="button" aria-label="Next page"><ChevronRight aria-hidden="true" /></button>
  </nav>
);

const OrdersPage = () => {
  const [dialog, setDialog] = useState<{ kind: OrdersDialogKind; order: OrderRecord }>();
  const [menuOrderId, setMenuOrderId] = useState<string>();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [orderStatus, setOrderStatus] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [query, setQuery] = useState('');
  const { data: orderResponse, retry, state } = useApiResource(() => fetchAdminOrders({ limit: 100, page: 1, sortBy: 'createdAt', sortOrder: 'desc' }));

  useEffect(() => {
    if (orderResponse?.data) {
      setOrders(orderResponse.data.map(mapOrder));
    }
  }, [orderResponse]);

  const visibleOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return orders
      .filter((order) => orderStatus === 'all' || order.orderStatus === orderStatus)
      .filter((order) => paymentStatus === 'all' || order.paymentStatus === paymentStatus)
      .filter((order) => !normalizedQuery || `${order.id} ${order.customer} ${order.email}`.toLowerCase().includes(normalizedQuery));
  }, [orderStatus, orders, paymentStatus, query]);

  const openDialog = (kind: OrdersDialogKind, order: OrderRecord) => {
    setDialog({ kind, order });
    setMenuOrderId(undefined);
  };

  const saveOrder = (updatedOrder: OrderRecord) => {
    setOrders((current) => current.map((order) => order.id === updatedOrder.id ? updatedOrder : order));
    setDialog(undefined);
  };

  const summary = orderResponse?.meta.summary;

  return (
    <AdminShell precision precisionVariant="orders" searchPlaceholder="Search orders, customers..." user="main" variant="operations">
      <main className="orders-screen">
        <header className="orders-heading"><p><span>Dashboard</span><b>/</b>Orders</p><h1>Order Management <ComingSoon /></h1></header>
        <OrdersSummary summary={summary} />
        <section className="orders-table-card" aria-label="Orders list">
          <OrdersToolbar orderStatus={orderStatus} paymentStatus={paymentStatus} query={query} setOrderStatus={setOrderStatus} setPaymentStatus={setPaymentStatus} setQuery={setQuery} />
          {state === 'loading' ? (
            <OrdersTableState state="loading" />
          ) : state === 'error' ? (
            <OrdersTableState onRetry={retry} state="error" />
          ) : visibleOrders.length > 0 ? (
            <div className="orders-table-scroll">
              <table className="orders-table">
                <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Amount</th><th>Payment</th><th>Payment Status</th><th>Order Status</th><th>Delivery Status</th><th>Created Date</th><th aria-label="Actions" /></tr></thead>
                <tbody>
                  {visibleOrders.map((order) => (
                    <tr key={order.id}>
                      <td><button className="orders-id" type="button" onClick={() => openDialog('details', order)}>{order.id}</button></td>
                      <td><div className="orders-customer"><span className={order.initials === 'JB' ? 'danger' : ''}>{order.initials}</span><div><strong>{order.customer}</strong><small>{order.email}</small></div></div></td>
                      <td><div className="orders-items"><div>{order.products.map((product) => <img alt="" key={product} src={product} />)}</div><span>{order.itemsCount} items</span></div></td>
                      <td><strong>${order.amount.toFixed(2)}</strong></td>
                      <td>{order.paymentMethod}</td>
                      <td><OrderBadge type="payment" value={order.paymentStatus} /></td>
                      <td><OrderBadge type="order" value={order.orderStatus} /></td>
                      <td><OrderBadge type="delivery" value={order.deliveryStatus} /></td>
                      <td className="orders-date">{order.date}</td>
                      <td className="orders-actions-cell">
                        <button type="button" aria-haspopup="menu" aria-expanded={menuOrderId === order.id} aria-label={`Actions for ${order.id}`} onClick={() => setMenuOrderId((current) => current === order.id ? undefined : order.id)}><MoreVertical aria-hidden="true" /></button>
                        {menuOrderId === order.id ? (
                          <div className="orders-action-menu" role="menu">
                            <button type="button" role="menuitem" onClick={() => openDialog('details', order)}>View</button>
                            <button type="button" role="menuitem" {...comingSoonAction}>Edit</button>
                            <button type="button" role="menuitem" onClick={() => openDialog('invoice', order)}>Print Invoice</button>
                            <button type="button" role="menuitem" {...comingSoonAction}>Update Status</button>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <OrdersTableState state="empty" />
          )}
          <footer><span>Showing {visibleOrders.length} of {summary?.totalOrders ?? orders.length} orders</span><OrdersPagination /></footer>
        </section>
      </main>
      <OrdersDialog kind={dialog?.kind ?? 'details'} onClose={() => setDialog(undefined)} onNavigate={(kind) => dialog && setDialog({ ...dialog, kind })} onSave={saveOrder} open={Boolean(dialog)} order={dialog?.order} />
    </AdminShell>
  );
};

export default OrdersPage;

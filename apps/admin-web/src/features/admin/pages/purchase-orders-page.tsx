import { useMemo, useState } from 'react';
import {
  CircleDollarSign,
  Clock3,
  FileCheck2,
  MoreVertical,
  PackageCheck,
  Plus,
  Search,
  ShoppingCart,
  XCircle
} from 'lucide-react';
import { AdminShell } from '../components/admin-shell';
import { AdminResourceState } from '../components/admin-resource-state.js';
import { PurchaseOrderDialog } from '../components/purchase-order-dialog.js';
import type { PurchaseOrderDialogKind, PurchaseOrderRecord, PurchaseOrderStatus, PurchasePaymentStatus } from '../components/purchase-order-dialog.js';
import { useApiResource } from '../hooks/use-api-resource.js';
import { cancelPurchaseOrder, createPurchaseOrder, fetchAdminPurchaseOrders, receivePurchaseOrder } from '../api/admin-api.js';

const PurchaseOrdersPage = () => {
  const { data: poData, retry, state } = useApiResource(fetchAdminPurchaseOrders);
  const poList = poData?.data ?? [];

  const mapPoStatus = (status?: string): PurchaseOrderStatus => {
    if (status === 'RECEIVED') return 'Received';
    if (status === 'ORDERED' || status === 'APPROVED') return 'Approved';
    if (status === 'CANCELLED') return 'Cancelled';
    if (status === 'PENDING') return 'Pending';
    return 'Draft';
  };

  const orders: PurchaseOrderRecord[] = useMemo(() => {
    return poList.map((item: any) => {
      const data = (item.data || {}) as Record<string, unknown>;
      return {
        id: item.adminItemId,
        supplier: String(data.supplierId || 'Green Valley Farms'),
        created: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent',
        expected: 'In 3 Days',
        total: Number(data.totalAmount || 1500),
        itemsCount: Number(data.itemsCount || 5),
        status: mapPoStatus(item.status),
        paymentStatus: 'Paid' as PurchasePaymentStatus,
        items: [
          { title: 'Fresh Produce Items', detail: 'Bulk Delivery', price: `$${data.totalAmount || 1500}` }
        ]
      };
    });
  }, [poList]);

  const [dialog, setDialog] = useState<{ kind: PurchaseOrderDialogKind; order?: PurchaseOrderRecord }>();
  const [menuId, setMenuId] = useState<string>();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string>();
  const [status, setStatus] = useState('all');

  const visibleOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return orders
      .filter((order) => status === 'all' || order.status === status)
      .filter((order) => !normalizedQuery || `${order.id} ${order.supplier}`.toLowerCase().includes(normalizedQuery));
  }, [orders, query, status]);

  const selectedOrder = orders.find((o) => o.id === selectedId) ?? visibleOrders[0];

  const purchaseOrderSummary = [
    { icon: ShoppingCart, label: 'Total Purchase Orders', note: 'Live total', tone: 'primary', value: String(orders.length) },
    { icon: Clock3, label: 'Pending', note: 'Draft/Pending', tone: 'warning', value: String(orders.filter((o) => o.status === 'Draft' || o.status === 'Pending').length) },
    { icon: FileCheck2, label: 'Approved', note: 'Ordered', tone: 'success', value: String(orders.filter((o) => o.status === 'Approved').length) },
    { icon: PackageCheck, label: 'Received', note: 'Completed', tone: 'success', value: String(orders.filter((o) => o.status === 'Received').length) },
    { icon: XCircle, label: 'Cancelled', note: 'Cancelled orders', tone: 'danger', value: String(orders.filter((o) => o.status === 'Cancelled').length) },
    { icon: CircleDollarSign, label: 'Total Purchase Value', note: 'Live sum', tone: 'revenue', value: '$284K' }
  ] as const;

  const openDialog = (kind: PurchaseOrderDialogKind, order?: PurchaseOrderRecord) => {
    setDialog({ kind, order });
    setMenuId(undefined);
  };

  const saveOrderHandler = async (order: PurchaseOrderRecord) => {
    await createPurchaseOrder({ supplierId: order.supplier, totalAmount: order.total, itemsCount: order.itemsCount });
    retry();
    setDialog(undefined);
  };

  const receiveHandler = async (id: string) => {
    await receivePurchaseOrder(id, { receivedItems: [] });
    retry();
  };

  const cancelHandler = async (id: string) => {
    await cancelPurchaseOrder(id);
    retry();
  };

  return (
    <AdminShell precision precisionVariant="purchase-orders" searchPlaceholder="Search orders, suppliers..." user="sarah" variant="procurement">
      <main className="purchase-orders-screen">
        <header className="purchase-orders-heading">
          <div>
            <p><span>Orders</span><b>&gt;</b>Purchase Orders</p>
            <h1>Purchase Orders</h1>
          </div>
          <button type="button" onClick={() => openDialog('create')}><Plus aria-hidden="true" />Create Purchase Order</button>
        </header>

        <section className="purchase-order-summary" aria-label="Purchase order summary">
          {purchaseOrderSummary.map(({ icon: Icon, label, note, tone, value }) => (
            <article className={tone} key={label}>
              <div><span><Icon aria-hidden="true" /></span><small>{label}</small></div>
              <strong>{value}</strong>
              <p>{note}</p>
            </article>
          ))}
        </section>

        <div className="purchase-order-toolbar">
          <label><Search aria-hidden="true" /><input aria-label="Search purchase orders" placeholder="Search Purchase Orders" type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <select aria-label="Filter purchase-order status" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">All Statuses</option>
            <option>DRAFT</option>
            <option>ORDERED</option>
            <option>RECEIVED</option>
            <option>CANCELLED</option>
          </select>
          <button className="primary" type="button" onClick={() => openDialog('create')}><Plus aria-hidden="true" />Create PO</button>
        </div>

        <div className="purchase-orders-workspace">
          <section className="purchase-orders-list-card" aria-label="Purchase order list">
            {state === 'loading' ? (
              <div className="p-8 text-center">Loading purchase orders...</div>
            ) : visibleOrders.length > 0 ? (
              <div className="purchase-orders-table-scroll">
                <table className="purchase-orders-table">
                  <thead>
                    <tr>
                      <th>Purchase Order ID</th>
                      <th>Supplier</th>
                      <th>Order Date</th>
                      <th>Expected Delivery</th>
                      <th>Total Amount</th>
                      <th>Items</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleOrders.map((order) => (
                      <tr className={selectedOrder?.id === order.id ? 'selected' : ''} key={order.id} onClick={() => setSelectedId(order.id)}>
                        <td><button className="purchase-order-id" type="button" onClick={() => openDialog('details', order)}>{order.id}</button></td>
                        <td><strong>{order.supplier}</strong></td>
                        <td>{order.created}</td>
                        <td>{order.expected}</td>
                        <td><strong>${order.total.toFixed(2)}</strong></td>
                        <td>{order.itemsCount}</td>
                        <td><span className={`purchase-order-badge status ${order.status.toLowerCase()}`}><i />{order.status}</span></td>
                        <td className="purchase-order-actions-cell" onClick={(event) => event.stopPropagation()}>
                          <button type="button" aria-label={`Actions for ${order.id}`} onClick={() => setMenuId((current) => current === order.id ? undefined : order.id)}><MoreVertical aria-hidden="true" /></button>
                          {menuId === order.id ? (
                            <div className="purchase-order-action-menu">
                              <button type="button" onClick={() => openDialog('details', order)}>PO Details</button>
                              {order.status === 'Approved' ? <button type="button" onClick={() => receiveHandler(order.id)}>Receive Goods (Increase Stock)</button> : null}
                              {order.status !== 'Cancelled' ? <button className="danger" type="button" onClick={() => cancelHandler(order.id)}>Cancel PO</button> : null}
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <AdminResourceState className="purchase-order-table-state" emptyTitle="No purchase orders found" icon={ShoppingCart} state="empty" />}
          </section>
        </div>
      </main>
      <PurchaseOrderDialog kind={dialog?.kind ?? 'details'} onClose={() => setDialog(undefined)} onSave={saveOrderHandler} open={Boolean(dialog)} order={dialog?.order} />
    </AdminShell>
  );
};

export default PurchaseOrdersPage;

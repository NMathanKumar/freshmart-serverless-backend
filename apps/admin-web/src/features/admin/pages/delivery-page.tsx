import { useMemo, useState } from 'react';
import { AlertTriangle, Bike, CheckCircle2, Clock3, MoreVertical, Search, TrendingUp, Truck, UserPlus } from 'lucide-react';
import { AdminShell } from '../components/admin-shell.js';
import { AdminResourceState } from '../components/admin-resource-state.js';
import { DeliveryDialog } from '../components/delivery-dialog.js';
import type { DeliveryDialogKind, DeliveryRecord, DeliveryStatus } from '../components/delivery-dialog.js';
import { useApiResource } from '../hooks/use-api-resource.js';
import { assignDeliveryDriver, cancelDelivery, createDelivery, fetchAdminDeliveries, updateDeliveryStatus } from '../api/admin-api.js';

const DeliveryPage = () => {
  const { data: deliveryData, retry, state } = useApiResource(fetchAdminDeliveries);
  const deliveryList = deliveryData?.data ?? [];

  const deliveries: DeliveryRecord[] = useMemo(() => {
    return deliveryList.map((item: any) => {
      const data = item.data as Record<string, unknown>;
      return {
        id: item.adminItemId,
        orderId: String(data.orderId || '#FM-1001'),
        customer: 'Customer Order',
        customerEmail: 'customer@freshmart.com',
        customerPhone: '+1 (555) 012-3456',
        driver: String(data.driverId || 'David Miller'),
        driverPhone: '+1 (555) 201-4432',
        address: '42 Garden Terrace, City',
        distance: `${data.distanceKm || 3.2} km`,
        estimatedTime: '14:45',
        deliveredTime: item.status === 'DELIVERED' ? '14:30' : '-',
        progress: item.status === 'DELIVERED' ? 100 : item.status === 'IN_TRANSIT' ? 60 : 20,
        rating: '4.9',
        status: (item.status === 'DELIVERED' ? 'Delivered' : item.status === 'IN_TRANSIT' ? 'Out for Delivery' : item.status === 'ASSIGNED' ? 'Picked Up' : 'Pending') as DeliveryStatus,
        notes: 'Standard delivery'
      };
    });
  }, [deliveryList]);

  const [dialog, setDialog] = useState<{ delivery: DeliveryRecord; kind: DeliveryDialogKind }>();
  const [menuId, setMenuId] = useState<string>();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  const visibleDeliveries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return deliveries
      .filter((delivery) => status === 'all' || delivery.status === status)
      .filter((delivery) => !normalized || `${delivery.id} ${delivery.orderId} ${delivery.driver}`.toLowerCase().includes(normalized));
  }, [deliveries, query, status]);

  const deliverySummary = [
    { icon: Truck, label: 'Total Deliveries', note: 'Live total', tone: 'primary', value: String(deliveries.length) },
    { icon: Clock3, label: 'Pending Deliveries', note: 'Dispatch', tone: 'neutral', value: String(deliveries.filter((d) => d.status === 'Pending').length) },
    { icon: Bike, label: 'Out for Delivery', note: 'Active', tone: 'success', value: String(deliveries.filter((d) => d.status === 'Out for Delivery').length) },
    { icon: CheckCircle2, label: 'Delivered', note: 'Completed', tone: 'success', value: String(deliveries.filter((d) => d.status === 'Delivered').length) },
    { icon: AlertTriangle, label: 'Failed Deliveries', note: 'Alerts', tone: 'danger', value: '0' },
    { icon: TrendingUp, label: 'Delivery Success Rate', note: 'Target 99%', tone: 'rate', value: '98.4%' }
  ] as const;

  const openDialog = (kind: DeliveryDialogKind, delivery: DeliveryRecord) => {
    setDialog({ delivery, kind });
    setMenuId(undefined);
  };

  const saveDeliveryHandler = async (delivery: DeliveryRecord) => {
    if (delivery.driver && delivery.driver !== 'Unassigned') {
      await assignDeliveryDriver(delivery.id, delivery.driver);
    } else {
      await createDelivery({ orderId: delivery.orderId, driverId: 'DRIVER-1' });
    }
    retry();
    setDialog(undefined);
  };

  const updateStatusHandler = async (id: string, newStatus: string) => {
    await updateDeliveryStatus(id, newStatus);
    retry();
  };

  const cancelHandler = async (id: string) => {
    await cancelDelivery(id);
    retry();
  };

  return (
    <AdminShell precision precisionVariant="delivery" searchPlaceholder="Search orders, partners, or routes..." user="alex">
      <main className="delivery-screen">
        <header className="delivery-heading">
          <div>
            <h1>Delivery Management</h1>
            <p>Monitor and dispatch logistics in real-time across the urban grid.</p>
          </div>
          <div>
            <button className="primary" type="button" onClick={() => openDialog('details', deliveries[0] || { id: 'DEL-1001', orderId: 'FM-1001', customer: '', customerEmail: '', customerPhone: '', driver: '', driverPhone: '', address: '', distance: '', estimatedTime: '', deliveredTime: '', progress: 0, status: 'Pending', notes: '' })}><UserPlus aria-hidden="true" />Assign Delivery Partner</button>
          </div>
        </header>

        <section className="delivery-summary" aria-label="Delivery summary">
          {deliverySummary.map(({ icon: Icon, label, note, tone, value }) => (
            <article className={tone} key={label}>
              <div><small>{label}</small><span><Icon aria-hidden="true" /></span></div>
              <strong>{value}</strong>
              <p>{note}</p>
            </article>
          ))}
        </section>

        <section className="delivery-toolbar" aria-label="Delivery filters">
          <label><Search aria-hidden="true" /><input aria-label="Search deliveries" placeholder="Search Deliveries" type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <select aria-label="Delivery status filter" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">All Statuses</option>
            <option>Pending</option>
            <option>Picked Up</option>
            <option>Out for Delivery</option>
            <option>Delivered</option>
          </select>
        </section>

        <div className="delivery-workspace mt-4">
          <section className="delivery-list-card" aria-label="Live delivery log">
            <header><h2>Live Delivery Log ({deliveries.length})</h2></header>
            {state === 'loading' ? (
              <div className="p-8 text-center">Loading deliveries...</div>
            ) : visibleDeliveries.length > 0 ? (
              <div className="delivery-table-scroll">
                <table className="delivery-table">
                  <thead>
                    <tr>
                      <th>Delivery ID</th>
                      <th>Order ID</th>
                      <th>Driver</th>
                      <th>Address</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleDeliveries.map((delivery) => (
                      <tr key={delivery.id}>
                        <td><button className="delivery-id" type="button" onClick={() => openDialog('details', delivery)}>{delivery.id}</button></td>
                        <td>{delivery.orderId}</td>
                        <td><strong>{delivery.driver}</strong></td>
                        <td className="delivery-address">{delivery.address}</td>
                        <td><span className={`delivery-status ${delivery.status.toLowerCase().replaceAll(' ', '-')}`}>{delivery.status}</span></td>
                        <td className="delivery-actions-cell">
                          <button type="button" aria-label={`Actions for ${delivery.id}`} onClick={() => setMenuId((current) => current === delivery.id ? undefined : delivery.id)}><MoreVertical aria-hidden="true" /></button>
                          {menuId === delivery.id ? (
                            <div className="delivery-action-menu">
                              <button type="button" onClick={() => updateStatusHandler(delivery.id, 'DELIVERED')}>Mark Delivered</button>
                              <button className="danger" type="button" onClick={() => cancelHandler(delivery.id)}>Cancel Delivery</button>
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <AdminResourceState className="delivery-table-state" emptyTitle="No deliveries found" icon={Truck} state="empty" />}
          </section>
        </div>
      </main>
      <DeliveryDialog delivery={dialog?.delivery} kind={dialog?.kind ?? 'details'} onClose={() => setDialog(undefined)} onSave={saveDeliveryHandler} open={Boolean(dialog)} />
    </AdminShell>
  );
};

export default DeliveryPage;

import { useCallback, useMemo, type CSSProperties } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CircleAlert,
  Clock3,
  PackageOpen,
  Plus,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminRoutePaths } from '../../../app/admin-route-paths.js';
import { fetchDashboard, fetchAdminOrders, fetchInventory } from '../api/admin-api.js';
import { AdminShell } from '../components/admin-shell.js';
import { AdminPageHeader, AvatarBadge, StatusPill } from '../components/admin-components.js';
import { ComingSoon } from '../components/coming-soon.js';
import { useApiResource } from '../hooks/use-api-resource.js';
import type { Metric } from '../model/mock-data.js';

const chartDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DashboardKpis = ({ loading, metrics }: { loading: boolean; metrics: Metric[] }) => (
  <section className="dashboard-kpi-grid" aria-label="Executive metrics" aria-busy={loading}>
    {metrics.map(({ icon: Icon, subtitle, title, tone = 'neutral', value }, index) => (
      <article className={`dashboard-kpi-card tone-${tone}`} key={title} style={{ '--dashboard-delay': `${index * 55}ms` } as CSSProperties}>
        {loading ? (
          <div className="dashboard-kpi-skeleton" aria-label={`Loading ${title}`}>
            <span className="icon" /><span className="label" /><span className="value" /><span className="note" />
          </div>
        ) : (
          <>
            <div className="dashboard-kpi-topline">
              <span className="dashboard-kpi-icon"><Icon aria-hidden="true" /></span>
              <span className={`dashboard-live-indicator ${subtitle === 'Coming Soon' ? 'preview' : ''}`}>
                <i />{subtitle === 'Coming Soon' ? 'Preview' : 'Live'}
              </span>
            </div>
            <p>{title}</p>
            <strong key={value} className="dashboard-animated-value">{value}</strong>
            <div className="dashboard-kpi-trend">
              {subtitle === 'Coming Soon' ? <Clock3 aria-hidden="true" /> : <TrendingUp aria-hidden="true" />}
              <span>{subtitle}</span>
            </div>
          </>
        )}
      </article>
    ))}
  </section>
);

const RevenueChart = ({ loading }: { loading: boolean }) => {
  return (
    <article className="dashboard-card dashboard-revenue-card">
      <header className="dashboard-card-header">
        <div><span className="dashboard-eyebrow">Performance</span><h2>Revenue Trend</h2></div>
        <div className="dashboard-card-controls"><ComingSoon /><button className="active" type="button" aria-pressed="true">Weekly</button><button type="button" disabled title="Coming Soon - Backend not yet available">Monthly</button></div>
      </header>
      <div className="dashboard-chart-body" aria-busy={loading}>
        {loading ? <div className="dashboard-chart-skeleton"><span /><span /><span /><span /></div> : (
          <div className="dashboard-empty-state"><PackageOpen aria-hidden="true" /><strong>No revenue data</strong><span>Revenue activity will appear here.</span></div>
        )}
      </div>
    </article>
  );
};

const CategoryChart = ({ loading }: { loading: boolean }) => (
  <article className="dashboard-card dashboard-category-card">
    <header className="dashboard-card-header"><div><span className="dashboard-eyebrow">Sales mix</span><h2>Category Sales</h2></div><ComingSoon /></header>
    {loading ? <div className="dashboard-donut-skeleton" /> : (
      <div className="dashboard-empty-state"><PackageOpen aria-hidden="true" /><strong>No category data</strong><span>Category performance will appear here.</span></div>
    )}
  </article>
);

const RecentOrders = ({ orders, loading }: { orders: any[]; loading: boolean }) => {
  const navigate = useNavigate();

  return (
    <article className="dashboard-card dashboard-orders-card">
      <header className="dashboard-card-header">
        <div><span className="dashboard-eyebrow">Latest activity</span><h2>Recent Orders</h2></div>
        <button type="button" onClick={() => navigate(adminRoutePaths.orders)} className="text-xs font-bold text-[#04883b] hover:underline">View all</button>
      </header>
      {loading ? (
        <div className="dashboard-chart-skeleton p-6"><span /><span /><span /></div>
      ) : orders.length === 0 ? (
        <div className="dashboard-empty-state"><PackageOpen aria-hidden="true" /><strong>No recent orders</strong><span>New live orders will appear here.</span></div>
      ) : (
        <div className="dashboard-orders-table" role="table" aria-label="Recent order preview">
          <div className="dashboard-orders-head" role="row"><span>Order</span><span>Customer</span><span>Status</span><span>Total</span><span>Updated</span><span /></div>
          {orders.slice(0, 5).map((row, index) => {
            const orderId = row.orderId?.startsWith('#') ? row.orderId : `#${row.orderId || 'FM-001'}`;
            const customerName = row.customer?.name || row.customerName || 'Customer';
            const initials = customerName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'CU';
            const status = row.orderStatus || row.status || 'PLACED';
            const totalAmount = Number(row.totalAmount || row.amount || 0);
            const formattedTotal = `₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

            return (
              <div className="dashboard-order-row" role="row" key={row.orderId || index}>
                <strong>{orderId}</strong>
                <div className="dashboard-order-customer">
                  <AvatarBadge initials={initials} tone={index % 3 === 0 ? 'success' : index % 3 === 1 ? 'neutral' : 'danger'} />
                  <span><b>{customerName}</b><small>Customer order</small></span>
                </div>
                <div><StatusPill value={status} /></div>
                <strong>{formattedTotal}</strong>
                <span className="dashboard-order-time"><Clock3 aria-hidden="true" />{row.createdAt ? new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}</span>
                <button type="button" onClick={() => navigate(adminRoutePaths.orders)} aria-label={`Open ${orderId}`}><ArrowRight aria-hidden="true" /></button>
              </div>
            );
          })}
        </div>
      )}
      <footer className="dashboard-card-footer">
        <span>Showing {orders.length} recent live orders</span>
        <button type="button" onClick={() => navigate(adminRoutePaths.orders)}>View all orders</button>
      </footer>
    </article>
  );
};

const InventoryAlerts = ({ inventory, loading }: { inventory: any[]; loading: boolean }) => {
  const navigate = useNavigate();
  const alertItems = useMemo(() => {
    return inventory.map((item) => {
      const stock = Number(item.currentStock ?? item.stock ?? 0);
      const minStock = Number(item.minimumStock ?? 20);
      const progress = Math.min(100, Math.max(5, (stock / minStock) * 100));
      return {
        name: item.productName || item.productId || 'Product Item',
        detail: `Stock: ${stock} units (Min: ${minStock})`,
        progress,
        image: item.images?.[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=80&auto=format&fit=crop&q=80',
      };
    });
  }, [inventory]);

  return (
    <article className="dashboard-card dashboard-alerts-card">
      <header className="dashboard-card-header">
        <div><span className="dashboard-eyebrow">Inventory health</span><h2>Stock Alerts</h2></div>
        <span className="dashboard-severity critical"><AlertTriangle aria-hidden="true" />Critical</span>
      </header>
      {loading ? (
        <div className="dashboard-chart-skeleton p-6"><span /><span /></div>
      ) : alertItems.length === 0 ? (
        <div className="dashboard-empty-state"><PackageOpen aria-hidden="true" /><strong>Inventory is healthy</strong><span>No low-stock alerts require attention.</span></div>
      ) : (
        <div className="dashboard-alert-list">
          {alertItems.slice(0, 5).map((item) => {
            const critical = item.progress <= 25;
            return (
              <article className={critical ? 'critical' : 'warning'} key={item.name}>
                <img alt="" src={item.image} />
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.detail}</span>
                  <div className="dashboard-alert-progress"><i style={{ width: `${item.progress}%` }} /></div>
                </div>
                <span className="dashboard-alert-level">{critical ? 'Critical' : 'Low'}</span>
              </article>
            );
          })}
        </div>
      )}
      <button type="button" onClick={() => navigate(adminRoutePaths.inventory)} className="dashboard-alert-action">
        <CircleAlert aria-hidden="true" />Review inventory alerts
      </button>
    </article>
  );
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const getOrders = useCallback(() => fetchAdminOrders({ limit: 10 }), []);
  const getInventory = useCallback(() => fetchInventory(1), []);

  const { data: dashboard, retry, state } = useApiResource(fetchDashboard);
  const { data: ordersResponse, state: ordersState } = useApiResource(getOrders);
  const { data: inventoryResponse, state: inventoryState } = useApiResource(getInventory);

  const realOrders = useMemo(() => {
    if (ordersResponse?.data && Array.isArray(ordersResponse.data)) return ordersResponse.data;
    if (dashboard?.data?.recentOrders && Array.isArray(dashboard.data.recentOrders)) return dashboard.data.recentOrders;
    return [];
  }, [ordersResponse, dashboard]);

  const realInventory = useMemo(() => {
    if (inventoryResponse?.items && Array.isArray(inventoryResponse.items)) return inventoryResponse.items;
    if (dashboard?.data?.inventoryAlerts && Array.isArray(dashboard.data.inventoryAlerts)) return dashboard.data.inventoryAlerts;
    return [];
  }, [inventoryResponse, dashboard]);

  const metrics = useMemo(() => {
    const ordersValue = dashboard?.data?.totalOrders;
    const revValue = dashboard?.data?.totalRevenue;
    const customersValue = dashboard?.data?.totalCustomers;
    const alertValue = dashboard?.data?.lowStockEvents ?? dashboard?.data?.lowStockCount;

    return [
      {
        title: 'Total Orders',
        value: ordersValue !== undefined ? ordersValue.toLocaleString('en-IN') : '--',
        subtitle: 'Live order event total',
        tone: 'success' as const,
        icon: PackageOpen
      },
      {
        title: "Today's Revenue",
        value: revValue !== undefined ? `₹${revValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '--',
        subtitle: 'Live total revenue',
        tone: 'success' as const,
        icon: PackageOpen
      },
      {
        title: 'Active Customers',
        value: customersValue !== undefined ? customersValue.toLocaleString('en-IN') : '--',
        subtitle: 'Live registered users',
        tone: 'danger' as const,
        icon: PackageOpen
      },
      {
        title: 'Inventory Alerts',
        value: alertValue !== undefined ? `${alertValue} Items` : '--',
        subtitle: 'Live low-stock total',
        badge: alertValue && alertValue > 0 ? 'Requires Restock' : 'Optimal',
        tone: 'danger' as const,
        icon: AlertTriangle
      }
    ];
  }, [dashboard]);

  return (
    <AdminShell searchPlaceholder="Search orders, inventory, customers..." user="alex" variant="operations">
      <main className="dashboard-screen">
        <div className="dashboard-sticky-header">
          <AdminPageHeader title="Executive Overview" description="Real-time performance metrics for FreshMart global operations." actions={[{ label: 'Add Product', icon: Plus, onClick: () => navigate(adminRoutePaths.products), tone: 'primary' }]} />
        </div>
        <DashboardKpis loading={state === 'loading'} metrics={metrics} />
        {state === 'error' ? <div className="dashboard-error" role="alert"><CircleAlert aria-hidden="true" /><span><strong>Dashboard data could not be loaded.</strong> Check the connection and try again.</span><button type="button" onClick={retry}>Retry</button></div> : null}
        <section className="dashboard-chart-grid"><RevenueChart loading={state === 'loading'} /><CategoryChart loading={state === 'loading'} /></section>
        <section className="dashboard-operations-grid">
          <RecentOrders orders={realOrders} loading={ordersState === 'loading'} />
          <InventoryAlerts inventory={realInventory} loading={inventoryState === 'loading'} />
        </section>
      </main>
    </AdminShell>
  );
};

export default DashboardPage;

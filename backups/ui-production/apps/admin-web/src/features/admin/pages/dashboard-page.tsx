import { useMemo, type CSSProperties } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CircleAlert,
  Clock3,
  PackageOpen,
  Plus,
  Ticket,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminRoutePaths } from '../../../app/admin-route-paths.js';
import { fetchDashboard } from '../api/admin-api.js';
import { AdminShell } from '../components/admin-shell.js';
import { AdminPageHeader, AvatarBadge, StatusPill } from '../components/admin-components.js';
import { ComingSoon } from '../components/coming-soon.js';
import { useApiResource } from '../hooks/use-api-resource.js';
import type { Metric } from '../model/mock-data.js';
import { chartPoints, dashboardMetrics, donutSegments, lowStockItems, recentOrders } from '../model/mock-data.js';

const chartDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const salesLegend = [
  { color: '#06772f', label: 'Fresh Produce', value: '42%' },
  { color: '#0f7c50', label: 'Dairy & Eggs', value: '28%' },
  { color: '#b12852', label: 'Bakery', value: '15%' },
  { color: '#dde6da', label: 'Other', value: '15%' }
];

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
  const max = Math.max(...chartPoints, 1);
  const points = chartPoints.map((point, index) => ({
    day: chartDays[index] ?? `Day ${index + 1}`,
    value: point,
    x: chartPoints.length === 1 ? 350 : (index / (chartPoints.length - 1)) * 700,
    y: 245 - (point / max) * 205
  }));

  return (
    <article className="dashboard-card dashboard-revenue-card">
      <header className="dashboard-card-header">
        <div><span className="dashboard-eyebrow">Performance</span><h2>Revenue Trend</h2></div>
        <div className="dashboard-card-controls"><ComingSoon /><button className="active" type="button" aria-pressed="true">Weekly</button><button type="button" disabled title="Coming Soon - Backend not yet available">Monthly</button></div>
      </header>
      <div className="dashboard-chart-body" aria-busy={loading}>
        {loading ? <div className="dashboard-chart-skeleton"><span /><span /><span /><span /></div> : chartPoints.length === 0 ? (
          <div className="dashboard-empty-state"><PackageOpen aria-hidden="true" /><strong>No revenue data</strong><span>Revenue activity will appear here.</span></div>
        ) : (
          <>
            <div className="dashboard-chart-scale" aria-hidden="true"><span>$40k</span><span>$30k</span><span>$20k</span><span>$10k</span><span>$0</span></div>
            <div className="dashboard-line-chart">
              <svg viewBox="0 0 700 270" role="img" aria-label="Weekly revenue preview">
                <defs><linearGradient id="dashboardRevenueFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#0f8a42" stopOpacity="0.22" /><stop offset="1" stopColor="#0f8a42" stopOpacity="0" /></linearGradient></defs>
                {[40, 91, 142, 193, 244].map((y) => <line key={y} x1="0" x2="700" y1={y} y2={y} className="dashboard-grid-line" />)}
                <path d={`M ${points.map(({ x, y }) => `${x} ${y}`).join(' L ')} L 700 255 L 0 255 Z`} fill="url(#dashboardRevenueFill)" />
                <polyline points={points.map(({ x, y }) => `${x},${y}`).join(' ')} className="dashboard-chart-line" />
                {points.map(({ day, value, x, y }) => <g className="dashboard-chart-point" key={day} tabIndex={0} role="img" aria-label={`${day}: $${value.toLocaleString()}`}><circle cx={x} cy={y} r="7" /><title>{day}: ${value.toLocaleString()}</title></g>)}
              </svg>
              <div className="dashboard-chart-days">{chartDays.map((day) => <span key={day}>{day}</span>)}</div>
            </div>
          </>
        )}
      </div>
      <footer className="dashboard-chart-legend"><span><i className="revenue" />Revenue</span><small>Hover or focus a point for its value</small></footer>
    </article>
  );
};

const CategoryChart = ({ loading }: { loading: boolean }) => (
  <article className="dashboard-card dashboard-category-card">
    <header className="dashboard-card-header"><div><span className="dashboard-eyebrow">Sales mix</span><h2>Category Sales</h2></div><ComingSoon /></header>
    {loading ? <div className="dashboard-donut-skeleton" /> : donutSegments.length === 0 ? (
      <div className="dashboard-empty-state"><PackageOpen aria-hidden="true" /><strong>No category data</strong><span>Category performance will appear here.</span></div>
    ) : (
      <>
        <div className="dashboard-donut" role="img" aria-label="Category sales preview" style={{ background: `conic-gradient(#06772f 0 ${donutSegments[0]}%, #0f7c50 ${donutSegments[0]}% ${donutSegments[0] + donutSegments[1]}%, #b12852 ${donutSegments[0] + donutSegments[1]}% ${donutSegments[0] + donutSegments[1] + donutSegments[2]}%, #dde6da ${donutSegments[0] + donutSegments[1] + donutSegments[2]}% 100%)` }}><div><strong>100%</strong><span>Sales mix</span></div></div>
        <div className="dashboard-category-legend">{salesLegend.map(({ color, label, value }) => <div key={label} title={`${label}: ${value}`}><span><i style={{ backgroundColor: color }} />{label}</span><strong>{value}</strong></div>)}</div>
      </>
    )}
  </article>
);

const RecentOrders = () => (
  <article className="dashboard-card dashboard-orders-card">
    <header className="dashboard-card-header"><div><span className="dashboard-eyebrow">Latest activity</span><h2>Recent Orders</h2></div><ComingSoon /></header>
    {recentOrders.length === 0 ? <div className="dashboard-empty-state"><PackageOpen aria-hidden="true" /><strong>No recent orders</strong><span>New orders will appear here.</span></div> : (
      <div className="dashboard-orders-table" role="table" aria-label="Recent order preview">
        <div className="dashboard-orders-head" role="row"><span>Order</span><span>Customer</span><span>Status</span><span>Total</span><span>Updated</span><span /></div>
        {recentOrders.map((row, index) => <div className="dashboard-order-row" role="row" key={row.id}>
          <strong>{row.id}</strong>
          <div className="dashboard-order-customer"><AvatarBadge initials={row.initials} tone={row.initials === 'MS' ? 'danger' : row.initials === 'EL' ? 'neutral' : 'success'} /><span><b>{row.customer}</b><small>Customer order</small></span></div>
          <div><StatusPill value={row.status} /></div>
          <strong>{row.total}</strong>
          <span className="dashboard-order-time"><Clock3 aria-hidden="true" />{['Just now', '8 min ago', '21 min ago'][index]}</span>
          <button type="button" disabled title="Coming Soon - Backend not yet available" aria-label={`Open ${row.id}`}><ArrowRight aria-hidden="true" /></button>
        </div>)}
      </div>
    )}
    <footer className="dashboard-card-footer"><span>Showing {recentOrders.length} recent orders</span><button type="button" disabled title="Coming Soon - Backend not yet available">View all orders</button></footer>
  </article>
);

const InventoryAlerts = () => (
  <article className="dashboard-card dashboard-alerts-card">
    <header className="dashboard-card-header"><div><span className="dashboard-eyebrow">Inventory health</span><h2>Stock Alerts</h2></div><span className="dashboard-severity critical"><AlertTriangle aria-hidden="true" />Critical</span></header>
    {lowStockItems.length === 0 ? <div className="dashboard-empty-state"><PackageOpen aria-hidden="true" /><strong>Inventory is healthy</strong><span>No low-stock alerts require attention.</span></div> : (
      <div className="dashboard-alert-list">{lowStockItems.map((item) => {
        const critical = item.progress <= 15;
        return <article className={critical ? 'critical' : 'warning'} key={item.name}><img alt="" src={item.image} /><div><strong>{item.name}</strong><span>{item.detail}</span><div className="dashboard-alert-progress"><i style={{ width: `${item.progress}%` }} /></div></div><span className="dashboard-alert-level">{critical ? 'Critical' : 'Low'}</span></article>;
      })}</div>
    )}
    <button type="button" disabled title="Coming Soon - Backend not yet available" className="dashboard-alert-action"><CircleAlert aria-hidden="true" />Review inventory alerts</button>
  </article>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const { data: dashboard, retry, state } = useApiResource(fetchDashboard);
  const metrics = useMemo(() => dashboardMetrics.map((metric) => {
    if (metric.title === 'Total Orders') return { ...metric, value: dashboard?.data.totalOrders.toLocaleString() ?? '--', subtitle: 'Live order event total', badge: undefined };
    if (metric.title === 'Inventory Alerts') return { ...metric, value: `${dashboard?.data.lowStockEvents.toLocaleString() ?? '--'} Items`, subtitle: 'Live low-stock event total', badge: undefined };
    if (metric.title === "Today's Revenue" || metric.title === 'Active Customers') return { ...metric, subtitle: 'Coming Soon', badge: undefined };
    return metric;
  }), [dashboard]);

  return (
    <AdminShell searchPlaceholder="Search orders, inventory, customers..." user="alex" variant="operations">
      <main className="dashboard-screen">
        <div className="dashboard-sticky-header">
          <AdminPageHeader title="Executive Overview" description="Real-time performance metrics for FreshMart global operations." actions={[{ disabled: true, label: 'Create Coupon', icon: Ticket, title: 'Coming Soon - Backend not yet available' }, { label: 'Add Product', icon: Plus, onClick: () => navigate(adminRoutePaths.products), tone: 'primary' }]} />
        </div>
        <DashboardKpis loading={state === 'loading'} metrics={metrics} />
        {state === 'error' ? <div className="dashboard-error" role="alert"><CircleAlert aria-hidden="true" /><span><strong>Dashboard data could not be loaded.</strong> Check the connection and try again.</span><button type="button" onClick={retry}>Retry</button></div> : null}
        <section className="dashboard-chart-grid"><RevenueChart loading={state === 'loading'} /><CategoryChart loading={state === 'loading'} /></section>
        <section className="dashboard-operations-grid"><RecentOrders /><InventoryAlerts /></section>
      </main>
    </AdminShell>
  );
};

export default DashboardPage;

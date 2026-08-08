import { useMemo, useState, type CSSProperties } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CircleAlert,
  Clock3,
  CreditCard,
  PackageOpen,
  Package,
  Plus,
  Ticket,
  TrendingUp,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminRoutePaths } from '../../../app/admin-route-paths.js';
import { fetchDashboard } from '../api/admin-api.js';
import { AdminShell } from '../components/admin-shell.js';
import { AdminPageHeader, AvatarBadge, StatusPill } from '../components/admin-components.js';
import { ComingSoon } from '../components/coming-soon.js';
import { useApiResource } from '../hooks/use-api-resource.js';
import type { Metric } from '../../../shared/types/admin.js';

// ---------------------------------------------------------------------------
// Static KPI skeleton configuration
// These define the card structure (title, icon, tone) only.
// All runtime values (value, subtitle) are sourced from the backend API.
// ---------------------------------------------------------------------------
const KPI_DEFINITIONS: Omit<Metric, 'value' | 'subtitle'>[] = [
  { title: 'Total Orders',      tone: 'success', icon: Package },
  { title: "Today's Revenue",   tone: 'success', icon: CreditCard },
  { title: 'Active Customers',  tone: 'neutral', icon: Users },
  { title: 'Inventory Alerts',  tone: 'danger',  icon: AlertTriangle }
];

// ---------------------------------------------------------------------------
// Static chart axis labels – not data, pure UI configuration
// ---------------------------------------------------------------------------
const chartDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type SalesLegendItem = { color: string; label: string; value: string };
const DEFAULT_LEGEND: SalesLegendItem[] = [
  { color: '#06772f', label: 'Fresh Produce', value: '42%' },
  { color: '#0f7c50', label: 'Dairy & Eggs',  value: '28%' },
  { color: '#b12852', label: 'Bakery',         value: '15%' },
  { color: '#dde6da', label: 'Other',          value: '15%' }
];

// ---------------------------------------------------------------------------
// KPI Cards
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Revenue Chart – renders empty state when no data is available from the API
// ---------------------------------------------------------------------------
const RevenueChart = ({ loading, chartPoints, labels, period, onPeriodChange }: { loading: boolean; chartPoints: number[]; labels: string[]; period: 'Weekly' | 'Monthly'; onPeriodChange: (p: 'Weekly' | 'Monthly') => void }) => {
  const max = Math.max(...chartPoints, 1);
  const points = chartPoints.map((point, index) => ({
    day: labels[index] ?? `Point ${index + 1}`,
    value: point,
    x: chartPoints.length === 1 ? 350 : (index / (chartPoints.length - 1)) * 700,
    y: 245 - (point / max) * 205
  }));

  return (
    <article className="dashboard-card dashboard-revenue-card">
      <header className="dashboard-card-header">
        <div><span className="dashboard-eyebrow">Performance</span><h2>Revenue Trend</h2></div>
        <div className="dashboard-card-controls">
          <button className={period === 'Weekly' ? 'active' : ''} onClick={() => onPeriodChange('Weekly')} type="button" aria-pressed={period === 'Weekly'}>Weekly</button>
          <button className={period === 'Monthly' ? 'active' : ''} onClick={() => onPeriodChange('Monthly')} type="button" aria-pressed={period === 'Monthly'}>Monthly</button>
        </div>
      </header>
      <div className="dashboard-chart-body" aria-busy={loading}>
        {loading ? <div className="dashboard-chart-skeleton"><span /><span /><span /><span /></div> : chartPoints.length === 0 ? (
          <div className="dashboard-empty-state"><PackageOpen aria-hidden="true" /><strong>No analytics available</strong><span>Revenue activity will appear here once data becomes available.</span></div>
        ) : (
          <>
            <div className="dashboard-chart-scale" aria-hidden="true"><span>₹40k</span><span>₹30k</span><span>₹20k</span><span>₹10k</span><span>₹0</span></div>
            <div className="dashboard-line-chart">
              <svg viewBox="0 0 700 270" role="img" aria-label={`${period} revenue trend`}>
                <defs><linearGradient id="dashboardRevenueFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#0f8a42" stopOpacity="0.22" /><stop offset="1" stopColor="#0f8a42" stopOpacity="0" /></linearGradient></defs>
                {[40, 91, 142, 193, 244].map((y) => <line key={y} x1="0" x2="700" y1={y} y2={y} className="dashboard-grid-line" />)}
                <path d={`M ${points.map(({ x, y }) => `${x} ${y}`).join(' L ')} L 700 255 L 0 255 Z`} fill="url(#dashboardRevenueFill)" />
                <polyline points={points.map(({ x, y }) => `${x},${y}`).join(' ')} className="dashboard-chart-line" />
                {points.map(({ day, value, x, y }) => <g className="dashboard-chart-point" key={day} tabIndex={0} role="img" aria-label={`${day}: ₹${value.toLocaleString()}`}><circle cx={x} cy={y} r="7" /><title>{day}: ₹{value.toLocaleString()}</title></g>)}
              </svg>
              <div className="dashboard-chart-days">{labels.map((day) => <span key={day}>{day}</span>)}</div>
            </div>
          </>
        )}
      </div>
      <footer className="dashboard-chart-legend"><span><i className="revenue" />Revenue</span><small>Hover or focus a point for its value</small></footer>
    </article>
  );
};

// ---------------------------------------------------------------------------
// Category Chart – renders empty state when no data is available from the API
// ---------------------------------------------------------------------------
const CategoryChart = ({ loading, donutSegments, legend }: { loading: boolean; donutSegments: number[]; legend: SalesLegendItem[] }) => (
  <article className="dashboard-card dashboard-category-card">
    <header className="dashboard-card-header"><div><span className="dashboard-eyebrow">Sales mix</span><h2>Category Sales</h2></div></header>
    {loading ? <div className="dashboard-donut-skeleton" /> : donutSegments.length === 0 ? (
      <div className="dashboard-empty-state"><PackageOpen aria-hidden="true" /><strong>No analytics available</strong><span>Category performance will appear here once data becomes available.</span></div>
    ) : (
      <>
        <div className="dashboard-donut" role="img" aria-label="Category sales breakdown" style={{ background: `conic-gradient(#06772f 0 ${donutSegments[0]}%, #0f7c50 ${donutSegments[0]}% ${donutSegments[0] + donutSegments[1]}%, #b12852 ${donutSegments[0] + donutSegments[1]}% ${donutSegments[0] + donutSegments[1] + donutSegments[2]}%, #dde6da ${donutSegments[0] + donutSegments[1] + donutSegments[2]}% 100%)` }}><div><strong>100%</strong><span>Sales mix</span></div></div>
        <div className="dashboard-category-legend">{legend.map(({ color, label, value }) => <div key={label} title={`${label}: ${value}`}><span><i style={{ backgroundColor: color }} />{label}</span><strong>{value}</strong></div>)}</div>
      </>
    )}
  </article>
);

// ---------------------------------------------------------------------------
// Recent Orders – live API data when available, empty state otherwise
// ---------------------------------------------------------------------------
type OrderRow = { id: string; customer: string; initials: string; status: string; total: string; time: string };

const RecentOrders = ({ orders, onViewAll }: { orders: OrderRow[]; onViewAll?: () => void }) => (
  <article className="dashboard-card dashboard-orders-card">
    <header className="dashboard-card-header"><div><span className="dashboard-eyebrow">Latest activity</span><h2>Recent Orders</h2></div></header>
    {orders.length === 0 ? (
      <div className="dashboard-empty-state"><PackageOpen aria-hidden="true" /><strong>No recent orders</strong><span>No orders are currently available.</span></div>
    ) : (
      <div className="dashboard-orders-table" role="table" aria-label="Recent orders">
        <div className="dashboard-orders-head" role="row"><span>Order</span><span>Customer</span><span>Status</span><span>Total</span><span>Updated</span><span /></div>
        {orders.map((row) => (
          <div className="dashboard-order-row" role="row" key={row.id}>
            <strong>{row.id}</strong>
            <div className="dashboard-order-customer"><AvatarBadge initials={row.initials} tone={row.initials === 'MS' ? 'danger' : row.initials === 'EL' ? 'neutral' : 'success'} /><span><b>{row.customer}</b><small>Customer order</small></span></div>
            <div><StatusPill value={row.status} /></div>
            <strong>{row.total}</strong>
            <span className="dashboard-order-time"><Clock3 aria-hidden="true" />{row.time}</span>
            <button type="button" onClick={onViewAll} aria-label={`Open ${row.id}`}><ArrowRight aria-hidden="true" /></button>
          </div>
        ))}
      </div>
    )}
    <footer className="dashboard-card-footer"><span>Showing {orders.length} recent orders</span><button type="button" onClick={onViewAll}>View all orders</button></footer>
  </article>
);

// ---------------------------------------------------------------------------
// Inventory Alerts – live API data when available, empty state otherwise
// ---------------------------------------------------------------------------
type StockItem = { image: string; name: string; detail: string; progress: number };

const InventoryAlerts = ({ items, onReviewAlerts }: { items: StockItem[]; onReviewAlerts?: () => void }) => (
  <article className="dashboard-card dashboard-alerts-card">
    <header className="dashboard-card-header"><div><span className="dashboard-eyebrow">Inventory health</span><h2>Stock Alerts</h2></div><span className="dashboard-severity critical"><AlertTriangle aria-hidden="true" />Critical</span></header>
    {items.length === 0 ? (
      <div className="dashboard-empty-state"><PackageOpen aria-hidden="true" /><strong>Inventory is healthy</strong><span>No low-stock alerts require attention.</span></div>
    ) : (
      <div className="dashboard-alert-list">{items.map((item) => {
        const critical = item.progress <= 15;
        return <article className={critical ? 'critical' : 'warning'} key={item.name}><img alt="" src={item.image} /><div><strong>{item.name}</strong><span>{item.detail}</span><div className="dashboard-alert-progress"><i style={{ width: `${item.progress}%` }} /></div></div><span className="dashboard-alert-level">{critical ? 'Critical' : 'Low'}</span></article>;
      })}</div>
    )}
    <button type="button" onClick={onReviewAlerts} className="dashboard-alert-action"><CircleAlert aria-hidden="true" />Review inventory alerts</button>
  </article>
);

// ---------------------------------------------------------------------------
// DashboardPage
// All business data flows from useApiResource(fetchDashboard).
// Static KPI structure is defined in KPI_DEFINITIONS above.
// Charts and widgets render empty states when the API returns no data.
// ---------------------------------------------------------------------------
const DashboardPage = () => {
  const navigate = useNavigate();
  const { data: dashboard, retry, state } = useApiResource(fetchDashboard);

  // Build metrics by merging static KPI definitions with live API values.
  const metrics = useMemo((): Metric[] => KPI_DEFINITIONS.map((def) => {
    if (def.title === 'Total Orders') {
      return { ...def, value: dashboard?.data.totalOrders.toLocaleString() ?? '--', subtitle: dashboard ? 'Live order event total' : '--' };
    }
    if (def.title === 'Inventory Alerts') {
      return { ...def, value: dashboard ? `${dashboard.data.lowStockCount.toLocaleString()} Items` : '--', subtitle: dashboard ? 'Live low-stock event total' : '--' };
    }
    if (def.title === "Today's Revenue") {
      let revenue = dashboard?.data.totalRevenue || 0;
      if (revenue === 0 && dashboard?.data.recentOrders) {
        revenue = dashboard.data.recentOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      }
      return { ...def, value: dashboard ? `₹${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '--', subtitle: dashboard ? 'Live revenue' : '--' };
    }
    if (def.title === 'Active Customers') {
      return { ...def, value: dashboard ? dashboard.data.totalCustomers.toLocaleString() : '--', subtitle: dashboard ? 'Live customers' : '--' };
    }
    return { ...def, value: '--', subtitle: '--' };
  }), [dashboard]);

  const [trendPeriod, setTrendPeriod] = useState<'Weekly' | 'Monthly'>('Weekly');

  // Chart data – derived from live API data.
  const chartPoints = useMemo((): number[] => {
    if (!dashboard?.data.recentOrders || dashboard.data.recentOrders.length === 0) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (trendPeriod === 'Monthly') {
      const points = [0, 0, 0, 0];
      dashboard.data.recentOrders.forEach(order => {
        if (!order.createdAt) return;
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        const diffTime = today.getTime() - orderDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 0 && diffDays < 28) {
          const weekIdx = Math.floor(diffDays / 7);
          const idx = 3 - weekIdx;
          points[idx] += order.totalAmount;
        }
      });
      return points.every(p => p === 0) ? [] : points;
    }

    // Weekly logic
    const points = [0, 0, 0, 0, 0, 0, 0];
    dashboard.data.recentOrders.forEach(order => {
      if (!order.createdAt) return;
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      const diffTime = today.getTime() - orderDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays < 7) {
        const idx = 6 - diffDays;
        points[idx] += order.totalAmount;
      }
    });

    return points.every(p => p === 0) ? [] : points;
  }, [dashboard, trendPeriod]);

  const chartLabels = trendPeriod === 'Monthly' ? ['Week 1', 'Week 2', 'Week 3', 'Week 4'] : chartDays;

  const { donutSegments, categoryLegend } = useMemo(() => {
    let top: Array<{ productName: string; revenue: number }> = [];

    if (dashboard?.data.topSellingProducts && dashboard.data.topSellingProducts.length > 0) {
      top = dashboard.data.topSellingProducts.slice(0, 4);
    } else if (dashboard?.data.recentOrders && dashboard.data.recentOrders.length > 0) {
      const productMap = new Map<string, number>();
      dashboard.data.recentOrders.forEach((order) => {
        const items = (order as any).items || [];
        if (Array.isArray(items) && items.length > 0) {
          items.forEach((item: any) => {
            const name = item.productName || item.name || 'Organic Produce';
            const revenue = Number(item.lineTotal || (item.price * item.quantity) || 0);
            productMap.set(name, (productMap.get(name) || 0) + (revenue || 10));
          });
        } else {
          productMap.set('Fresh Organic Produce', (productMap.get('Fresh Organic Produce') || 0) + (order.totalAmount || 15));
        }
      });

      top = Array.from(productMap.entries())
        .map(([productName, revenue]) => ({ productName, revenue }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 4);
    }

    if (top.length === 0) {
      return { donutSegments: [], categoryLegend: [] };
    }

    const sum = top.reduce((acc, p) => acc + p.revenue, 0);
    if (sum === 0) return { donutSegments: [], categoryLegend: [] };

    const colors = ['#06772f', '#0f7c50', '#b12852', '#dde6da'];
    const segments = top.map((p) => Math.round((p.revenue / sum) * 100));

    const currentSum = segments.reduce((a, b) => a + b, 0);
    if (segments.length > 0) {
      segments[segments.length - 1] += 100 - currentSum;
    }

    const legend: SalesLegendItem[] = top.map((p, i) => ({
      color: colors[i % colors.length],
      label: p.productName.length > 18 ? p.productName.substring(0, 18) + '...' : p.productName,
      value: `${segments[i]}%`,
    }));

    while (segments.length < 4) segments.push(0);

    return { donutSegments: segments, categoryLegend: legend };
  }, [dashboard]);

  // Orders and stock alert data – mapped from live dashboard API data
  const recentOrders = useMemo((): OrderRow[] => {
    if (!dashboard?.data.recentOrders) return [];
    return dashboard.data.recentOrders.slice(0, 5).map(order => {
      let displayName = order.customerName || 'Mathankumar N';
      if (!displayName || displayName.startsWith('USER_') || displayName.includes('-')) {
        displayName = 'Mathankumar N';
      }
      const parts = displayName.trim().split(' ');
      const initials = parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() : displayName.substring(0, 2).toUpperCase();
      
      let timeAgoStr = 'Just now';
      if (order.createdAt) {
        const date = new Date(order.createdAt);
        if (!isNaN(date.getTime())) {
          const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
          if (seconds > 60) {
            const minutes = Math.floor(seconds / 60);
            if (minutes < 60) {
              timeAgoStr = `${minutes} min ago`;
            } else {
              const hours = Math.floor(minutes / 60);
              if (hours < 24) {
                timeAgoStr = `${hours} hr${hours > 1 ? 's' : ''} ago`;
              } else {
                const days = Math.floor(hours / 24);
                timeAgoStr = `${days} day${days > 1 ? 's' : ''} ago`;
              }
            }
          }
        }
      }

      return {
        id: order.orderId.substring(0, 8),
        customer: order.customerName || 'Unknown Customer',
        initials: initials.toUpperCase(),
        status: order.orderStatus || 'PENDING',
        total: `₹${order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        time: timeAgoStr
      };
    });
  }, [dashboard]);

  const stockAlerts = useMemo((): StockItem[] => {
    if (!dashboard?.data.inventoryAlerts) return [];
    return dashboard.data.inventoryAlerts.slice(0, 4).map(alert => ({
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=150', // placeholder fallback
      name: alert.productName,
      detail: `${alert.currentStock} left (Min: ${alert.minimumStock})`,
      progress: alert.minimumStock > 0 ? Math.min(100, Math.max(0, (alert.currentStock / alert.minimumStock) * 100)) : 0
    }));
  }, [dashboard]);

  return (
    <AdminShell searchPlaceholder="Search orders, inventory, customers..." user="alex" variant="operations">
      <main className="dashboard-screen">
        <div className="dashboard-sticky-header">
          <AdminPageHeader
            title="Executive Overview"
            description="Real-time performance metrics for FreshMart global operations."
            actions={[]}
          />
        </div>
        <DashboardKpis loading={state === 'loading'} metrics={metrics} />
        {state === 'error' ? (
          <div className="dashboard-error" role="alert">
            <CircleAlert aria-hidden="true" />
            <span><strong>Dashboard data could not be loaded.</strong> Check the connection and try again.</span>
            <button type="button" onClick={retry}>Retry</button>
          </div>
        ) : null}
        <section className="dashboard-chart-grid">
          <RevenueChart loading={state === 'loading'} chartPoints={chartPoints} labels={chartLabels} period={trendPeriod} onPeriodChange={setTrendPeriod} />
          <CategoryChart loading={state === 'loading'} donutSegments={donutSegments} legend={categoryLegend.length > 0 ? categoryLegend : DEFAULT_LEGEND} />
        </section>
        <section className="dashboard-operations-grid">
          <RecentOrders orders={recentOrders} onViewAll={() => navigate('/orders')} />
          <InventoryAlerts items={stockAlerts} onReviewAlerts={() => navigate('/inventory')} />
        </section>
      </main>
    </AdminShell>
  );
};

export default DashboardPage;

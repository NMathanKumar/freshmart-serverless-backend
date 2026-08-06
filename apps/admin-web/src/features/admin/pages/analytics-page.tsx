import { useId, useState, type CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeDollarSign,
  BarChart3,
  CircleAlert,
  Clock3,
  DollarSign,
  MousePointerClick,
  PackageOpen,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  UserPlus,
  UsersRound
} from 'lucide-react';
import { fetchDashboard } from '../api/admin-api.js';
import { AdminPageHeader } from '../components/admin-components.js';
import { AdminShell } from '../components/admin-shell.js';
import { ComingSoon } from '../components/coming-soon.js';
import { useApiResource } from '../hooks/use-api-resource.js';

type PreviewMetric = {
  icon: LucideIcon;
  label: string;
  trend?: string;
  trendDirection?: 'up' | 'down';
  value: string;
};

const dateRanges = ['Today', 'Week', 'Month', 'Year', 'Custom'] as const;
const revenuePeriods = ['Monthly', 'Weekly', 'Daily'] as const;
const revenuePreview: number[] = [];
const customerPreview = {
  new: [],
  returning: []
};
const categoryPreview: any[] = [];
const trafficPreview: any[] = [];
const topProducts: any[] = [];
const analyticsEvents: any[] = [];

const PreviewBadge = ComingSoon;

const AnalyticsSkeleton = ({ className = '' }: { className?: string }) => (
  <span className={`analytics-skeleton ${className}`} aria-hidden="true" />
);

const AnalyticsEmpty = ({ message }: { message: string }) => (
  <div className="analytics-empty-state">
    <PackageOpen aria-hidden="true" />
    <strong>No analytics data yet</strong>
    <span>{message}</span>
  </div>
);

const AnalyticsCardHeader = ({ eyebrow, title }: { eyebrow: string; title: string }) => (
  <header className="analytics-card-header">
    <div><span>{eyebrow}</span><h2>{title}</h2></div>
    <PreviewBadge />
  </header>
);

const RevenueOverview = ({ loading, totalOrders }: { loading: boolean; totalOrders: string }) => {
  const metrics: PreviewMetric[] = [
    { icon: DollarSign, label: 'Revenue', trend: 'Coming Soon', value: '--' },
    { icon: ShoppingBag, label: 'Orders', trend: 'Live total', trendDirection: 'up', value: totalOrders },
    { icon: UsersRound, label: 'Customers', trend: 'Coming Soon', value: '--' },
    { icon: TrendingUp, label: 'Profit', trend: 'Coming Soon', value: '--' }
  ];

  return (
    <section className="analytics-overview-grid" aria-label="Revenue overview" aria-busy={loading}>
      {metrics.map(({ icon: Icon, label, trend, trendDirection, value }, index) => (
        <article className="analytics-kpi-card" key={label} style={{ '--analytics-delay': `${index * 60}ms` } as CSSProperties}>
          {loading ? <><AnalyticsSkeleton className="analytics-skeleton-icon" /><AnalyticsSkeleton className="analytics-skeleton-label" /><AnalyticsSkeleton className="analytics-skeleton-value" /><AnalyticsSkeleton className="analytics-skeleton-note" /></> : (
            <>
              <div className="analytics-kpi-top"><span><Icon aria-hidden="true" /></span>{label === 'Orders' ? <i className="analytics-live-dot">Live</i> : <PreviewBadge />}</div>
              <p>{label}</p>
              <strong key={value}>{value}</strong>
              <small className={trendDirection ? `trend-${trendDirection}` : 'trend-preview'}>
                {trendDirection === 'up' ? <ArrowUpRight aria-hidden="true" /> : trendDirection === 'down' ? <ArrowDownRight aria-hidden="true" /> : <Clock3 aria-hidden="true" />}
                {trend}
              </small>
            </>
          )}
        </article>
      ))}
    </section>
  );
};

const RevenueChart = ({ loading }: { loading: boolean }) => {
  const gradientId = useId();
  const [period, setPeriod] = useState<(typeof revenuePeriods)[number]>('Monthly');
  const [revenueVisible, setRevenueVisible] = useState(true);
  const points = revenuePreview.map((value, index) => ({
    label: new Date(2026, index).toLocaleString('en', { month: 'short' }),
    value,
    x: (index / (revenuePreview.length - 1)) * 780,
    y: 230 - (value / 100) * 190
  }));

  return (
    <article className="analytics-card analytics-revenue-chart">
      <header className="analytics-card-header analytics-chart-heading">
        <div><span>Performance preview</span><h2>Revenue Chart</h2></div>
        <div className="analytics-period-tabs" aria-label="Revenue period">
          {revenuePeriods.map((item) => <button className={period === item ? 'active' : ''} key={item} onClick={() => setPeriod(item)} type="button" aria-pressed={period === item}>{item}</button>)}
        </div>
      </header>
      {loading ? <div className="analytics-chart-loader"><AnalyticsSkeleton /><AnalyticsSkeleton /><AnalyticsSkeleton /><AnalyticsSkeleton /><AnalyticsSkeleton /></div> : revenuePreview.length === 0 ? <AnalyticsEmpty message="Revenue activity will appear when analytics reporting is available." /> : (
        <div className="analytics-chart-wrap">
          <div className="analytics-y-axis" aria-hidden="true"><span>$100k</span><span>$75k</span><span>$50k</span><span>$25k</span><span>$0</span></div>
          <div className="analytics-svg-chart">
            <svg viewBox="0 0 780 250" role="img" aria-label={`${period} revenue preview chart`}>
              <defs><linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#07813a" stopOpacity=".22" /><stop offset="1" stopColor="#07813a" stopOpacity="0" /></linearGradient></defs>
              {[40, 87.5, 135, 182.5, 230].map((y) => <line className="analytics-grid-line" key={y} x1="0" x2="780" y1={y} y2={y} />)}
              {revenueVisible ? <><path d={`M ${points.map(({ x, y }) => `${x} ${y}`).join(' L ')} L 780 230 L 0 230 Z`} fill={`url(#${gradientId})`} /><polyline className="analytics-revenue-line" points={points.map(({ x, y }) => `${x},${y}`).join(' ')} />{points.map(({ label, value, x, y }) => <g className="analytics-data-point" key={label} role="img" tabIndex={0} aria-label={`${label}: $${value} thousand`}><circle cx={x} cy={y} r="6" /><title>{label}: ${value}k</title></g>)}</> : null}
            </svg>
            <div className="analytics-x-axis">{points.map(({ label }) => <span key={label}>{label}</span>)}</div>
          </div>
        </div>
      )}
      <footer className="analytics-chart-footer"><button className={revenueVisible ? 'active' : ''} onClick={() => setRevenueVisible((value) => !value)} type="button" aria-pressed={revenueVisible}><i />Revenue preview</button><span>Hover or focus chart points for values</span><PreviewBadge /></footer>
    </article>
  );
};

const DonutCard = ({ items, loading, title, eyebrow }: { items: typeof categoryPreview; loading: boolean; title: string; eyebrow: string }) => {
  const gradient = items.reduce((parts, item, index) => {
    const start = items.slice(0, index).reduce((sum, part) => sum + part.value, 0);
    return [...parts, `${item.color} ${start}% ${start + item.value}%`];
  }, [] as string[]).join(', ');

  return (
    <article className="analytics-card analytics-donut-card">
      <AnalyticsCardHeader eyebrow={eyebrow} title={title} />
      {loading ? <AnalyticsSkeleton className="analytics-donut-loader" /> : items.length === 0 ? <AnalyticsEmpty message={`${title} will appear when reporting is available.`} /> : (
        <div className="analytics-donut-content">
          <div className="analytics-donut-visual" style={{ background: `conic-gradient(${gradient})` }} role="img" aria-label={`${title} preview`}><div><strong>100%</strong><span>Preview mix</span></div></div>
          <div className="analytics-donut-legend">{items.map((item) => <div key={item.label}><span><i style={{ backgroundColor: item.color }} />{item.label}</span><strong>{item.value}%</strong></div>)}</div>
        </div>
      )}
    </article>
  );
};

const TopProducts = ({ loading }: { loading: boolean }) => (
  <article className="analytics-card analytics-products-card">
    <AnalyticsCardHeader eyebrow="Product preview" title="Top Selling Products" />
    {loading ? <div className="analytics-list-loader">{Array.from({ length: 4 }).map((_, index) => <AnalyticsSkeleton key={index} />)}</div> : topProducts.length === 0 ? <AnalyticsEmpty message="Product rankings will appear when analytics reporting is available." /> : (
      <div className="analytics-product-list">{topProducts.map((product, index) => <div className="analytics-product-row" key={product.name}>
        <span className="analytics-product-rank">{index + 1}</span><span className="analytics-product-image" style={{ background: product.color }}><ShoppingBag aria-hidden="true" /></span>
        <div className="analytics-product-info"><strong>{product.name}</strong><span>{product.quantity}</span><div><i style={{ width: `${product.sales}%` }} /></div></div>
        <strong className="analytics-product-revenue">{product.revenue}<small>revenue</small></strong>
      </div>)}</div>
    )}
  </article>
);

const CustomerGrowth = ({ loading }: { loading: boolean }) => {
  const chart = (values: number[]) => values.map((value, index) => `${(index / (values.length - 1)) * 520},${150 - value * 1.8}`).join(' ');
  return (
    <article className="analytics-card analytics-growth-card">
      <AnalyticsCardHeader eyebrow="Audience preview" title="Customer Growth" />
      {loading ? <div className="analytics-growth-loader"><AnalyticsSkeleton /><AnalyticsSkeleton /><AnalyticsSkeleton /></div> : customerPreview.new.length === 0 ? <AnalyticsEmpty message="Customer growth will appear when analytics reporting is available." /> : <>
        <div className="analytics-growth-chart"><svg viewBox="0 0 520 175" role="img" aria-label="New and returning customer preview"><line x1="0" x2="520" y1="150" y2="150" className="analytics-grid-line" /><polyline points={chart(customerPreview.new)} className="analytics-growth-new" /><polyline points={chart(customerPreview.returning)} className="analytics-growth-returning" /></svg></div>
        <div className="analytics-growth-legend"><span><i className="new" />New customers</span><span><i className="returning" />Returning customers</span></div>
      </>}
    </article>
  );
};

const RecentEvents = ({ loading }: { loading: boolean }) => (
  <article className="analytics-card analytics-events-card">
    <AnalyticsCardHeader eyebrow="Activity preview" title="Recent Analytics Events" />
    {loading ? <div className="analytics-list-loader">{Array.from({ length: 4 }).map((_, index) => <AnalyticsSkeleton key={index} />)}</div> : analyticsEvents.length === 0 ? <AnalyticsEmpty message="Analytics events will appear when reporting is available." /> : (
      <div className="analytics-timeline">{analyticsEvents.map(({ description, icon: Icon, status, time, tone }) => <div className="analytics-event" key={description}>
        <span className={`analytics-event-icon ${tone}`}><Icon aria-hidden="true" /></span><div><strong>{description}</strong><span><Clock3 aria-hidden="true" />{time}</span></div><i className={`analytics-event-status ${tone}`}>{status}</i>
      </div>)}</div>
    )}
  </article>
);

const AnalyticsPage = () => {
  const [range, setRange] = useState<(typeof dateRanges)[number]>('Month');
  const { data: dashboard, retry, state } = useApiResource(fetchDashboard);
  const loading = state === 'loading';

  return (
    <AdminShell searchPlaceholder="Search reports and trends..." user="alex" variant="operations">
      <main className="analytics-screen">
        <div className="analytics-sticky-header">
          <AdminPageHeader title="Analytics" description="Business intelligence and performance insights across FreshMart operations." actions={[{ disabled: true, label: 'Export Report', icon: BarChart3, title: 'Coming Soon - Backend not yet available' }]} />
          <div className="analytics-date-filters" aria-label="Analytics date range">{dateRanges.map((item) => <button className={range === item ? 'active' : ''} key={item} onClick={() => setRange(item)} type="button" aria-pressed={range === item}>{item}</button>)}</div>
        </div>
        {state === 'error' ? <div className="analytics-error" role="alert"><CircleAlert aria-hidden="true" /><span><strong>Live dashboard totals could not be loaded.</strong> Preview analytics remain available.</span><button onClick={retry} type="button"><RefreshCw aria-hidden="true" />Retry</button></div> : null}
        <RevenueOverview loading={loading} totalOrders={dashboard?.data.totalOrders.toLocaleString() ?? '--'} />
        <section className="analytics-primary-grid"><RevenueChart loading={loading} /><DonutCard eyebrow="Sales mix" items={categoryPreview} loading={loading} title="Sales by Category" /></section>
        <section className="analytics-secondary-grid"><TopProducts loading={loading} /><CustomerGrowth loading={loading} /></section>
        <section className="analytics-tertiary-grid"><DonutCard eyebrow="Acquisition preview" items={trafficPreview} loading={loading} title="Traffic Sources" /><RecentEvents loading={loading} /></section>
      </main>
    </AdminShell>
  );
};

export default AnalyticsPage;

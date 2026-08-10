import { useMemo, useState, type CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Download,
  KeyRound,
  PackageOpen,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  UserCog,
  UsersRound,
  X
} from 'lucide-react';
import { AdminPageHeader, AvatarBadge } from '../components/admin-components.js';
import { AdminShell } from '../components/admin-shell';
import { ComingSoon } from '../components/coming-soon.js';
import { useDialogAccessibility } from '../hooks/use-dialog-accessibility.js';

type AuditState = 'loading' | 'ready' | 'error';
type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
type AuditStatus = 'Success' | 'Failed' | 'Blocked';

type AuditLog = {
  action: string;
  after?: Record<string, string>;
  before?: Record<string, string>;
  eventId: string;
  icon: LucideIcon;
  initials: string;
  ipAddress: string;
  metadata: Record<string, string>;
  module: string;
  requestId: string;
  resource: string;
  severity: Severity;
  status: AuditStatus;
  timestamp: string;
  timeAgo: string;
  user: string;
};

const auditLogs: AuditLog[] = [
  { action: 'Updated inventory threshold', after: { reorderLevel: '24', status: 'Active' }, before: { reorderLevel: '12', status: 'Active' }, eventId: 'EVT-2026-0719-001', icon: SlidersHorizontal, initials: 'AR', ipAddress: '10.24.8.16', metadata: { environment: 'Production', source: 'Admin Web' }, module: 'Inventory', requestId: 'req_8f13d2a0', resource: 'SKU-FM-2048', severity: 'Medium', status: 'Success', timestamp: 'Jul 19, 2026 14:42:18', timeAgo: '12 min ago', user: 'Alex Rivera' },
  { action: 'Blocked authentication attempt', eventId: 'EVT-2026-0719-002', icon: ShieldAlert, initials: 'SY', ipAddress: '198.51.100.22', metadata: { attempts: '5', rule: 'Brute-force protection' }, module: 'Security', requestId: 'req_6c98e417', resource: 'Admin session', severity: 'Critical', status: 'Blocked', timestamp: 'Jul 19, 2026 14:27:03', timeAgo: '27 min ago', user: 'System Guard' },
  { action: 'Changed product visibility', after: { visibility: 'Published' }, before: { visibility: 'Draft' }, eventId: 'EVT-2026-0719-003', icon: UserCog, initials: 'SJ', ipAddress: '10.24.9.41', metadata: { environment: 'Production', source: 'Admin Web' }, module: 'Catalog', requestId: 'req_33ab79c1', resource: 'Organic Avocado', severity: 'Low', status: 'Success', timestamp: 'Jul 19, 2026 13:58:44', timeAgo: '56 min ago', user: 'Sarah Jenkins' },
  { action: 'Export operation denied', eventId: 'EVT-2026-0719-004', icon: KeyRound, initials: 'MC', ipAddress: '10.24.11.7', metadata: { permission: 'orders:export', reason: 'Insufficient role' }, module: 'Orders', requestId: 'req_ba2148c9', resource: 'Order report', severity: 'High', status: 'Failed', timestamp: 'Jul 19, 2026 12:36:20', timeAgo: '2 hrs ago', user: 'Marcus Chen' },
  { action: 'Updated customer access', after: { status: 'Active' }, before: { status: 'Review' }, eventId: 'EVT-2026-0719-005', icon: UsersRound, initials: 'AR', ipAddress: '10.24.8.16', metadata: { environment: 'Production', source: 'Admin Web' }, module: 'Customers', requestId: 'req_541c6de8', resource: 'CUS-10842', severity: 'Medium', status: 'Success', timestamp: 'Jul 19, 2026 11:14:09', timeAgo: '3 hrs ago', user: 'Alex Rivera' }
];

const summary = [
  { icon: Activity, label: 'Total Events', tone: 'success', trend: 'Coming Soon' },
  { icon: ShieldAlert, label: 'Security Events', tone: 'critical', trend: 'Coming Soon' },
  { icon: UserCog, label: 'Admin Actions', tone: 'success', trend: 'Coming Soon' },
  { icon: AlertTriangle, label: 'Failed Operations', tone: 'warning', trend: 'Coming Soon' }
];

const ComingSoonBadge = ComingSoon;

const SeverityBadge = ({ severity }: { severity: Severity }) => <span className={`activity-severity severity-${severity.toLowerCase()}`}><i />{severity}</span>;

const StatusBadge = ({ status }: { status: AuditStatus }) => (
  <span className={`activity-status status-${status.toLowerCase()}`}>
    {status === 'Success' ? <CheckCircle2 aria-hidden="true" /> : <CircleAlert aria-hidden="true" />}{status}
  </span>
);

const ActivitySummary = ({ loading }: { loading: boolean }) => (
  <section className="activity-summary-grid" aria-label="Activity summary" aria-busy={loading}>
    {summary.map(({ icon: Icon, label, tone, trend }, index) => <article className={`activity-summary-card tone-${tone}`} key={label} style={{ '--activity-delay': `${index * 55}ms` } as CSSProperties}>
      {loading ? <div className="activity-summary-skeleton"><span className="icon" /><span className="label" /><span className="value" /><span className="trend" /></div> : <>
        <div><span className="activity-summary-icon"><Icon aria-hidden="true" /></span><ComingSoonBadge /></div>
        <p>{label}</p><strong>--</strong><small><Clock3 aria-hidden="true" />{trend}</small>
      </>}
    </article>)}
  </section>
);

const ActivityFilters = ({ module, onModule, onQuery, onSeverity, onUser, query, severity, user }: {
  module: string;
  onModule: (value: string) => void;
  onQuery: (value: string) => void;
  onSeverity: (value: string) => void;
  onUser: (value: string) => void;
  query: string;
  severity: string;
  user: string;
}) => (
  <section className="activity-filter-panel" aria-label="Audit log filters">
    <label className="activity-search"><Search aria-hidden="true" /><input aria-label="Search audit logs" onChange={(event) => onQuery(event.target.value)} placeholder="Search activity, resource, or IP..." type="search" value={query} /></label>
    <button className="activity-date-button" type="button"><CalendarDays aria-hidden="true" /><span>Last 30 days</span></button>
    <label className="activity-select"><span>User</span><select aria-label="Filter by user" onChange={(event) => onUser(event.target.value)} value={user}><option value="all">All users</option>{Array.from(new Set(auditLogs.map((log) => log.user))).map((name) => <option key={name}>{name}</option>)}</select></label>
    <label className="activity-select"><span>Module</span><select aria-label="Filter by module" onChange={(event) => onModule(event.target.value)} value={module}><option value="all">All modules</option>{Array.from(new Set(auditLogs.map((log) => log.module))).map((name) => <option key={name}>{name}</option>)}</select></label>
    <label className="activity-select"><span>Severity</span><select aria-label="Filter by severity" onChange={(event) => onSeverity(event.target.value)} value={severity}><option value="all">All severity</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select></label>
    <button className="activity-export-button" disabled title="Coming Soon - Backend not yet available" type="button"><Download aria-hidden="true" />Export</button>
  </section>
);

const AuditTableState = ({ onRetry, state }: { onRetry: () => void; state: Exclude<AuditState, 'ready'> | 'empty' }) => {
  if (state === 'loading') return <div className="activity-table-skeleton" aria-label="Loading audit logs">{Array.from({ length: 5 }).map((_, index) => <span key={index} />)}</div>;
  if (state === 'error') return <div className="activity-state" role="alert"><CircleAlert aria-hidden="true" /><strong>Audit activity could not be loaded</strong><span>Try loading the activity preview again.</span><button onClick={onRetry} type="button"><RefreshCw aria-hidden="true" />Retry</button></div>;
  return <div className="activity-state"><PackageOpen aria-hidden="true" /><strong>No matching activity</strong><span>Adjust the filters to see other preview events.</span></div>;
};

const AuditTable = ({ logs, onOpen, onRetry, state }: { logs: AuditLog[]; onOpen: (log: AuditLog) => void; onRetry: () => void; state: AuditState }) => (
  <article className="activity-table-card">
    <header className="activity-card-header"><div><span>Read-only preview</span><h2>Audit Log</h2></div><div><span>{logs.length} preview events</span><ComingSoonBadge /></div></header>
    {state !== 'ready' ? <AuditTableState onRetry={onRetry} state={state} /> : logs.length === 0 ? <AuditTableState onRetry={onRetry} state="empty" /> : <div className="activity-table-scroll"><table className="activity-table"><thead><tr><th>Timestamp</th><th>User</th><th>Module</th><th>Action</th><th>Resource</th><th>Status</th><th>Severity</th><th>IP Address</th><th aria-label="Details" /></tr></thead><tbody>{logs.map((log) => <tr key={log.eventId} onClick={() => onOpen(log)} tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpen(log); } }}>
      <td><strong>{log.timestamp.split(' ')[0]} {log.timestamp.split(' ')[1]} {log.timestamp.split(' ')[2]}</strong><small>{log.timestamp.split(' ').slice(3).join(' ')}</small></td>
      <td><div className="activity-table-user"><AvatarBadge initials={log.initials} tone={log.status === 'Failed' || log.status === 'Blocked' ? 'danger' : 'success'} /><span><strong>{log.user}</strong><small>Administrator</small></span></div></td>
      <td><span className="activity-module-badge">{log.module}</span></td><td>{log.action}</td><td><strong>{log.resource}</strong></td><td><StatusBadge status={log.status} /></td><td><SeverityBadge severity={log.severity} /></td><td><code>{log.ipAddress}</code></td><td><button onClick={(event) => { event.stopPropagation(); onOpen(log); }} type="button" aria-label={`View ${log.eventId}`}><ChevronRight aria-hidden="true" /></button></td>
    </tr>)}</tbody></table></div>}
    <footer><span>Preview data only. Live audit history is not connected.</span><span>Page 1 of 1</span></footer>
  </article>
);

const ActivityTimeline = ({ logs, loading }: { logs: AuditLog[]; loading: boolean }) => (
  <article className="activity-timeline-card">
    <header className="activity-card-header"><div><span>Latest preview</span><h2>Recent Activity</h2></div><ComingSoonBadge /></header>
    {loading ? <div className="activity-timeline-skeleton">{Array.from({ length: 4 }).map((_, index) => <span key={index} />)}</div> : logs.length === 0 ? <div className="activity-state"><PackageOpen aria-hidden="true" /><strong>No recent activity</strong><span>Recent events will appear here.</span></div> : <div className="activity-timeline-list">{logs.slice(0, 4).map((log) => { const Icon = log.icon; return <div className="activity-timeline-event" key={log.eventId}><span className={`severity-${log.severity.toLowerCase()}`}><Icon aria-hidden="true" /></span><div><strong>{log.action}</strong><small>{log.user} · {log.timeAgo}</small></div><SeverityBadge severity={log.severity} /></div>; })}</div>}
  </article>
);

const AuditDetailsDrawer = ({ log, onClose }: { log?: AuditLog; onClose: () => void }) => {
  useDialogAccessibility(Boolean(log), onClose);

  if (!log) return null;
  return <div className="activity-drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()} role="presentation"><aside aria-labelledby="audit-drawer-title" aria-modal="true" className="activity-details-drawer" role="dialog">
    <header><div><ComingSoonBadge /><h2 id="audit-drawer-title">Log Details</h2><span>{log.eventId}</span></div><button autoFocus onClick={onClose} type="button" aria-label="Close log details"><X aria-hidden="true" /></button></header>
    <div className="activity-drawer-body">
      <section className="activity-drawer-summary"><span className={`activity-drawer-icon severity-${log.severity.toLowerCase()}`}>{(() => { const Icon = log.icon; return <Icon aria-hidden="true" />; })()}</span><div><strong>{log.action}</strong><span>{log.module} · {log.resource}</span></div><StatusBadge status={log.status} /></section>
      <dl className="activity-detail-grid"><div><dt>Event ID</dt><dd>{log.eventId}</dd></div><div><dt>User</dt><dd>{log.user}</dd></div><div><dt>Timestamp</dt><dd>{log.timestamp}</dd></div><div><dt>IP Address</dt><dd><code>{log.ipAddress}</code></dd></div><div className="wide"><dt>Request ID</dt><dd><code>{log.requestId}</code></dd></div></dl>
      <section className="activity-change-section"><h3>Before / After</h3>{log.before || log.after ? <div className="activity-change-grid"><div><span>Before</span>{Object.entries(log.before ?? {}).map(([key, value]) => <p key={key}><b>{key}</b><code>{value}</code></p>)}</div><div><span>After</span>{Object.entries(log.after ?? {}).map(([key, value]) => <p key={key}><b>{key}</b><code>{value}</code></p>)}</div></div> : <div className="activity-no-changes">No value changes are available for this event.</div>}</section>
      <section className="activity-metadata-section"><h3>Metadata</h3>{Object.entries(log.metadata).map(([key, value]) => <div key={key}><span>{key}</span><strong>{value}</strong></div>)}</section>
    </div>
    <footer><span><ShieldCheck aria-hidden="true" />Read-only audit preview</span><button onClick={onClose} type="button">Close</button></footer>
  </aside></div>;
};

const ActivityPage = () => {
  const [module, setModule] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog>();
  const [severity, setSeverity] = useState('all');
  const [state, setState] = useState<AuditState>('ready');
  const [user, setUser] = useState('all');
  const visibleLogs = useMemo(() => auditLogs.filter((log) => {
    const searchValue = query.trim().toLowerCase();
    const matchesQuery = !searchValue || [log.action, log.eventId, log.ipAddress, log.resource, log.user].some((value) => value.toLowerCase().includes(searchValue));
    return matchesQuery && (module === 'all' || log.module === module) && (severity === 'all' || log.severity === severity) && (user === 'all' || log.user === user);
  }), [module, query, severity, user]);

  return <AdminShell searchPlaceholder="Search admin activity..." user="alex" variant="operations"><main className="activity-screen">
    <div className="activity-sticky-header"><AdminPageHeader title="Activity & Audit Logs" description="Monitor administrative actions, security signals, and operational changes across FreshMart." actions={[{ disabled: true, icon: Download, label: 'Export Logs', title: 'Coming Soon - Backend not yet available' }]} /></div>
    <ActivitySummary loading={state === 'loading'} />
    <ActivityFilters module={module} onModule={setModule} onQuery={setQuery} onSeverity={setSeverity} onUser={setUser} query={query} severity={severity} user={user} />
    {state === 'error' ? <div className="activity-inline-error" role="alert"><CircleAlert aria-hidden="true" /><span><strong>Audit activity is unavailable.</strong>No supported audit endpoint is currently connected.</span><button onClick={() => setState('ready')} type="button"><RefreshCw aria-hidden="true" />Retry</button></div> : null}
    <section className="activity-content-grid"><AuditTable logs={visibleLogs} onOpen={setSelectedLog} onRetry={() => setState('ready')} state={state} /><ActivityTimeline loading={state === 'loading'} logs={visibleLogs} /></section>
    <AuditDetailsDrawer log={selectedLog} onClose={() => setSelectedLog(undefined)} />
  </main></AdminShell>;
};

export default ActivityPage;

import { useMemo, useState, type CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  Download,
  EllipsisVertical,
  History,
  MailPlus,
  PackageOpen,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldEllipsis,
  SlidersHorizontal,
  UserCheck,
  UserCog,
  UsersRound,
  X
} from 'lucide-react';
import { AdminPageHeader, AvatarBadge } from '../components/admin-components.js';
import { AdminShell } from '../components/admin-shell.js';
import { ComingSoon } from '../components/coming-soon.js';
import { useDialogAccessibility } from '../hooks/use-dialog-accessibility.js';

type PageState = 'loading' | 'ready' | 'error';
type RoleStatus = 'Active' | 'System' | 'Draft';

type Role = {
  assignedUsers: number;
  created: string;
  description: string;
  history: { action: string; actor: string; time: string }[];
  id: string;
  name: string;
  permissionCount: number;
  status: RoleStatus;
  updated: string;
  users: TeamMember[];
};

type TeamMember = {
  email: string;
  initials: string;
  lastLogin: string;
  name: string;
  role: string;
  status: 'Active' | 'Invited';
};

const teamMembers: TeamMember[] = [
  { email: 'alex.rivera@freshmart.com', initials: 'AR', lastLogin: '12 minutes ago', name: 'Alex Rivera', role: 'Super Admin', status: 'Active' },
  { email: 'sarah.jenkins@freshmart.com', initials: 'SJ', lastLogin: '2 hours ago', name: 'Sarah Jenkins', role: 'Operations Admin', status: 'Active' },
  { email: 'marcus.chen@freshmart.com', initials: 'MC', lastLogin: 'Yesterday', name: 'Marcus Chen', role: 'Catalog Manager', status: 'Active' },
  { email: 'priya.shah@freshmart.com', initials: 'PS', lastLogin: 'Invitation pending', name: 'Priya Shah', role: 'Support Agent', status: 'Invited' }
];

const roles: Role[] = [
  { assignedUsers: 2, created: 'Jan 12, 2025', description: 'Complete platform access with security and configuration controls.', history: [{ action: 'Permission set reviewed', actor: 'Alex Rivera', time: '2 days ago' }, { action: 'Role assigned to administrator', actor: 'System', time: '8 days ago' }], id: 'ROLE-001', name: 'Super Admin', permissionCount: 60, status: 'System', updated: 'Jul 17, 2026', users: teamMembers.slice(0, 1) },
  { assignedUsers: 4, created: 'Mar 08, 2025', description: 'Operational access for orders, inventory, customers, and delivery.', history: [{ action: 'Inventory approval added', actor: 'Alex Rivera', time: '4 days ago' }], id: 'ROLE-002', name: 'Operations Admin', permissionCount: 42, status: 'Active', updated: 'Jul 15, 2026', users: teamMembers.slice(1, 2) },
  { assignedUsers: 3, created: 'Jun 19, 2025', description: 'Product, category, pricing, and merchandising administration.', history: [{ action: 'Export permission removed', actor: 'Sarah Jenkins', time: '1 week ago' }], id: 'ROLE-003', name: 'Catalog Manager', permissionCount: 27, status: 'Active', updated: 'Jul 12, 2026', users: teamMembers.slice(2, 3) },
  { assignedUsers: 1, created: 'Feb 22, 2026', description: 'Read-only customer support access with limited order updates.', history: [{ action: 'Invitation accepted', actor: 'Priya Shah', time: '3 weeks ago' }], id: 'ROLE-004', name: 'Support Agent', permissionCount: 14, status: 'Draft', updated: 'Jul 02, 2026', users: teamMembers.slice(3) }
];

const permissionRows = ['Products', 'Inventory', 'Orders', 'Customers', 'Coupons', 'Delivery', 'Reports', 'Analytics', 'Settings', 'Audit Logs'];
const permissionColumns = ['View', 'Create', 'Update', 'Delete', 'Export', 'Approve'];
const allowedPermissions = new Set(['Products-View', 'Inventory-View', 'Orders-View', 'Customers-View', 'Delivery-View', 'Reports-View', 'Analytics-View', 'Audit Logs-View', 'Products-Create', 'Products-Update', 'Inventory-Update', 'Orders-Update', 'Orders-Approve', 'Reports-Export', 'Analytics-Export']);
const roleActivity = [
  { action: 'Role assigned', detail: 'Operations Admin assigned to Sarah Jenkins', icon: UserCheck, time: '2 hours ago', tone: 'success' },
  { action: 'Permission updated', detail: 'Inventory approval permission enabled', icon: SlidersHorizontal, time: '4 days ago', tone: 'warning' },
  { action: 'Role removed', detail: 'Catalog Manager removed from former member', icon: ShieldEllipsis, time: '1 week ago', tone: 'danger' },
  { action: 'Invitation accepted', detail: 'Priya Shah joined as Support Agent', icon: MailPlus, time: '3 weeks ago', tone: 'success' }
];

const PreviewBadge = ComingSoon;

const RoleStatusBadge = ({ status }: { status: RoleStatus }) => <span className={`roles-status status-${status.toLowerCase()}`}><i />{status}</span>;

const RoleSummary = ({ loading }: { loading: boolean }) => {
  const cards: { description: string; icon: LucideIcon; label: string; tone: string; value: string }[] = [
    { description: 'Role definitions in preview', icon: ShieldCheck, label: 'Total Roles', tone: 'success', value: `${roles.length}` },
    { description: 'Active preview team members', icon: UsersRound, label: 'Active Admins', tone: 'success', value: `${teamMembers.filter((member) => member.status === 'Active').length}` },
    { description: 'Non-system role previews', icon: UserCog, label: 'Custom Roles', tone: 'neutral', value: `${roles.filter((role) => role.status !== 'System').length}` },
    { description: 'Read-only invitation preview', icon: MailPlus, label: 'Pending Invitations', tone: 'warning', value: `${teamMembers.filter((member) => member.status === 'Invited').length}` }
  ];
  return <section className="roles-summary-grid" aria-label="Role summary" aria-busy={loading}>{cards.map(({ description, icon: Icon, label, tone, value }, index) => <article className={`roles-summary-card tone-${tone}`} key={label} style={{ '--roles-delay': `${index * 55}ms` } as CSSProperties}>{loading ? <div className="roles-summary-skeleton"><span className="icon" /><span className="label" /><span className="value" /><span className="note" /></div> : <><div><span className="roles-summary-icon"><Icon aria-hidden="true" /></span><PreviewBadge /></div><p>{label}</p><strong>{value}</strong><small><Clock3 aria-hidden="true" />{description}</small></>}</article>)}</section>;
};

const RolesToolbar = ({ onPermission, onQuery, onRole, onStatus, permission, query, role, status }: { onPermission: (value: string) => void; onQuery: (value: string) => void; onRole: (value: string) => void; onStatus: (value: string) => void; permission: string; query: string; role: string; status: string }) => <section className="roles-toolbar" aria-label="Role filters">
  <label className="roles-search"><Search aria-hidden="true" /><input aria-label="Search roles" onChange={(event) => onQuery(event.target.value)} placeholder="Search roles and descriptions..." type="search" value={query} /></label>
  <label><span>Role</span><select aria-label="Filter by role" onChange={(event) => onRole(event.target.value)} value={role}><option value="all">All roles</option>{roles.map((item) => <option key={item.id}>{item.name}</option>)}</select></label>
  <label><span>Permission</span><select aria-label="Filter by permission" onChange={(event) => onPermission(event.target.value)} value={permission}><option value="all">All permissions</option>{permissionRows.map((item) => <option key={item}>{item}</option>)}</select></label>
  <label><span>Status</span><select aria-label="Filter by status" onChange={(event) => onStatus(event.target.value)} value={status}><option value="all">All statuses</option><option>Active</option><option>System</option><option>Draft</option></select></label>
  <button disabled title="Coming Soon - Backend not yet available" type="button"><RefreshCw aria-hidden="true" />Refresh</button><button disabled title="Coming Soon - Backend not yet available" type="button"><Download aria-hidden="true" />Export</button><button className="primary" disabled title="Coming Soon - Backend not yet available" type="button"><Plus aria-hidden="true" />Create Role</button>
</section>;

const RolesState = ({ onRetry, state }: { onRetry: () => void; state: Exclude<PageState, 'ready'> | 'empty' }) => state === 'loading' ? <div className="roles-table-skeleton" aria-label="Loading roles">{Array.from({ length: 4 }).map((_, index) => <span key={index} />)}</div> : <div className="roles-empty-state" role={state === 'error' ? 'alert' : 'status'}><PackageOpen aria-hidden="true" /><strong>{state === 'error' ? 'Roles could not be loaded' : 'No matching roles'}</strong><span>{state === 'error' ? 'Try loading the role preview again.' : 'Adjust the filters to see another role.'}</span>{state === 'error' ? <button onClick={onRetry} type="button"><RefreshCw aria-hidden="true" />Retry</button> : null}</div>;

const RolesTable = ({ items, onOpen, onRetry, onSort, sortAscending, state }: { items: Role[]; onOpen: (role: Role) => void; onRetry: () => void; onSort: () => void; sortAscending: boolean; state: PageState }) => <article className="roles-table-card">
  <header className="roles-card-header"><div><span>Read-only preview</span><h2>Roles</h2></div><div><button className="roles-sort-button" onClick={onSort} type="button">{sortAscending ? <ArrowDownAZ aria-hidden="true" /> : <ArrowUpAZ aria-hidden="true" />}Sort</button><PreviewBadge /></div></header>
  {state !== 'ready' ? <RolesState onRetry={onRetry} state={state} /> : items.length === 0 ? <RolesState onRetry={onRetry} state="empty" /> : <div className="roles-table-scroll"><table className="roles-table"><thead><tr><th>Role Name</th><th>Description</th><th>Users Assigned</th><th>Permissions</th><th>Created</th><th>Last Updated</th><th>Status</th><th>Actions</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} onClick={() => onOpen(item)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpen(item); } }} tabIndex={0}><td><div className="roles-name-cell"><span><ShieldCheck aria-hidden="true" /></span><div><strong>{item.name}</strong><small>{item.id}</small></div></div></td><td>{item.description}</td><td><strong>{item.assignedUsers}</strong><small>team members</small></td><td><strong>{item.permissionCount}</strong><small>permissions</small></td><td>{item.created}</td><td>{item.updated}</td><td><RoleStatusBadge status={item.status} /></td><td><div className="roles-actions"><button onClick={(event) => { event.stopPropagation(); onOpen(item); }} type="button" aria-label={`View ${item.name}`}><ChevronRight aria-hidden="true" /></button><button disabled title="Coming Soon" type="button" aria-label={`More actions for ${item.name}`}><EllipsisVertical aria-hidden="true" /></button></div></td></tr>)}</tbody></table></div>}
  <footer><span>Showing {items.length} of {roles.length} preview roles</span><div><button disabled aria-label="Previous page" type="button"><ChevronLeft aria-hidden="true" /></button><button className="active" type="button">1</button><button disabled aria-label="Next page" type="button"><ChevronRight aria-hidden="true" /></button></div></footer>
</article>;

const PermissionMatrix = ({ loading }: { loading: boolean }) => <article className="roles-panel roles-permissions-panel"><header className="roles-card-header"><div><span>Permission preview</span><h2>Permission Matrix</h2></div><PreviewBadge /></header>{loading ? <div className="roles-matrix-skeleton">{Array.from({ length: 7 }).map((_, index) => <span key={index} />)}</div> : <div className="roles-matrix-scroll"><table className="roles-matrix"><thead><tr><th>Module</th>{permissionColumns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{permissionRows.map((row) => <tr key={row}><th>{row}</th>{permissionColumns.map((column) => { const checked = allowedPermissions.has(`${row}-${column}`); return <td key={column}><label title="Permission editing is Coming Soon"><input aria-label={`${column} ${row}`} checked={checked} disabled readOnly type="checkbox" /><span>{checked ? <Check aria-hidden="true" /> : null}</span></label></td>; })}</tr>)}</tbody></table></div>}</article>;

const TeamPanel = ({ loading }: { loading: boolean }) => <article className="roles-panel roles-team-panel"><header className="roles-card-header"><div><span>Team preview</span><h2>Team Members</h2></div><PreviewBadge /></header>{loading ? <div className="roles-list-skeleton">{Array.from({ length: 4 }).map((_, index) => <span key={index} />)}</div> : teamMembers.length === 0 ? <RolesState onRetry={() => undefined} state="empty" /> : <div className="roles-team-list">{teamMembers.map((member) => <div key={member.email}><AvatarBadge initials={member.initials} tone={member.status === 'Invited' ? 'neutral' : 'success'} /><div><strong>{member.name}</strong><span>{member.email}</span><small>{member.role} · {member.lastLogin}</small></div><i className={`member-${member.status.toLowerCase()}`}>{member.status}</i></div>)}</div>}</article>;

const RoleActivityPanel = ({ loading }: { loading: boolean }) => <article className="roles-panel roles-activity-panel"><header className="roles-card-header"><div><span>Latest changes</span><h2>Role Activity</h2></div><PreviewBadge /></header>{loading ? <div className="roles-list-skeleton">{Array.from({ length: 4 }).map((_, index) => <span key={index} />)}</div> : roleActivity.length === 0 ? <RolesState onRetry={() => undefined} state="empty" /> : <div className="roles-activity-list">{roleActivity.map(({ action, detail, icon: Icon, time, tone }) => <div key={detail}><span className={`tone-${tone}`}><Icon aria-hidden="true" /></span><div><strong>{action}</strong><small>{detail}</small></div><time>{time}</time></div>)}</div>}</article>;

const RoleDrawer = ({ onClose, role }: { onClose: () => void; role?: Role }) => {
  useDialogAccessibility(Boolean(role), onClose);
  if (!role) return null;
  const groupedPermissions = ['System Permissions', 'Product', 'Inventory', 'Orders', 'Customers', 'Reports', 'Settings', 'Audit Logs'];
  return <div className="roles-drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()} role="presentation"><aside aria-labelledby="role-drawer-title" aria-modal="true" className="roles-drawer" role="dialog"><header><div><PreviewBadge /><h2 id="role-drawer-title">Role Details</h2><span>{role.id}</span></div><button autoFocus onClick={onClose} type="button" aria-label="Close role details"><X aria-hidden="true" /></button></header><div className="roles-drawer-body">
    <section className="roles-drawer-hero"><span><ShieldCheck aria-hidden="true" /></span><div><h3>{role.name}</h3><p>{role.description}</p></div><RoleStatusBadge status={role.status} /></section>
    <dl className="roles-info-grid"><div><dt>Users Assigned</dt><dd>{role.assignedUsers}</dd></div><div><dt>Permissions</dt><dd>{role.permissionCount}</dd></div><div><dt>Created</dt><dd>{role.created}</dd></div><div><dt>Last Updated</dt><dd>{role.updated}</dd></div></dl>
    <section className="roles-drawer-section"><h3>Assigned Users</h3>{role.users.map((member) => <div className="roles-drawer-user" key={member.email}><AvatarBadge initials={member.initials} /><span><strong>{member.name}</strong><small>{member.email}</small></span><i>{member.status}</i></div>)}</section>
    <section className="roles-drawer-section"><h3>Permission Groups</h3><div className="roles-permission-groups">{groupedPermissions.map((group, index) => <div key={group}><span>{group}</span><strong>{index === 0 ? 'Restricted' : index < 6 ? 'View access' : 'No access'}</strong></div>)}</div></section>
    <section className="roles-drawer-section"><h3><History aria-hidden="true" />Role History</h3><div className="roles-history">{role.history.map((item) => <div key={item.action}><i /><span><strong>{item.action}</strong><small>{item.actor} · {item.time}</small></span></div>)}</div></section>
  </div><footer><span><ShieldCheck aria-hidden="true" />Read-only role preview</span><button onClick={onClose} type="button">Close</button></footer></aside></div>;
};

const RolesPage = () => {
  const [permission, setPermission] = useState('all');
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedRole, setSelectedRole] = useState<Role>();
  const [sortAscending, setSortAscending] = useState(true);
  const [state, setState] = useState<PageState>('ready');
  const [status, setStatus] = useState('all');
  const visibleRoles = useMemo(() => roles.filter((role) => {
    const term = query.trim().toLowerCase();
    return (!term || [role.name, role.description, role.id].some((value) => value.toLowerCase().includes(term))) && (roleFilter === 'all' || role.name === roleFilter) && (status === 'all' || role.status === status) && (permission === 'all' || role.permissionCount > 0);
  }).sort((a, b) => sortAscending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)), [permission, query, roleFilter, sortAscending, status]);
  const loading = state === 'loading';
  return <AdminShell searchPlaceholder="Search roles and team members..." user="alex" variant="operations"><main className="roles-screen"><div className="roles-sticky-header"><AdminPageHeader title="Roles & Permissions" description="Manage administrative access, permission groups, and team responsibilities across FreshMart." actions={[{ disabled: true, icon: Plus, label: 'Create Role', title: 'Coming Soon - Backend not yet available', tone: 'primary' }]} /></div><RoleSummary loading={loading} /><RolesToolbar onPermission={setPermission} onQuery={setQuery} onRole={setRoleFilter} onStatus={setStatus} permission={permission} query={query} role={roleFilter} status={status} />{state === 'error' ? <div className="roles-inline-error" role="alert"><CircleAlert aria-hidden="true" /><span><strong>Role management is unavailable.</strong>No supported roles endpoint is currently connected.</span><button onClick={() => setState('ready')} type="button"><RefreshCw aria-hidden="true" />Retry</button></div> : null}<section className="roles-content"><RolesTable items={visibleRoles} onOpen={setSelectedRole} onRetry={() => setState('ready')} onSort={() => setSortAscending((value) => !value)} sortAscending={sortAscending} state={state} /><PermissionMatrix loading={loading} /><div className="roles-lower-grid"><TeamPanel loading={loading} /><RoleActivityPanel loading={loading} /></div></section><RoleDrawer onClose={() => setSelectedRole(undefined)} role={selectedRole} /></main></AdminShell>;
};

export default RolesPage;

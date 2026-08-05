import { useEffect, useMemo, useState } from 'react';
import type { AdminCustomer } from '@freshmart/api-sdk';
import {
  BadgeCheck,
  Ban,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Download,
  Eye,
  Filter,
  MoreVertical,
  RefreshCcw,
  Search,
  Sparkles,
  UserPlus,
  UsersRound
} from 'lucide-react';
import { adminSdk, fetchAdminCustomers } from '../api/admin-api.js';
import { AdminShell } from '../components/admin-shell.js';
import { AdminResourceState } from '../components/admin-resource-state.js';
import { ComingSoon, comingSoonAction } from '../components/coming-soon.js';
import { CustomerDialog } from '../components/customer-dialog.js';
import type { CustomerDialogKind, CustomerRecord, CustomerStatus } from '../components/customer-dialog.js';
import { useApiResource } from '../hooks/use-api-resource.js';

const customerStatusMap: Record<string, CustomerStatus> = {
  ACTIVE: 'Active',
  BLOCKED: 'Blocked',
  INACTIVE: 'Blocked'
};

const membershipFor = (orderCount: number, spending: number): CustomerRecord['membership'] => {
  if (spending >= 2000 || orderCount >= 30) return 'VIP';
  if (spending >= 800 || orderCount >= 10) return 'Premium';
  return 'Standard';
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return 'Not available';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(parsed);
};

const relativeTime = (value: string | null | undefined) => {
  if (!value) return 'Not available';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const diff = Date.now() - parsed.getTime();
  if (diff < 60_000) return 'Just now';
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

const formatAddress = (value: unknown) => {
  if (!value || typeof value !== 'object') return 'Backend not available';
  const record = value as Record<string, unknown>;
  const parts = [record.line1, record.line2, record.city, record.state, record.postalCode]
    .filter((part): part is string => typeof part === 'string' && part.trim().length > 0)
    .map((part) => part.trim());
  return parts.length > 0 ? parts.join(', ') : 'Backend not available';
};

const initialsFor = (name: string | null | undefined) => {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] ?? 'F'}${parts[1]?.[0] ?? 'M'}`;
};

const mapCustomer = (customer: AdminCustomer): CustomerRecord => {
  const spending = customer.totalSpending ?? 0;
  const orderCount = customer.orderCount ?? 0;
  return {
    address: formatAddress(customer.defaultAddress) || 'Backend not available',
    email: customer.email ?? 'Not available',
    id: customer.customerId,
    image: customer.avatarUrl ?? undefined,
    initials: customer.avatarUrl ? undefined : initialsFor(customer.name),
    joined: formatDate(customer.registrationDate),
    lastActive: relativeTime(customer.lastOrderDate ?? customer.updatedAt),
    membership: membershipFor(orderCount, spending),
    name: customer.name ?? 'Unknown customer',
    notes: customer.status === 'BLOCKED' ? 'Account is currently blocked in the backend.' : 'Live customer profile from the admin service.',
    orders: orderCount,
    phone: customer.phone ?? 'Not available',
    spending: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(spending),
    status: customerStatusMap[customer.status ?? 'ACTIVE'] ?? 'Active'
  };
};

const customerSummaryFrom = (summary?: { activeCustomers: number; inactiveCustomers: number; newCustomers: number; totalCustomers: number }, customers: CustomerRecord[] = []) => {
  const totalRevenue = customers.reduce((sum, customer) => sum + Number(customer.spending.replace(/[^0-9.-]+/g, '')), 0);
  const premiumCount = customers.filter((customer) => customer.membership === 'Premium' || customer.membership === 'VIP').length;
  return [
    { icon: UsersRound, label: 'Total Customers', note: 'Live backend total', tone: 'primary', value: summary?.totalCustomers?.toLocaleString() ?? customers.length.toLocaleString() },
    { icon: BadgeCheck, label: 'Active Customers', note: 'Live backend total', tone: 'success', value: summary?.activeCustomers?.toLocaleString() ?? customers.filter((customer) => customer.status === 'Active').length.toLocaleString() },
    { icon: UserPlus, label: 'New Customers', note: 'Live backend total', tone: 'new', value: summary?.newCustomers?.toLocaleString() ?? '--' },
    { icon: Sparkles, label: 'Premium Customers', note: 'Derived from live spend', tone: 'premium', value: premiumCount.toLocaleString() },
    { icon: Ban, label: 'Blocked Customers', note: 'Live backend total', tone: 'danger', value: summary?.inactiveCustomers?.toLocaleString() ?? customers.filter((customer) => customer.status === 'Blocked').length.toLocaleString() },
    { icon: CircleDollarSign, label: 'Total Revenue', note: 'Derived from live spend', tone: 'revenue', value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalRevenue) }
  ] as const;
};

const CustomerSummary = ({ customers, summary }: { customers: CustomerRecord[]; summary?: { activeCustomers: number; inactiveCustomers: number; newCustomers: number; totalCustomers: number } }) => <section className="customer-summary" aria-label="Customer summary">{customerSummaryFrom(summary, customers).map(({ icon: Icon, label, note, tone, value }) => <article className={tone} key={label}><div><span><Icon aria-hidden="true" /></span><small>{label}</small></div><strong>{value}</strong><p>{note}</p></article>)}</section>;

const CustomerStatusBadge = ({ value }: { value: CustomerStatus }) => <span className={`customer-status ${value.toLowerCase()}`}>{value}</span>;
const CustomerState = ({ onRetry, state }: { onRetry?: () => void; state: 'empty' | 'error' | 'loading' }) => state === 'loading' ? <AdminResourceState className="customer-table-state" loadingLabel="Loading customers" rows={4} secondaryText="Pulling the latest customer profiles from the admin service." state="loading" /> : state === 'error' ? <AdminResourceState className="customer-table-state" errorDescription="Try loading the customer list again." errorTitle="Customers could not be loaded" icon={UsersRound} onRetry={onRetry} state="error" /> : <AdminResourceState className="customer-table-state" emptyDescription="Adjust the filters to reveal more customer records." emptyTitle="No customers found" icon={UsersRound} secondaryText="No create action is available from this screen, but the filters remain active." state="empty" />;

const CustomersPage = () => {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [dialog, setDialog] = useState<{ customer: CustomerRecord; kind: CustomerDialogKind }>();
  const [membership, setMembership] = useState('all');
  const [menuId, setMenuId] = useState<string>();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const { data: customerResponse, retry, state } = useApiResource(() => fetchAdminCustomers({ limit: 100, page: 1, sortBy: 'registrationDate', sortOrder: 'desc' }));

  useEffect(() => {
    if (customerResponse?.data) {
      setCustomers(customerResponse.data.map(mapCustomer));
    }
  }, [customerResponse]);

  const visibleCustomers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return customers
      .filter((customer) => status === 'all' || customer.status === status)
      .filter((customer) => membership === 'all' || customer.membership === membership)
      .filter((customer) => !normalized || `${customer.name} ${customer.id} ${customer.email} ${customer.phone}`.toLowerCase().includes(normalized));
  }, [customers, membership, query, status]);

  const summary = customerResponse?.meta.summary;

  const openDialog = (kind: CustomerDialogKind, customer: CustomerRecord) => {
    setDialog({ customer, kind });
    setMenuId(undefined);
  };

  const saveCustomer = (customer: CustomerRecord) => {
    const saved = customer.id === '#CUST-NEW' ? { ...customer, id: `#CUST-${1024 + customers.length}` } : customer;
    setCustomers((current) => current.some((item) => item.id === saved.id) ? current.map((item) => item.id === saved.id ? saved : item) : [saved, ...current]);
    setDialog(undefined);
  };

  const toggleBlock = async (customer: CustomerRecord) => {
    await adminSdk.admin.updateCustomerStatus(customer.id, customer.status === 'Blocked' ? 'ACTIVE' : 'BLOCKED');
    setCustomers((current) => current.map((item) => item.id === customer.id ? { ...item, status: item.status === 'Blocked' ? 'Active' : 'Blocked' } : item));
    setDialog(undefined);
  };

  return (
    <AdminShell precision precisionVariant="customers" searchPlaceholder="Search customers, orders, or IDs..." user="main">
      <main className="customers-screen">
        <header className="customers-heading">
          <div><h1>Customer Management <ComingSoon /></h1><p>Oversee your user base, monitor activity, and handle account statuses.</p></div>
          <div><button type="button" {...comingSoonAction}><Download aria-hidden="true" />Export CSV</button><button className="primary" type="button" {...comingSoonAction}><UserPlus aria-hidden="true" />Add Customer</button></div>
        </header>
        <CustomerSummary customers={customers} summary={summary} />

        <section className="customer-toolbar" aria-label="Customer filters">
          <label><Search aria-hidden="true" /><input aria-label="Search customers" placeholder="Search Customers" type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <select aria-label="Customer status filter" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All Statuses</option><option>Active</option><option>Blocked</option></select>
          <select aria-label="Membership filter" value={membership} onChange={(event) => setMembership(event.target.value)}><option value="all">All Memberships</option><option>Standard</option><option>Premium</option><option>VIP</option></select>
          <button type="button"><CalendarDays aria-hidden="true" />Jan 1 - Dec 31, 2023</button>
          <button type="button" {...comingSoonAction}><Download aria-hidden="true" />Export</button>
          <button type="button" {...comingSoonAction}><RefreshCcw aria-hidden="true" />Refresh</button>
          <button className="icon" type="button" aria-label="More filters"><Filter aria-hidden="true" /></button>
        </section>

        <section className="customer-list-card" aria-label="Customer list">
          {state === 'loading' ? <CustomerState state="loading" /> : state === 'error' ? <CustomerState onRetry={retry} state="error" /> : visibleCustomers.length > 0 ? <div className="customer-table-scroll"><table className="customer-table"><thead><tr><th>Customer</th><th>Email</th><th>Phone</th><th>Orders</th><th>Total Spend</th><th>Membership</th><th>Status</th><th>Joined Date</th><th>Last Active</th><th aria-label="Actions" /></tr></thead><tbody>{visibleCustomers.map((customer, index) => <tr className={index === 0 ? 'selected' : ''} key={customer.id}><td><button className="customer-identity" type="button" onClick={() => openDialog('details', customer)}>{customer.image ? <img alt="" src={customer.image} /> : <span>{customer.initials}</span>}<div><strong>{customer.name}</strong><small>{customer.id}</small></div></button></td><td>{customer.email}</td><td>{customer.phone}</td><td><strong>{customer.orders}</strong></td><td className="customer-spend">{customer.spending}</td><td><span className={`customer-membership ${customer.membership.toLowerCase()}`}>{customer.membership}</span></td><td><CustomerStatusBadge value={customer.status} /></td><td>{customer.joined}</td><td>{customer.lastActive}</td><td className="customer-actions-cell"><button type="button" aria-label={`Actions for ${customer.name}`} aria-expanded={menuId === customer.id} onClick={() => setMenuId((current) => current === customer.id ? undefined : customer.id)}><MoreVertical aria-hidden="true" /></button>{menuId === customer.id ? <div className="customer-action-menu"><button type="button" onClick={() => openDialog('details', customer)}><Eye aria-hidden="true" />Customer Details</button><button type="button" {...comingSoonAction}>Edit Customer</button><button type="button" onClick={() => openDialog('orders', customer)}>Order History</button><button type="button" onClick={() => openDialog('addresses', customer)}>Address List</button><button type="button" {...comingSoonAction}>Customer Notes</button><button className={customer.status === 'Blocked' ? '' : 'danger'} type="button" onClick={() => openDialog('block', customer)}>{customer.status === 'Blocked' ? 'Unblock Customer' : 'Block Customer'}</button></div> : null}</td></tr>)}</tbody></table></div> : <CustomerState state="empty" />}
          <footer><span>Showing 1 to {visibleCustomers.length} of {summary?.totalCustomers?.toLocaleString() ?? customers.length.toLocaleString()} customers</span><nav className="customer-pagination" aria-label="Customer pages"><button disabled type="button" aria-label="Previous page"><ChevronLeft aria-hidden="true" /></button><button className="active" type="button">1</button><button type="button">2</button><button type="button">3</button><span>...</span><button type="button">1248</button><button type="button" aria-label="Next page"><ChevronRight aria-hidden="true" /></button></nav></footer>
        </section>
      </main>
      <CustomerDialog customer={dialog?.customer} kind={dialog?.kind ?? 'details'} onClose={() => setDialog(undefined)} onSave={saveCustomer} onToggleBlock={toggleBlock} open={Boolean(dialog)} />
    </AdminShell>
  );
};

export default CustomersPage;

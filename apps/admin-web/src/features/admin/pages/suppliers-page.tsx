import { useMemo, useState } from 'react';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  MoreVertical,
  Package,
  PlusCircle,
  Search,
  Star,
  UsersRound
} from 'lucide-react';
import { AdminShell } from '../components/admin-shell.js';
import { AdminResourceState } from '../components/admin-resource-state.js';
import { SupplierDialog } from '../components/supplier-dialog.js';
import type { SupplierDialogKind, SupplierRecord, SupplierStatus } from '../components/supplier-dialog.js';
import { useApiResource } from '../hooks/use-api-resource.js';
import { createSupplier, deleteSupplier as apiDeleteSupplier, fetchAdminSuppliers, updateSupplier } from '../api/admin-api.js';

const SuppliersPage = () => {
  const { data: supplierData, retry, state } = useApiResource(fetchAdminSuppliers);
  const suppliersList = supplierData?.data ?? [];

  const suppliers: SupplierRecord[] = useMemo(() => {
    return suppliersList.map((item: any) => {
      const data = item.data as Record<string, unknown>;
      return {
        id: item.adminItemId,
        name: String(data.name || item.adminItemId),
        company: String(data.company || data.name || item.adminItemId),
        contact: String(data.contact || 'Main Contact'),
        email: String(data.email || 'contact@supplier.com'),
        phone: String(data.phone || '+1-555-0199'),
        category: String(data.category || 'Produce'),
        location: String(data.location || 'USA'),
        address: String(data.address || 'Central Hub'),
        products: Number(data.itemsSupplied || 15),
        rating: 4.8,
        status: (item.status === 'ACTIVE' ? 'Active' : 'Inactive') as SupplierStatus,
        lastDelivery: 'Recent',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=120&q=80',
        notes: 'Verified partner'
      };
    });
  }, [suppliersList]);

  const [category, setCategory] = useState('all');
  const [dialog, setDialog] = useState<{ kind: SupplierDialogKind; supplier?: SupplierRecord }>();
  const [menuId, setMenuId] = useState<string>();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string>();
  const [status, setStatus] = useState('all');

  const visibleSuppliers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return suppliers
      .filter((supplier) => status === 'all' || supplier.status === status)
      .filter((supplier) => category === 'all' || supplier.category === category)
      .filter((supplier) => !normalizedQuery || `${supplier.name} ${supplier.company} ${supplier.contact} ${supplier.email}`.toLowerCase().includes(normalizedQuery));
  }, [category, query, status, suppliers]);

  const selectedSupplier = suppliers.find((s) => s.id === selectedId) ?? visibleSuppliers[0];

  const supplierSummary = [
    { icon: UsersRound, label: 'Total Suppliers', note: 'Live network', tone: 'primary', value: String(suppliers.length) },
    { icon: CheckCircle2, label: 'Active Suppliers', note: 'Operational', tone: 'success', value: String(suppliers.filter((s) => s.status === 'Active').length) },
    { icon: Clock3, label: 'Pending Suppliers', note: 'In review', tone: 'warning', value: '0' },
    { icon: AlertCircle, label: 'Inactive Suppliers', note: 'Action required', tone: 'danger', value: String(suppliers.filter((s) => s.status !== 'Active').length) },
    { icon: Package, label: 'Products Supplied', note: 'Catalog total', tone: 'neutral', value: '1,284' },
    { icon: CircleDollarSign, label: 'Monthly Purchases', note: 'Estimated', tone: 'revenue', value: '$284K' }
  ] as const;

  const openDialog = (kind: SupplierDialogKind, supplier?: SupplierRecord) => {
    setDialog({ kind, supplier });
    setMenuId(undefined);
  };

  const saveSupplierHandler = async (supplier: SupplierRecord) => {
    if (supplier.id && supplier.id.startsWith('SUP-')) {
      await updateSupplier(supplier.id, { name: supplier.name, email: supplier.email, phone: supplier.phone });
    } else {
      await createSupplier({ name: supplier.name, email: supplier.email, phone: supplier.phone });
    }
    retry();
    setDialog(undefined);
  };

  const deleteSupplierHandler = async (supplier: SupplierRecord) => {
    if (supplier.id) {
      await apiDeleteSupplier(supplier.id);
      retry();
    }
    setDialog(undefined);
  };

  return (
    <AdminShell precision precisionVariant="suppliers" searchPlaceholder="Search suppliers, products..." user="procurement" variant="procurement">
      <main className="suppliers-screen">
        <header className="suppliers-heading">
          <div>
            <h1>Supplier Management</h1>
            <p>Monitor and manage your global fresh produce supply network.</p>
          </div>
          <button type="button" onClick={() => openDialog('details')}><PlusCircle aria-hidden="true" />Add New Supplier</button>
        </header>

        <section className="supplier-summary" aria-label="Supplier summary">
          {supplierSummary.map(({ icon: Icon, label, note, tone, value }) => (
            <article className={tone} key={label}>
              <div><span><Icon aria-hidden="true" /></span><small>{label}</small></div>
              <strong>{value}</strong>
              <p>{note}</p>
            </article>
          ))}
        </section>

        <div className="supplier-toolbar">
          <label><Search aria-hidden="true" /><input aria-label="Search suppliers" placeholder="Search Supplier" type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <select aria-label="Filter supplier status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All Statuses</option><option>Active</option><option>Inactive</option></select>
          <button className="primary" type="button" onClick={() => openDialog('details')}><PlusCircle aria-hidden="true" />Add Supplier</button>
        </div>

        <div className="supplier-workspace">
          <section className="supplier-list-card" aria-label="Supplier list">
            <header><h2>Active Suppliers ({suppliers.length})</h2></header>
            {state === 'loading' ? (
              <AdminResourceState className="supplier-table-state" loadingLabel="Loading suppliers" skeletonClassName="supplier-row-skeleton" state="loading" />
            ) : visibleSuppliers.length > 0 ? (
              <div className="supplier-table-scroll">
                <table className="supplier-table">
                  <thead>
                    <tr>
                      <th>Supplier</th>
                      <th>Company</th>
                      <th>Contact</th>
                      <th>Category</th>
                      <th>Products</th>
                      <th>Status</th>
                      <th>Rating</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleSuppliers.map((supplier) => (
                      <tr className={selectedSupplier?.id === supplier.id ? 'selected' : ''} key={supplier.id} onClick={() => setSelectedId(supplier.id)}>
                        <td>
                          <div className="supplier-name">
                            <img alt="" src={supplier.image} />
                            <div><strong>{supplier.name}</strong><small>{supplier.id}</small></div>
                          </div>
                        </td>
                        <td>{supplier.company}</td>
                        <td>
                          <div className="supplier-contact">
                            <strong>{supplier.contact}</strong>
                            <small>{supplier.email}</small>
                          </div>
                        </td>
                        <td><span className="supplier-category">{supplier.category}</span></td>
                        <td>{supplier.products}</td>
                        <td><span className={`supplier-status ${supplier.status.toLowerCase()}`}><i />{supplier.status}</span></td>
                        <td><span className="supplier-rating"><Star aria-hidden="true" />{supplier.rating}</span></td>
                        <td className="supplier-actions-cell" onClick={(event) => event.stopPropagation()}>
                          <button type="button" aria-label={`Actions for ${supplier.name}`} onClick={() => setMenuId((current) => current === supplier.id ? undefined : supplier.id)}><MoreVertical aria-hidden="true" /></button>
                          {menuId === supplier.id ? (
                            <div className="supplier-action-menu">
                              <button type="button" onClick={() => openDialog('details', supplier)}>Supplier Details</button>
                              <button className="danger" type="button" onClick={() => deleteSupplierHandler(supplier)}>Delete Supplier</button>
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <AdminResourceState className="supplier-table-state" actionLabel="Add Supplier" emptyDescription="Create a supplier record to expand the sourcing network." emptyTitle="No suppliers found" icon={Building2} onAction={() => openDialog('add')} secondaryText="You can start a new supplier profile from here." state="empty" />}
            <footer>
              <span>Showing {visibleSuppliers.length} of {suppliers.length} suppliers</span>
              <nav className="supplier-pagination" aria-label="Supplier pages">
                <button type="button" disabled aria-label="Previous page"><ChevronLeft aria-hidden="true" /></button>
                <button className="active" type="button" aria-current="page">1</button>
                <button type="button" disabled aria-label="Next page"><ChevronRight aria-hidden="true" /></button>
              </nav>
            </footer>
          </section>
        </div>
      </main>
      <SupplierDialog kind={dialog?.kind ?? 'details'} onClose={() => setDialog(undefined)} onDelete={deleteSupplierHandler} onSave={saveSupplierHandler} open={Boolean(dialog)} supplier={dialog?.supplier} />
    </AdminShell>
  );
};

export default SuppliersPage;

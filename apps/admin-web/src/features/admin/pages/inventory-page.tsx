import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Archive,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  MoreVertical,
  RefreshCcw,
  Search,
  TrendingUp
} from 'lucide-react';
import { AdminShell } from '../components/admin-shell.js';
import { AdminResourceState } from '../components/admin-resource-state.js';
import { InventoryDialog } from '../components/inventory-dialog.js';
import type { InventoryDialogKind, InventoryRecord } from '../components/inventory-dialog.js';
import { fetchInventoryWorkspace, updateInventory } from '../api/admin-api.js';
import { useApiResource } from '../hooks/use-api-resource.js';

type InventoryLoadState = 'loading' | 'ready' | 'empty' | 'error';

const InventorySummary = ({ items, total }: { items: InventoryRecord[]; total: number }) => {
  const stats = [
    { title: 'Total Products', value: total.toLocaleString(), note: 'Live inventory records', icon: Archive, tone: 'primary' },
    { title: 'In Stock', value: items.filter((item) => item.status === 'In Stock').length.toLocaleString(), note: 'Loaded inventory', icon: CheckCircle2, tone: 'success' },
    { title: 'Low Stock', value: items.filter((item) => item.status === 'Low Stock').length.toLocaleString(), note: 'Requires Attention', icon: AlertTriangle, tone: 'warning' },
    { title: 'Out of Stock', value: items.filter((item) => item.status === 'Out of Stock').length.toLocaleString(), note: 'Urgent Restock', icon: AlertCircle, tone: 'danger' }
  ];
  return (
  <section className="inventory-summary" aria-label="Inventory summary">
    {stats.map(({ icon: Icon, note, title, tone, value }) => (
      <article className={tone} key={title}>
        <div><h2>{title}</h2><span><Icon aria-hidden="true" /></span></div>
        <strong>{value}</strong>
        <p>{title === 'Total Products' ? <TrendingUp aria-hidden="true" /> : null}{note}</p>
      </article>
    ))}
  </section>
  );
};

const InventoryToolbar = ({
  query,
  setQuery,
  status,
  setStatus,
  warehouse,
  setWarehouse,
  sort,
  setSort
}: {
  query: string;
  setQuery: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  warehouse: string;
  setWarehouse: (value: string) => void;
  sort: string;
  setSort: (value: string) => void;
}) => (
  <div className="inventory-toolbar">
    <label><Search aria-hidden="true" /><input aria-label="Search inventory" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search inventory" /></label>
    <select aria-label="Filter by warehouse" value={warehouse} onChange={(event) => setWarehouse(event.target.value)}><option value="all">All Warehouses</option><option>Central Hub</option><option>Metro Express</option><option>Regional DC</option></select>
    <select aria-label="Filter by stock status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All Statuses</option><option>In Stock</option><option>Low Stock</option><option>Out of Stock</option></select>
    <select aria-label="Sort inventory" value={sort} onChange={(event) => setSort(event.target.value)}><option value="default">Sort: Default</option><option value="stock">Sort: Stock</option><option value="updated">Sort: Updated</option></select>
    <button type="button" aria-label="More filters"><Filter aria-hidden="true" /></button>
  </div>
);

const InventoryStatus = ({ value }: { value: InventoryRecord['status'] }) => <span className={`inventory-status ${value.toLowerCase().replaceAll(' ', '-')}`}><i />{value}</span>;

const InventoryTableState = ({ onRetry, state }: { onRetry: () => void; state: Exclude<InventoryLoadState, 'ready'> }) => <AdminResourceState className="inventory-table-state" actionLabel="Refresh Inventory" emptyDescription="Refresh the inventory feed or broaden the warehouse filters." emptyTitle="No inventory items found" errorDescription="Try loading the inventory list again." errorTitle="Inventory could not be loaded" icon={Archive} loadingLabel="Loading inventory" onAction={onRetry} onRetry={onRetry} secondaryText="New products automatically appear here once the backend responds." skeletonClassName="inventory-row-skeleton" state={state} />;

const InventoryWidgets = ({ items }: { items: InventoryRecord[] }) => {
  const recentlyUpdated = items.slice(0, 3);
  const totalAvailable = items.reduce((total, item) => total + item.available, 0);
  const totalReserved = items.reduce((total, item) => total + item.reserved, 0);

  return (
    <section className="inventory-widgets" aria-label="Inventory widgets">
      <article>
        <header><h2>Recently Updated</h2><span>Live</span></header>
        <div>{recentlyUpdated.map((item) => <div key={item.sku}><img alt="" src={item.image} /><span><strong>{item.name}</strong><small>{item.lastUpdated}</small></span><b>{item.current}</b></div>)}</div>
      </article>
      <article>
        <header><h2>Quick Inventory Stats</h2></header>
        <dl>
          <div><dt>Available Units</dt><dd>{totalAvailable.toLocaleString()}</dd></div>
          <div><dt>Reserved Units</dt><dd>{totalReserved.toLocaleString()}</dd></div>
          <div><dt>Warehouses</dt><dd>Coming Soon - Backend not yet available</dd></div>
          <div><dt>Updated Today</dt><dd>Coming Soon - Backend not yet available</dd></div>
        </dl>
      </article>
    </section>
  );
};

const InventoryPagination = ({ onPage, page, total }: { onPage: (page: number) => void; page: number; total: number }) => {
  const pages = Math.max(1, Math.ceil(total / 10));
  return <nav className="inventory-pagination" aria-label="Inventory pages"><button type="button" disabled={page === 1} onClick={() => onPage(page - 1)} aria-label="Previous page"><ChevronLeft aria-hidden="true" /></button><button className="active" type="button" aria-current="page">{page}</button>{page < pages ? <button type="button" onClick={() => onPage(page + 1)}>{page + 1}</button> : null}<button type="button" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page"><ChevronRight aria-hidden="true" /></button></nav>;
};

const InventoryPage = () => {
  const [dialog, setDialog] = useState<{ kind: InventoryDialogKind; item: InventoryRecord }>();
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [inventoryTotal, setInventoryTotal] = useState(0);
  const [menuSku, setMenuSku] = useState<string>();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('default');
  const [status, setStatus] = useState('all');
  const [warehouse, setWarehouse] = useState('all');
  const loadInventoryPage = useCallback(() => fetchInventoryWorkspace(page), [page]);
  const { data: workspace, retry, state: loadState } = useApiResource(loadInventoryPage);

  useEffect(() => {
    if (workspace) {
      const { inventory: inventoryResponse, products } = workspace;
      const productById = new Map(products.map((product) => [product.productId, product]));
      const records = inventoryResponse.items.map((item, index): InventoryRecord => {
        const product = productById.get(item.productId);
        const current = Number(item.currentStock || 0);
        const reserved = Number(item.reservedStock || 0);
        const reorderLevel = Number(item.minimumStock || 0);
        return {
          available: typeof item.availableStock === 'number' ? item.availableStock : Math.max(0, current - reserved),
          category: product?.category ?? 'UNCATEGORIZED',
          current,
          image: product?.images[0] ?? '',
          lastUpdated: item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'Not available',
          name: product?.productName ?? item.productId,
          reorderLevel,
          reserved,
          sku: item.productId,
          status: current === 0 ? 'Out of Stock' : current <= reorderLevel ? 'Low Stock' : 'In Stock',
          subtitle: product?.brand || product?.description || item.unit || 'Inventory item',
          unit: item.unit ?? undefined,
      warehouse: 'Coming Soon - Backend not yet available'
        };
      });
      setInventory(records);
      setInventoryTotal(inventoryResponse.total);
    }
  }, [workspace]);

  const visibleInventory = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return inventory
      .filter((item) => warehouse === 'all' || item.warehouse === warehouse)
      .filter((item) => status === 'all' || item.status === status)
      .filter((item) => !normalizedQuery || `${item.name} ${item.sku} ${item.category}`.toLowerCase().includes(normalizedQuery))
      .sort((left, right) => sort === 'stock' ? left.current - right.current : sort === 'updated' ? right.lastUpdated.localeCompare(left.lastUpdated) : 0);
  }, [inventory, query, sort, status, warehouse]);
  const effectiveState: InventoryLoadState = loadState === 'ready' && visibleInventory.length === 0 ? 'empty' : loadState;

  const saveItem = async (item: InventoryRecord) => {
    if (dialog?.kind === 'update') {
      try {
        await updateInventory(item.sku, {
          currentStock: item.current,
          minimumStock: item.reorderLevel,
          unit: item.unit || 'unit'
        });
        setInventory((current) => current.map((candidate) => candidate.sku === item.sku ? item : candidate));
        setDialog(undefined);
      } catch {
        retry();
      }
    }
  };

  return (
    <AdminShell precision precisionVariant="inventory" searchPlaceholder="Search SKU, Product Name..." user="alex" variant="operations">
      <main className="inventory-screen">
        <header className="inventory-heading">
          <div><h1>Inventory Management</h1><p>Real-time tracking and stock optimization across all warehouses.</p></div>
          <div><button type="button"><Download aria-hidden="true" />Export</button><button className="primary" type="button" disabled={!inventory[0]} onClick={() => inventory[0] && setDialog({ kind: 'update', item: inventory[0] })}><RefreshCcw aria-hidden="true" />Update Stock</button></div>
        </header>
        <InventorySummary items={inventory} total={inventoryTotal} />

        <section className="inventory-table-card" aria-label="Inventory list">
          <header><div><h2>Inventory List</h2><span>{inventoryTotal.toLocaleString()} SKUs Total</span></div><button type="button"><Download aria-hidden="true" />Export</button></header>
          <InventoryToolbar query={query} setQuery={setQuery} sort={sort} setSort={setSort} status={status} setStatus={setStatus} warehouse={warehouse} setWarehouse={setWarehouse} />
          {effectiveState === 'ready' ? (
            <div className="inventory-table-scroll">
              <table className="inventory-table">
                <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Current Stock</th><th>Reserved Stock</th><th>Available Stock</th><th>Reorder Level</th><th>Warehouse</th><th>Last Updated</th><th>Stock Status</th><th aria-label="Actions" /></tr></thead>
                <tbody>{visibleInventory.map((item) => (
                  <tr key={item.sku}>
                    <td><div className="inventory-product"><img alt="" src={item.image} /><span><strong>{item.name}</strong><small>{item.subtitle}</small></span></div></td>
                    <td className="inventory-sku">{item.sku}</td>
                    <td><span className="inventory-category">{item.category}</span></td>
                    <td><strong className={item.status !== 'In Stock' ? 'danger' : ''}>{item.current.toLocaleString()}</strong></td>
                    <td>{item.reserved.toLocaleString()}</td><td>{item.available.toLocaleString()}</td><td>{item.reorderLevel.toLocaleString()}</td><td>{item.warehouse}</td><td className="inventory-updated">{item.lastUpdated}</td>
                    <td><InventoryStatus value={item.status} /></td>
                    <td className="inventory-menu-cell"><button type="button" aria-label={`Actions for ${item.name}`} onClick={() => setMenuSku((current) => current === item.sku ? undefined : item.sku)}><MoreVertical aria-hidden="true" /></button>{menuSku === item.sku ? <div className="inventory-action-menu"><button type="button" onClick={() => { setDialog({ kind: 'details', item }); setMenuSku(undefined); }}>Stock Details</button><button type="button" onClick={() => { setDialog({ kind: 'update', item }); setMenuSku(undefined); }}>Update Stock</button><button type="button" disabled title="Coming Soon - Backend not yet available">Adjust Inventory</button><button type="button" onClick={() => { setDialog({ kind: 'history', item }); setMenuSku(undefined); }}>Stock History</button><button className="danger" type="button" disabled title="Coming Soon - Backend not yet available">Delete Item</button></div> : null}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : <InventoryTableState onRetry={retry} state={effectiveState} />}
          <footer><span>Showing {visibleInventory.length === 0 ? 0 : (page - 1) * 10 + 1}-{Math.min(page * 10, inventoryTotal)} of {inventoryTotal.toLocaleString()} products</span><InventoryPagination onPage={setPage} page={page} total={inventoryTotal} /></footer>
        </section>
        <InventoryWidgets items={inventory} />
      </main>
      <InventoryDialog item={dialog?.item} kind={dialog?.kind ?? 'details'} onClose={() => setDialog(undefined)} onDelete={() => undefined} onSave={saveItem} open={Boolean(dialog)} />
    </AdminShell>
  );
};

export default InventoryPage;

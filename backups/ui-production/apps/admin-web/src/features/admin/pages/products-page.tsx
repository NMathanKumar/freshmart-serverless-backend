import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import type { ProductSummary } from '@freshmart/api-sdk';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  ListFilter,
  PackageSearch,
  Pencil,
  PlusCircle,
} from 'lucide-react';
import { AdminShell } from '../components/admin-shell.js';
import { AdminResourceState } from '../components/admin-resource-state.js';
import { comingSoonAction } from '../components/coming-soon.js';
import { ProductDialog } from '../components/product-dialog.js';
import { productMetrics, productRows } from '../model/mock-data.js';
import { createProduct, fetchProductPage, updateProduct, type ProductInput } from '../api/admin-api.js';
import { useApiResource } from '../hooks/use-api-resource.js';

type ProductLoadState = 'loading' | 'ready' | 'empty' | 'error';
type ProductRow = (typeof productRows)[number];
const noProducts = (page: Awaited<ReturnType<typeof fetchProductPage>>) => page.items.length === 0;

const ProductSummary = () => (
  <section className="product-summary" aria-label="Product statistics">
    {productMetrics.map((metric) => (
      <article key={metric.title}>
        <h2>{metric.title}</h2>
        <div>
          <strong className={metric.title === 'LOW STOCK ALERT' ? 'danger' : ''}>{metric.value}</strong>
          <span className={metric.title === 'TOTAL PRODUCTS' || metric.title === 'ACTIVE STOCK' ? 'success' : ''}>Coming Soon - Backend not yet available</span>
        </div>
      </article>
    ))}
  </section>
);

const ProductToolbar = () => (
  <div className="product-toolbar">
    <div>
      <select aria-label="Filter by category" defaultValue="all">
        <option value="all">All Categories</option>
        <option value="produce">Fresh Produce</option>
        <option value="dairy">Dairy &amp; Eggs</option>
        <option value="pantry">Pantry</option>
        <option value="beverages">Beverages</option>
      </select>
      <select aria-label="Filter by status" defaultValue="all">
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="draft">Draft</option>
      </select>
      <button type="button"><ListFilter aria-hidden="true" />More Filters</button>
    </div>
    <button type="button"><Download aria-hidden="true" />Export</button>
  </div>
);

const ProductTableState = ({ onRetry, state }: { onRetry: () => void; state: Exclude<ProductLoadState, 'ready'> }) => <AdminResourceState className="product-table-state" emptyDescription="Adjust the filters to view more products." emptyTitle="No products found" errorDescription="Try refreshing the product list." errorTitle="Products could not be loaded" icon={PackageSearch} loadingLabel="Loading products" onRetry={onRetry} skeletonClassName="product-row-skeleton" state={state} />;

const ProductStatus = ({ value }: { value: string }) => (
  <span className={`product-status ${value.toLowerCase()}`}><i />{value}</span>
);

const ProductPagination = ({ canNext, canPrevious, onNext, onPrevious, page }: { canNext: boolean; canPrevious: boolean; onNext: () => void; onPrevious: () => void; page: number }) => (
  <nav className="product-pagination" aria-label="Product pages">
    <button type="button" disabled={!canPrevious} onClick={onPrevious} aria-label="Previous page"><ChevronLeft aria-hidden="true" /></button>
    <button className="active" type="button" aria-current="page">{page}</button>
    <button type="button" disabled={!canNext} onClick={onNext} aria-label="Next page"><ChevronRight aria-hidden="true" /></button>
  </nav>
);

const ProductTable = ({ canNext, canPrevious, onEdit, onNext, onPrevious, onRetry, page, rows, state }: { canNext: boolean; canPrevious: boolean; onEdit: (productId: string) => void; onNext: () => void; onPrevious: () => void; onRetry: () => void; page: number; rows: ProductRow[]; state: ProductLoadState }) => (
  <section className="product-table-card" aria-label="Products">
    <ProductToolbar />
    {state === 'ready' ? (
      <div className="product-table-scroll">
        <table className="product-table">
          <thead>
            <tr>
              <th><input aria-label="Select all products" type="checkbox" /></th>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((product) => (
              <tr key={product.sku}>
                <td><input aria-label={`Select ${product.name}`} type="checkbox" /></td>
                <td>
                  <div className="product-cell">
                    <img alt="" src={product.image} />
                    <div><strong>{product.name}</strong><span>{product.subtitle}</span></div>
                  </div>
                </td>
                <td className="product-sku">{product.sku}</td>
                <td><span className="product-category">{product.category}</span></td>
                <td><strong>{product.price}</strong></td>
                <td>
                  <div className="product-stock">
                    <strong>{product.stock}</strong>
                    <span><i className={product.danger ? 'danger' : ''} style={{ width: `${product.progress}%` }} /></span>
                  </div>
                </td>
                <td><ProductStatus value={product.status} /></td>
                <td>
                  <div className="product-actions">
                    <button type="button" aria-label={`Edit ${product.name}`} onClick={() => onEdit(product.sku)}><Pencil aria-hidden="true" /></button>
                    <button type="button" aria-label={`Duplicate ${product.name}`} {...comingSoonAction}><Copy aria-hidden="true" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : <ProductTableState onRetry={onRetry} state={state} />}
    <footer>
      <span>Showing {rows.length === 0 ? 0 : 1} to {rows.length} of {rows.length} loaded products</span>
      <ProductPagination canNext={canNext} canPrevious={canPrevious} onNext={onNext} onPrevious={onPrevious} page={page} />
    </footer>
  </section>
);

const ProductsPage = () => {
  const [cursor, setCursor] = useState<string>();
  const [cursorHistory, setCursorHistory] = useState<Array<string | undefined>>([]);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const loadProductPage = useCallback(() => fetchProductPage(cursor, deferredQuery), [cursor, deferredQuery]);
  const { data: productPage, retry, state } = useApiResource(loadProductPage, noProducts);
  const products = productPage?.items ?? [];
  const [dialogProduct, setDialogProduct] = useState<ProductSummary | null>();
  const rows = useMemo((): ProductRow[] => products.map((product, index) => {
        const stock = Number(product.stock || 0);
        return {
          image: product.images[0] ?? productRows[index % productRows.length]?.image ?? '',
          name: product.productName,
          subtitle: product.brand || product.description || [product.weight, product.unit].filter(Boolean).join(' ') || 'Product',
          sku: product.productId,
          category: product.category,
          price: new Intl.NumberFormat('en-US', { currency: 'USD', style: 'currency' }).format(product.price),
          stock,
          progress: Math.min(100, Math.round((stock / 200) * 100)),
          ...(stock <= 20 ? { danger: true } : {}),
          status: product.available ? 'ACTIVE' : 'INACTIVE'
        };
      }), [products]);
  const loadState = state as ProductLoadState;
  const saveProduct = async (payload: ProductInput) => {
    if (dialogProduct) await updateProduct(dialogProduct.productId, payload);
    else await createProduct(payload);
    setDialogProduct(undefined);
    retry();
  };
  const nextPage = () => {
    if (!productPage?.nextCursor) return;
    setCursorHistory((current) => [...current, cursor]);
    setCursor(productPage.nextCursor);
  };
  const previousPage = () => {
    setCursor(cursorHistory.at(-1));
    setCursorHistory((current) => current.slice(0, -1));
  };
  const searchProducts = (value: string) => {
    setQuery(value);
    setCursor(undefined);
    setCursorHistory([]);
  };

  return (
    <AdminShell
      precision
      precisionVariant="products"
      onSearch={searchProducts}
      searchPlaceholder="Search products, SKUs..."
      user="catalog"
      variant="catalog"
    >
      <main className="products-screen">
        <header className="products-heading">
          <div>
            <h1>Product Management</h1>
            <p>Manage your inventory, pricing, and stock levels across all categories.</p>
          </div>
          <button type="button" onClick={() => setDialogProduct(null)}><PlusCircle aria-hidden="true" />Add Product</button>
        </header>
        <ProductSummary />
        <ProductTable canNext={Boolean(productPage?.nextCursor)} canPrevious={cursorHistory.length > 0} onEdit={(productId) => setDialogProduct(products.find((product) => product.productId === productId) ?? null)} onNext={nextPage} onPrevious={previousPage} onRetry={retry} page={cursorHistory.length + 1} rows={rows} state={loadState} />
      </main>
      <ProductDialog onClose={() => setDialogProduct(undefined)} onSave={saveProduct} open={dialogProduct !== undefined} product={dialogProduct} />
    </AdminShell>
  );
};

export default ProductsPage;

import { useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ClipboardCheck,
  Grid2x2,
  MoreVertical,
  Plus,
  Search
} from 'lucide-react';
import { AdminShell } from '../components/admin-shell.js';
import { AdminResourceState } from '../components/admin-resource-state.js';
import { CategoryDialog } from '../components/category-dialog.js';
import type { CategoryDialogKind, CategoryRecord } from '../components/category-dialog.js';
import { useApiResource } from '../hooks/use-api-resource.js';
import { createCategory, deleteCategory as apiDeleteCategory, fetchAdminCategories, updateCategory } from '../api/admin-api.js';

type CategoryStat = {
  badge?: string;
  icon: LucideIcon;
  title: string;
  tone: 'primary' | 'secondary' | 'danger' | 'neutral';
  value: string;
};

const CategoriesPage = () => {
  const { data: categoryData, retry, state } = useApiResource(fetchAdminCategories);
  const categoriesList = categoryData?.data ?? [];

  const categories: CategoryRecord[] = useMemo(() => {
    return categoriesList.map((item: any) => {
      const data = (item.data || {}) as Record<string, unknown>;
      return {
        id: item.adminItemId,
        name: String(data.name || item.adminItemId),
        description: String(data.description || 'Category'),
        products: String(data.products || '0'),
        active: item.status === 'ACTIVE',
        image: String(data.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=120&q=80'),
        createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent',
        updatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'Recent'
      };
    });
  }, [categoriesList]);

  const [dialog, setDialog] = useState<{ kind: CategoryDialogKind; category?: CategoryRecord }>();
  const [filter, setFilter] = useState('all');
  const [menuId, setMenuId] = useState<string>();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('default');

  const categoryStats: CategoryStat[] = [
    { title: 'Total Categories', value: String(categories.length), badge: '+Live', icon: Grid2x2, tone: 'primary' },
    { title: 'Categorized Products', value: String(categories.reduce((acc, c) => acc + Number(c.products), 0)), icon: ClipboardCheck, tone: 'secondary' },
    { title: 'Active Status', value: String(categories.filter((c) => c.active).length), icon: BadgeCheck, tone: 'danger' },
    { title: 'Avg. Depth', value: '--', icon: ChevronsUpDown, tone: 'neutral' }
  ];

  const visibleCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return categories
      .filter((category) => filter === 'all' || (filter === 'active' ? category.active : !category.active))
      .filter((category) => !normalizedQuery || `${category.name} ${category.description} ${category.id}`.toLowerCase().includes(normalizedQuery))
      .sort((left, right) => sort === 'default'
        ? 0
        : sort === 'products'
        ? Number(right.products) - Number(left.products)
        : sort === 'updated'
          ? right.updatedAt.localeCompare(left.updatedAt)
          : left.name.localeCompare(right.name));
  }, [categories, filter, query, sort]);

  const closeDialog = () => setDialog(undefined);
  const saveCategoryHandler = async (category: CategoryRecord) => {
    if (dialog?.kind === 'add') {
      await createCategory({ name: category.name, description: category.description });
    } else if (category.id) {
      await updateCategory(category.id, { name: category.name, description: category.description });
    }
    retry();
    closeDialog();
  };
  const deleteCategoryHandler = async (category: CategoryRecord) => {
    if (category.id) {
      await apiDeleteCategory(category.id);
      retry();
    }
    closeDialog();
  };

  return (
    <AdminShell precision precisionVariant="categories" searchPlaceholder="Search categories..." user="categories" variant="catalog">
      <main className="categories-screen">
        <header className="categories-heading">
          <div>
            <nav aria-label="Breadcrumb"><span>Admin</span><span>/</span><strong>Categories</strong></nav>
            <h1>Category Management</h1>
            <p>Organize and manage your product hierarchy</p>
          </div>
          <div>
            <button className="primary" type="button" onClick={() => setDialog({ kind: 'add' })}><Plus aria-hidden="true" />Add Category</button>
          </div>
        </header>

        <section className="category-summary" aria-label="Category statistics">
          {categoryStats.map(({ badge, icon: Icon, title, tone, value }) => (
            <article key={title}>
              <div>
                <span className={`category-summary-icon ${tone}`}><Icon aria-hidden="true" /></span>
                {badge ? <strong className="category-summary-badge">{badge}</strong> : null}
              </div>
              <h2>{title}</h2>
              <p>{value}</p>
            </article>
          ))}
        </section>

        <div className="category-toolbar">
          <label className="category-toolbar-search">
            <Search aria-hidden="true" />
            <input aria-label="Search category table" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search categories" />
          </label>
          <select aria-label="Filter categories" value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select aria-label="Sort categories" value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="default">Sort: Default</option>
            <option value="name">Sort: Name</option>
            <option value="products">Sort: Products</option>
            <option value="updated">Sort: Updated</option>
          </select>
        </div>

        <section className="category-table-card" aria-label="Categories">
          {state === 'loading' ? (
            <AdminResourceState className="category-table-state" loadingLabel="Loading categories" skeletonClassName="category-row-skeleton" state="loading" />
          ) : visibleCategories.length > 0 ? (
            <div className="category-table-scroll">
              <table className="category-table">
                <thead>
                  <tr>
                    <th><input aria-label="Select all" type="checkbox" /></th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Products</th>
                    <th>Status</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleCategories.map((category) => (
                    <tr key={category.id}>
                      <td><input aria-label={`Select ${category.name}`} type="checkbox" /></td>
                      <td>
                        <div className="category-name-cell">
                          <img alt="" src={category.image} />
                          <div><strong>{category.name}</strong><span>ID: {category.id}</span></div>
                        </div>
                      </td>
                      <td className="category-description">{category.description}</td>
                      <td><span className="category-product-count">{category.products}</span></td>
                      <td>
                        <span className={`status-pill ${category.active ? 'active' : 'inactive'}`}>
                          {category.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="category-date">{category.updatedAt}</td>
                      <td className="category-menu-cell">
                        <button type="button" aria-label={`Actions for ${category.name}`} onClick={() => setMenuId((current) => current === category.id ? undefined : category.id)}><MoreVertical aria-hidden="true" /></button>
                        {menuId === category.id ? (
                          <div className="category-action-menu">
                            <button type="button" onClick={() => { setDialog({ kind: 'details', category }); setMenuId(undefined); }}>View Details</button>
                            <button type="button" onClick={() => { setDialog({ kind: 'edit', category }); setMenuId(undefined); }}>Edit</button>
                            <button className="danger" type="button" onClick={() => { deleteCategoryHandler(category); setMenuId(undefined); }}>Delete</button>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <AdminResourceState
              actionLabel="Add Category"
              className="category-table-state"
              emptyDescription="Create a category to keep product hierarchy easy to scan."
              emptyTitle="No categories found"
              icon={Grid2x2}
              onAction={() => setDialog({ kind: 'add' })}
              secondaryText="Use the primary action to create a new category."
              state="empty"
            />
          )}
          <footer>
            <span>Showing {visibleCategories.length} of {categories.length} categories</span>
            <nav className="category-pagination" aria-label="Category pages">
              <button type="button" disabled aria-label="Previous page"><ChevronLeft aria-hidden="true" /></button>
              <button className="active" type="button" aria-current="page">1</button>
              <button type="button" disabled aria-label="Next page"><ChevronRight aria-hidden="true" /></button>
            </nav>
          </footer>
        </section>
      </main>

      <CategoryDialog
        category={dialog?.category}
        kind={dialog?.kind ?? 'add'}
        onClose={closeDialog}
        onDelete={deleteCategoryHandler}
        onSave={saveCategoryHandler}
        open={Boolean(dialog)}
      />
    </AdminShell>
  );
};

export default CategoriesPage;

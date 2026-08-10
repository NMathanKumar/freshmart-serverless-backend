import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Trash2,
  AlertCircle,
  RefreshCw,
  FolderTree,
} from 'lucide-react';
import { useCategories, useDeleteCategory, useUpdateCategory } from '../hooks/useCategories';
import { Switch } from '@/shared/components/ui/switch';
import { Skeleton, CardSkeleton, TableSkeleton } from '@/shared/components/ui/skeleton';
import { useToast } from '@/shared/components/ui/toast';
import { ErrorState, EmptyState } from '@/shared/components/ui';
import { isAdmin } from '@freshmart/shared';
import { CategoryModal } from '../components/CategoryModal';
import { CategoryModel } from '../services/category.service';

export const CategoriesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryModel | null>(null);
  const { showToast } = useToast();

  // Debounce search by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: categories, isLoading, isError, error, refetch } = useCategories({
    search: debouncedSearch,
    page,
    limit: 10,
  });

  const deleteCategoryMutation = useDeleteCategory();
  const updateCategoryMutation = useUpdateCategory();

  const userIsAdmin = isAdmin();

  const handleDelete = (id: string, name: string) => {
    if (!userIsAdmin) {
      showToast('403 Access Denied: Admin authorization required.', 'error');
      return;
    }
    if (confirm(`Are you sure you want to delete category "${name}"?`)) {
      deleteCategoryMutation.mutate(id, {
        onSuccess: () => showToast('Category deleted successfully', 'success'),
        onError: (err) => showToast(err.message || 'Failed to delete category', 'error'),
      });
    }
  };

  const handleToggleStatus = (id: string, currentActive: boolean) => {
    if (!userIsAdmin) {
      showToast('403 Access Denied: Admin authorization required to modify categories.', 'error');
      return;
    }
    updateCategoryMutation.mutate({
      id,
      input: { status: currentActive ? 'INACTIVE' : 'ACTIVE' },
    }, {
      onSuccess: () => showToast('Category status updated', 'success'),
      onError: (err) => showToast(err.message || 'Failed to update category status', 'error'),
    });
  };

  const displayCategories = categories && categories.length > 0 ? categories : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56 rounded-xl" />
            <Skeleton className="h-4 w-96 rounded-md" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <TableSkeleton rows={5} columns={6} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="my-12 max-w-lg mx-auto">
        <ErrorState
          title="Failed to load category taxonomy"
          description={error?.message || 'Server connection error'}
          onRetry={() => refetch()}
          errorCode={error?.code}
          correlationId={error?.correlationId}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-slate-400">Admin / Categories</span>
          <h1 className="text-2xl font-extrabold text-[#0f172a] mt-0.5">Category Management</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Organize product taxonomies, hierarchy levels, and store display departments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e8f3e5] text-xs font-bold text-[#0f172a] border border-[#d4e8d1] hover:bg-[#dcefd8] transition-colors">
            <FolderTree className="w-4 h-4 text-slate-600" />
            <span>Bulk Actions</span>
          </button>
          <button
            onClick={() => {
              if (!userIsAdmin) {
                alert('403 Access Denied: Admin authorization required to add categories.');
              } else {
                setSelectedCategory(null);
                setIsModalOpen(true);
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#04883b] text-xs font-bold text-white shadow-md shadow-[#04883b]/20 hover:bg-[#037030] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            TOTAL CATEGORIES
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-[#0f172a]">{displayCategories.length}</span>
            <span className="text-[11px] font-bold text-[#04883b] bg-[#e6f7ec] px-2 py-0.5 rounded-full">
              Taxonomy
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            CATEGORIZED PRODUCTS
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-[#0f172a]">
              {displayCategories.reduce((acc, c) => acc + (c.productCount || 0), 0).toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
              Assigned
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            ACTIVE STATUS
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-[#0f172a]">
              {displayCategories.filter((c) => c.status === 'ACTIVE').length}
            </span>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Live
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            INACTIVE / DRAFT
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-[#0f172a]">
              {displayCategories.filter((c) => c.status !== 'ACTIVE').length}
            </span>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              Hidden
            </span>
          </div>
        </div>
      </div>

      {/* Category Table Card */}
      <div className="bg-white rounded-2xl border border-[#e9f2e7] shadow-sm overflow-hidden">
        {/* Search Bar Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search category name..."
              className="w-full bg-[#f0f7ee] border border-[#e0ede0] rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#04883b] transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#f0f7ee] text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4 w-10 text-center">
                  <input type="checkbox" className="rounded border-slate-300 text-[#04883b]" />
                </th>
                <th className="px-6 py-4">CATEGORY</th>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">PRODUCTS</th>
                <th className="px-6 py-4 text-center">STATUS</th>
                <th className="px-6 py-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {displayCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-0">
                    <EmptyState 
                      title="No categories found" 
                      description="Create a new category to organize your products." 
                      icon={<FolderTree className="w-8 h-8 text-slate-300 mx-auto" />} 
                    />
                  </td>
                </tr>
              ) : (
                displayCategories.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-center">
                    <input type="checkbox" className="rounded border-slate-300 text-[#04883b]" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={c.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80'}
                        alt={c.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-100 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-[#0f172a]">{c.name}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{c.description || 'No description'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-600">{c.id}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#e6f7ec] text-[#04883b]">
                      {c.productCount} Products
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Switch
                      checked={c.status === 'ACTIVE'}
                      onChange={() => handleToggleStatus(c.id, c.status === 'ACTIVE')}
                      size="sm"
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-400">
                      <button 
                        onClick={() => {
                          setSelectedCategory(c);
                          setIsModalOpen(true);
                        }}
                        className="p-1 hover:text-[#04883b]"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        className="p-1 hover:text-rose-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-1 hover:text-slate-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-[#f4fcf0]/50">
          <span>
            {displayCategories.length === 0
              ? 'Showing 0 categories'
              : `Showing ${ (page - 1) * 10 + 1 } to ${Math.min(page * 10, displayCategories.length)} of ${displayCategories.length} categories`}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-bold text-[#04883b] bg-[#e6f7ec] rounded-lg">
              Page {page}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={displayCategories.length < 10}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
      />
    </div>
  );
};

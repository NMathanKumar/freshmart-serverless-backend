import React, { useState, useEffect } from 'react';
import {
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Search,
  Package,
  SlidersHorizontal,
} from 'lucide-react';
import { useInventory } from '../hooks/useInventory';
import { type InventoryModel } from '../services/inventory.service';
import { Skeleton, CardSkeleton, TableSkeleton } from '@/shared/components/ui/skeleton';
import { freshmartSdk } from '../../../lib/sdk';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { ErrorState } from '@/shared/components/ui/error-state';
import { Logger } from '@/shared/utils/logger';
import { AdjustmentModal } from '../components/AdjustmentModal';
import { Select } from '@/shared/components/ui/select';
import { isAdmin } from '@freshmart/shared';

import { AdminShell } from '../../admin/components/admin-shell.js';

export const InventoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('All Warehouses');
  const [page, setPage] = useState(1);

  // Selected Stock Item for Custom Modal
  const [stockModalItem, setStockModalItem] = useState<InventoryModel | null>(null);

  // Warehouse Dropdown Options
  const [warehouseOptions, setWarehouseOptions] = useState<{value: string, label: string}[]>([
    { value: 'All Warehouses', label: 'All Warehouses' }
  ]);

  useEffect(() => {
    const loadWarehouses = async () => {
      try {
        const res = await freshmartSdk.warehouse.listWarehouses(100);
        if (res.data) {
          const ops = res.data.map(w => ({ value: w.warehouseId, label: w.warehouseName }));
          setWarehouseOptions([{ value: 'All Warehouses', label: 'All Warehouses' }, ...ops]);
        }
      } catch (err) {
        Logger.error('Failed to load warehouses', err, { module: 'InventoryPage' });
      }
    };
    loadWarehouses();
  }, []);

  // Debounce search by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: inventoryData, isLoading, isError, error, refetch } = useInventory({
    search: debouncedSearch,
    warehouse: selectedWarehouse,
    page,
    limit: 10,
  });


  const userIsAdmin = isAdmin();

  // Prompt Custom Stock Modal
  const handleOpenStockModal = (item: InventoryModel) => {
    if (!userIsAdmin) {
      alert('403 Access Denied: Admin authorization required to update stock.');
      return;
    }
    setStockModalItem(item);
  };



  const displayInventory = inventoryData || [];

  const totalProducts = displayInventory.length;
  const inStockCount = displayInventory.filter((i) => i.status === 'IN_STOCK').length;
  const lowStockCount = displayInventory.filter((i) => i.status === 'LOW_STOCK').length;
  const outOfStockCount = displayInventory.filter((i) => i.status === 'OUT_OF_STOCK').length;
  const inStockPercentage = totalProducts > 0 ? Math.round((inStockCount / totalProducts) * 100) : 0;

  if (isLoading) {
    return (
      <AdminShell searchPlaceholder="Search inventory..." user="alex" variant="operations" onSearch={setSearchTerm}>
      <div className="space-y-6 px-5 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-60 rounded-xl" />
            <Skeleton className="h-4 w-96 rounded-md" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-36 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <TableSkeleton rows={6} columns={7} />
      </div>
      </AdminShell>
    );
  }

  if (isError) {
    return (
      <AdminShell searchPlaceholder="Search inventory..." user="alex" variant="operations" onSearch={setSearchTerm}>
      <div className="my-12 max-w-lg mx-auto px-5 lg:px-8">
        <ErrorState
          title="Failed to load inventory stock"
          description={error?.message || 'An error occurred while fetching inventory records.'}
          onRetry={() => refetch()}
          errorCode={error?.code}
          correlationId={error?.correlationId}
        />
      </div>
      </AdminShell>
    );
  }


  return (
    <AdminShell searchPlaceholder="Search inventory..." user="alex" variant="operations" onSearch={setSearchTerm}>
    <div className="space-y-6 min-h-[calc(100vh-120px)] pb-12 px-5 lg:px-8">
      {/* Top Title & Actions Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">
            Inventory Management
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Real-time stock tracking and stock optimization across all warehouses.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#04883b] text-xs font-bold text-white shadow-md shadow-[#04883b]/20 hover:bg-[#037030] transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* 4 Sleek Single-Line Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#e9f2e7] shadow-sm flex items-center justify-between whitespace-nowrap">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-extrabold text-[#0f172a]">{totalProducts}</span>
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              Total Products
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#e6f7ec] text-[#04883b] whitespace-nowrap">
            In Stock
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#e9f2e7] shadow-sm flex items-center justify-between whitespace-nowrap">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-extrabold text-[#0f172a]">{inStockCount}</span>
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              In-Stock SKUs
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#e6f7ec] text-[#04883b] whitespace-nowrap">
            {inStockPercentage}% Active
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#e9f2e7] shadow-sm flex items-center justify-between whitespace-nowrap">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-extrabold text-amber-600">{lowStockCount}</span>
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              Low Stock
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 whitespace-nowrap">
            Restock
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#e9f2e7] shadow-sm flex items-center justify-between whitespace-nowrap">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-extrabold text-rose-600">{outOfStockCount}</span>
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 whitespace-nowrap">
            Stockout
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#e9f2e7] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search product, SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#04883b]/20 focus:border-[#04883b]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="w-52">
            <Select
              options={warehouseOptions}
              value={selectedWarehouse}
              onChange={(val) => {
                setSelectedWarehouse(val);
                setPage(1);
              }}
            />
          </div>

          <button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Stock</span>
          </button>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white rounded-2xl border border-[#e9f2e7] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/70 border-b border-[#e9f2e7] text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Warehouse</th>
                <th className="py-3.5 px-4">Stock Level</th>
                <th className="py-3.5 px-4">Reserved</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {displayInventory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-0">
                    <EmptyState 
                      title="No inventory records found" 
                      description="Create products in the Products page to view them in Inventory." 
                    />
                  </td>
                </tr>
              ) : (
                displayInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f8fcf7]/60 transition-colors whitespace-nowrap">
                    <td className="py-3.5 px-4">
                      <div className="min-w-0">
                        <p className="font-bold text-[#0f172a] truncate max-w-xs">{item.name}</p>
                        <p className="text-[10px] font-mono text-slate-400 truncate">{item.id}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{item.sku}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-[#f4fcf0] border border-[#e0ede0] text-[11px] font-bold text-[#04883b]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">{item.warehouse}</td>
                    <td className="py-3.5 px-4 font-medium">
                      <div className="flex items-center gap-2.5">
                        <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden shrink-0">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              item.stock > 20
                                ? 'bg-[#04883b]'
                                : item.stock > 0
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, (item.stock / item.maxStock) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[#0f172a] font-extrabold whitespace-nowrap">{item.stock} units</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-500">{item.reserved} units</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold whitespace-nowrap ${
                          item.status === 'IN_STOCK'
                            ? 'bg-[#e6f7ec] text-[#04883b]'
                            : item.status === 'LOW_STOCK'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.status === 'IN_STOCK'
                              ? 'bg-[#04883b]'
                              : item.status === 'LOW_STOCK'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                        />
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleOpenStockModal(item)}
                        className="p-2 rounded-xl bg-[#e6f7ec] hover:bg-[#04883b] text-[#04883b] hover:text-white transition-all shadow-xs inline-flex items-center justify-center"
                        title="Adjust Stock Level"
                      >
                        <SlidersHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination Footer */}
        <div className="p-4 border-t border-[#e9f2e7] bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <p>
            Showing {displayInventory.length > 0 ? (page - 1) * 10 + 1 : 0} to{' '}
            {Math.min(page * 10, displayInventory.length)} of {displayInventory.length} products
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 bg-[#04883b] text-white font-bold rounded-lg">{page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={displayInventory.length < page * 10}
              className="p-1.5 rounded-lg border border-[#e9f2e7] bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Custom Theme Stock Adjustment Modal */}
      <AdjustmentModal
        isOpen={!!stockModalItem}
        onClose={() => setStockModalItem(null)}
        item={stockModalItem}
      />
    </div>
    </AdminShell>
  );
};

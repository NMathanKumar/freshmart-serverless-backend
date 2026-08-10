import React, { useState, useEffect } from 'react';
import {
  Download,
  Printer,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useOrders, useUpdateOrderStatus, useDeleteOrder } from '../hooks/useOrders';
import { Skeleton, TableSkeleton, ErrorState, EmptyState, useToast } from '@/shared/components/ui';
import { isAdmin } from '@freshmart/shared';

import { AdminShell } from '../../admin/components/admin-shell';

export const OrdersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All Orders');
  const [page, setPage] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const { showToast } = useToast();

  // Debounce search by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: orders, isLoading, isError, error, refetch } = useOrders({
    search: debouncedSearch,
    status: activeTab,
    page,
    limit: 10,
  });

  const updateStatusMutation = useUpdateOrderStatus();
  const deleteOrderMutation = useDeleteOrder();

  const userIsAdmin = isAdmin();

  const handleStatusChange = (orderId: string, newStatus: string) => {
    if (!userIsAdmin) {
      showToast('403 Access Denied: Admin authorization required to modify orders.', 'error');
      return;
    }
    updateStatusMutation.mutate(
      {
        orderId,
        status: newStatus as any,
      },
      {
        onSuccess: () => {
          showToast(`Order ${orderId} status updated to ${newStatus}`, 'success');
        },
        onError: (err) => {
          showToast(`Failed to update status for ${orderId}: ${err?.message || 'Server error'}`, 'error');
        },
      }
    );
  };

  const handleDelete = (orderId: string) => {
    if (!userIsAdmin) {
      showToast('403 Access Denied: Admin authorization required.', 'error');
      return;
    }
    if (confirm(`Are you sure you want to cancel/delete order ${orderId}?`)) {
      deleteOrderMutation.mutate(orderId, {
        onSuccess: () => {
          showToast(`Order ${orderId} cancelled successfully`, 'success');
        },
        onError: (err) => {
          showToast(`Failed to cancel order ${orderId}: ${err?.message || 'Server error'}`, 'error');
        },
      });
    }
  };

  const displayOrders = orders || [];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(new Set(displayOrders.map((o) => o.id)));
    } else {
      setSelectedOrders(new Set());
    }
  };

  const handleSelectOne = (orderId: string) => {
    const next = new Set(selectedOrders);
    if (next.has(orderId)) {
      next.delete(orderId);
    } else {
      next.add(orderId);
    }
    setSelectedOrders(next);
  };

  const isAllSelected = displayOrders.length > 0 && displayOrders.every((o) => selectedOrders.has(o.id));

  const handleExport = () => {
    const targetOrders = selectedOrders.size > 0
      ? displayOrders.filter((o) => selectedOrders.has(o.id))
      : displayOrders;

    if (targetOrders.length === 0) {
      alert('No orders available to export.');
      return;
    }

    const headers = ['Order ID', 'Customer Name', 'Customer Email', 'Products', 'Date', 'Amount', 'Payment Status', 'Order Status'];
    const rows = targetOrders.map((o) => [
      `"${o.id}"`,
      `"${o.customerName}"`,
      `"${o.customerEmail}"`,
      `"${o.productsCount}"`,
      `"${o.date}"`,
      `"${o.amount}"`,
      `"${o.paymentStatus}"`,
      `"${o.orderStatus}"`,
    ]);

    const csvString = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `freshmart_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <AdminShell searchPlaceholder="Search orders, IDs..." user="alex" variant="operations" onSearch={setSearchTerm}>
      <div className="space-y-6 px-5 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56 rounded-xl" />
            <Skeleton className="h-4 w-80 rounded-md" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>
        <div className="flex justify-between items-center gap-4">
          <Skeleton className="h-10 w-80 rounded-xl" />
          <Skeleton className="h-10 w-44 rounded-xl" />
        </div>
        <TableSkeleton rows={6} columns={8} />
      </div>
      </AdminShell>
    );
  }

  if (isError) {
    return (
      <AdminShell searchPlaceholder="Search orders, IDs..." user="alex" variant="operations" onSearch={setSearchTerm}>
      <div className="my-12 max-w-lg mx-auto px-5 lg:px-8">
        <ErrorState
          title="Failed to load order records"
          description={error?.message || 'Server connection error'}
          onRetry={() => refetch()}
          errorCode={error?.code}
          correlationId={error?.correlationId}
        />
      </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell searchPlaceholder="Search orders, IDs..." user="alex" variant="operations" onSearch={setSearchTerm}>
    <div className="space-y-6 px-5 lg:px-8 pb-12">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0f172a]">Order Management</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Monitor, process, and track customer orders across all stores.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#04883b] text-xs font-bold text-white shadow-md shadow-[#04883b]/20 hover:bg-[#037030] transition-colors cursor-pointer"
            title="Export orders as CSV"
          >
            <Download className="w-4 h-4" />
            <span>Export{selectedOrders.size > 0 ? ` (${selectedOrders.size})` : ''}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search / Date */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center bg-white p-1 rounded-xl border border-[#e9f2e7]">
          {['All Orders', 'Pending', 'Processing', 'Shipped', 'Delivered'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setPage(1);
              }}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-[#04883b] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#04883b]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search order ID, customer..."
              className="w-full bg-white border border-[#e9f2e7] rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#04883b]"
            />
          </div>

          <div className="text-xs font-bold text-slate-600 bg-white border border-[#e9f2e7] px-4 py-2 rounded-xl shrink-0">
            {new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#e9f2e7] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#f0f7ee] text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-slate-300 text-[#04883b] focus:ring-[#04883b] cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4">ORDER ID</th>
                <th className="px-6 py-4">CUSTOMER</th>
                <th className="px-6 py-4">PRODUCTS</th>
                <th className="px-6 py-4">DATE</th>
                <th className="px-6 py-4">AMOUNT</th>
                <th className="px-6 py-4">PAYMENT</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {displayOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-0">
                    <EmptyState title="No order records found" description="No order records found in database." />
                  </td>
                </tr>
              ) : (
                displayOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedOrders.has(ord.id)}
                        onChange={() => handleSelectOne(ord.id)}
                        className="rounded border-slate-300 text-[#04883b] focus:ring-[#04883b] cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 font-bold text-[#0f172a]">{ord.id}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#0f172a]">{ord.customerName}</p>
                      <p className="text-[10px] text-slate-400">{ord.customerEmail}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{ord.productsCount}</td>
                    <td className="px-6 py-4 text-slate-600">{ord.date}</td>
                    <td className="px-6 py-4 font-extrabold text-[#0f172a]">{ord.amount}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={ord.rawOrderStatus || 'PLACED'}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer outline-none border-0 ${ord.statusBadgeBg} ${ord.statusBadgeColor} hover:opacity-90 transition-opacity`}
                      >
                        <option value="PLACED" className="bg-white text-slate-800 font-semibold">PLACED (Pending)</option>
                        <option value="ACCEPTED" className="bg-white text-slate-800 font-semibold">ACCEPTED (Accepted)</option>
                        <option value="PREPARING" className="bg-white text-slate-800 font-semibold">PREPARING (Processing)</option>
                        <option value="READY" className="bg-white text-slate-800 font-semibold">READY (Shipped)</option>
                        <option value="DELIVERED" className="bg-white text-slate-800 font-semibold">DELIVERED (Delivered)</option>
                        <option value="CANCELLED" className="bg-white text-slate-800 font-semibold">CANCELLED (Cancelled)</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDelete(ord.id)}
                          className="px-2.5 py-1 text-[10px] font-bold text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                          title="Cancel/Delete order in AWS DynamoDB"
                        >
                          Cancel Order
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
            {displayOrders.length === 0
              ? 'Showing 0 orders'
              : `Showing ${ (page - 1) * 10 + 1 } to ${Math.min(page * 10, displayOrders.length)} of ${displayOrders.length} orders`}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(1)}
              className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center ${
                page === 1 ? 'bg-[#04883b] text-white' : 'border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              1
            </button>
            <button
              onClick={() => setPage(2)}
              className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center ${
                page === 2 ? 'bg-[#04883b] text-white' : 'border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              2
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
    </AdminShell>
  );
};

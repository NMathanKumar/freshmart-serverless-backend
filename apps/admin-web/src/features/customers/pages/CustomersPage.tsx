import React, { useState, useEffect } from 'react';
import {
  Download,
  Plus,
  Search,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Users,
  BadgeCheck,
  UserPlus,
  Ban,
  Upload
} from 'lucide-react';
import { useCustomers, useUpdateCustomerStatus, useDeleteCustomer } from '../hooks/useCustomers';
import { Skeleton, CardSkeleton, TableSkeleton, ErrorState, EmptyState } from '@/shared/components/ui';
import { useToast } from '@/shared/components/ui/toast';
import { isAdmin } from '@freshmart/shared';
import { AdminShell } from '../../admin/components/admin-shell';

export const CustomersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All Customers');
  const [page, setPage] = useState(1);

  // Debounce search by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: customers, isLoading, isError, error, refetch } = useCustomers({
    search: debouncedSearch,
    status: activeTab,
    page,
    limit: 10,
  });

  const { showToast } = useToast();

  const updateStatusMutation = useUpdateCustomerStatus();
  const deleteCustomerMutation = useDeleteCustomer();

  const userIsAdmin = isAdmin();

  const handleToggleStatus = (customerId: string, currentStatus: string) => {
    if (!userIsAdmin) {
      alert('403 Access Denied: Admin authorization required to block/unblock customers.');
      return;
    }
    const nextStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    updateStatusMutation.mutate({
      customerId,
      status: nextStatus,
    }, {
      onSuccess: () => showToast(`Customer status updated to ${nextStatus}`, 'success'),
      onError: () => showToast('Failed to update customer status', 'error')
    });
  };

  const handleDelete = (customerId: string, name: string) => {
    if (!userIsAdmin) {
      alert('403 Access Denied: Admin authorization required.');
      return;
    }
    if (confirm(`Are you sure you want to delete customer "${name}"?`)) {
      deleteCustomerMutation.mutate(customerId, {
        onSuccess: () => showToast(`Customer "${name}" deleted successfully`, 'success'),
        onError: () => showToast('Failed to delete customer', 'error')
      });
    }
  };

  const displayCustomers = customers || [];

  if (isLoading) {
    return (
      <AdminShell searchPlaceholder="Search customers, orders, or IDs..." user="alex" variant="operations" onSearch={setSearchTerm}>
      <div className="space-y-6">
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
      <AdminShell searchPlaceholder="Search customers, orders, or IDs..." user="alex" variant="operations" onSearch={setSearchTerm}>
      <div className="my-12 max-w-lg mx-auto">
        <ErrorState
          title="Failed to load customer directory"
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
    <AdminShell searchPlaceholder="Search customers, orders, or IDs..." user="alex" variant="operations" onSearch={setSearchTerm}>
    <div className="space-y-6 p-6 min-h-screen bg-[#f4fcf0]/50">
      {/* Title & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0f172a] tracking-tight">Customer Management</h1>
          <p className="text-sm text-slate-600 font-medium mt-1">
            Oversee your user base, monitor activity, and handle account statuses.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-sm font-bold text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              if (!userIsAdmin) {
                alert('403 Access Denied: Admin authorization required to add customers.');
              } else {
                alert('Add Customer form ready.');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#04883b] text-sm font-bold text-white shadow-md shadow-[#04883b]/20 hover:bg-[#037030] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#e2e8f0]/60">
          <div className="flex justify-between items-start mb-4">
            <div className="w-11 h-11 rounded-xl bg-[#e6f7ec] flex items-center justify-center text-[#04883b]">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#04883b] bg-[#e6f7ec] px-2 py-0.5 rounded-full tracking-wide">
              +12.5%
            </span>
          </div>
          <div>
            <p className="text-[13px] font-bold text-slate-700 mb-0.5">Total Customers</p>
            <p className="text-3xl font-extrabold text-[#0f172a] tracking-tight">{displayCustomers.length.toLocaleString('en-US')}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#e2e8f0]/60">
          <div className="flex justify-between items-start mb-4">
            <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <BadgeCheck className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full tracking-wide">
              High Retention
            </span>
          </div>
          <div>
            <p className="text-[13px] font-bold text-slate-700 mb-0.5">Active Customers</p>
            <p className="text-3xl font-extrabold text-[#0f172a] tracking-tight">
              {displayCustomers.length > 0 ? Math.round((displayCustomers.filter((c) => c.status === 'ACTIVE').length / displayCustomers.length) * 100) : 0}%
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#e2e8f0]/60">
          <div className="flex justify-between items-start mb-4">
            <div className="w-11 h-11 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500">
              <UserPlus className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full tracking-wide">
              +450 Today
            </span>
          </div>
          <div>
            <p className="text-[13px] font-bold text-slate-700 mb-0.5">New Customers</p>
            <p className="text-3xl font-extrabold text-[#0f172a] tracking-tight">
              {Math.floor(displayCustomers.length * 0.1).toLocaleString('en-US')}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#e2e8f0]/60">
          <div className="flex justify-between items-start mb-4">
            <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
              <Ban className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full tracking-wide">
              Action Req.
            </span>
          </div>
          <div>
            <p className="text-[13px] font-bold text-slate-700 mb-0.5">Blocked Accounts</p>
            <p className="text-3xl font-extrabold text-[#0f172a] tracking-tight">
              {displayCustomers.filter((c) => c.status === 'BLOCKED').length.toLocaleString('en-US')}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center bg-white p-1 rounded-xl border border-[#e9f2e7]">
          {['All Customers', 'Active', 'Blocked', 'VIP'].map((tab) => (
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

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-[#e2e8f0] rounded-xl hover:bg-slate-50 transition-colors">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Jan 1 - Dec 31, 2023
          </button>
          <button className="p-1.5 bg-white border border-[#e2e8f0] rounded-xl text-slate-500 hover:text-slate-700 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Customers Data Table */}
      <div className="bg-white rounded-2xl border border-[#e9f2e7] shadow-sm overflow-hidden">
        {displayCustomers.length === 0 ? (
          <EmptyState 
            title="No customers found" 
            description="Try adjusting your filters or search terms." 
            icon={<Search className="w-8 h-8 text-slate-300 mx-auto" />} 
          />
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#f0f7ee] text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4 w-10 text-center">
                  <input type="checkbox" className="rounded border-slate-300 text-[#04883b]" />
                </th>
                <th className="px-6 py-4">CUSTOMER</th>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">CONTACT</th>
                <th className="px-6 py-4">REG. DATE</th>
                <th className="px-6 py-4 text-center">ORDERS</th>
                <th className="px-6 py-4">SPENDING</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {displayCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-center">
                    <input type="checkbox" className="rounded border-slate-300 text-[#04883b]" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={cust.avatar}
                        alt={cust.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-100 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-[#0f172a]">{cust.name}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{cust.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-600">{cust.id}</td>
                  <td className="px-6 py-4 text-slate-600">{cust.contact}</td>
                  <td className="px-6 py-4 text-slate-600">{cust.regDate}</td>
                  <td className="px-6 py-4 text-center font-bold text-slate-800">{cust.orders}</td>
                  <td className="px-6 py-4 font-extrabold text-[#04883b]">{cust.spending}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(cust.id, cust.status)}
                      className="cursor-pointer"
                    >
                      {cust.status === 'ACTIVE' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#e6f7ec] text-[#04883b]">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600">
                          BLOCKED
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(cust.id, cust.name)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-[#f4fcf0]/50">
          <span>
            {(customers || []).length === 0
              ? 'Showing 0 customers'
              : `Showing ${ (page - 1) * 10 + 1 } to ${Math.min(page * 10, (customers || []).length)} of ${(customers || []).length} customers`}
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

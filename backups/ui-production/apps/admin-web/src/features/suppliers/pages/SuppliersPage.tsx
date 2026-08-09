import React, { useState } from 'react';
import {
  Plus,
  Filter,
  Download,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Building,
} from 'lucide-react';
import { useSuppliers, useUpdateSupplierStatus, useDeleteSupplier, useCreateSupplier } from '../hooks/useSuppliers';
import { Switch } from '../../../components/ui/switch';
import { Skeleton } from '../../../components/ui/skeleton';
import { isAdmin } from '@freshmart/shared';

export const SuppliersPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);

  const limit = 10;
  const { data, isLoading, isError, error, refetch } = useSuppliers({ page, limit });
  const updateStatusMutation = useUpdateSupplierStatus();
  const deleteSupplierMutation = useDeleteSupplier();
  const createSupplierMutation = useCreateSupplier();

  const userIsAdmin = isAdmin();

  const toggleStatus = (id: string, currentStatus: string) => {
    if (!userIsAdmin) {
      alert('403 Access Denied: Admin authorization required to toggle supplier status.');
      return;
    }
    updateStatusMutation.mutate({
      supplierId: id,
      status: currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
    });
  };

  const handleAddSupplier = () => {
    if (!userIsAdmin) {
      alert('403 Access Denied: Admin authorization required to create suppliers.');
      return;
    }
    const name = prompt('Enter Supplier Name:');
    if (name) {
      const email = prompt('Enter Contact Email:') || 'contact@supplier.com';
      createSupplierMutation.mutate({
        name,
        contactPerson: 'Lead Representative',
        email,
        status: 'ACTIVE',
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to soft-delete this supplier?')) {
      deleteSupplierMutation.mutate(id);
      if (selectedSupplierId === id) setSelectedSupplierId(null);
    }
  };

  if (!userIsAdmin) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#0f172a]">403 Access Denied</h3>
        <p className="text-xs text-slate-500">
          You do not have administrative permissions to access supplier management.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-48 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[500px] lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-[500px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#0f172a]">Failed to load supplier network</h3>
        <p className="text-xs text-slate-500">{error?.message || 'Server connection error'}</p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#04883b] text-white font-bold text-xs hover:bg-[#037030] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const suppliers = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const activeSupplier = selectedSupplierId
    ? suppliers.find((s) => s.id === selectedSupplierId)
    : suppliers[0];

  return (
    <div className="space-y-6">
      {/* Title & Add Supplier Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0f172a]">Supplier Management</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Monitor and manage your global fresh produce supply network.
          </p>
        </div>
        <button
          onClick={handleAddSupplier}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#04883b] text-xs font-bold text-white shadow-md shadow-[#04883b]/20 hover:bg-[#037030] transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Supplier</span>
        </button>
      </div>

      {suppliers.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-[#e9f2e7] text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#e6f7ec] text-[#04883b] flex items-center justify-center mx-auto">
            <Building className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[#0f172a]">No suppliers found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Add your first supplier to start building your supply network.
          </p>
          <button
            onClick={handleAddSupplier}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#04883b] text-xs font-bold text-white hover:bg-[#037030] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Suppliers Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e9f2e7] shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0f172a]">Active Suppliers</h3>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">
                    <Filter className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#f0f7ee] text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <th className="px-6 py-4">SUPPLIER NAME</th>
                      <th className="px-6 py-4">CONTACT PERSON</th>
                      <th className="px-6 py-4">PRODUCTS</th>
                      <th className="px-6 py-4 text-center">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                    {suppliers.map((sup) => (
                      <tr
                        key={sup.id}
                        onClick={() => setSelectedSupplierId(sup.id)}
                        className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                          activeSupplier?.id === sup.id ? 'bg-[#f4fcf0]' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                              {sup.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-[#0f172a]">{sup.name}</p>
                              <p className="text-[10px] text-slate-400 font-semibold">
                                {sup.supplierCode}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-[#0f172a]">{sup.contactPerson || 'N/A'}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{sup.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#f0f7ee] text-slate-700">
                            {sup.supportedCategories?.length || 0} Categories
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Switch
                            checked={sup.status === 'ACTIVE'}
                            onChange={() => toggleStatus(sup.id, sup.status)}
                            size="sm"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-[#f4fcf0]/50">
              <span>Showing {suppliers.length} of {total} suppliers</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-semibold text-slate-700">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Supplier Detail & Monthly Supply Volume */}
          {activeSupplier && (
            <div className="space-y-6">
              {/* Supplier Detail Card */}
              <div className="bg-white rounded-2xl border border-[#e9f2e7] shadow-sm overflow-hidden space-y-4 pb-6">
                {/* Top Green Banner */}
                <div className="h-20 bg-[#04883b] relative">
                  <div className="absolute -bottom-6 left-6 w-14 h-14 bg-white rounded-2xl p-1 shadow-md border border-slate-100 flex items-center justify-center">
                    <div className="w-full h-full rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-2xl">
                      {activeSupplier.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Profile Info Header */}
                <div className="pt-4 px-6 flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-[#0f172a]">{activeSupplier.name}</h3>
                    <span className="text-[11px] font-bold text-[#04883b] flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#04883b]" />
                      {activeSupplier.companyName}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <button
                      onClick={() => alert(`Editing profile for ${activeSupplier.name}`)}
                      className="text-xs font-bold text-[#04883b] hover:underline cursor-pointer"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={() => handleDelete(activeSupplier.id)}
                      className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                    >
                      Delete Supplier
                    </button>
                  </div>
                </div>

                {/* Address & Contact Details */}
                <div className="px-6 space-y-3 text-xs text-slate-600">
                  <div className="flex items-start gap-2.5">
                    <Building className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#0f172a] block text-[10px] uppercase tracking-wider">
                        Business Details
                      </span>
                      <span>GST: {activeSupplier.gstNumber || 'N/A'}</span>
                      <br />
                      <span>PAN: {activeSupplier.panNumber || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#0f172a] block text-[10px] uppercase tracking-wider">
                        Address
                      </span>
                      <span>{`${activeSupplier.city}, ${activeSupplier.state}, ${activeSupplier.country}`}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#0f172a] block text-[10px] uppercase tracking-wider">
                        Support Phone
                      </span>
                      <span>{activeSupplier.phone || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#0f172a] block text-[10px] uppercase tracking-wider">
                        Billing Email
                      </span>
                      <span>{activeSupplier.email}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {activeSupplier.notes && (
                  <div className="px-6 pt-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                      NOTES
                    </h4>
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {activeSupplier.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

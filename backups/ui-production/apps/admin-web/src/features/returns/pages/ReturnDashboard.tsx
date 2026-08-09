import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  IndianRupee,
  FileText,
  PackageX,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { CardSkeleton } from '../../../components/ui/skeleton';
import { freshmartSdk } from '../../../lib/sdk';
import { type ReturnToVendor } from '@freshmart/api-sdk';

export function ReturnDashboard() {
  const [returns, setReturns] = useState<ReturnToVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    loadReturns();
  }, [statusFilter]);

  const loadReturns = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
      if (statusFilter !== 'All') params.status = statusFilter;
      const res = await freshmartSdk.admin.listVendorReturns(params);
      setReturns(res.data?.items || []);
    } catch (e) {
      console.error('Failed to load returns', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredReturns = returns.filter((r) => {
    const term = search.toLowerCase();
    return (
      r.returnNumber?.toLowerCase().includes(term) ||
      r.supplierId?.toLowerCase().includes(term) ||
      r.purchaseOrderId?.toLowerCase().includes(term)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      case 'REQUESTED': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'APPROVED': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'DISPATCHED': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'RECEIVED_BY_VENDOR': return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
      case 'CREDIT_NOTE_RECEIVED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'CLOSED': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'REJECTED':
      case 'CANCELLED': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return <FileText className="w-3.5 h-3.5" />;
      case 'REQUESTED': return <Clock className="w-3.5 h-3.5" />;
      case 'APPROVED': return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'DISPATCHED': return <Truck className="w-3.5 h-3.5" />;
      case 'RECEIVED_BY_VENDOR': return <PackageX className="w-3.5 h-3.5" />;
      case 'CREDIT_NOTE_RECEIVED': return <IndianRupee className="w-3.5 h-3.5" />;
      case 'CLOSED': return <CheckCircle2 className="w-3.5 h-3.5" />;
      default: return <AlertCircle className="w-3.5 h-3.5" />;
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);

  const kpiPendingApproval = returns.filter(r => r.status === 'REQUESTED').length;
  const kpiDispatched = returns.filter(r => r.status === 'DISPATCHED').length;
  const kpiCreditPending = returns.filter(r => r.status === 'RECEIVED_BY_VENDOR').length;
  const kpiTotalReturnValue = returns.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
  const kpiCreditReceived = returns.reduce((sum, r) => sum + (r.creditNoteAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-orange-500" />
            Return to Vendor
          </h1>
          <p className="text-gray-400 mt-1">Manage supplier goods returns, dispatch tracking, and credit notes</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]">
          <Plus className="w-4 h-4 mr-2" />
          Create Return
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="glass-card p-5 rounded-xl border border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400">Pending Approval</p>
              <h3 className="text-xl font-bold text-white mt-0.5">{loading ? '-' : kpiPendingApproval}</h3>
            </div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <Truck className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400">In Transit</p>
              <h3 className="text-xl font-bold text-white mt-0.5">{loading ? '-' : kpiDispatched}</h3>
            </div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-500/10 rounded-lg border border-teal-500/20">
              <FileText className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400">Awaiting Credit Note</p>
              <h3 className="text-xl font-bold text-white mt-0.5">{loading ? '-' : kpiCreditPending}</h3>
            </div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 rounded-lg border border-rose-500/20">
              <IndianRupee className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400">Total Return Value</p>
              <h3 className="text-lg font-bold text-white mt-0.5">{loading ? '-' : formatCurrency(kpiTotalReturnValue)}</h3>
            </div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400">Credits Received</p>
              <h3 className="text-lg font-bold text-white mt-0.5">{loading ? '-' : formatCurrency(kpiCreditReceived)}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="glass-card p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search return number, supplier, or PO..."
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-500 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          options={[
            { value: 'All', label: 'All Statuses' },
            { value: 'DRAFT', label: 'Draft' },
            { value: 'REQUESTED', label: 'Requested' },
            { value: 'APPROVED', label: 'Approved' },
            { value: 'DISPATCHED', label: 'Dispatched' },
            { value: 'RECEIVED_BY_VENDOR', label: 'Vendor Received' },
            { value: 'CREDIT_NOTE_RECEIVED', label: 'Credit Note Rcvd' },
            { value: 'CLOSED', label: 'Closed' },
          ]}
          className="w-full md:w-52 bg-white/5 border-white/10 text-white"
        />
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 bg-white/5 uppercase border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">Return Info</th>
                <th className="px-6 py-4 font-medium">Supplier & PO</th>
                <th className="px-6 py-4 font-medium">Items</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-6 py-4"><CardSkeleton /></td>
                    ))}
                  </tr>
                ))
              ) : filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-gray-400">
                    <RotateCcw className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium mb-1">No vendor returns found</p>
                    <p className="text-sm">Create a new return to get started</p>
                  </td>
                </tr>
              ) : (
                filteredReturns.map((rtv) => (
                  <tr key={rtv.returnId} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{rtv.returnNumber}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5 uppercase">{rtv.reasonCode?.replace(/_/g, ' ')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-300 text-xs truncate max-w-[140px]">{rtv.supplierId}</div>
                      <div className="text-xs text-indigo-400 mt-0.5">{rtv.purchaseOrderId}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {rtv.items?.length || 0} items
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{formatCurrency(rtv.totalAmount)}</div>
                      {rtv.creditNoteAmount > 0 && (
                        <div className="text-xs text-emerald-400 mt-0.5">Credit: {formatCurrency(rtv.creditNoteAmount)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${getStatusColor(rtv.status)}`}>
                        {getStatusIcon(rtv.status)}
                        {rtv.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(rtv.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="text-orange-400 hover:bg-orange-400/10">
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

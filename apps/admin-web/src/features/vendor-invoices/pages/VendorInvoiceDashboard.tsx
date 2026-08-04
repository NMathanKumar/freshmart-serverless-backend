import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  IndianRupee,
  MoreVertical
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { CardSkeleton } from '../../../components/ui/skeleton';
import { freshmartSdk } from '../../../lib/sdk';
import { type VendorInvoice } from '@freshmart/api-sdk';
import { useNavigate } from '@tanstack/react-router';

export function VendorInvoiceDashboard() {
  const [invoices, setInvoices] = useState<VendorInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    loadInvoices();
  }, [statusFilter, paymentStatusFilter]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
      if (statusFilter !== 'All') params.status = statusFilter;
      // Depending on backend support, we might need to filter paymentStatus client-side for now
      const res = await freshmartSdk.admin.listVendorInvoices(params);
      let data = res.data?.items || [];
      if (paymentStatusFilter !== 'All') {
        data = data.filter(i => i.paymentStatus === paymentStatusFilter);
      }
      setInvoices(data);
    } catch (e) {
      console.error('Failed to load invoices', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    return inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
           inv.supplierId.toLowerCase().includes(search.toLowerCase());
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      case 'SUBMITTED': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'APPROVED': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'PARTIALLY_PAID': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'PAID': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'REJECTED':
      case 'CANCELLED': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-500" />
            Vendor Invoices
          </h1>
          <p className="text-gray-400 mt-1">Manage accounts payable, vendor bills, and supplier payments</p>
        </div>
        <Button 
          className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]"
          onClick={() => navigate({ to: '/vendor-invoices' })}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-xl border border-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Pending Approval</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {loading ? '-' : invoices.filter(i => i.status === 'SUBMITTED').length}
              </h3>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-6 rounded-xl border border-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-500/10 rounded-lg border border-rose-500/20">
              <AlertCircle className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Outstanding Amount</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {loading ? '-' : formatCurrency(invoices.reduce((sum, inv) => sum + (inv.balanceAmount || 0), 0))}
              </h3>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl border border-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Paid This Month</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {loading ? '-' : formatCurrency(invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0))}
              </h3>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl border border-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <IndianRupee className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Total Payables</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {loading ? '-' : formatCurrency(invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0))}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search invoice number or supplier..."
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
            { value: 'SUBMITTED', label: 'Pending Approval' },
            { value: 'APPROVED', label: 'Approved' },
          ]}
          className="w-full md:w-48 bg-white/5 border-white/10 text-white"
        />
        <Select
          value={paymentStatusFilter}
          onChange={(val) => setPaymentStatusFilter(val)}
          options={[
            { value: 'All', label: 'All Payments' },
            { value: 'UNPAID', label: 'Unpaid' },
            { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
            { value: 'PAID', label: 'Paid' },
          ]}
          className="w-full md:w-48 bg-white/5 border-white/10 text-white"
        />
      </div>

      <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 bg-white/5 uppercase border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">Invoice Info</th>
                <th className="px-6 py-4 font-medium">Supplier & PO</th>
                <th className="px-6 py-4 font-medium">Amount & Balance</th>
                <th className="px-6 py-4 font-medium">Dates</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><CardSkeleton /></td>
                    <td className="px-6 py-4"><CardSkeleton /></td>
                    <td className="px-6 py-4"><CardSkeleton /></td>
                    <td className="px-6 py-4"><CardSkeleton /></td>
                    <td className="px-6 py-4"><CardSkeleton /></td>
                    <td className="px-6 py-4"><CardSkeleton /></td>
                  </tr>
                ))
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    No vendor invoices found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.invoiceId} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{inv.invoiceNumber}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{inv.items?.length || 0} items</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-300 truncate max-w-[150px]">{inv.supplierId}</div>
                      <div className="text-xs text-indigo-400 mt-0.5 hover:underline cursor-pointer">
                        {inv.purchaseOrderId}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{formatCurrency(inv.totalAmount)}</div>
                      {inv.balanceAmount > 0 ? (
                        <div className="text-xs text-rose-400 mt-0.5">Bal: {formatCurrency(inv.balanceAmount)}</div>
                      ) : (
                        <div className="text-xs text-emerald-400 mt-0.5">Fully Paid</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="text-gray-300">Inv: {new Date(inv.invoiceDate).toLocaleDateString()}</div>
                      <div className={`mt-0.5 ${new Date(inv.dueDate) < new Date() && inv.balanceAmount > 0 ? 'text-rose-400 font-medium' : 'text-gray-500'}`}>
                        Due: {new Date(inv.dueDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusColor(inv.status)}`}>
                          {inv.status}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusColor(inv.paymentStatus)}`}>
                          {inv.paymentStatus.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="text-indigo-400 hover:bg-indigo-400/10">
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

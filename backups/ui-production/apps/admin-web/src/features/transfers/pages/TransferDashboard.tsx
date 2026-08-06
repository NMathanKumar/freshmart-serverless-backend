import React, { useState, useEffect } from 'react';
import { 
  ArrowRightLeft, 
  Plus, 
  Search, 
  Filter, 
  Truck, 
  Package, 
  CheckCircle2, 
  Clock, 
  XCircle 
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { CardSkeleton, TableSkeleton } from '../../../components/ui/skeleton';
import { freshmartSdk } from '../../../lib/sdk';
import { type Transfer } from '@freshmart/api-sdk';

export function TransferDashboard() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    loadTransfers();
  }, [statusFilter]);

  const loadTransfers = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
      if (statusFilter !== 'All') {
        params.status = statusFilter;
      }
      const res = await freshmartSdk.inventory.listTransfers(params);
      setTransfers(res.data || []);
    } catch (e) {
      console.error('Failed to load transfers', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransfers = transfers.filter((t) => {
    return t.transferNumber.toLowerCase().includes(search.toLowerCase());
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      case 'REQUESTED': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'APPROVED': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'IN_TRANSIT': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'PARTIALLY_RECEIVED': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'RECEIVED':
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'CANCELLED':
      case 'REJECTED': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ArrowRightLeft className="w-6 h-6 text-indigo-500" />
            Stock Transfers
          </h1>
          <p className="text-gray-400 mt-1">Manage warehouse-to-warehouse stock movements</p>
        </div>
        <Button className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]">
          <Plus className="w-4 h-4 mr-2" />
          Create Transfer
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
                {loading ? '-' : transfers.filter(t => t.status === 'REQUESTED').length}
              </h3>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-6 rounded-xl border border-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <Truck className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">In Transit</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {loading ? '-' : transfers.filter(t => t.status === 'IN_TRANSIT').length}
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
              <p className="text-sm font-medium text-gray-400">Received Today</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {loading ? '-' : transfers.filter(t => t.status === 'RECEIVED' || t.status === 'PARTIALLY_RECEIVED').length}
              </h3>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl border border-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-500/10 rounded-lg border border-rose-500/20">
              <XCircle className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Cancelled/Rejected</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {loading ? '-' : transfers.filter(t => t.status === 'CANCELLED' || t.status === 'REJECTED').length}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search transfer number..."
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
            { value: 'IN_TRANSIT', label: 'In Transit' },
            { value: 'RECEIVED', label: 'Received' },
          ]}
          className="w-full md:w-48 bg-white/5 border-white/10 text-white"
        />
      </div>

      <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 bg-white/5 uppercase border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">Transfer ID</th>
                <th className="px-6 py-4 font-medium">Route</th>
                <th className="px-6 py-4 font-medium">Items / Qty</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
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
              ) : filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <ArrowRightLeft className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    No transfers found.
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((transfer) => (
                  <tr key={transfer.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 font-medium text-white">
                      {transfer.transferNumber}
                      <br/>
                      <span className="text-xs text-gray-500">{transfer.priority} Priority</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300 font-medium truncate max-w-[120px] block">{transfer.sourceWarehouseId}</span>
                        <ArrowRightLeft className="w-3 h-3 text-gray-500 flex-shrink-0" />
                        <span className="text-gray-300 font-medium truncate max-w-[120px] block">{transfer.destinationWarehouseId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-500" />
                        {transfer.totalItems} items ({transfer.totalQuantity} qty)
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(transfer.status)}`}>
                        {transfer.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(transfer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="text-indigo-400 hover:bg-indigo-400/10">
                        View Details
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

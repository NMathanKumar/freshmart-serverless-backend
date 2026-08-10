import React, { useState } from 'react';
import { RefreshCw, AlertCircle, Search, ArrowRightLeft, PackageMinus, PackagePlus, FileText, CheckCircle, XCircle } from 'lucide-react';
import { useMovements, useApproveAdjustment, useRejectAdjustment } from '../hooks/useInventory';
import { Skeleton, TableSkeleton } from '@/shared/components/ui/skeleton';
import { Select } from '@/shared/components/ui/select';
import { useToast } from '@/shared/components/ui/toast';

export const InventoryMovementDashboard: React.FC = () => {
  const [page, setPage] = useState(1);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const { data: movements, isLoading, isError, error, refetch } = useMovements({
    page,
    limit: 50,
    warehouseId: selectedWarehouse || undefined,
    movementType: selectedType || undefined,
  });

  const approveMutation = useApproveAdjustment();
  const rejectMutation = useRejectAdjustment();
  const { showToast } = useToast();

  const handleApprove = async (productId: string, movementId: string) => {
    if (confirm('Approve this adjustment?')) {
      try {
        await approveMutation.mutateAsync({ productId, movementId });
        showToast('Adjustment approved', 'success');
      } catch (e: any) {
        showToast(e?.message || 'Failed to approve', 'error');
      }
    }
  };

  const handleReject = async (productId: string, movementId: string) => {
    if (confirm('Reject this adjustment?')) {
      try {
        await rejectMutation.mutateAsync({ productId, movementId });
        showToast('Adjustment rejected', 'success');
      } catch (e: any) {
        showToast(e?.message || 'Failed to reject', 'error');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <TableSkeleton rows={10} columns={7} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#0f172a]">Failed to load movements</h3>
        <p className="text-xs text-slate-500">{error?.message}</p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#04883b] text-white text-xs font-bold shadow-md"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'STOCK_IN': return <PackagePlus className="w-4 h-4 text-[#04883b]" />;
      case 'STOCK_OUT': return <PackageMinus className="w-4 h-4 text-rose-500" />;
      case 'DAMAGE': return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case 'EXPIRED': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'RETURN': return <ArrowRightLeft className="w-4 h-4 text-blue-500" />;
      default: return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#e6f7ec] text-[#04883b]">COMPLETED</span>;
      case 'PENDING': return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600">PENDING</span>;
      case 'REJECTED': return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600">REJECTED</span>;
      default: return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">Movement Ledger</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">Immutable record of all stock adjustments and movements.</p>
        </div>
        <div className="flex gap-3">
          <Select
            options={[
              { value: '', label: 'All Warehouses' },
              { value: 'Main Distribution Center', label: 'Main Distribution Center' },
              { value: 'Central Warehouse', label: 'Central Warehouse' },
              { value: 'SYSTEM', label: 'SYSTEM' }
            ]}
            value={selectedWarehouse}
            onChange={setSelectedWarehouse}
          />
          <Select
            options={[
              { value: '', label: 'All Types' },
              { value: 'STOCK_IN', label: 'Stock In' },
              { value: 'STOCK_OUT', label: 'Stock Out' },
              { value: 'DAMAGE', label: 'Damage' },
              { value: 'EXPIRED', label: 'Expired' },
              { value: 'RETURN', label: 'Return' },
              { value: 'CYCLE_COUNT', label: 'Cycle Count' }
            ]}
            value={selectedType}
            onChange={setSelectedType}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#e9f2e7] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/70 border-b border-[#e9f2e7] text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Product/SKU</th>
                <th className="py-3.5 px-4">Movement</th>
                <th className="py-3.5 px-4 text-right">Qty</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {movements?.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">No movements found.</td>
                </tr>
              ) : (
                movements?.map((m) => (
                  <tr key={m.movementId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#0f172a]">{new Date(m.createdAt).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-400">{new Date(m.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#0f172a]">{m.sku}</div>
                      <div className="text-[10px] font-mono text-slate-400">{m.productId}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(m.movementType)}
                        <span className="font-bold text-slate-600">{m.movementType}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`font-extrabold ${m.quantity > 0 ? 'text-[#04883b]' : 'text-rose-600'}`}>
                        {m.quantity > 0 ? '+' : ''}{m.quantity}
                      </span>
                      <div className="text-[10px] text-slate-400">{m.beforeQuantity} → {m.afterQuantity}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-[200px] truncate" title={m.reason + (m.remarks ? ` - ${m.remarks}` : '')}>
                      {m.reason}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(m.status)}</td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-600 font-medium">{m.createdBy}</div>
                      {m.approvedBy && <div className="text-[10px] text-[#04883b]">Approved: {m.approvedBy}</div>}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {m.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(m.productId, m.movementId)}
                            className="p-1.5 bg-[#e6f7ec] text-[#04883b] rounded-lg hover:bg-[#04883b] hover:text-white transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(m.productId, m.movementId)}
                            className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
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
};

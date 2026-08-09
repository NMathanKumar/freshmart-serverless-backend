import React, { useState } from 'react';
import { X, Save, AlertCircle, RefreshCcw, PackageMinus, PackagePlus } from 'lucide-react';
import { useAdjustStock, useAdjustDamage, useAdjustExpired, useAdjustReturn } from '../hooks/useInventory';
import { InventoryModel } from '../services/inventory.service';
import { useToast } from '../../../components/ui/toast';

interface AdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryModel | null;
}

export const AdjustmentModal: React.FC<AdjustmentModalProps> = ({ isOpen, onClose, item }) => {
  const [activeTab, setActiveTab] = useState<'MANUAL' | 'DAMAGE' | 'EXPIRED' | 'RETURN'>('MANUAL');
  const [amount, setAmount] = useState<number>(0);
  const [reason, setReason] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const { showToast } = useToast();

  const adjustStock = useAdjustStock();
  const adjustDamage = useAdjustDamage();
  const adjustExpired = useAdjustExpired();
  const adjustReturn = useAdjustReturn();

  const isSubmitting = adjustStock.isPending || adjustDamage.isPending || adjustExpired.isPending || adjustReturn.isPending;

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    try {
      const payload = { amount, reason, remarks, warehouseId: item.warehouse };
      if (activeTab === 'MANUAL') {
        await adjustStock.mutateAsync({ productId: item.id, payload: { ...payload, movementType: amount > 0 ? 'STOCK_IN' : 'STOCK_OUT', reason: reason || 'SYSTEM_CORRECTION' } });
      } else if (activeTab === 'DAMAGE') {
        await adjustDamage.mutateAsync({ productId: item.id, payload: { ...payload, reason: 'DAMAGE' } });
      } else if (activeTab === 'EXPIRED') {
        await adjustExpired.mutateAsync({ productId: item.id, payload: { ...payload, reason: 'EXPIRED' } });
      } else if (activeTab === 'RETURN') {
        await adjustReturn.mutateAsync({ productId: item.id, payload: { ...payload, reason: 'RETURN' } });
      }
      onClose();
      setAmount(0);
      setReason('');
      setRemarks('');
      showToast('Stock adjusted successfully!', 'success');
    } catch (err: any) {
      console.error('Failed to adjust stock', err);
      showToast(err?.message || 'Failed to adjust stock', 'error');
    }
  };

  const tabs = [
    { id: 'MANUAL', label: 'Manual Adjust', icon: RefreshCcw },
    { id: 'DAMAGE', label: 'Report Damage', icon: PackageMinus },
    { id: 'EXPIRED', label: 'Mark Expired', icon: PackageMinus },
    { id: 'RETURN', label: 'Process Return', icon: PackagePlus },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold text-[#0f172a]">Adjust Stock</h2>
            <p className="text-xs text-slate-500 mt-1">
              {item.name} • {item.sku}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex p-4 gap-2 overflow-x-auto bg-slate-50/50 border-b border-slate-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#04883b] text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between mb-6">
            <span className="text-sm font-semibold text-slate-600">Current Stock</span>
            <span className="text-xl font-extrabold text-[#0f172a]">{item.stock}</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {activeTab === 'MANUAL' ? 'Adjustment Amount (+/-)' : 'Quantity'}
              </label>
              <input
                type="number"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#04883b]/20 focus:border-[#04883b] text-sm"
                placeholder="0"
                min={activeTab === 'MANUAL' ? undefined : 1}
                required
              />
            </div>

            {activeTab === 'MANUAL' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Reason Code</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#04883b]/20 focus:border-[#04883b] text-sm bg-white"
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="SYSTEM_CORRECTION">System Correction</option>
                  <option value="CYCLE_COUNT">Cycle Count</option>
                  <option value="INITIAL_STOCK">Initial Stock</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Remarks (Optional)</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#04883b]/20 focus:border-[#04883b] text-sm resize-none h-24"
                placeholder="Add any additional notes..."
              />
            </div>
          </div>

          {(activeTab === 'DAMAGE' && amount > 100) && (
            <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-800 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
              <p>
                <strong>Approval Required:</strong> Damage reports exceeding 100 units require manager approval. This adjustment will be marked as Pending.
              </p>
            </div>
          )}

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !amount}
              className="px-5 py-2.5 rounded-xl bg-[#04883b] text-white text-xs font-bold shadow-md hover:bg-[#037030] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <RefreshCcw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isSubmitting ? 'Saving...' : 'Confirm Adjustment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

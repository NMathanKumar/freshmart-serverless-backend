import React, { useState, useEffect } from 'react';
import { Package, Plus, Minus, X, Check, RefreshCw } from 'lucide-react';

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newStock: number) => void | Promise<void>;
  itemTitle?: string;
  itemSku?: string;
  itemImage?: string;
  currentStock?: number;
  isUpdating?: boolean;
}

export const UpdateStockModal: React.FC<StockModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemTitle = 'Product Item',
  itemSku = 'SKU-001',
  itemImage,
  currentStock = 0,
  isUpdating = false,
}) => {
  const [stockVal, setStockVal] = useState(currentStock);

  useEffect(() => {
    setStockVal(currentStock);
  }, [currentStock, isOpen]);

  if (!isOpen) return null;

  const handleIncrement = (amount: number) => {
    setStockVal((prev) => Math.max(0, prev + amount));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(stockVal);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-fadeIn overflow-hidden">
      <div className="bg-white rounded-3xl border border-[#e9f2e7] shadow-2xl w-full max-w-md overflow-hidden animate-scaleUp">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#f8fcf7] border-b border-[#e9f2e7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#e6f7ec] text-[#04883b] flex items-center justify-center font-bold shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0f172a]">Adjust Inventory Stock</h3>
              <p className="text-xs text-slate-500">Update item quantity in real-time database.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Target Item Details Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3.5">
            {itemImage ? (
              <img
                src={itemImage}
                alt={itemTitle}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[#e6f7ec] text-[#04883b] flex items-center justify-center font-bold shrink-0">
                <Package className="w-6 h-6" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-mono text-slate-400 block">{itemSku}</span>
              <h4 className="text-sm font-extrabold text-[#0f172a] truncate">{itemTitle}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-semibold text-slate-500">Current Level:</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                  {currentStock} units
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Stepper & Stock Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block text-center">
              New Inventory Stock Count
            </label>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleIncrement(-1)}
                className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-lg transition-colors active:scale-95"
              >
                <Minus className="w-5 h-5" />
              </button>

              <input
                type="number"
                min={0}
                value={stockVal}
                onChange={(e) => setStockVal(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-28 text-center py-3 text-xl font-extrabold text-[#0f172a] bg-[#f8fcf7] border-2 border-[#04883b] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#04883b]/20"
              />

              <button
                type="button"
                onClick={() => handleIncrement(1)}
                className="w-12 h-12 rounded-2xl bg-[#e6f7ec] hover:bg-[#04883b] hover:text-white border border-emerald-200 text-[#04883b] flex items-center justify-center font-bold text-lg transition-colors active:scale-95"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Increment Chips */}
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleIncrement(10)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#e6f7ec] hover:text-[#04883b] text-xs font-bold text-slate-600 transition-colors"
            >
              +10
            </button>
            <button
              type="button"
              onClick={() => handleIncrement(50)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#e6f7ec] hover:text-[#04883b] text-xs font-bold text-slate-600 transition-colors"
            >
              +50
            </button>
            <button
              type="button"
              onClick={() => handleIncrement(100)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#e6f7ec] hover:text-[#04883b] text-xs font-bold text-slate-600 transition-colors"
            >
              +100
            </button>
            <button
              type="button"
              onClick={() => setStockVal(0)}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-600 transition-colors"
            >
              Reset to 0
            </button>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-[#e9f2e7] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#04883b] text-xs font-bold text-white shadow-md shadow-[#04883b]/20 hover:bg-[#037030] transition-colors disabled:opacity-50"
            >
              {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Save Stock Level</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

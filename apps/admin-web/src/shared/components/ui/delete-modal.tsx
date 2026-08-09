import React from 'react';
import { AlertTriangle, Trash2, RefreshCw } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  itemTitle?: string;
  itemSubtitle?: string;
  itemImage?: string;
  isDeleting?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Item',
  description = 'Are you sure you want to delete this item? This action will permanently remove it from your backend database.',
  itemTitle,
  itemSubtitle,
  itemImage,
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-fadeIn overflow-hidden">
      <div className="bg-white rounded-3xl border border-[#e9f2e7] shadow-2xl w-full max-w-md overflow-hidden animate-scaleUp">
        {/* Modal Header */}
        <div className="p-6 text-center space-y-4">
          {/* Warning Icon Badge */}
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-[#0f172a] tracking-tight">{title}</h3>
            <p className="text-xs font-medium text-slate-500 max-w-xs mx-auto leading-relaxed">
              {description}
            </p>
          </div>

          {/* Optional Target Item Preview Box */}
          {itemTitle && (
            <div className="p-3.5 rounded-2xl bg-[#f8fcf7] border border-[#e9f2e7] flex items-center gap-3 text-left">
              {itemImage ? (
                <img src={itemImage} alt={itemTitle} className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                  <Trash2 className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold text-[#0f172a] truncate">{itemTitle}</p>
                {itemSubtitle && <p className="text-[11px] font-medium text-slate-400 truncate">{itemSubtitle}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Buttons */}
        <div className="p-4 bg-[#f8fcf7] border-t border-[#e9f2e7] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-600/20 hover:bg-rose-700 transition-colors disabled:opacity-50"
          >
            {isDeleting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span>Confirm Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

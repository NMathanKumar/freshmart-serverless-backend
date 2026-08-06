import React, { useState } from 'react';
import {
  Plus,
  Download,
  AlertCircle,
  RefreshCw,
  FileText,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  usePurchaseOrders,
  useCreatePurchaseOrder,
  useSubmitPurchaseOrder,
  useApprovePurchaseOrder,
  useRejectPurchaseOrder,
  useCancelPurchaseOrder,
} from '../hooks/usePurchaseOrders';
import { Skeleton } from '../../../components/ui/skeleton';
import { isAdmin } from '@freshmart/shared';

export const PurchaseOrdersPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [selectedPoId, setSelectedPoId] = useState<string | null>(null);
  const limit = 10;

  const { data, isLoading, isError, error, refetch } = usePurchaseOrders({ page, limit });
  const createPoMutation = useCreatePurchaseOrder();
  const submitPoMutation = useSubmitPurchaseOrder();
  const approvePoMutation = useApprovePurchaseOrder();
  const rejectPoMutation = useRejectPurchaseOrder();
  const cancelPoMutation = useCancelPurchaseOrder();

  const userIsAdmin = isAdmin();

  const handleCreatePo = () => {
    if (!userIsAdmin) {
      alert('403 Access Denied: Admin authorization required.');
      return;
    }
    const supplierName = prompt('Enter Supplier Name:', 'Default Supplier');
    if (supplierName) {
      createPoMutation.mutate({
        supplierId: 'SUP-001',
        supplierName,
        currency: 'USD',
        items: [
          { productId: 'prod-1', productName: 'Sample Product 1', quantityOrdered: 100, unitPrice: 10 },
          { productId: 'prod-2', productName: 'Sample Product 2', quantityOrdered: 50, unitPrice: 20 },
        ],
      });
    }
  };

  const handleSubmit = (poId: string) => {
    if (confirm('Submit this Purchase Order for approval?')) {
      submitPoMutation.mutate(poId);
    }
  };

  const handleApprove = (poId: string) => {
    if (confirm('Approve this Purchase Order?')) {
      approvePoMutation.mutate({ id: poId });
    }
  };

  const handleReject = (poId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      rejectPoMutation.mutate({ id: poId, reason });
    }
  };

  const handleCancel = (poId: string) => {
    const reason = prompt('Enter cancellation reason (optional):');
    if (reason !== null) {
      cancelPoMutation.mutate({ id: poId, reason });
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
          You do not have administrative permissions to view or manage purchase orders.
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
        <h3 className="text-base font-bold text-[#0f172a]">Failed to load purchase orders</h3>
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

  const purchaseOrders = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const activePo = selectedPoId
    ? purchaseOrders.find((po) => po.id === selectedPoId)
    : purchaseOrders[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0f172a]">Purchase Orders</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage vendor procurements, stock replenishment, and order fulfillment.
          </p>
        </div>
        <button
          onClick={handleCreatePo}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#04883b] text-xs font-bold text-white shadow-md shadow-[#04883b]/20 hover:bg-[#037030] transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create PO</span>
        </button>
      </div>

      {purchaseOrders.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-[#e9f2e7] text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#e6f7ec] text-[#04883b] flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[#0f172a]">No purchase orders found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Create your first purchase order to replenish stock.
          </p>
          <button
            onClick={handleCreatePo}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#04883b] text-xs font-bold text-white hover:bg-[#037030] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create PO</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e9f2e7] shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#f0f7ee] text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-6 py-4">PO NUMBER</th>
                    <th className="px-6 py-4">SUPPLIER</th>
                    <th className="px-6 py-4">TOTAL</th>
                    <th className="px-6 py-4 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                  {purchaseOrders.map((po) => (
                    <tr
                      key={po.id}
                      onClick={() => setSelectedPoId(po.id)}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                        activePo?.id === po.id ? 'bg-[#f4fcf0]' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <span className="font-bold text-[#04883b] block">{po.poNumber}</span>
                        <span className="text-[10px] text-slate-400">{po.createdAt.split('T')[0]}</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-[#0f172a]">{po.supplierName}</td>
                      <td className="px-6 py-4 font-extrabold text-[#0f172a]">${po.totalAmount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${po.statusBadgeBg} ${po.statusBadgeColor}`}>
                          {po.statusText}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-[#f4fcf0]/50">
              <span>Showing {purchaseOrders.length} of {total} items</span>
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

          {activePo && (
            <div className="bg-white p-6 rounded-2xl border border-[#e9f2e7] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#0f172a]">PO Detail</h3>
                  <p className="text-xs font-extrabold text-[#04883b] mt-0.5">{activePo.poNumber}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${activePo.statusBadgeBg} ${activePo.statusBadgeColor}`}>
                  {activePo.statusText}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <p className="font-bold text-[#0f172a]">{activePo.supplierName}</p>
                <p className="text-slate-500">Date: {activePo.createdAt.split('T')[0]}</p>
              </div>

              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-700 mb-2">Itemized Order</h4>
                <div className="space-y-2 text-xs">
                  {activePo.items.map((item, i) => (
                    <div key={i} className="p-2.5 bg-[#f0f7ee] rounded-xl flex items-center justify-between">
                      <div>
                        <p className="font-bold text-[#0f172a]">{item.productName}</p>
                        <p className="text-[10px] text-slate-500">Qty: {item.quantityOrdered} (${item.unitPrice.toFixed(2)})</p>
                      </div>
                      <span className="font-extrabold text-[#0f172a]">${item.lineTotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs font-bold pt-3 border-t border-slate-100">
                <span className="text-slate-600">Total Amount:</span>
                <span className="text-base text-[#04883b]">${activePo.totalAmount.toFixed(2)}</span>
              </div>

              {/* Actions based on Workflow Status */}
              <div className="flex flex-wrap gap-3 pt-2">
                {activePo.status === 'DRAFT' && (
                  <button
                    onClick={() => handleSubmit(activePo.id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-xs cursor-pointer shadow-md"
                  >
                    Submit for Approval
                  </button>
                )}
                {activePo.status === 'SUBMITTED' && (
                  <>
                    <button
                      onClick={() => handleApprove(activePo.id)}
                      className="flex-1 bg-[#04883b] hover:bg-[#037030] text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(activePo.id)}
                      className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </>
                )}
                {['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'ORDERED'].includes(activePo.status) && (
                  <button
                    onClick={() => handleCancel(activePo.id)}
                    className="w-full border border-rose-200 hover:bg-rose-50 text-rose-600 py-2.5 rounded-xl font-bold text-xs cursor-pointer"
                  >
                    Cancel PO
                  </button>
                )}
                <button
                  onClick={() => alert(`Downloading PDF for ${activePo.poNumber}`)}
                  className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

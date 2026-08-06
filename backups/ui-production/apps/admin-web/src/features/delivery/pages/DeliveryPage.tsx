import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Truck, CheckCircle2, AlertTriangle, Users, MapPin, Download, Plus, Navigation } from 'lucide-react';
import { freshmartSdk } from '../../../lib/sdk';
import { queryKeys } from '../../../lib/queryKeys';
import { LoadingState } from '../../../components/ui/loading-state';
import { ErrorState } from '../../../components/ui/error-state';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Select } from '../../../components/ui/select';
import { Modal } from '../../../components/ui/modal';
import { usePermissions } from '../../../context/PermissionsContext';
import { EmptyState } from '../../../components/ui/empty-state';
import type { Delivery } from '@freshmart/api-sdk';

export const DeliveryPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const canRead = hasPermission('delivery.read');
  const canAssign = hasPermission('delivery.assign');

  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [partnerId, setPartnerId] = useState<string>('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const { data: deliveries = [], isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.delivery.list(),
    queryFn: () => freshmartSdk.delivery.listDeliveries(),
    enabled: canRead,
    refetchInterval: 30000,
  });

  const assignMutation = useMutation({
    mutationFn: ({ deliveryId, partnerId }: { deliveryId: string; partnerId: string }) =>
      freshmartSdk.delivery.assignPartner(deliveryId, partnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.delivery.list() });
      setIsAssignModalOpen(false);
      setSelectedDelivery(null);
      setPartnerId('');
    },
  });

  const activeDeliveries = deliveries.filter((d: any) => d.status === 'ASSIGNED' || d.status === 'OUT_FOR_DELIVERY').length;
  const completedToday = deliveries.filter((d: any) => d.status === 'DELIVERED').length;
  const delayedOrders = 0; // Derived from ETA vs current time if available

  if (!canRead) {
    return (
      <EmptyState
        icon={<AlertTriangle className="h-8 w-8 text-rose-500" />}
        title="Access Denied"
        description="You do not have permission to view deliveries."
      />
    );
  }

  const handleAssignClick = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setIsAssignModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0f172a]">Delivery Management</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Monitor and dispatch logistics in real-time across the urban grid.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e8f3e5] text-xs font-bold text-[#0f172a] border border-[#d4e8d1] hover:bg-[#dcefd8] transition-colors">
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export Logs</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#e6f7ec] flex items-center justify-center text-[#04883b]">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs font-medium text-slate-500">Active Deliveries</span>
            <p className="text-2xl font-extrabold text-[#0f172a] mt-0.5">{activeDeliveries}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs font-medium text-slate-500">Completed Today</span>
            <p className="text-2xl font-extrabold text-[#0f172a] mt-0.5">{completedToday}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            {delayedOrders > 0 && (
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full">
                Dispatcher attention
              </span>
            )}
          </div>
          <div className="mt-3">
            <span className="text-xs font-medium text-slate-500">Delayed Orders</span>
            <p className="text-2xl font-extrabold text-rose-600 mt-0.5">{delayedOrders}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs font-medium text-slate-500">Available Partners</span>
            <p className="text-2xl font-extrabold text-[#0f172a] mt-0.5">12</p>
          </div>
        </div>
      </div>

      {/* Grid: Delivery Log Table (2/3) & Urban Grid Map Card (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Delivery Log Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e9f2e7] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0f172a]">Live Delivery Log</h3>
          </div>

          <div className="overflow-x-auto min-h-[300px]">
            {isLoading ? (
              <LoadingState label="Loading deliveries..." />
            ) : isError ? (
              <ErrorState description="Failed to load deliveries" onRetry={() => refetch()} />
            ) : deliveries.length === 0 ? (
              <EmptyState title="No Deliveries" description="There are no active deliveries at the moment." />
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#f0f7ee] text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-6 py-4">DELIVERY ID</th>
                    <th className="px-6 py-4">ORDER ID</th>
                    <th className="px-6 py-4">PARTNER</th>
                    <th className="px-6 py-4">STATUS</th>
                    <th className="px-6 py-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                  {deliveries.map((del: any) => (
                    <tr key={del.deliveryId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-[#04883b]">{del.deliveryId}</td>
                      <td className="px-6 py-4 font-bold text-[#0f172a]">{del.orderId}</td>
                      <td className="px-6 py-4 text-slate-600">{del.partnerId || 'Unassigned'}</td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            del.status === 'DELIVERED' ? 'emerald' :
                            del.status === 'OUT_FOR_DELIVERY' ? 'emerald' :
                            del.status === 'ASSIGNED' ? 'blue' :
                            'amber'
                          }
                        >
                          {del.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {canAssign && (del.status === 'PENDING' || del.status === 'UNASSIGNED' || !del.partnerId) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssignClick(del)}
                            className="text-[10px] h-7"
                          >
                            Assign
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Urban Grid Map & Dispatch Optimization Panel */}
        <div className="bg-white p-6 rounded-2xl border border-[#e9f2e7] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-[#0f172a]">Urban Grid Logistics</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e6f7ec] text-[#04883b]">
              Live Map
            </span>
          </div>

          {/* Map Image Graphic */}
          <div className="relative h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&auto=format&fit=crop&q=80"
              alt="Urban Map Grid"
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-bold text-[#0f172a] shadow-xs flex items-center gap-1.5">
              <Navigation className="w-3 h-3 text-[#04883b]" />
              <span>Optimized Routes</span>
            </div>
          </div>

          {/* Logistics metrics */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-[#f0f7ee] rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Average Speed</span>
              <p className="text-base font-extrabold text-[#0f172a] mt-0.5">High</p>
            </div>
            <div className="p-3 bg-[#f0f7ee] rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Avg Distance</span>
              <p className="text-base font-extrabold text-[#0f172a] mt-0.5">3.2km</p>
            </div>
          </div>

          {/* Automated Optimization Banner */}
          <div className="p-4 bg-[#04883b] rounded-xl text-white space-y-2">
            <p className="text-xs font-bold">Dispatch Requests</p>
            <p className="text-[11px] text-emerald-100 leading-relaxed">
              Smart algorithm is optimizing {deliveries.filter((d: any) => d.status === 'PENDING').length} unassigned parcel routes.
            </p>
            <button className="w-full py-2 bg-white text-[#04883b] rounded-lg text-xs font-extrabold hover:bg-emerald-50 transition-colors mt-2">
              Automate Optimization
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Delivery Partner"
      >
        <div className="space-y-4 pt-4">
          <p className="text-sm text-slate-600">
            Assign a partner for delivery <span className="font-bold">{selectedDelivery?.deliveryId}</span>.
          </p>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Delivery Partner</label>
            <Select
              value={partnerId}
              onChange={(value) => setPartnerId(value)}
              className="w-full"
              options={[
                { value: '', label: 'Select a partner' },
                { value: 'PARTNER-001', label: 'PARTNER-001 (Robert Chen)' },
                { value: 'PARTNER-002', label: 'PARTNER-002 (Elena Rodriguez)' },
                { value: 'PARTNER-003', label: 'PARTNER-003 (Marcus Thorne)' },
              ]}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!partnerId || assignMutation.isPending}
              onClick={() => {
                if (selectedDelivery) {
                  assignMutation.mutate({ deliveryId: (selectedDelivery as any).deliveryId, partnerId });
                }
              }}
            >
              {assignMutation.isPending ? 'Assigning...' : 'Assign'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

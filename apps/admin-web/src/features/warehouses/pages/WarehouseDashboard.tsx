import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  MapPin, 
  Activity, 
  MoreVertical,
  PackageCheck,
  Edit,
  Trash2,
  Power
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { CardSkeleton, TableSkeleton } from '../../../components/ui/skeleton';
import { freshmartSdk } from '../../../lib/sdk';
import { type AdminWarehouse } from '@freshmart/api-sdk';

export function WarehouseDashboard() {
  const [warehouses, setWarehouses] = useState<AdminWarehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    setLoading(true);
    try {
      const res = await freshmartSdk.warehouse.listWarehouses(100);
      setWarehouses(res.data || []);
    } catch (e) {
      console.error('Failed to load warehouses', e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'CLOSED') => {
    try {
      await freshmartSdk.warehouse.updateWarehouseStatus(id, newStatus);
      await loadWarehouses();
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  const filteredWarehouses = warehouses.filter((w) => {
    const matchesSearch = w.warehouseName.toLowerCase().includes(search.toLowerCase()) || 
                          w.warehouseCode.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || w.status === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'INACTIVE': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      case 'MAINTENANCE': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'CLOSED': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-500" />
            Warehouse Management
          </h1>
          <p className="text-gray-400 mt-1">Manage physical locations, capacity, and status</p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          <Plus className="w-4 h-4 mr-2" />
          Add Warehouse
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-xl border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <Building2 className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Total Warehouses</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {loading ? '-' : warehouses.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Active Facilities</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {loading ? '-' : warehouses.filter(w => w.status === 'ACTIVE').length}
              </h3>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-6 rounded-xl border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <PackageCheck className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Total Capacity</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {loading ? '-' : warehouses.reduce((acc, w) => acc + (w.capacity?.maxStorageCapacity || 0), 0).toLocaleString()}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search warehouses by name or code..."
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-500 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          options={[
            { value: 'All', label: 'All Status' },
            { value: 'ACTIVE', label: 'Active' },
            { value: 'MAINTENANCE', label: 'Maintenance' },
            { value: 'INACTIVE', label: 'Inactive' },
            { value: 'CLOSED', label: 'Closed' }
          ]}
          className="w-full md:w-48 bg-white/5 border-white/10 text-white"
        />
      </div>

      {/* List */}
      <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 bg-white/5 uppercase border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">Warehouse</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium">Capacity Util.</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
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
                  </tr>
                ))
              ) : filteredWarehouses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <Building2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    No warehouses found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredWarehouses.map((warehouse) => (
                  <tr key={warehouse.warehouseId} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{warehouse.warehouseName}</p>
                          <p className="text-xs text-gray-400">{warehouse.warehouseCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        {warehouse.address.city}, {warehouse.address.state}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden w-24">
                          <div 
                            className={`h-full rounded-full ${warehouse.capacity.utilizationPercentage > 85 ? 'bg-red-500' : warehouse.capacity.utilizationPercentage > 70 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                            style={{ width: `${warehouse.capacity.utilizationPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 font-medium">{warehouse.capacity.utilizationPercentage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(warehouse.status)}`}>
                        {warehouse.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-400 hover:text-white"
                          onClick={() => handleStatusChange(warehouse.warehouseId, warehouse.status === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE')}
                        >
                          <Power className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-blue-400 hover:bg-blue-400/10">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
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

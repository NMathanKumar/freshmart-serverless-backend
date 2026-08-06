import React, { useState } from 'react';
import { Card } from '../../../components/ui/card';
import { Tabs, type TabItem } from '../../../components/ui/tabs';
import { Table, type Column } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { SearchBar } from '../../../components/ui/search-bar';
import { FilterBar, type FilterConfig } from '../../../components/ui/filter-bar';
import { StatusBadge } from '../../../components/ui/status-badge';
import { Clock, User, ListTodo, Box } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { orderService, type OrderModel } from '../../orders/services/order.service';

interface Order {
  id: string;
  status: string;
  priority: string;
  warehouse: string;
  items: number;
  createdAt: string;
}

export const FulfillmentDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const navigate = useNavigate();

  // Mock KPIs
  const kpis = [
    { title: 'Orders Waiting', value: '142', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-100' },
    { title: 'Allocated for Picking', value: '45', icon: ListTodo, color: 'text-blue-500', bg: 'bg-blue-100' },
    { title: 'Ready for Dispatch', value: '28', icon: Box, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    { title: 'Picking SLA Breach', value: '3', icon: User, color: 'text-rose-500', bg: 'bg-rose-100' },
  ];

  const [orders, setOrders] = useState<Order[]>([]);

  React.useEffect(() => {
    orderService.listOrders().then(data => {
      const mappedOrders: Order[] = data.map((o, i) => ({
        id: o.id,
        status: o.orderStatus === 'DELIVERED' ? 'completed' : o.orderStatus === 'PENDING' ? 'pending' : o.orderStatus === 'SHIPPED' ? 'ready' : 'allocated',
        priority: i % 3 === 0 ? 'HIGH' : i % 5 === 0 ? 'URGENT' : 'NORMAL',
        warehouse: `WH-0${(i % 3) + 1}`,
        items: parseInt(o.productsCount) || 1,
        createdAt: o.date,
      }));
      setOrders(mappedOrders);
    });
  }, []);

  const filterOptions: FilterConfig[] = [
    { 
      key: 'priority', 
      label: 'Priority', 
      value: priorityFilter,
      options: [{ label: 'Normal', value: 'NORMAL' }, { label: 'High', value: 'HIGH' }, { label: 'Urgent', value: 'URGENT' }] 
    },
    { 
      key: 'warehouse', 
      label: 'Warehouse', 
      value: warehouseFilter,
      options: [{ label: 'WH-01', value: 'WH-01' }, { label: 'WH-02', value: 'WH-02' }, { label: 'WH-03', value: 'WH-03' }] 
    },
  ];

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'priority') setPriorityFilter(value);
    if (key === 'warehouse') setWarehouseFilter(value);
  };

  const filteredOrders = orders.filter(o => {
    if (activeTab !== o.status) return false;
    if (priorityFilter && o.priority !== priorityFilter) return false;
    if (warehouseFilter && o.warehouse !== warehouseFilter) return false;
    if (searchTerm && !o.id.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'rose';
      case 'HIGH': return 'amber';
      default: return 'slate';
    }
  };

  const columns: Column<Order>[] = [
    { key: 'id', header: 'Order ID', sortable: true },
    { key: 'createdAt', header: 'Date & Time', accessor: (o) => new Date(o.createdAt).toLocaleString(), sortable: true },
    { key: 'warehouse', header: 'Warehouse', sortable: true },
    { key: 'items', header: 'Items', accessor: (o) => `${o.items} items`, sortable: true },
    { key: 'priority', header: 'Priority', accessor: (o) => <Badge variant={getPriorityColor(o.priority) as any}>{o.priority}</Badge>, sortable: true },
    { key: 'status', header: 'Status', accessor: (o) => <StatusBadge status={o.status} />, sortable: true },
  ];

  const tabs: TabItem[] = [
    { id: 'pending', label: 'Pending' },
    { id: 'allocated', label: 'Allocated' },
    { id: 'picking', label: 'Picking' },
    { id: 'packing', label: 'Packing' },
    { id: 'ready', label: 'Ready' },
    { id: 'completed', label: 'Completed' },
  ];

  const renderActions = (order: Order) => {
    if (order.status === 'pending') return <Button size="sm" variant="outline" onClick={() => navigate({ to: '/fulfillment/picker-assignment' })}>Allocate</Button>;
    if (order.status === 'allocated') return <Button size="sm" variant="outline" onClick={() => navigate({ to: '/fulfillment/pick-list' })}>Start Picking</Button>;
    if (order.status === 'picking') return <Button size="sm" variant="outline" onClick={() => navigate({ to: '/fulfillment/packing' })}>Pack</Button>;
    if (order.status === 'packing') return <Button size="sm" variant="outline" onClick={() => navigate({ to: '/fulfillment/packing' })}>Complete Packing</Button>;
    if (order.status === 'ready') return <Button size="sm" variant="outline" onClick={() => navigate({ to: '/fulfillment/shipment' })}>Dispatch</Button>;
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-200">Fulfillment Dashboard</h1>
          <p className="text-sm text-slate-400">Manage order picking, packing, and dispatch queues.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate({ to: '/fulfillment/picker-assignment' })} leftIcon={<User className="w-4 h-4" />}>
            Assign Pickers
          </Button>
          <Button onClick={() => navigate({ to: '/fulfillment/pick-list' })} leftIcon={<ListTodo className="w-4 h-4" />}>
            Generate Pick List
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <Card key={idx} className="p-6 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${kpi.bg}`}>
              <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">{kpi.title}</p>
              <h3 className="text-2xl font-bold text-slate-200">{kpi.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      <Card className="flex flex-col overflow-hidden">
        <div className="border-b border-slate-800">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>
        
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
          <div className="w-64">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search orders..."
            />
          </div>
          <FilterBar filters={filterOptions} onFilterChange={handleFilterChange} onReset={() => { setPriorityFilter(''); setWarehouseFilter(''); }} />
        </div>
        
        <div className="p-4">
          <Table<Order>
            columns={columns}
            data={filteredOrders}
            keyExtractor={(o) => o.id}
            actions={renderActions}
            emptyMessage="No orders found in this queue."
          />
        </div>
      </Card>
    </div>
  );
};

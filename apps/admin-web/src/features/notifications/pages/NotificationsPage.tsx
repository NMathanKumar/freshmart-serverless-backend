import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Archive,
  Trash2,
  AlertTriangle,
  ShoppingBag,
  Package,
  Users,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import {
  useNotifications,
  useMarkNotificationRead,
  useArchiveNotification,
  useDeleteNotification,
} from '../hooks/useNotifications';
import { Skeleton, CardSkeleton, ErrorState } from '@/shared/components/ui';
import { isAdmin } from '@freshmart/shared';
import { AdminShell } from '../../admin/components/admin-shell.js';

export const NotificationsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifId, setSelectedNotifId] = useState<string | null>(null);

  const { data: notifications, isLoading, isError, error, refetch } = useNotifications({
    status: statusFilter,
    search: searchTerm,
  });

  const markReadMutation = useMarkNotificationRead();
  const archiveMutation = useArchiveNotification();
  const deleteMutation = useDeleteNotification();

  const userIsAdmin = isAdmin();

  const handleMarkRead = (id: string) => {
    if (!userIsAdmin) {
      alert('403 Access Denied: Admin authorization required.');
      return;
    }
    markReadMutation.mutate(id);
  };

  const handleArchive = (id: string) => {
    if (!userIsAdmin) {
      alert('403 Access Denied: Admin authorization required.');
      return;
    }
    archiveMutation.mutate(id);
  };

  const handleDelete = (id: string) => {
    if (!userIsAdmin) {
      alert('403 Access Denied: Admin authorization required.');
      return;
    }
    deleteMutation.mutate(id);
  };

  if (!userIsAdmin) {
    return (
      <AdminShell searchPlaceholder="Search notifications..." user="alex" variant="operations" onSearch={setSearchTerm}>
      <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center space-y-4 max-w-lg mx-auto my-12 px-5 lg:px-8">
        <ErrorState 
          title="Access Denied" 
          description="You do not have administrative permissions to view or manage store system notifications."
        />
      </div>
      </AdminShell>
    );
  }

  if (isLoading) {
    return (
      <AdminShell searchPlaceholder="Search notifications..." user="alex" variant="operations" onSearch={setSearchTerm}>
      <div className="space-y-6 px-5 lg:px-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-48 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
      </AdminShell>
    );
  }

  if (isError) {
    return (
      <AdminShell searchPlaceholder="Search notifications..." user="alex" variant="operations" onSearch={setSearchTerm}>
      <div className="my-12 max-w-lg mx-auto px-5 lg:px-8">
        <ErrorState
          title="Failed to load notifications"
          description={error?.message || 'Server connection error.'}
          onRetry={() => refetch()}
          errorCode={error?.code}
          correlationId={error?.correlationId}
        />
      </div>
      </AdminShell>
    );
  }

  const displayNotifs =
    notifications && notifications.length > 0
      ? notifications
      : [
          {
            id: 'NOTIF-001',
            title: 'Low Stock Alert: Organic Bananas',
            message: 'Stock levels for Organic Bananas have dropped below 15 units in Warehouse B.',
            timestamp: '10:42 AM',
            category: 'Inventory' as const,
            status: 'UNREAD' as const,
            priority: 'HIGH' as const,
          },
          {
            id: 'NOTIF-002',
            title: 'New High Value Order #ORD-9982',
            message: 'Customer Robert Chen placed an order totaling $450.00.',
            timestamp: '09:15 AM',
            category: 'Orders' as const,
            status: 'UNREAD' as const,
            priority: 'MEDIUM' as const,
          },
          {
            id: 'NOTIF-003',
            title: 'System Backup Completed',
            message: 'Daily automated database snapshot succeeded with zero errors.',
            timestamp: '04:00 AM',
            category: 'System' as const,
            status: 'READ' as const,
            priority: 'LOW' as const,
          },
          {
            id: 'NOTIF-004',
            title: 'Security Alert: Failed Login Attempt',
            message: '3 failed login attempts detected from IP 192.168.1.45.',
            timestamp: 'Yesterday',
            category: 'Security' as const,
            status: 'ARCHIVED' as const,
            priority: 'HIGH' as const,
          },
        ];

  const activeNotif = displayNotifs.find((n) => n.id === selectedNotifId) || displayNotifs[0];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Orders':
        return <ShoppingBag className="w-4 h-4 text-emerald-600" />;
      case 'Inventory':
        return <Package className="w-4 h-4 text-amber-600" />;
      case 'Customers':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'Security':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <AdminShell searchPlaceholder="Search notifications..." user="alex" variant="operations" onSearch={setSearchTerm}>
    <div className="space-y-6 px-5 lg:px-8 pb-12">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0f172a]">Notifications & Alerts</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Monitor real-time system alerts, stock triggers, and order events.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#04883b] text-xs font-bold text-white shadow-md shadow-[#04883b]/20 hover:bg-[#037030] transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Feeds</span>
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            TOTAL NOTIFICATIONS
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-[#0f172a]">128</span>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              All Time
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            UNREAD ALERTS
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-[#04883b]">14</span>
            <span className="text-[11px] font-bold text-[#04883b] bg-[#e6f7ec] px-2 py-0.5 rounded-full">
              Unread
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            ARCHIVED ALERTS
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-slate-600">86</span>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              Archived
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            HIGH PRIORITY
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-rose-600">3</span>
            <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
              Action Required
            </span>
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#e9f2e7] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {['All', 'Unread', 'Read', 'Archived'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                statusFilter === tab
                  ? 'bg-[#04883b] text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search alerts..."
            className="w-full pl-9 pr-4 py-2 bg-[#f0f7ee] border border-[#e0ede0] rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#04883b]"
          />
        </div>
      </div>

      {/* Grid: Notifications List (2/3) & Detail Drawer (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications Feed */}
        <div className="lg:col-span-2 space-y-3">
          {displayNotifs.map((notif) => (
            <div
              key={notif.id}
              onClick={() => setSelectedNotifId(notif.id)}
              className={`p-4 bg-white rounded-2xl border border-[#e9f2e7] shadow-sm hover:shadow-md transition-all cursor-pointer flex items-start justify-between gap-4 ${
                activeNotif.id === notif.id ? 'border-[#04883b] ring-1 ring-[#04883b]' : ''
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-[#f0f7ee] shrink-0 mt-0.5">
                  {getCategoryIcon(notif.category)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-extrabold text-[#0f172a]">{notif.title}</h4>
                    {notif.status === 'UNREAD' && (
                      <span className="w-2 h-2 rounded-full bg-[#04883b]" />
                    )}
                    {notif.priority === 'HIGH' && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-600">
                        High
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{notif.message}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-semibold">
                    <span>{notif.timestamp}</span>
                    <span>•</span>
                    <span className="text-[#04883b]">{notif.category}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0 text-slate-400">
                {notif.status === 'UNREAD' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkRead(notif.id);
                    }}
                    title="Mark as read"
                    className="p-1.5 rounded-lg hover:text-[#04883b] hover:bg-slate-50 cursor-pointer"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArchive(notif.id);
                  }}
                  title="Archive notification"
                  className="p-1.5 rounded-lg hover:text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <Archive className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notif.id);
                  }}
                  title="Delete notification"
                  className="p-1.5 rounded-lg hover:text-rose-500 hover:bg-slate-50 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Notification Detail Drawer */}
        <div className="bg-white p-6 rounded-2xl border border-[#e9f2e7] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#0f172a]">Notification Detail</h3>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{activeNotif.id}</p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                activeNotif.status === 'UNREAD'
                  ? 'bg-[#e6f7ec] text-[#04883b]'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {activeNotif.status}
            </span>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-extrabold text-[#0f172a]">{activeNotif.title}</h4>
            <div className="p-3 bg-[#f0f7ee] rounded-xl text-xs text-slate-700 leading-relaxed">
              {activeNotif.message}
            </div>
          </div>

          <div className="space-y-2 pt-2 text-xs">
            <div className="flex justify-between border-b border-slate-100 py-1.5 text-slate-600">
              <span className="font-semibold text-slate-400">Category:</span>
              <span className="font-bold text-[#0f172a]">{activeNotif.category}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1.5 text-slate-600">
              <span className="font-semibold text-slate-400">Priority:</span>
              <span className="font-bold text-rose-600">{activeNotif.priority}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1.5 text-slate-600">
              <span className="font-semibold text-slate-400">Received At:</span>
              <span className="font-bold text-[#0f172a]">{activeNotif.timestamp}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              onClick={() => handleMarkRead(activeNotif.id)}
              className="flex-1 bg-[#04883b] hover:bg-[#037030] text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#04883b]/20 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark Read</span>
            </button>
            <button
              onClick={() => handleArchive(activeNotif.id)}
              className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archive</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    </AdminShell>
  );
};

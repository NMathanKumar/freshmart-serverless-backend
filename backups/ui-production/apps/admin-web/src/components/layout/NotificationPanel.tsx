import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Popover } from '../ui/popover';
import { Bell, Check, ShoppingCart, AlertTriangle, UserPlus, Sparkles } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { freshmartSdk } from '../../lib/sdk';
import { queryKeys } from '../../lib/queryKeys';

export const NotificationPanel: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: () => freshmartSdk.notifications.list(),
    refetchInterval: 30000, // auto refresh every 30 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => freshmartSdk.notifications.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => freshmartSdk.notifications.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });

  // Safe fallback if API SDK response shape differs temporarily
  const notifications: any[] = data?.notifications || (data as any)?.items || (data as any)?.data || [];
  const unreadCount = notifications.filter((n) => !n.read || n.status === 'UNREAD').length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'ORDER':
        return <ShoppingCart className="w-4 h-4 text-emerald-400" />;
      case 'INVENTORY':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'USER':
      case 'ROLE':
        return <UserPlus className="w-4 h-4 text-blue-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <Popover
      align="right"
      className="w-80 sm:w-96 p-0 overflow-hidden"
      trigger={
        <button className="relative p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-400 hover:text-slate-200 transition-colors">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex items-center justify-center text-[8px] text-white font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      }
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-sm text-slate-100">Notifications</h4>
          {unreadCount > 0 && <Badge variant="emerald">{unreadCount} New</Badge>}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-[11px] h-7 px-2"
          disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
          onClick={() => markAllAsReadMutation.mutate()}
        >
          {markAllAsReadMutation.isPending ? 'Marking...' : 'Mark all read'}
        </Button>
      </div>

      <div className="divide-y divide-slate-800/60 max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-xs text-slate-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No notifications</div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id || item.notificationId}
              className={`p-3.5 flex items-start gap-3 hover:bg-slate-800/40 transition-colors cursor-pointer ${
                (!item.read && item.status !== 'READ') ? 'bg-emerald-500/5' : ''
              }`}
              onClick={() => {
                if (!item.read && item.status !== 'READ') {
                  markAsReadMutation.mutate(item.id || item.notificationId);
                }
              }}
            >
              <div className="p-2 rounded-xl bg-slate-800 border border-slate-700/60 shrink-0">
                {getIcon(item.category || item.type || 'SYSTEM')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-semibold text-slate-200 truncate">{item.title || item.subject}</h5>
                  <span className="text-[10px] text-slate-500 shrink-0">
                    {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                  {item.message || item.body}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-2 border-t border-slate-800 text-center bg-slate-950/40">
        <Button variant="ghost" size="sm" className="w-full text-xs text-emerald-400 hover:text-emerald-300">
          View All Notifications
        </Button>
      </div>
    </Popover>
  );
};

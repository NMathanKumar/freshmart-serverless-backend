const fs = require('fs');
const path = require('path');

const hookFile = path.resolve('apps/customer-web/src/features/account/hooks/use-notifications.ts');

const newContent = `import { useMemo } from 'react';
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllNotificationsMutation
} from '../../commerce/api/commerce-api.js';
import {
  Check,
  PartyPopper,
  ShieldCheck,
  Tag,
  Truck,
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  type: 'order' | 'offer' | 'system';
  title: string;
  description: string;
  time: string;
  read: boolean;
  icon: typeof Truck;
  iconBg: string;
  iconColor: string;
  imageBanner?: string;
  hasDot?: boolean;
}

const getRelativeTime = (isoString?: string): string => {
  if (!isoString) return 'Just now';
  const now = new Date();
  const past = new Date(isoString);
  const diffMs = now.getTime() - past.getTime();
  if (isNaN(diffMs) || diffMs < 0) return 'Just now';
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return \`\${diffMins} mins ago\`;
  if (diffHours < 24) return \`\${diffHours} hour\${diffHours === 1 ? '' : 's'} ago\`;
  if (diffDays === 1) return 'Yesterday';
  return \`\${diffDays} days ago\`;
};

const mapBackendNotification = (n: any): NotificationItem => {
  const type = n.type || 'system';
  let icon = ShieldCheck;
  let iconBg = 'bg-[#e9f0e5]';
  let iconColor = 'text-[#3e4a3d]';

  if (type === 'order' || type === 'ORDER') {
    icon = Truck;
    iconBg = 'bg-[#d8f4ce]';
    iconColor = 'text-[#006b2c]';
  } else if (type === 'offer' || type === 'OFFER' || type === 'PROMO') {
    icon = Tag;
    iconBg = 'bg-[#ffd9de]';
    iconColor = 'text-[#a72d51]';
  } else if (type === 'alert' || type === 'ALERT') {
    icon = Check;
    iconBg = 'bg-[#e3f5ea]';
    iconColor = 'text-[#006c4a]';
  }

  return {
    id: String(n.id || n.notificationId || Math.random()),
    type: (type.toLowerCase() as 'order' | 'offer' | 'system') || 'system',
    title: n.title || 'Notification',
    description: n.message || n.description || '',
    time: getRelativeTime(n.createdAt || n.created_at),
    read: !!n.read || !!n.isRead,
    icon,
    iconBg,
    iconColor,
    hasDot: !(!!n.read || !!n.isRead),
  };
};

export function useNotifications() {
  const { data: rawData = [] } = useGetNotificationsQuery(undefined, { pollingInterval: 30000 });
  const [markReadApi] = useMarkNotificationReadMutation();
  const [markAllReadApi] = useMarkAllNotificationsReadMutation();
  const [deleteApi] = useDeleteNotificationMutation();
  const [deleteAllApi] = useDeleteAllNotificationsMutation();

  const allNotifications = useMemo(() => {
    return Array.isArray(rawData) ? rawData.map(mapBackendNotification) : [];
  }, [rawData]);

  const unreadCount = allNotifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      await markReadApi(id).unwrap();
    } catch (_) {}
  };

  const markAllAsRead = async () => {
    try {
      await markAllReadApi().unwrap();
    } catch (_) {}
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteApi(id).unwrap();
    } catch (_) {}
  };

  const deleteAll = async () => {
    try {
      // Best effort delete all if endpoint supported, otherwise we rely on backend action
      await deleteAllApi().unwrap();
    } catch (_) {}
  };

  return {
    allNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAll,
  };
}
`;

fs.writeFileSync(hookFile, newContent);
console.log('Patched use-notifications.ts');

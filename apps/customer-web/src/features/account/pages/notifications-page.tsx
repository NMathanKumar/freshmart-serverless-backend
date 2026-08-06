import { useState } from 'react';
import {
  Check,
  CheckCheck,
  PartyPopper,
  ShieldCheck,
  Tag,
  Trash2,
  Truck,
} from 'lucide-react';
import { Button } from '@freshmart/design-system';
import { HomeHeader } from '../../home/components/home-header.js';
import { HomeFooter } from '../../home/components/home-footer.js';

import { useGetOrdersQuery } from '../../commerce/api/commerce-api.js';

interface NotificationItem {
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
  if (diffMins < 60) return `${diffMins} mins ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
};

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'order',
    title: 'Your order is out for delivery',
    description:
      'Driver Marcus is approaching your location with your fresh groceries from Order #FM-9921.',
    time: '2 mins ago',
    read: false,
    icon: Truck,
    iconBg: 'bg-[#d8f4ce]',
    iconColor: 'text-[#006b2c]',
    hasDot: true,
  },
  {
    id: 'notif-2',
    type: 'offer',
    title: 'Flash Sale: 40% OFF Organic Greens',
    description:
      'Get fresh kale, spinach, and arugula at nearly half price. Offer valid until midnight today!',
    time: '1 hour ago',
    read: false,
    icon: Tag,
    iconBg: 'bg-[#ffd9de]',
    iconColor: 'text-[#a72d51]',
    imageBanner:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCSHaELNOhgX7mXWpkTZoBd8EkjiC2gtiPjn00f0mfjjc35_Do4_8Cy5vfaZ00jCjl_LWa_yqs1YWNNxfKG-47zOk6_uc4o68CzFG_6qcXMcdsDVDl_SyzMzXoPgwzJXcSlEVxzUTctK3lNfyPPIhPNxdF9p3-VLXrfZOpRAlbQ8V_eSjtPAmHqEI4QEygGblDnpdLD1BIr84P3DEYq4457nmGfVawMGFAmdA0Sx86DswR32pk7VCPiD5p8M9i4wnqts7_21AyM6I6S',
  },
  {
    id: 'notif-3',
    type: 'order',
    title: 'Order Delivered',
    description:
      'Order #FM-9918 has been successfully delivered. Please rate your experience!',
    time: '4 hours ago',
    read: true,
    icon: Check,
    iconBg: 'bg-[#e3f5ea]',
    iconColor: 'text-[#006c4a]',
  },
  {
    id: 'notif-4',
    type: 'system',
    title: 'Security Update',
    description:
      "We've enhanced our payment encryption protocols to ensure your data stays even more secure.",
    time: 'Yesterday',
    read: true,
    icon: ShieldCheck,
    iconBg: 'bg-[#e9f0e5]',
    iconColor: 'text-[#3e4a3d]',
  },
  {
    id: 'notif-5',
    type: 'offer',
    title: 'Happy Fresh Anniversary!',
    description:
      "You've been shopping with us for 1 year! Here's a ₹100 voucher as a thank you.",
    time: '2 days ago',
    read: true,
    icon: PartyPopper,
    iconBg: 'bg-[#ffd9de]/60',
    iconColor: 'text-[#a72d51]',
  },
];

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'orders', label: 'Orders' },
  { id: 'offers', label: 'Offers' },
  { id: 'system', label: 'System' },
];

export function NotificationsContent() {
  const { data: realOrders = [] } = useGetOrdersQuery();
  const [cleared, setCleared] = useState(false);
  const [readMap, setReadMap] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('all');

  const dynamicOrderNotifs: NotificationItem[] = realOrders.map((o) => ({
    id: `order-notif-${o.orderId}`,
    type: 'order',
    title: `Order Placed Successfully`,
    description: `Order #${o.orderId} for ₹${o.totalAmount} has been placed. Status: ${o.orderStatusLabel || o.orderStatus}.`,
    time: getRelativeTime((o as any).createdAt || o.orderDate),
    read: !!readMap[`order-notif-${o.orderId}`],
    icon: Truck,
    iconBg: 'bg-[#d8f4ce]',
    iconColor: 'text-[#006b2c]',
    hasDot: !readMap[`order-notif-${o.orderId}`],
  }));

  const allNotifications = cleared
    ? []
    : [...dynamicOrderNotifs, ...INITIAL_NOTIFICATIONS.map((n) => ({ ...n, read: readMap[n.id] ?? n.read, hasDot: readMap[n.id] ? false : n.hasDot }))];

  const markAllAsRead = () => {
    const updatedMap: Record<string, boolean> = {};
    allNotifications.forEach((n) => {
      updatedMap[n.id] = true;
    });
    setReadMap(updatedMap);
  };

  const deleteAll = () => {
    setCleared(true);
  };

  const filteredNotifications = allNotifications.filter((n) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'orders') return n.type === 'order';
    if (activeTab === 'offers') return n.type === 'offer';
    if (activeTab === 'system') return n.type === 'system';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f4fcf0] font-sans text-[#171d16]">
      <HomeHeader cartCount={3} />

      <main className="mx-auto max-w-4xl space-y-6 px-6 pt-24 pb-16 md:px-8">
        {/* Header Row */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#171d16] md:text-4xl">
              Notifications
            </h1>
            <p className="mt-1 text-sm font-semibold text-[#8b9888]">
              Stay updated with your latest activities
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              className="flex h-9 items-center gap-1.5 rounded-full bg-[#e3f5ea] px-4 text-xs font-black text-[#006c4a] shadow-xs transition-all hover:bg-[#c5edd8]"
              onClick={markAllAsRead}
              type="button"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Mark all as read</span>
            </Button>

            <button
              className="inline-flex items-center gap-1 p-1 text-xs font-extrabold text-rose-600 transition-colors hover:text-rose-700"
              onClick={deleteAll}
              type="button"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete all</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-8 border-b border-[#e2ebdE]">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`relative pb-3 text-xs font-black transition-all ${
                activeTab === tab.id
                  ? 'text-[#006c4a]'
                  : 'text-[#8b9888] hover:text-[#171d16]'
              }`}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-[#006c4a]" />
              )}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="rounded-[24px] border border-[#e2ebdE] bg-white p-12 text-center text-sm font-bold text-[#8b9888]">
            No notifications available in this view.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`rounded-[24px] border border-[#e2ebdE] bg-white p-5 shadow-xs transition-all hover:shadow-md md:p-6 ${
                    !item.read ? 'border-l-4 border-l-[#006c4a]' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon Circle */}
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${item.iconBg} ${item.iconColor}`}
                    >
                      <Icon className="h-5 w-5 stroke-[2.5]" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold text-[#171d16]">
                            {item.title}
                          </h3>
                          {item.hasDot && (
                            <span className="h-2 w-2 rounded-full bg-[#006c4a]" />
                          )}
                        </div>
                        <span className="shrink-0 text-[11px] font-bold text-[#8b9888]">
                          {item.time}
                        </span>
                      </div>

                      <p className="text-xs leading-relaxed font-medium text-[#3e4a3d]">
                        {item.description}
                      </p>

                      {/* Optional Image Banner for Offers */}
                      {item.imageBanner && (
                        <div className="mt-3 h-40 w-full overflow-hidden rounded-2xl border border-[#e2ebdE] bg-[#f4fcf0]">
                          <img
                            alt={item.title}
                            className="h-full w-full object-cover"
                            src={item.imageBanner}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <HomeFooter />
    </div>
  );
}

export default function NotificationsPage() {
  return <NotificationsContent />;
}

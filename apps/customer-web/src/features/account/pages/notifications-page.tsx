import { useState } from 'react';
import { Check, CheckCheck, PartyPopper, ShieldCheck, Tag, Trash2, Truck } from 'lucide-react';
import { Button } from '@freshmart/design-system';
import { HomeHeader } from '../../home/components/home-header.js';
import { HomeFooter } from '../../home/components/home-footer.js';

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

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'order',
    title: 'Your order is out for delivery',
    description: 'Driver Marcus is approaching your location with your fresh groceries from Order #FM-9921.',
    time: '2 mins ago',
    read: false,
    icon: Truck,
    iconBg: 'bg-[#d8f4ce]',
    iconColor: 'text-[#006b2c]',
    hasDot: true
  },
  {
    id: 'notif-2',
    type: 'offer',
    title: 'Flash Sale: 40% OFF Organic Greens',
    description: 'Get fresh kale, spinach, and arugula at nearly half price. Offer valid until midnight today!',
    time: '1 hour ago',
    read: false,
    icon: Tag,
    iconBg: 'bg-[#ffd9de]',
    iconColor: 'text-[#a72d51]',
    imageBanner: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSHaELNOhgX7mXWpkTZoBd8EkjiC2gtiPjn00f0mfjjc35_Do4_8Cy5vfaZ00jCjl_LWa_yqs1YWNNxfKG-47zOk6_uc4o68CzFG_6qcXMcdsDVDl_SyzMzXoPgwzJXcSlEVxzUTctK3lNfyPPIhPNxdF9p3-VLXrfZOpRAlbQ8V_eSjtPAmHqEI4QEygGblDnpdLD1BIr84P3DEYq4457nmGfVawMGFAmdA0Sx86DswR32pk7VCPiD5p8M9i4wnqts7_21AyM6I6S'
  },
  {
    id: 'notif-3',
    type: 'order',
    title: 'Order Delivered',
    description: 'Order #FM-9918 has been successfully delivered. Please rate your experience!',
    time: '4 hours ago',
    read: true,
    icon: Check,
    iconBg: 'bg-[#e3f5ea]',
    iconColor: 'text-[#006c4a]'
  },
  {
    id: 'notif-4',
    type: 'system',
    title: 'Security Update',
    description: "We've enhanced our payment encryption protocols to ensure your data stays even more secure.",
    time: 'Yesterday',
    read: true,
    icon: ShieldCheck,
    iconBg: 'bg-[#e9f0e5]',
    iconColor: 'text-[#3e4a3d]'
  },
  {
    id: 'notif-5',
    type: 'offer',
    title: 'Happy Fresh Anniversary!',
    description: "You've been shopping with us for 1 year! Here's a $10 voucher as a thank you.",
    time: '2 days ago',
    read: true,
    icon: PartyPopper,
    iconBg: 'bg-[#ffd9de]/60',
    iconColor: 'text-[#a72d51]'
  }
];

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'orders', label: 'Orders' },
  { id: 'offers', label: 'Offers' },
  { id: 'system', label: 'System' }
];

export function NotificationsContent() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState('all');

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true, hasDot: false })));
  };

  const deleteAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'orders') return n.type === 'order';
    if (activeTab === 'offers') return n.type === 'offer';
    if (activeTab === 'system') return n.type === 'system';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f4fcf0] text-[#171d16] font-sans">
      <HomeHeader cartCount={3} />

      <main className="mx-auto max-w-4xl px-6 md:px-8 pb-16 pt-24 space-y-6">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#171d16]">Notifications</h1>
            <p className="mt-1 text-sm font-semibold text-[#8b9888]">Stay updated with your latest activities</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              className="h-9 rounded-full bg-[#e3f5ea] px-4 text-xs font-black text-[#006c4a] hover:bg-[#c5edd8] transition-all flex items-center gap-1.5 shadow-xs"
              onClick={markAllAsRead}
              type="button"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Mark all as read</span>
            </Button>

            <button
              className="inline-flex items-center gap-1 text-xs font-extrabold text-rose-600 hover:text-rose-700 transition-colors p-1"
              onClick={deleteAll}
              type="button"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete all</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-[#e2ebdE] gap-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`pb-3 text-xs font-black transition-all relative ${
                activeTab === tab.id
                  ? 'text-[#006c4a]'
                  : 'text-[#8b9888] hover:text-[#171d16]'
              }`}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#006c4a] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="rounded-[24px] border border-[#e2ebdE] bg-white p-12 text-center text-[#8b9888] font-bold text-sm">
            No notifications available in this view.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`rounded-[24px] border border-[#e2ebdE] bg-white p-5 md:p-6 shadow-xs transition-all hover:shadow-md ${
                    !item.read ? 'border-l-4 border-l-[#006c4a]' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon Circle */}
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${item.iconBg} ${item.iconColor}`}>
                      <Icon className="h-5 w-5 stroke-[2.5]" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold text-[#171d16]">{item.title}</h3>
                          {item.hasDot && (
                            <span className="h-2 w-2 rounded-full bg-[#006c4a]" />
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-[#8b9888] shrink-0">{item.time}</span>
                      </div>

                      <p className="text-xs leading-relaxed font-medium text-[#3e4a3d]">
                        {item.description}
                      </p>

                      {/* Optional Image Banner for Offers */}
                      {item.imageBanner && (
                        <div className="mt-3 overflow-hidden rounded-2xl border border-[#e2ebdE] h-40 w-full bg-[#f4fcf0]">
                          <img alt={item.title} className="h-full w-full object-cover" src={item.imageBanner} />
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

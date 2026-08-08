import { useState } from 'react';
import { CheckCheck, Trash2 } from 'lucide-react';
import { Button } from '@freshmart/design-system';
import { HomeHeader } from '../../home/components/home-header.js';
import { HomeFooter } from '../../home/components/home-footer.js';
import { useNotifications } from '../hooks/use-notifications.js';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'orders', label: 'Orders' },
  { id: 'offers', label: 'Offers' },
  { id: 'system', label: 'System' },
];

export function NotificationsContent() {
  const { allNotifications, markAllAsRead, deleteAll } = useNotifications();
  const [activeTab, setActiveTab] = useState('all');

  const filteredNotifications = allNotifications.filter((n) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'orders') return n.type === 'order';
    if (activeTab === 'offers') return n.type === 'offer';
    if (activeTab === 'system') return n.type === 'system';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f4fcf0] font-sans text-[#171d16]">
      <HomeHeader />

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

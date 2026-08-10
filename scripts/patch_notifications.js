const fs = require('fs');
const file = 'apps/customer-web/src/features/account/pages/notifications-page.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacement = `import { useState } from 'react';
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

  return (`

content = content.replace(/import \{ useState \} from 'react';[\s\S]*?return \(/, replacement);
fs.writeFileSync(file, content);
console.log('done');

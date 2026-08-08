import type { LucideIcon } from 'lucide-react';

export interface Metric {
  title: string;
  value: string;
  subtitle: string;
  accent?: string;
  badge?: string;
  tone?: 'success' | 'danger' | 'neutral';
  icon: LucideIcon;
}

export interface TopbarUser {
  name: string;
  role: string;
  avatar: string;
}

export interface AdminUser {
  name: string;
  role: string;
  avatar: string;
}

export interface InventoryRow {
  image: string;
  name: string;
  subtitle: string;
  sku: string;
  category: string;
  warehouse: string;
  stock: string;
  reserved: string;
  progress: number;
  status: string;
  danger?: boolean;
}

export interface SettingsItem {
  id: string;
  group: string;
  key: string;
  value: string;
  description: string;
}

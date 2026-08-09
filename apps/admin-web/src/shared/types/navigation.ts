import type { LucideIcon } from 'lucide-react';
import type { Permission } from '../../constants/permissions.js';

export interface NavigationItem {
  id: string;
  title: string;
  icon: LucideIcon;
  path?: string;
  permission?: Permission;
  featureFlag?: string;
  badge?: string;
  children?: NavigationItem[];
  order?: number;
}

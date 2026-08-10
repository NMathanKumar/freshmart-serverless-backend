import type { NavigationItem } from '../types/navigation.js';

export class NavigationService {
  /**
   * Filters the navigation items based on the provided user permissions and active feature flags.
   */
  static filterNavigation(
    items: NavigationItem[],
    hasPermission: (permission: string) => boolean,
    activeFeatureFlags: Set<string> = new Set()
  ): NavigationItem[] {
    return items
      .filter((item) => {
        // 1. Check feature flag (if specified, user must have it enabled)
        if (item.featureFlag && !activeFeatureFlags.has(item.featureFlag)) {
          return false;
        }

        // 2. Check permissions (if specified, user must have the permission)
        if (item.permission && !hasPermission(item.permission)) {
          return false;
        }

        return true;
      })
      .map((item) => {
        // 3. Recursively filter children if they exist
        if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: this.filterNavigation(item.children, hasPermission, activeFeatureFlags),
          };
        }
        return item;
      });
  }
}

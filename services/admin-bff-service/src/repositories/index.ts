import type { DashboardView } from '../entities/index.js';

export interface DashboardCacheRepository {
  getDashboard(): Promise<DashboardView | null>;
  saveDashboard(view: DashboardView): Promise<DashboardView>;
}

export class InMemoryDashboardCacheRepository implements DashboardCacheRepository {
  private dashboard: DashboardView | null = null;

  async getDashboard(): Promise<DashboardView | null> {
    return this.dashboard;
  }

  async saveDashboard(view: DashboardView): Promise<DashboardView> {
    this.dashboard = view;
    return view;
  }
}

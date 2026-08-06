import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { Skeleton, AppErrorBoundary } from '@freshmart/design-system';
import { adminRoutePaths } from './admin-route-paths.js';
import { initializeSession, requireAdmin } from '@freshmart/shared';
const DashboardPage = lazy(() => import('../features/admin/pages/dashboard-page.js'));
const ProductsPage = lazy(() => import('../features/admin/pages/products-page.js'));
const CategoriesPage = lazy(() => import('../features/admin/pages/categories-page.js'));
const OrdersPage = lazy(() => import('../features/admin/pages/orders-page.js'));
const InventoryPage = lazy(() => import('../features/admin/pages/inventory-page.js'));
const CustomersPage = lazy(() => import('../features/admin/pages/customers-page.js'));
const DeliveryPage = lazy(() => import('../features/admin/pages/delivery-page.js'));
const ReviewsPage = lazy(() => import('../features/admin/pages/reviews-page.js'));
const SuppliersPage = lazy(() => import('../features/admin/pages/suppliers-page.js'));
const PurchaseOrdersPage = lazy(() => import('../features/admin/pages/purchase-orders-page.js'));
const AnalyticsPage = lazy(() => import('../features/admin/pages/analytics-page.js'));
const ActivityPage = lazy(() => import('../features/admin/pages/activity-page.js'));
const RolesPage = lazy(() => import('../features/admin/pages/roles-page.js'));
const SettingsPage = lazy(() => import('../features/admin/pages/settings-page.js'));
const LoginPage = lazy(() => import('../pages/Login.js').then((m) => ({ default: m.Login })));

const RouteSkeleton = () => (
  <main className="admin-page flex min-h-screen bg-[var(--admin-bg)] p-4" aria-busy="true" aria-label="Loading FreshMart admin page">
    <div className="admin-card mx-auto w-full max-w-[1440px] p-6">
      <Skeleton className="mb-6 h-16 w-1/3 rounded-full" />
      <div className="grid gap-6 lg:grid-cols-4">
        <Skeleton className="h-48 rounded-[32px]" />
        <Skeleton className="h-48 rounded-[32px]" />
        <Skeleton className="h-48 rounded-[32px]" />
        <Skeleton className="h-48 rounded-[32px]" />
      </div>
      <Skeleton className="mt-8 h-[520px] rounded-[32px]" />
    </div>
  </main>
);

const RequireAdminSession = () => {
  initializeSession();
  
  if (requireAdmin()) {
    return <Outlet />;
  }
  
  return null;
};

export const AppRouter = () => (
  <BrowserRouter>
    <Suspense fallback={<RouteSkeleton />}>
      <AppErrorBoundary>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireAdminSession />}>
        <Route path={adminRoutePaths.dashboard} element={<DashboardPage />} />
        <Route path={adminRoutePaths.products} element={<ProductsPage />} />
        <Route path={adminRoutePaths.categories} element={<CategoriesPage />} />
        <Route path={adminRoutePaths.orders} element={<OrdersPage />} />
        <Route path={adminRoutePaths.inventory} element={<InventoryPage />} />
        <Route path={adminRoutePaths.customers} element={<CustomersPage />} />
        {/* <Route path="/delivery" element={<DeliveryPage />} /> */}
        {/* <Route path="/reviews" element={<ReviewsPage />} /> */}
        {/* <Route path="/suppliers" element={<SuppliersPage />} /> */}
        {/* <Route path="/purchase-orders" element={<PurchaseOrdersPage />} /> */}
        <Route path={adminRoutePaths.analytics} element={<AnalyticsPage />} />
        {/* <Route path={adminRoutePaths.activity} element={<ActivityPage />} /> */}
        <Route path={adminRoutePaths.roles} element={<RolesPage />} />
        {/* <Route path={adminRoutePaths.settings} element={<SettingsPage />} /> */}
        </Route>
        <Route path="*" element={<Navigate replace to={adminRoutePaths.dashboard} />} />
        </Routes>
      </AppErrorBoundary>
    </Suspense>
  </BrowserRouter>
);

import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { Skeleton, AppErrorBoundary } from '@freshmart/design-system';
import { adminRoutePaths } from './admin-route-paths.js';
import { useAuth } from '../context/AuthContext.js';
import { ToastProvider } from '@/shared/components/ui/toast';

const DashboardPage = lazy(() => import('@/features/admin/pages/dashboard-page.js'));
const CategoriesPage = lazy(() => import('@/features/admin/pages/categories-page.js'));
const OrdersPage = lazy(() => import('@/features/orders').then(m => ({ default: m.OrdersPage })));
const InventoryPage = lazy(() => import('@/features/inventory').then(m => ({ default: m.InventoryPage })));
const CustomersPage = lazy(() => import('@/features/customers').then(m => ({ default: m.CustomersPage })));
const DeliveryPage = lazy(() => import('@/features/admin/pages/delivery-page.js'));
const CouponsPage = lazy(() => import('@/features/admin/pages/coupons-page.js'));
const ReviewsPage = lazy(() => import('@/features/admin/pages/reviews-page.js'));
const SuppliersPage = lazy(() => import('@/features/admin/pages/suppliers-page.js'));
const PurchaseOrdersPage = lazy(() => import('@/features/admin/pages/purchase-orders-page.js'));
const AnalyticsPage = lazy(() => import('@/features/analytics').then(m => ({ default: m.AnalyticsPage })));
const NotificationsPage = lazy(() => import('@/features/notifications').then(m => ({ default: m.NotificationsPage })));
const ActivityPage = lazy(() => import('@/features/admin/pages/activity-page.js'));
const ProductsPage = lazy(() => import('@/features/products').then(m => ({ default: m.ProductsPage })));
const RolesPage = lazy(() => import('@/features/admin/pages/roles-page.js'));
const SettingsPage = lazy(() => import('@/features/settings').then(m => ({ default: m.SettingsPage })));
const LoginPage = lazy(() => import('../pages/Login').then(m => ({ default: m.Login })));

const NotFoundPage = lazy(() => import('@/shared/components/ui/not-found-page').then(m => ({ default: m.NotFoundPage })));
const UnauthorizedPage = lazy(() => import('@/shared/components/ui/unauthorized-page').then(m => ({ default: m.UnauthorizedPage })));

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
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate replace to="/login" />;
  }

  // Use the robust isAdmin() utility which checks Cognito groups and profiles
  // Since we cannot use async imports directly in render without suspense, we rely on the user object
  // populated by AuthContext, which we fixed to not default to ADMIN blindly for groups.
  // Actually, we can just use the user role and groups from the auth context.
  
  const groups = user?.groups || [];
  const role = String(user?.role || '').toUpperCase();
  const profile = String(user?.profile || '').toLowerCase();
  
  const hasAdminRole = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'SUPER ADMIN';
  const hasAdminGroup = groups.some((g: string) => g.toUpperCase() === 'ADMIN' || g.toUpperCase() === 'SUPER_ADMIN');
  const hasAdminProfile = profile === 'admin';
  
  if (!hasAdminRole && !hasAdminGroup && !hasAdminProfile) {
    return <Navigate replace to="/unauthorized" />;
  }
  
  return <Outlet />;
};

export const AppRouter = () => (
  <BrowserRouter>
    <Suspense fallback={<RouteSkeleton />}>
      <AppErrorBoundary>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path={adminRoutePaths.signIn} element={<LoginPage />} />
            <Route element={<RequireAdminSession />}>
              <Route path={adminRoutePaths.dashboard} element={<DashboardPage />} />
              <Route path={adminRoutePaths.products} element={<ProductsPage />} />
              <Route path={adminRoutePaths.categories} element={<CategoriesPage />} />
              <Route path={adminRoutePaths.orders} element={<OrdersPage />} />
              <Route path={adminRoutePaths.inventory} element={<InventoryPage />} />
              <Route path={adminRoutePaths.customers} element={<CustomersPage />} />
              <Route path={adminRoutePaths.delivery} element={<DeliveryPage />} />
              <Route path={adminRoutePaths.coupons} element={<CouponsPage />} />
              <Route path={adminRoutePaths.reviews} element={<ReviewsPage />} />
              <Route path={adminRoutePaths.suppliers} element={<SuppliersPage />} />
              <Route path={adminRoutePaths.purchaseOrders} element={<PurchaseOrdersPage />} />
              <Route path={adminRoutePaths.analytics} element={<AnalyticsPage />} />
              <Route path={adminRoutePaths.notifications} element={<NotificationsPage />} />
              <Route path={adminRoutePaths.activity} element={<ActivityPage />} />
              <Route path={adminRoutePaths.roles} element={<RolesPage />} />
              <Route path={adminRoutePaths.settings} element={<SettingsPage />} />
            </Route>
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </AppErrorBoundary>
    </Suspense>
  </BrowserRouter>
);

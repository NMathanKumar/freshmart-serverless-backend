import React, { lazy, Suspense, useEffect, useState } from 'react';
import { AuthGuard } from '@freshmart/shared';
import { createRootRoute, createRoute, createRouter, RouterProvider, Outlet, useNavigate, useLocation } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PermissionsProvider } from './context/PermissionsContext';
import { ToastProvider } from './components/ui/toast';
import { toast } from 'react-hot-toast';
import { AdminLayout } from './components/layout/AdminLayout';
import { TableSkeleton, Skeleton } from './components/ui/skeleton';

// Lazy Loaded Feature Page Components for Instant Load & Code Splitting
const DashboardPage = lazy(() => import('./features/dashboard').then((m) => ({ default: m.DashboardPage })));
const ProductsPage = lazy(() => import('./features/products').then((m) => ({ default: m.ProductsPage })));
const CategoriesPage = lazy(() => import('./features/categories').then((m) => ({ default: m.CategoriesPage })));
const InventoryPage = lazy(() => import('./features/inventory').then((m) => ({ default: m.InventoryPage })));
const InventoryMovementDashboard = lazy(() => import('./features/inventory').then((m) => ({ default: m.InventoryMovementDashboard })));
const ForecastDashboard = lazy(() => import('./features/inventory/pages/ForecastDashboard').then((m) => ({ default: m.ForecastDashboard })));
const OrdersPage = lazy(() => import('./features/orders').then((m) => ({ default: m.OrdersPage })));
const CustomersPage = lazy(() => import('./features/customers').then((m) => ({ default: m.CustomersPage })));
const SuppliersPage = lazy(() => import('./features/suppliers').then((m) => ({ default: m.SuppliersPage })));
const PurchaseOrdersPage = lazy(() => import('./features/purchase-orders').then((m) => ({ default: m.PurchaseOrdersPage })));
const AnalyticsPage = lazy(() => import('./features/analytics').then((m) => ({ default: m.AnalyticsPage })));
const ProcurementDashboard = lazy(() => import('./features/analytics/pages/ProcurementDashboard').then((m) => ({ default: m.ProcurementDashboard })));
const ReportsPage = lazy(() => import('./features/reports').then((m) => ({ default: m.ReportsPage })));
const ReviewsPage = lazy(() => import('./features/reviews').then((m) => ({ default: m.ReviewsPage })));
const NotificationsPage = lazy(() => import('./features/notifications').then((m) => ({ default: m.NotificationsPage })));
const SettingsPage = lazy(() => import('./features/settings').then((m) => ({ default: m.SettingsPage })));
const DeliveryPage = lazy(() => import('./features/delivery/pages/DeliveryPage').then((m) => ({ default: m.DeliveryPage })));
const WarehouseDashboard = lazy(() => import('./features/warehouses').then((m) => ({ default: m.WarehouseDashboard })));
const TransferDashboard = lazy(() => import('./features/transfers/pages/TransferDashboard').then((m) => ({ default: m.TransferDashboard })));
const VendorInvoiceDashboard = lazy(() => import('./features/vendor-invoices/pages/VendorInvoiceDashboard').then((m) => ({ default: m.VendorInvoiceDashboard })));
const ReturnDashboard = lazy(() => import('./features/returns/pages/ReturnDashboard').then((m) => ({ default: m.ReturnDashboard })));

// Fulfillment routes
const FulfillmentDashboard = lazy(() => import('./features/fulfillment').then((m) => ({ default: m.FulfillmentDashboard })));
const PickListScreen = lazy(() => import('./features/fulfillment').then((m) => ({ default: m.PickListScreen })));
const PickerAssignmentScreen = lazy(() => import('./features/fulfillment').then((m) => ({ default: m.PickerAssignmentScreen })));
const PackingScreen = lazy(() => import('./features/fulfillment').then((m) => ({ default: m.PackingScreen })));
const ShipmentScreen = lazy(() => import('./features/fulfillment').then((m) => ({ default: m.ShipmentScreen })));

// Optimized QueryClient Cache Defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes cache lifetime
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const PageSuspenseFallback: React.FC = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-60 rounded-xl" />
      <Skeleton className="h-10 w-36 rounded-xl" />
    </div>
    <TableSkeleton rows={6} columns={7} />
  </div>
);

// Root Route
const rootRoute = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PermissionsProvider>
          <ToastProvider>
            <Outlet />
          </ToastProvider>
        </PermissionsProvider>
      </AuthProvider>
    </QueryClientProvider>
  ),
});



// Auth Callback Wrapper
const AuthCallbackPageWrapper: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const authenticate = async () => {
      // Parse query params safely
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');

      try {
        if (code) {
          const { exchangeCodeForTokens, saveSession } = await import('@freshmart/shared');
          const tokens = await exchangeCodeForTokens(code);
          saveSession(tokens);
        }

        const { getEnvironmentUrls, isAdmin, isAuthenticated } = await import('@freshmart/shared');
        
        if (!isAuthenticated()) {
          navigate({ to: '/' }); // This triggers AuthGuard which redirects to SSO
          return;
        }

        if (isAdmin()) {
          navigate({ to: '/' });
        } else {
          const { customerWebUrl } = getEnvironmentUrls();
          window.location.replace(customerWebUrl);
        }
      } catch (error) {
        console.error("SSO Authentication failed", error);
        navigate({ to: '/' }); // Trigger re-auth
      }
    };

    authenticate();
  }, [navigate, location.search]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4fcf0]">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#04883b]"></div>
        <p className="mt-4 text-sm text-slate-600 font-medium animate-pulse">
          Authenticating securely...
        </p>
      </div>
    </div>
  );
};

const authCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/callback',
  component: AuthCallbackPageWrapper,
});

// Protected App Layout Wrapper
const ProtectedAppWrapper: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState(location.pathname);

  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location.pathname]);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    navigate({ to: path });
  };

  return (
    <AuthGuard allowedRoles={['ADMIN']}>
      <AdminLayout currentPath={currentPath} onNavigate={handleNavigate}>
        <Suspense fallback={<PageSuspenseFallback />}>
          <Outlet />
        </Suspense>
      </AdminLayout>
    </AuthGuard>
  );
};

const protectedLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'protected-layout',
  component: ProtectedAppWrapper,
});

// Feature Routes
const indexRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/',
  component: DashboardPage,
});

const productsRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/products',
  component: ProductsPage,
});

const categoriesRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/categories',
  component: CategoriesPage,
});

const inventoryRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/inventory',
  component: InventoryPage,
});

const inventoryMovementsRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/inventory/movements',
  component: InventoryMovementDashboard,
});

const forecastDashboardRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/inventory/forecast',
  component: ForecastDashboard,
});

const ordersRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/orders',
  component: OrdersPage,
});

const customersRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/customers',
  component: CustomersPage,
});

const suppliersRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/suppliers',
  component: SuppliersPage,
});

const purchaseOrdersRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/purchase-orders',
  component: PurchaseOrdersPage,
});

const analyticsRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/analytics',
  component: AnalyticsPage,
});

const procurementAnalyticsRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/procurement-analytics',
  component: ProcurementDashboard,
});

const reportsRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/reports',
  component: ReportsPage,
});

const reviewsRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/reviews',
  component: ReviewsPage,
});

const notificationsRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/notifications',
  component: NotificationsPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/settings',
  component: SettingsPage,
});

const deliveryRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/delivery',
  component: DeliveryPage,
});

const warehousesRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/warehouses',
  component: WarehouseDashboard,
});

const transfersRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/transfers',
  component: TransferDashboard,
});

const vendorInvoicesRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/vendor-invoices',
  component: VendorInvoiceDashboard,
});

const vendorReturnsRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/vendor-returns',
  component: ReturnDashboard,
});

const fulfillmentRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/fulfillment',
  component: FulfillmentDashboard,
});

const pickListRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/fulfillment/pick-list',
  component: PickListScreen,
});

const pickerAssignmentRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/fulfillment/picker-assignment',
  component: PickerAssignmentScreen,
});

const packingRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/fulfillment/packing',
  component: PackingScreen,
});

const shipmentRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/fulfillment/shipment',
  component: ShipmentScreen,
});

// Assemble Route Tree
const routeTree = rootRoute.addChildren([
  authCallbackRoute,
  protectedLayoutRoute.addChildren([
    indexRoute,
    productsRoute,
    categoriesRoute,
    inventoryRoute,
    inventoryMovementsRoute,
    forecastDashboardRoute,
    ordersRoute,
    customersRoute,
    suppliersRoute,
    purchaseOrdersRoute,
    analyticsRoute,
    procurementAnalyticsRoute,
    reportsRoute,
    reviewsRoute,
    notificationsRoute,
    settingsRoute,
    deliveryRoute,
    warehousesRoute,
    transfersRoute,
    vendorInvoicesRoute,
    vendorReturnsRoute,
    fulfillmentRoute,
    pickListRoute,
    pickerAssignmentRoute,
    packingRoute,
    shipmentRoute,
  ]),
]);

export const router = createRouter({ routeTree, basepath: '/admin' });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

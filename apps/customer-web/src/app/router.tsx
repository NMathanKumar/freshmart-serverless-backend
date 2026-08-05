import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Skeleton, AppErrorBoundary } from '@freshmart/design-system';
import * as shared from '@freshmart/shared';
import { authPaths } from './auth-paths.js';
import { RequireAuth } from '../features/auth/components/require-auth.js';

const { customerRoutePaths } = shared;

const HomePage = lazy(() => import('../features/home/pages/home-page.js'));
const AccountSettingsPage = lazy(() => import('../features/account/pages/account-settings-page.js'));
const AddressManagementPage = lazy(() => import('../features/commerce/pages/address-management-page.js'));
const CartPage = lazy(() => import('../features/commerce/pages/cart-page.js'));
const CategoryListingPage = lazy(() => import('../features/commerce/pages/category-listing-page.js'));
const CheckoutPaymentPage = lazy(() => import('../features/commerce/pages/checkout-payment-page.js'));
const OrderDetailsPage = lazy(() => import('../features/commerce/pages/order-details-page.js'));
const OrderConfirmationPage = lazy(() => import('../features/commerce/pages/order-confirmation-page.js'));
const OrdersPage = lazy(() => import('../features/commerce/pages/orders-page.js'));
const ProductDetailsPage = lazy(() => import('../features/commerce/pages/product-details-page.js'));
const SearchResultsPage = lazy(() => import('../features/commerce/pages/search-results-page.js'));
const WishlistPage = lazy(() => import('../features/commerce/pages/wishlist-page.js'));
const NotificationsPage = lazy(() => import('../features/account/pages/notifications-page.js'));
const PrivacySecurityPage = lazy(() => import('../features/account/pages/privacy-security-page.js'));
const SystemStatesPage = lazy(() => import('../features/system/pages/system-states-page.js'));
const NotFoundPage = lazy(() => import('../features/system/pages/system-states-page.js').then((module) => ({ default: module.NotFoundPage })));
const LoginPage = lazy(() => import('../features/auth/pages/login-page.js'));
const RegisterPage = lazy(() => import('../features/auth/pages/register-page.js'));
const ForgotPasswordPage = lazy(() => import('../features/auth/pages/forgot-password-page.js'));
const VerifyEmailPage = lazy(() => import('../features/auth/pages/verify-email-page.js'));

const AuthRouteSkeleton = () => (
  <main className="auth-page flex min-h-screen items-center justify-center p-4" aria-busy="true" aria-label="Loading authentication screen">
    <div className="w-full max-w-[480px] space-y-5 rounded-2xl bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <Skeleton className="mx-auto h-16 w-16 rounded-full" />
      <Skeleton className="mx-auto h-9 w-2/3" />
      <Skeleton className="mx-auto h-5 w-4/5" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
    </div>
  </main>
);

export const AppRouter = () => (
  <BrowserRouter>
    <Suspense fallback={<AuthRouteSkeleton />}>
      <AppErrorBoundary>
        <Routes>
        <Route path={customerRoutePaths.home} element={<HomePage />} />
        <Route path={customerRoutePaths.search} element={<SearchResultsPage />} />
        <Route path={customerRoutePaths.categories} element={<CategoryListingPage />} />
        <Route path={customerRoutePaths.productDetails} element={<ProductDetailsPage />} />
        <Route path={customerRoutePaths.wishlist} element={<WishlistPage />} />
        <Route path={customerRoutePaths.cart} element={<CartPage />} />
        <Route path={customerRoutePaths.checkout} element={<RequireAuth><CheckoutPaymentPage /></RequireAuth>} />
        <Route path={customerRoutePaths.orders} element={<RequireAuth><OrdersPage /></RequireAuth>} />
        <Route path={`${customerRoutePaths.orders}/:orderId`} element={<RequireAuth><OrderDetailsPage /></RequireAuth>} />
        <Route path={customerRoutePaths.settings} element={<RequireAuth><AccountSettingsPage /></RequireAuth>} />
        <Route path="/addresses" element={<RequireAuth><AddressManagementPage /></RequireAuth>} />
        <Route path="/checkout/confirmation" element={<RequireAuth><OrderConfirmationPage /></RequireAuth>} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/privacy-security" element={<RequireAuth><PrivacySecurityPage /></RequireAuth>} />
        <Route path="/system-states" element={<SystemStatesPage />} />
        <Route path={authPaths.login} element={<LoginPage />} />
        <Route path={authPaths.register} element={<RegisterPage />} />
        <Route path={authPaths.forgotPassword} element={<ForgotPasswordPage />} />
        <Route path={authPaths.verifyEmail} element={<VerifyEmailPage />} />
        <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppErrorBoundary>
    </Suspense>
  </BrowserRouter>
);

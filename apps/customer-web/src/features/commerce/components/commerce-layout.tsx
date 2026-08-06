import type { ReactNode } from 'react';
import { Button, Input } from '@freshmart/design-system';
import {
  ArrowLeft,
  Bell,
  Heart,
  Home,
  MapPin,
  ReceiptText,
  Search,
  ShoppingBasket,
  Store,
  UserRound,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as shared from '@freshmart/shared';

const { customerRoutePaths } = shared;

const navItems = [
  { label: 'Shop', to: customerRoutePaths.home },
  { label: 'Search', to: customerRoutePaths.search },
  { label: 'Orders', to: customerRoutePaths.orders },
  { label: 'Wishlist', to: customerRoutePaths.wishlist },
  { label: 'Cart', to: customerRoutePaths.cart },
  { label: 'Account', to: customerRoutePaths.settings },
];

export const CommerceHeader = ({
  title,
  showBack = false,
  cartCount = 3,
}: {
  title?: string;
  showBack?: boolean;
  cartCount?: number;
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="commerce-glass fixed inset-x-0 top-0 z-50 bg-[#f4fcf0]/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <div className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between px-4 md:px-10">
        <div className="flex items-center gap-4">
          {showBack && (
            <button
              aria-label="Go back"
              className="commerce-focus rounded-full p-2 text-[#006b2c] hover:bg-[#d8f4ce]"
              onClick={() => navigate(-1)}
              type="button"
            >
              <ArrowLeft aria-hidden="true" className="h-5 w-5" />
            </button>
          )}
          <Link
            className="commerce-focus text-xl font-extrabold tracking-[-0.02em] text-[#006b2c]"
            to={customerRoutePaths.home}
          >
            FreshMart
          </Link>
          {title && (
            <span className="hidden text-sm font-semibold text-[#3e4a3d] md:inline">
              {title}
            </span>
          )}
        </div>
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-6 md:flex"
        >
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                className={`commerce-focus rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${active ? 'border-b-2 border-[#006b2c] text-[#006b2c]' : 'text-[#3e4a3d] hover:bg-[#d8f4ce]'}`}
                key={item.label}
                to={item.to}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            aria-label="Home"
            className="commerce-focus rounded-full p-2 text-[#006b2c] hover:bg-[#d8f4ce]"
            title="Home"
            to={customerRoutePaths.home}
          >
            <Home aria-hidden="true" className="h-5 w-5" />
          </Link>

          <Link
            aria-label="Notifications"
            className="commerce-focus relative rounded-full p-2 text-[#006b2c] hover:bg-[#d8f4ce]"
            title="Notifications"
            to="/notifications"
          >
            <Bell aria-hidden="true" className="h-5 w-5" />
            <span className="absolute top-0 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#a72d51] px-1 text-[10px] font-bold text-white">
              3
            </span>
          </Link>

          <button
            aria-label="Delivery location"
            className="commerce-focus rounded-full p-2 text-[#006b2c] hover:bg-[#d8f4ce]"
            type="button"
          >
            <MapPin aria-hidden="true" className="h-5 w-5" />
          </button>

          <Link
            aria-label={`Shopping cart with ${cartCount} items`}
            className="commerce-focus relative rounded-full p-2 text-[#006b2c] hover:bg-[#d8f4ce]"
            title="Shopping Cart"
            to={customerRoutePaths.cart}
          >
            <ShoppingBasket aria-hidden="true" className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#006b2c] px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export const CommerceSearchBar = ({
  defaultValue = 'Organic Avocados',
}: {
  defaultValue?: string;
}) => (
  <label className="relative block w-full">
    <span className="sr-only">Search FreshMart</span>
    <Search
      aria-hidden="true"
      className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#6e7b6c]"
    />
    <Input
      className="h-12 rounded-full border border-[#bdcaba] bg-[#eff6ea] pr-4 pl-12 text-base"
      defaultValue={defaultValue}
      type="search"
    />
  </label>
);

export const CommerceFooter = () => (
  <footer className="mt-16 border-t border-[#bdcaba]/30 bg-[#eff6ea]">
    <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-4 py-10 md:grid-cols-4 md:px-10">
      <div className="space-y-4">
        <strong className="text-xl font-bold text-[#006b2c]">FreshMart</strong>
        <p className="text-base text-[#3e4a3d]">
          Premium quality groceries delivered to your doorstep in minutes.
        </p>
      </div>
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase">Company</h2>
        <a className="block text-[#3e4a3d] hover:text-[#006b2c]" href="#about">
          About Us
        </a>
        <a className="block text-[#3e4a3d] hover:text-[#006b2c]" href="#areas">
          Delivery Areas
        </a>
        <a className="block text-[#3e4a3d] hover:text-[#006b2c]" href="#help">
          Help Center
        </a>
      </div>
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase">Legal</h2>
        <a
          className="block text-[#3e4a3d] hover:text-[#006b2c]"
          href="#privacy"
        >
          Privacy Policy
        </a>
        <a className="block text-[#3e4a3d] hover:text-[#006b2c]" href="#terms">
          Terms of Service
        </a>
      </div>
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase">Newsletter</h2>
        <div className="flex">
          <Input
            className="rounded-r-none bg-white"
            placeholder="Email address"
            type="email"
          />
          <Button className="rounded-l-none px-4" type="button">
            Join
          </Button>
        </div>
      </div>
    </div>
    <p className="border-t border-[#bdcaba]/30 px-4 py-6 text-center text-xs text-[#3e4a3d]">
      © 2024 FreshMart. Premium Quick Commerce.
    </p>
  </footer>
);

export const CommerceMobileNav = ({
  active,
}: {
  active: 'shop' | 'search' | 'wishlist' | 'cart' | 'orders' | 'account';
}) => (
  <nav
    aria-label="Mobile navigation"
    className="commerce-glass fixed inset-x-0 bottom-0 z-50 flex items-center justify-around rounded-t-xl border-t border-[#bdcaba]/30 bg-[#f4fcf0]/90 px-3 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] md:hidden"
  >
    <Link
      className={`commerce-mobile-nav-item ${active === 'shop' ? 'active' : ''}`}
      to={customerRoutePaths.home}
    >
      <Store aria-hidden="true" className="h-5 w-5" />
      Shop
    </Link>
    <Link
      className={`commerce-mobile-nav-item ${active === 'search' ? 'active' : ''}`}
      to={customerRoutePaths.search}
    >
      <Search aria-hidden="true" className="h-5 w-5" />
      Search
    </Link>
    <Link
      className={`commerce-mobile-nav-item ${active === 'wishlist' ? 'active' : ''}`}
      to={customerRoutePaths.wishlist}
    >
      <Heart aria-hidden="true" className="h-5 w-5" />
      Saved
    </Link>
    <Link
      className={`commerce-mobile-nav-item ${active === 'cart' ? 'active' : ''}`}
      to={customerRoutePaths.cart}
    >
      <ShoppingBasket aria-hidden="true" className="h-5 w-5" />
      Cart
    </Link>
    <Link
      className={`commerce-mobile-nav-item ${active === 'orders' ? 'active' : ''}`}
      to={customerRoutePaths.orders}
    >
      <ReceiptText aria-hidden="true" className="h-5 w-5" />
      Orders
    </Link>
    <Link
      className={`commerce-mobile-nav-item ${active === 'account' ? 'active' : ''}`}
      to={customerRoutePaths.settings}
    >
      <UserRound aria-hidden="true" className="h-5 w-5" />
      Account
    </Link>
  </nav>
);

export const CommerceShell = ({
  active,
  children,
  showBack = false,
  title,
}: {
  active: 'shop' | 'search' | 'wishlist' | 'cart' | 'orders' | 'account';
  children: ReactNode;
  showBack?: boolean;
  title?: string;
}) => (
  <div className="commerce-page pb-20 md:pb-0">
    <CommerceHeader showBack={showBack} title={title} />
    {children}
    <CommerceFooter />
    <CommerceMobileNav active={active} />
  </div>
);

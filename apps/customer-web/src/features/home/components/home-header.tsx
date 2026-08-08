import { Input } from '@freshmart/design-system';
import {
  Bell,
  Heart,
  Home,
  LogOut,
  MapPin,
  Search,
  ShoppingBag,
  ShoppingCart,
  UserRound,
  LogIn,
  UserPlus,
  Bookmark,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser, logout } from '@freshmart/shared';
import { useState, useEffect } from 'react';
import { useGetCartQuery, useGetWishlistQuery } from '../../commerce/api/commerce-api.js';
import { useNotifications } from '../../account/hooks/use-notifications.js';

export const HomeHeader = ({
  cartCount: overrideCartCount,
  variant,
}: {
  cartCount?: number;
  variant?: 'cart' | 'default';
}) => {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [, setUserEmail] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: cartItems = [] } = useGetCartQuery();
  const { data: wishlistItems = [] } = useGetWishlistQuery();
  const { unreadCount } = useNotifications();

  const liveCartCount =
    overrideCartCount !== undefined
      ? overrideCartCount
      : cartItems.reduce((sum, item) => sum + (item.quantityInCart || 1), 0);

  const wishlistCount = wishlistItems.length;

  useEffect(() => {
    const isAuth = isAuthenticated();
    setAuthed(isAuth);
    if (isAuth) {
      const user = getCurrentUser();
      setUserEmail(user?.email || user?.fullName || user?.name || 'Account');
    }
  }, []);

  const handleLogout = () => {
    logout();
    setAuthed(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  if (variant === 'cart') {
    return (
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#bdcaba]/30 bg-[#f4fcf0]/95 shadow-xs backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 md:px-8">
          <div className="flex shrink-0 items-center gap-3">
            <Link
              aria-label="FreshMart home"
              className="flex items-center gap-1 text-2xl font-black tracking-tight text-[#006b2c]"
              to="/"
            >
              <span>FreshMart</span>
              <span className="h-2 w-2 rounded-full bg-[#006c4a]"></span>
            </Link>
          </div>

          {/* Search Input Bar for Header */}
          <form
            className="relative hidden max-w-md flex-1 sm:block"
            onSubmit={handleSearchSubmit}
          >
            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#6e7b6c]" />
            <input
              className="h-10 w-full rounded-full border border-[#bdcaba]/50 bg-white/90 pr-4 pl-10 text-xs font-semibold transition-all placeholder:text-[#6e7b6c] focus:bg-white focus:ring-2 focus:ring-[#006b2c] focus:outline-none"
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for fresh groceries, organic fruits, snacks..."
              type="search"
              value={searchTerm}
            />
          </form>

          {/* Figma Navigation Links */}
          <nav
            aria-label="Main Navigation"
            className="hidden items-center gap-8 text-xs font-bold text-[#3e4a3d] sm:text-sm lg:flex"
          >
            <Link className="transition-colors hover:text-[#006b2c]" to="/">
              Shop
            </Link>
            <Link
              className="transition-colors hover:text-[#006b2c]"
              to="/offers"
            >
              Offers
            </Link>
            <Link
              className="border-b-2 border-[#006b2c] pb-1 font-black text-[#006b2c] transition-colors"
              to="/settings"
            >
              Profile
            </Link>
          </nav>

          {/* Right Header Controls */}
          <div className="flex shrink-0 items-center gap-2 text-[#3e4a3d]">
            <Link
              aria-label="Home"
              className="rounded-full p-2 text-[#006b2c] transition-all hover:bg-[#eff6ea] focus-visible:ring-2 focus-visible:ring-[#006b2c] focus-visible:outline-none"
              title="Home"
              to="/"
            >
              <Home aria-hidden="true" className="h-5 w-5" />
            </Link>

            <Link
              aria-label="Notifications"
              className="relative rounded-full p-2 text-[#006b2c] transition-all hover:bg-[#eff6ea] focus-visible:ring-2 focus-visible:ring-[#006b2c] focus-visible:outline-none"
              title="Notifications"
              to="/notifications"
            >
              <Bell aria-hidden="true" className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#a72d51] px-1 text-[9px] font-extrabold text-white shadow-sm">
                  {unreadCount}
                </span>
              )}
            </Link>

            <Link
              aria-label="Wishlist"
              className="relative rounded-full p-2 text-[#006b2c] transition-all hover:bg-[#eff6ea] focus-visible:ring-2 focus-visible:ring-[#006b2c] focus-visible:outline-none"
              title="Wishlist"
              to="/wishlist"
            >
              <Heart aria-hidden="true" className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#006b2c] px-1 text-[9px] font-extrabold text-white shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              aria-label="Search"
              className="cursor-pointer p-2 text-[#3e4a3d] transition-colors hover:text-[#006b2c] sm:hidden"
              onClick={() =>
                navigate(
                  `/search?q=${encodeURIComponent(searchTerm || 'Organic')}`
                )
              }
              type="button"
            >
              <Search className="h-5 w-5" />
            </button>

            <Link
              aria-label={`Cart with ${liveCartCount} items`}
              className="relative flex items-center justify-center p-2 transition-all hover:text-[#006b2c]"
              title="Shopping Cart"
              to="/cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {liveCartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#006b2c] text-[10px] font-black text-white">
                  {liveCartCount}
                </span>
              )}
            </Link>

            <Link
              aria-label="Account Profile"
              className="p-2 transition-colors hover:text-[#006b2c]"
              title="Account Profile"
              to="/settings"
            >
              <UserRound className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#bdcaba]/30 bg-[#f4fcf0]/95 shadow-xs backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 md:px-8">
        <div className="flex shrink-0 items-center gap-3">
          <Link
            aria-label="FreshMart home"
            className="flex items-center gap-1 text-2xl font-black tracking-tight text-[#006b2c] focus-visible:ring-2 focus-visible:ring-[#006b2c] focus-visible:outline-none"
            to="/"
          >
            <span>FreshMart</span>
            <span className="h-2 w-2 rounded-full bg-[#006c4a]"></span>
          </Link>
          <div className="hidden flex-col border-l border-[#bdcaba]/60 pl-3.5 sm:flex">
            <span className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-[#3e4a3d] uppercase">
              <MapPin aria-hidden="true" className="h-3 w-3 text-[#006b2c]" />
              Delivery to: Home
            </span>
            <button
              className="text-left text-xs leading-4 font-extrabold tracking-[0.01em] text-[#006b2c] hover:underline"
              type="button"
            >
              Sector 45, Gurgaon
            </button>
          </div>
        </div>

        {/* Central Search Bar */}
        <form
          className="relative mx-2 max-w-xl flex-1 sm:mx-4"
          onSubmit={handleSearchSubmit}
        >
          <span className="sr-only">Search FreshMart</span>
          <Search
            aria-hidden="true"
            className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#6e7b6c]"
          />
          <input
            className="block h-10 w-full rounded-full border border-[#bdcaba]/50 bg-white/95 pr-4 pl-10 text-xs font-medium shadow-2xs transition-all placeholder:text-[#6e7b6c] focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#006b2c] sm:text-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for groceries, snacks, or drinks..."
            type="search"
            value={searchTerm}
          />
        </form>

        {/* Right Header Icons */}
        <nav
          aria-label="Account actions"
          className="flex shrink-0 items-center gap-1.5 sm:gap-2"
        >
          <Link
            aria-label="Home"
            className="rounded-full p-2 text-[#006b2c] transition-all hover:bg-[#eff6ea] focus-visible:ring-2 focus-visible:ring-[#006b2c] focus-visible:outline-none"
            title="Home"
            to="/"
          >
            <Home aria-hidden="true" className="h-5 w-5" />
          </Link>

          <Link
            aria-label="Notifications"
            className="relative rounded-full p-2 text-[#006b2c] transition-all hover:bg-[#eff6ea] focus-visible:ring-2 focus-visible:ring-[#006b2c] focus-visible:outline-none"
            title="Notifications"
            to="/notifications"
          >
            <Bell aria-hidden="true" className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#a72d51] px-1 text-[9px] font-extrabold text-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </Link>

          <Link
            aria-label="Wishlist"
            className="relative rounded-full p-2 text-[#006b2c] transition-all hover:bg-[#eff6ea] focus-visible:ring-2 focus-visible:ring-[#006b2c] focus-visible:outline-none"
            title="Wishlist"
            to="/wishlist"
          >
            <Heart aria-hidden="true" className="h-5 w-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#006b2c] px-1 text-[9px] font-extrabold text-white shadow-sm">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            aria-label={`Cart with ${liveCartCount} items`}
            className="relative flex items-center justify-center rounded-full p-2 text-[#006b2c] transition-all hover:bg-[#eff6ea] focus-visible:ring-2 focus-visible:ring-[#006b2c] focus-visible:outline-none"
            title="Shopping Cart"
            to="/cart"
          >
            <ShoppingCart aria-hidden="true" className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#006b2c] px-1 text-[9px] font-extrabold text-white shadow-sm">
              {liveCartCount}
            </span>
          </Link>

          {authed ? (
            <Link
              aria-label="Profile"
              className="rounded-full p-2 text-[#006b2c] transition-all hover:bg-[#eff6ea] focus-visible:ring-2 focus-visible:ring-[#006b2c] focus-visible:outline-none"
              title="Profile"
              to="/settings"
            >
              <UserRound className="h-5 w-5" />
            </Link>
          ) : (
            <div className="flex items-center gap-1.5 pl-1">
              <Link
                className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-extrabold text-[#006b2c] transition-all hover:bg-[#eff6ea]"
                to="/login"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </Link>
              <Link
                className="flex items-center gap-1 rounded-full bg-[#006b2c] px-3.5 py-1.5 text-xs font-extrabold text-white shadow-sm transition-all hover:bg-[#005422] active:scale-95"
                to="/register"
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Register</span>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

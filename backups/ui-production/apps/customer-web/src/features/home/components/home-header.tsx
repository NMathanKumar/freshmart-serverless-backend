import { Input } from '@freshmart/design-system';
import { Bell, LogOut, MapPin, Search, ShoppingCart, UserRound, LogIn, UserPlus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { isAuthenticated, getCurrentUser, logout } from '@freshmart/shared';
import { useState, useEffect } from 'react';

export const HomeHeader = ({ cartCount }: { cartCount: number }) => {
  const [authed, setAuthed] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

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

  return (
    <header className="home-glass fixed inset-x-0 top-0 z-50 bg-[#f4fcf0]/90 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-10">
        <div className="flex items-center gap-2">
          <Link aria-label="FreshMart home" className="text-2xl font-extrabold tracking-[-0.05em] text-[#006b2c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006b2c]" to="/">FreshMart</Link>
          <div className="ml-6 hidden flex-col border-l border-[#bdcaba] pl-6 md:flex">
            <span className="flex items-center gap-1 text-xs font-medium leading-4 text-[#3e4a3d]"><MapPin aria-hidden="true" className="h-3.5 w-3.5" />Delivery to: Home</span>
            <button className="text-left text-sm font-bold leading-5 tracking-[0.01em] text-[#006b2c] hover:underline" type="button">Sector 45, Gurgaon</button>
          </div>
        </div>

        <label className="relative mx-8 hidden max-w-2xl flex-1 md:block">
          <span className="sr-only">Search FreshMart</span>
          <Search aria-hidden="true" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6e7b6c]" />
          <Input className="h-10 rounded-full border-0 bg-[#eff6ea] pl-12 pr-4 text-base placeholder:text-[#bdcaba] focus:ring-[#006b2c]" placeholder="Search for groceries, snacks, or drinks..." type="search" />
        </label>

        <nav aria-label="Account actions" className="flex items-center gap-2 md:gap-4">
          <Link aria-label={`Cart with ${cartCount} items`} className="relative rounded-full p-2 text-[#006b2c] hover:bg-[#eff6ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006b2c]" to="/cart">
            <ShoppingCart aria-hidden="true" className="h-5 w-5" />
            {cartCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#a72d51] px-1 text-[10px] font-bold text-white">{cartCount}</span>}
          </Link>
          
          {authed ? (
            <>
              <Link aria-label="Orders" className="hidden md:flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-[#006b2c] hover:bg-[#eff6ea]" to="/orders">
                <ShoppingBag className="h-4 w-4" />
                <span>Orders</span>
              </Link>
              <Link aria-label="Profile" className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-[#006b2c] hover:bg-[#eff6ea]" to="/settings">
                <UserRound className="h-4 w-4" />
                <span className="max-w-[100px] truncate">{userEmail}</span>
              </Link>
              <button aria-label="Logout" className="rounded-full p-2 text-rose-600 hover:bg-rose-50" onClick={handleLogout} title="Logout" type="button">
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-[#006b2c] hover:bg-[#eff6ea] transition-colors" to="/login">
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </Link>
              <Link className="flex items-center gap-1.5 rounded-full bg-[#006b2c] px-4 py-2 text-xs font-bold text-white hover:bg-[#005422] transition-colors shadow-sm" to="/register">
                <UserPlus className="h-4 w-4" />
                <span>Register</span>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

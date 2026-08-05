import { Input } from '@freshmart/design-system';
import { Bell, LogOut, MapPin, Search, ShoppingCart, UserRound, LogIn, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser, logout } from '@freshmart/shared';
import { useState, useEffect } from 'react';
import { useGetCartQuery } from '../../commerce/api/commerce-api.js';

export const HomeHeader = ({ cartCount: overrideCartCount }: { cartCount?: number }) => {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [, setUserEmail] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: cartItems = [] } = useGetCartQuery();

  const liveCartCount = overrideCartCount !== undefined
    ? overrideCartCount
    : cartItems.reduce((sum, item) => sum + (item.quantityInCart || 1), 0);

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

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-[#f4fcf0]/95 backdrop-blur-md border-b border-[#bdcaba]/30 shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-8">
        <div className="flex items-center gap-3">
          <Link aria-label="FreshMart home" className="text-2xl font-black tracking-tight text-[#006b2c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006b2c] flex items-center gap-1" to="/">
            <span>FreshMart</span>
            <span className="h-2 w-2 rounded-full bg-[#006c4a]"></span>
          </Link>
          <div className="ml-3 flex flex-col border-l border-[#bdcaba]/60 pl-3.5">
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#3e4a3d]"><MapPin aria-hidden="true" className="h-3 w-3 text-[#006b2c]" />Delivery to: Home</span>
            <button className="text-left text-xs font-extrabold leading-4 tracking-[0.01em] text-[#006b2c] hover:underline" type="button">Sector 43, Gurgaon</button>
          </div>
        </div>

        <form className="relative mx-6 flex-1 max-w-xl hidden md:block" onSubmit={handleSearchSubmit}>
          <span className="sr-only">Search FreshMart</span>
          <Search aria-hidden="true" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6e7b6c]" />
          <Input
            className="h-11 rounded-full border border-[#bdcaba]/40 bg-white/90 pl-11 pr-4 text-sm placeholder:text-[#6e7b6c] focus:bg-white focus:ring-2 focus:ring-[#006b2c] focus:border-transparent w-full block shadow-xs transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for fresh groceries, organic fruits, snacks..."
            type="search"
            value={searchTerm}
          />
        </form>

        <nav aria-label="Account actions" className="flex items-center gap-2">
          <Link aria-label={`Cart with ${liveCartCount} items`} className="relative flex items-center justify-center p-2.5 text-[#006b2c] hover:bg-[#eff6ea] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006b2c] rounded-full" to="/cart">
            <ShoppingCart aria-hidden="true" className="h-5 w-5" />
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#a72d51] px-1 text-[9px] font-extrabold text-white shadow-sm">{liveCartCount}</span>
          </Link>

          <Link aria-label="Notifications" className="p-2.5 text-[#006b2c] hover:bg-[#eff6ea] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006b2c] rounded-full" to="/notifications">
            <Bell aria-hidden="true" className="h-5 w-5" />
          </Link>
          
          {authed ? (
            <>
              <Link aria-label="Profile" className="p-2.5 text-[#006b2c] hover:bg-[#eff6ea] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006b2c] rounded-full" to="/settings">
                <UserRound className="h-5 w-5" />
              </Link>
              <button aria-label="Logout" className="p-2.5 text-rose-600 hover:bg-rose-50 transition-all rounded-full" onClick={handleLogout} title="Logout" type="button">
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 pl-1">
              <Link className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-extrabold text-[#006b2c] hover:bg-[#eff6ea] transition-all" to="/login">
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </Link>
              <Link className="flex items-center gap-1.5 rounded-full bg-[#006b2c] px-4.5 py-2 text-xs font-extrabold text-white hover:bg-[#005422] transition-all shadow-sm active:scale-95" to="/register">
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

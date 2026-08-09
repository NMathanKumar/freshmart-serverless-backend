import { Home, Search, ShoppingBag, ShoppingCart, UserRound } from 'lucide-react';

export const MobileNavigation = ({ cartCount }: { cartCount: number }) => (
  <nav aria-label="Mobile navigation" className="home-glass fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t border-[#bdcaba] bg-[#f4fcf0]/90 md:hidden">
    <button className="mobile-nav-item font-bold text-[#006b2c]" type="button"><Home aria-hidden="true" className="h-5 w-5 fill-current" />Home</button>
    <button className="mobile-nav-item" type="button"><Search aria-hidden="true" className="h-5 w-5" />Search</button>
    <button className="mobile-nav-item relative" type="button"><ShoppingCart aria-hidden="true" className="h-5 w-5" />Cart{cartCount > 0 && <span className="absolute right-1 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#a72d51] px-1 text-[8px] text-white">{cartCount}</span>}</button>
    <button className="mobile-nav-item" type="button"><UserRound aria-hidden="true" className="h-5 w-5" />Profile</button>
  </nav>
);

export const CartSummaryButton = ({ total }: { total: number }) => <button aria-label={`Open cart, total $${total.toFixed(2)}`} className="fixed bottom-6 right-6 z-40 hidden items-center gap-3 rounded-full bg-[#006b2c] p-6 font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-transform hover:scale-105 active:scale-95 md:flex" type="button"><ShoppingBag aria-hidden="true" className="h-5 w-5" />${total.toFixed(2)}</button>;

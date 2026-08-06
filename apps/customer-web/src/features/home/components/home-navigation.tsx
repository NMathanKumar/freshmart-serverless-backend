import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { formatCurrency } from '@freshmart/shared';

export const MobileNavigation = (_props: { cartCount: number }) => null;

export const CartSummaryButton = ({ total }: { total: number }) => (
  <Link
    aria-label={`Open cart, total ${formatCurrency(total)}`}
    className="fixed right-6 bottom-6 z-40 hidden items-center gap-3 rounded-full bg-[#006b2c] px-6 py-4 font-bold text-white shadow-[0_12px_30px_rgba(0,107,44,0.4)] transition-transform hover:scale-105 hover:shadow-[0_16px_40px_rgba(0,107,44,0.5)] active:scale-95 sm:flex md:right-8 md:bottom-8"
    to="/cart"
  >
    <ShoppingBag aria-hidden="true" className="h-5 w-5" />
    <span className="text-[17px] tracking-tight">{formatCurrency(total)}</span>
  </Link>
);

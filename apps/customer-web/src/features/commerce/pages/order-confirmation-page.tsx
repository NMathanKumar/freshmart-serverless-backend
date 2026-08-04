import { Suspense } from 'react';
import { Download, MapPin, Share2, ShoppingCart, Truck, CreditCard, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as shared from '@freshmart/shared';

const { customerRoutePaths } = shared;
import { CommerceShell } from '../components/commerce-layout.js';
import { CommerceProductCard } from '../components/commerce-product-card.js';
import { ProductGridSkeleton } from '../components/commerce-state.js';
import { orderConfirmationProducts, searchProducts } from '../model/commerce-content.js';

const OrderConfirmationContent = () => (
  <CommerceShell active="orders" title="Order Confirmed">
    <main className="mx-auto max-w-4xl px-4 pb-12 pt-28 md:px-10">
      <section className="mb-8 flex flex-col items-center text-center">
        <div className="relative mb-6 h-64 w-full max-w-md">
          <div className="absolute inset-0 scale-110 animate-pulse rounded-full bg-[#006b2c]/5 opacity-60 blur-3xl" />
          <img alt="Celebratory grocery delivery success" className="relative z-10 h-full w-full object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKOY3UJuc1cVmubfkC2th74wHXp7fxwoDXs7fSUGT5cx_zNrp08pRLj3QN6OcZdPlft-ZvvfblppHNqIn_SLxk39hV-lTEIkLdReh4UOQ4D3kBL1P5RB8pR4535juKQY7EkyPgWnYcjFTBdnoHh1H7U8K0P8CooeTfID7crgupsM5-ap97XLMa5hV9oRIX_R01HaFngZbFVX-InBOh6eWAeZuCOUKQYMnl_Gw8uVt0P8BIs7VdxiQUIKAJ5qFeC2MAasteTEJSlkUj" />
        </div>
        <h1 className="mb-2 text-3xl font-bold md:text-4xl">Thank You!</h1>
        <p className="max-w-lg text-lg text-[#3e4a3d]">Order #FM-102938 successfully placed! Sit back and relax while we prepare your fresh finds.</p>
      </section>
      <section className="commerce-card mb-8 p-6">
        <div className="mb-6 flex items-center gap-4 rounded-xl bg-[#d8f4ce]/50 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#006b2c] text-white"><Truck className="h-6 w-6" /></div>
          <div><p className="text-sm font-semibold text-[#006b2c]">Estimated Delivery</p><p className="text-xl font-semibold">Arriving in 12 mins</p></div>
        </div>
        <div className="mb-6 grid grid-cols-1 gap-6 border-b border-[#bdcaba]/40 pb-6 md:grid-cols-2">
          <Info icon={<MapPin />} label="Delivery Address" text={<>242 Luxury Avenue, Apt 4B<br />Manhattan, NY 10001</>} />
          <Info icon={<CreditCard />} label="Payment & Total" text={<>Apple Pay (•••• 4920)<br /><strong className="text-[#006b2c]">$42.85 Paid</strong></>} />
        </div>
        <div className="flex flex-col gap-3">
          <Link className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--color-fresh-500)] px-5 py-4 text-lg font-semibold text-white shadow-lg shadow-[color:rgba(26,127,55,0.22)] transition-colors hover:bg-[color:var(--color-fresh-600)]" to={customerRoutePaths.orders}>Track Order</Link>
          <div className="grid grid-cols-3 gap-3">
            <Action icon={<Download />} label="Invoice" />
            <Link className="commerce-focus flex flex-col items-center justify-center gap-1 rounded-xl border border-[#bdcaba]/40 p-3 text-sm font-semibold hover:bg-[#eff6ea]" to={customerRoutePaths.home}><ShoppingCart className="h-5 w-5 text-[#3e4a3d]" />Continue</Link>
            <Action icon={<Share2 />} label="Share" />
          </div>
        </div>
      </section>
      <section className="mb-8">
        <div className="mb-4 flex items-end justify-between"><h2 className="text-xl font-semibold">Buy It Again</h2><a className="text-sm font-bold text-[#006b2c]" href="#history">View History</a></div>
        <div className="commerce-no-scrollbar flex gap-4 overflow-x-auto pb-4">{orderConfirmationProducts.map((product) => <article className="min-w-[160px] rounded-xl border border-[#bdcaba]/20 bg-white p-3 shadow-sm" key={product.productId}><img alt={product.name} className="mb-2 h-32 w-full rounded-lg object-cover" src={product.imageUrl} /><p className="truncate text-sm font-semibold">{product.name}</p><div className="mt-2 flex items-center justify-between"><span className="font-bold">${product.price.toFixed(2)}</span><button aria-label={`Add ${product.name}`} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d8f4ce] text-[#2b4c1d]" type="button"><Plus className="h-4 w-4" /></button></div></article>)}</div>
      </section>
      <section><h2 className="mb-4 text-xl font-semibold">Recommended for You</h2><div className="grid grid-cols-2 gap-4 md:grid-cols-3">{searchProducts.slice(0, 3).map((product) => <CommerceProductCard key={product.productId} product={product} />)}</div></section>
    </main>
  </CommerceShell>
);

const Info = ({ icon, label, text }: { icon: React.ReactNode; label: string; text: React.ReactNode }) => <div className="flex gap-3"><span className="text-[#6e7b6c]">{icon}</span><div><p className="mb-1 text-xs font-semibold text-[#6e7b6c]">{label}</p><p className="text-base text-[#171d16]">{text}</p></div></div>;
const Action = ({ icon, label }: { icon: React.ReactNode; label: string }) => <button className="commerce-focus flex flex-col items-center justify-center gap-1 rounded-xl border border-[#bdcaba]/40 p-3 text-sm font-semibold hover:bg-[#eff6ea]" type="button"><span className="text-[#3e4a3d]">{icon}</span>{label}</button>;

export default function OrderConfirmationPage() {
  return <Suspense fallback={<ProductGridSkeleton count={2} />}><OrderConfirmationContent /></Suspense>;
}

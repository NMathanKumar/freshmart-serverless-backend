import { Suspense } from 'react';
import { Download, MapPin, Share2, ShoppingCart, Truck, CreditCard, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HomeHeader } from '../../home/components/home-header.js';
import { HomeFooter } from '../../home/components/home-footer.js';
import { CommerceProductCard } from '../components/commerce-product-card.js';
import { orderConfirmationProducts, searchProducts } from '../model/commerce-content.js';

const formatUSD = (amount: number) => `$${Number(amount || 0).toFixed(2)}`;

const OrderConfirmationContent = () => (
  <div className="min-h-screen bg-[#f4fcf0] text-[#171d16] font-sans">
    <HomeHeader variant="cart" />

    <main className="mx-auto max-w-4xl px-4 sm:px-6 md:px-8 pb-16 pt-24 space-y-8">

      {/* Hero Celebration Banner */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative h-56 w-full max-w-sm flex items-center justify-center">
          <div className="absolute inset-0 scale-110 animate-pulse rounded-full bg-[#006b2c]/10 opacity-60 blur-3xl" />
          <img
            alt="Grocery bag with fresh produce"
            className="relative z-10 h-full w-full object-contain mix-blend-multiply"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKOY3UJuc1cVmubfkC2th74wHXp7fxwoDXs7fSUGT5cx_zNrp08pRLj3QN6OcZdPlft-ZvvfblppHNqIn_SLxk39hV-lTEIkLdReh4UOQ4D3kBL1P5RB8pR4535juKQY7EkyPgWnYcjFTBdnoHh1H7U8K0P8CooeTfID7crgupsM5-ap97XLMa5hV9oRIX_R01HaFngZbFVX-InBOh6eWAeZuCOUKQYMnl_Gw8uVt0P8BIs7VdxiQUIKAJ5qFeC2MAasteTEJSlkUj"
          />
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#171d16]">Thank You!</h1>
          <p className="max-w-lg text-sm sm:text-base font-semibold text-[#8b9888]">
            Order <strong className="text-[#171d16]">#FM-102938</strong> successfully placed! Sit back and relax while we prepare your fresh finds.
          </p>
        </div>
      </div>

      {/* Delivery Tracking Card */}
      <div className="rounded-[28px] border border-[#e2ebdE] bg-white p-6 sm:p-8 shadow-xs space-y-6">

        {/* Estimated Delivery Banner */}
        <div className="flex items-center gap-3 rounded-2xl bg-[#eff6ea] p-4 text-[#006c4a] border border-[#bdcaba]/30">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#006b2c] text-white shadow-xs">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[11px] font-black uppercase tracking-wider text-[#8b9888]">Estimated Delivery</span>
            <span className="text-base font-black text-[#171d16]">Arriving in 12 mins</span>
          </div>
        </div>

        {/* Order Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-[#e2ebdE] pb-6">
          <div className="flex gap-3">
            <MapPin className="h-5 w-5 text-[#8b9888] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#8b9888]">Delivery Address</p>
              <p className="text-xs font-extrabold text-[#171d16] leading-relaxed mt-1">
                202 Luxury Avenue, Apt 4B<br />
                Manhattan, NY 10021
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <CreditCard className="h-5 w-5 text-[#8b9888] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#8b9888]">Payment & Total</p>
              <p className="text-xs font-extrabold text-[#171d16] leading-relaxed mt-1">
                Apple Pay (•••• 0921)<br />
                <strong className="text-[#006c4a] text-sm">{formatUSD(42.85)} Paid</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            className="flex h-13 w-full items-center justify-center rounded-2xl bg-[#006b2c] text-sm font-extrabold text-white shadow-md hover:bg-[#005422] transition-all active:scale-98"
            to="/orders"
          >
            Track Order
          </Link>

          <div className="grid grid-cols-3 gap-3">
            <button className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-[#e2ebdE] bg-white p-3 text-xs font-extrabold text-[#3e4a3d] hover:bg-[#eff6ea] transition-all" type="button">
              <Download className="h-4 w-4 text-[#006b2c]" />
              <span>Invoice</span>
            </button>
            <Link className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-[#e2ebdE] bg-white p-3 text-xs font-extrabold text-[#3e4a3d] hover:bg-[#eff6ea] transition-all" to="/">
              <ShoppingCart className="h-4 w-4 text-[#006b2c]" />
              <span>Continue</span>
            </Link>
            <button className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-[#e2ebdE] bg-white p-3 text-xs font-extrabold text-[#3e4a3d] hover:bg-[#eff6ea] transition-all" type="button">
              <Share2 className="h-4 w-4 text-[#006b2c]" />
              <span>Share</span>
            </button>
          </div>
        </div>

      </div>

      {/* Buy It Again Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-[#171d16]">Buy It Again</h2>
          <Link className="text-xs font-extrabold text-[#006b2c] hover:underline" to="/orders">
            View History
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {orderConfirmationProducts.map((prod) => (
            <div key={prod.productId} className="rounded-[20px] border border-[#e2ebdE] bg-white p-3 shadow-xs space-y-2">
              <div className="h-28 w-full rounded-xl bg-[#eff6ea] p-2 flex items-center justify-center overflow-hidden">
                <img alt={prod.name} className="h-full w-full object-contain mix-blend-multiply" src={prod.imageUrl} />
              </div>
              <h3 className="text-xs font-extrabold text-[#171d16] truncate">{prod.name}</h3>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-black text-[#006c4a]">{formatUSD(prod.price)}</span>
                <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#d8f4ce] text-[#2b4c1d] hover:bg-[#b8e5cd] transition-all" type="button">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended for You Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-[#171d16]">Recommended for You</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {searchProducts.slice(0, 3).map((product) => (
            <CommerceProductCard key={product.productId} product={product} />
          ))}
        </div>
      </div>

    </main>

    <HomeFooter />
  </div>
);

export default function OrderConfirmationPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#f4fcf0]" />}><OrderConfirmationContent /></Suspense>;
}

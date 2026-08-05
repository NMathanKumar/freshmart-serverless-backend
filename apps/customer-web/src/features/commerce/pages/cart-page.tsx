import { useState, useMemo } from 'react';
import { ArrowRight, Bookmark, CheckCircle2, Heart, Minus, Plus, ShieldCheck, Tag, Trash2 } from 'lucide-react';
import { Button, Input } from '@freshmart/design-system';
import { Link } from 'react-router-dom';
import { useGetCartQuery, useRemoveCartItemMutation, useUpdateCartItemMutation } from '../api/commerce-api.js';
import { HomeHeader } from '../../home/components/home-header.js';
import { HomeFooter } from '../../home/components/home-footer.js';

const formatUSD = (amount: number) => `$${Number(amount || 0).toFixed(2)}`;

export function CartContent() {
  const { data: cartItems = [] } = useGetCartQuery();
  const [updateCart] = useUpdateCartItemMutation();
  const [removeCartItem] = useRemoveCartItemMutation();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [savedForLater, setSavedForLater] = useState<Record<string, boolean>>({});

  const totalQuantity = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantityInCart, 0), [cartItems]);
  const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantityInCart, 0), [cartItems]);

  const deliveryFee = 0;
  const platformFee = 1.50;
  const taxes = 1.35;
  const discount = appliedCoupon === 'FRESH20' ? 4.00 : 0;
  const grandTotal = Math.max(0, subtotal + platformFee + taxes - discount);

  const toggleSaveForLater = (id: string) => {
    setSavedForLater((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleUpdateQuantity = async (productId: string, currentQty: number, delta: number) => {
    const nextQty = currentQty + delta;
    if (nextQty <= 0) {
      await removeCartItem({ productId }).unwrap().catch(() => undefined);
    } else {
      await updateCart({ productId, quantity: nextQty }).unwrap().catch(() => undefined);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4fcf0] text-[#171d16] font-sans">
      <HomeHeader variant="cart" />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 pb-16 pt-24 space-y-8">

        {/* Page Title & Subtitle matching Figma */}
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#171d16]">Your Cart</h1>
          <p className="text-sm font-semibold text-[#8b9888]">
            You have {totalQuantity} item{totalQuantity === 1 ? '' : 's'} ready for checkout
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="rounded-[28px] border border-[#e2ebdE] bg-white p-12 text-center space-y-4 shadow-xs">
            <p className="text-base font-extrabold text-[#171d16]">Your cart is empty.</p>
            <p className="text-xs font-semibold text-[#8b9888]">Add fresh groceries to check out quickly!</p>
            <Link className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#006b2c] px-6 text-xs font-black text-white hover:bg-[#005422] transition-all shadow-xs" to="/">
              Explore Fresh Produce
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-[1fr_300px] sm:grid-cols-[1fr_340px] md:grid-cols-[1fr_360px] lg:grid-cols-[1fr_380px] gap-6 lg:gap-8 items-start w-full">

            {/* Left Column: Cart Products (Guaranteed Left Column) */}
            <div className="space-y-4 min-w-0 w-full">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="rounded-[24px] border border-[#e2ebdE] bg-white p-4 sm:p-5 shadow-xs transition-all hover:shadow-md flex flex-col sm:flex-row gap-4 sm:gap-5"
                >
                  {/* Thumbnail Image Box */}
                  <div className="h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-2xl bg-[#eff6ea] p-2 border border-[#bdcaba]/30 flex items-center justify-center">
                    <img
                      alt={item.name}
                      className="h-full w-full object-contain mix-blend-multiply"
                      src={item.imageUrl}
                      onError={(e) => { e.currentTarget.src = 'https://lh3.googleusercontent.com/aida-public/b01cfbf2eb5d4e1fa429ed3ee7964b91/product-placeholder.png'; }}
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 flex flex-col justify-between space-y-3 min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="text-base font-extrabold text-[#171d16] truncate">{item.name}</h3>
                          <p className="text-xs font-bold text-[#8b9888] mt-0.5">{item.brand}</p>
                        </div>
                        <span className="text-base font-black text-[#006c4a] shrink-0">{formatUSD(item.price)}</span>
                      </div>

                      <p className="mt-1 flex items-center gap-1 text-[11px] font-extrabold text-[#006c4a]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>In-stock - Delivery in 15 mins</span>
                      </p>
                    </div>

                    {/* Bottom Actions Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      {/* Quantity Selector Pill */}
                      <div className="flex items-center gap-3 rounded-full border border-[#bdcaba]/60 bg-[#eff6ea] px-3.5 py-1 shadow-xs">
                        <button
                          aria-label="Decrease quantity"
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#171d16] shadow-xs hover:bg-[#d8f4ce] active:scale-95 transition-all"
                          onClick={() => void handleUpdateQuantity(item.productId, item.quantityInCart, -1)}
                          type="button"
                        >
                          <Minus className="h-3 w-3 stroke-[3]" />
                        </button>
                        <span className="w-5 text-center text-xs font-black text-[#171d16]">{item.quantityInCart}</span>
                        <button
                          aria-label="Increase quantity"
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#171d16] shadow-xs hover:bg-[#d8f4ce] active:scale-95 transition-all"
                          onClick={() => void handleUpdateQuantity(item.productId, item.quantityInCart, 1)}
                          type="button"
                        >
                          <Plus className="h-3 w-3 stroke-[3]" />
                        </button>
                      </div>

                      {/* Save for later & Remove triggers */}
                      <div className="flex items-center gap-3 sm:gap-4 text-xs font-extrabold">
                        <button
                          className={`inline-flex items-center gap-1 transition-colors ${
                            savedForLater[item.productId] ? 'text-[#006c4a]' : 'text-[#8b9888] hover:text-[#171d16]'
                          }`}
                          onClick={() => toggleSaveForLater(item.productId)}
                          type="button"
                        >
                          <Bookmark className={`h-3.5 w-3.5 ${savedForLater[item.productId] ? 'fill-[#006c4a] text-[#006c4a]' : ''}`} />
                          <span>{savedForLater[item.productId] ? 'Saved' : 'Save for later'}</span>
                        </button>

                        <button
                          className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 transition-colors"
                          onClick={() => void removeCartItem({ productId: item.productId }).unwrap().catch(() => undefined)}
                          type="button"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Price Details Card & Checkout (Guaranteed Right Column) */}
            <div className="space-y-4 min-w-0 w-full sticky top-24">

              <div className="rounded-[28px] border border-[#e2ebdE] bg-white p-5 sm:p-6 shadow-xs space-y-6">
                <h2 className="text-lg font-black tracking-tight text-[#171d16]">Price Details</h2>

                <div className="space-y-3 text-xs font-extrabold text-[#3e4a3d]">
                  <div className="flex items-center justify-between">
                    <span>Item Subtotal ({totalQuantity} items)</span>
                    <span className="text-[#171d16] font-black">{formatUSD(subtotal)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Delivery Fee</span>
                    <span className="text-[#006c4a] font-black">
                      <span className="line-through text-[#8b9888] mr-1.5">{formatUSD(2.50)}</span>
                      Free
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Platform Fee</span>
                    <span className="text-[#171d16] font-black">{formatUSD(platformFee)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Taxes</span>
                    <span className="text-[#171d16] font-black">{formatUSD(taxes)}</span>
                  </div>
                </div>

                {/* Grand Total & Savings Badge */}
                <div className="border-t border-[#e2ebdE] pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black text-[#171d16]">Grand Total</span>
                    <span className="text-xl font-black text-[#006c4a]">{formatUSD(grandTotal)}</span>
                  </div>

                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d8f4ce] px-3.5 py-1.5 text-xs font-black text-[#2b4c1d]">
                      <Tag className="h-3.5 w-3.5" />
                      <span>Estimated Savings: {formatUSD(2.50 + discount)}</span>
                    </span>
                  </div>
                </div>

                {/* Apply Coupon Row */}
                <div className="flex gap-2">
                  <Input
                    className="h-11 rounded-xl border border-[#bdcaba]/60 bg-[#f8fbf5] px-4 text-xs font-bold placeholder:text-[#8b9888] focus:bg-white focus:ring-2 focus:ring-[#006b2c] flex-1"
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Apply Coupon"
                    value={couponCode}
                  />
                  <Button
                    className="h-11 rounded-xl bg-[#006b2c] px-5 text-xs font-extrabold text-white hover:bg-[#005422] transition-all shadow-xs"
                    onClick={() => setAppliedCoupon(couponCode.trim().toUpperCase())}
                    type="button"
                  >
                    Apply
                  </Button>
                </div>

                {/* Proceed to Checkout CTA Button */}
                <div className="space-y-3 pt-1">
                  <Link
                    className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#006b2c] text-sm font-extrabold text-white shadow-md hover:bg-[#005422] transition-all active:scale-98"
                    to="/addresses"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link className="block text-center text-xs font-extrabold text-[#006b2c] hover:underline" to="/">
                    Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Secure Transactions Banner */}
              <div className="rounded-[24px] border border-[#bdcaba]/30 bg-[#eff6ea] p-4 flex items-center gap-3.5 shadow-xs">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#006c4a] shadow-xs">
                  <ShieldCheck className="h-5 w-5 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#171d16]">Secure Transactions</h4>
                  <p className="text-[11px] font-semibold text-[#8b9888]">Your payment is 100% safe and encrypted.</p>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      <HomeFooter />
    </div>
  );
}

export default function CartPage() {
  return <CartContent />;
}

import { useState, useMemo } from 'react';
import {
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  Tag,
  Trash2,
} from 'lucide-react';
import { Button, Input } from '@freshmart/design-system';
import { Link } from 'react-router-dom';
import {
  useGetCartQuery,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from '../api/commerce-api.js';
import { HomeHeader } from '../../home/components/home-header.js';
import { HomeFooter } from '../../home/components/home-footer.js';

const formatINR = (amount: number) => `₹${Number(amount || 0).toFixed(2)}`;

export function CartContent() {
  const { data: cartItems = [] } = useGetCartQuery();
  const [updateCart] = useUpdateCartItemMutation();
  const [removeCartItem] = useRemoveCartItemMutation();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [savedForLater, setSavedForLater] = useState<Record<string, boolean>>(
    {}
  );

  const totalQuantity = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantityInCart, 0),
    [cartItems]
  );
  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + item.price * item.quantityInCart,
        0
      ),
    [cartItems]
  );

  const deliveryFee = 0;
  const platformFee = 1.5;
  const taxes = 1.35;
  const discount = appliedCoupon === 'FRESH20' ? 4.0 : 0;
  const grandTotal = Math.max(0, subtotal + platformFee + taxes - discount);

  const toggleSaveForLater = (id: string) => {
    setSavedForLater((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleUpdateQuantity = async (
    productId: string,
    currentQty: number,
    delta: number
  ) => {
    const nextQty = currentQty + delta;
    if (nextQty <= 0) {
      await removeCartItem({ productId })
        .unwrap()
        .catch(() => undefined);
    } else {
      await updateCart({ productId, quantity: nextQty })
        .unwrap()
        .catch(() => undefined);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4fcf0] font-sans text-[#171d16]">
      <HomeHeader variant="cart" />

      <main className="mx-auto max-w-7xl space-y-8 px-4 pt-24 pb-16 sm:px-6 md:px-8">
        {/* Page Title & Subtitle matching Figma */}
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-[#171d16] sm:text-4xl">
            Your Cart
          </h1>
          <p className="text-sm font-semibold text-[#8b9888]">
            You have {totalQuantity} item{totalQuantity === 1 ? '' : 's'} ready
            for checkout
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="space-y-4 rounded-[28px] border border-[#e2ebdE] bg-white p-12 text-center shadow-xs">
            <p className="text-base font-extrabold text-[#171d16]">
              Your cart is empty.
            </p>
            <p className="text-xs font-semibold text-[#8b9888]">
              Add fresh groceries to check out quickly!
            </p>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#006b2c] px-6 text-xs font-black text-white shadow-xs transition-all hover:bg-[#005422]"
              to="/"
            >
              Explore Fresh Produce
            </Link>
          </div>
        ) : (
          <div className="grid w-full grid-cols-[1fr_300px] items-start gap-6 sm:grid-cols-[1fr_340px] md:grid-cols-[1fr_360px] lg:grid-cols-[1fr_380px] lg:gap-8">
            {/* Left Column: Cart Products (Guaranteed Left Column) */}
            <div className="w-full min-w-0 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="flex flex-col gap-4 rounded-[24px] border border-[#e2ebdE] bg-white p-4 shadow-xs transition-all hover:shadow-md sm:flex-row sm:gap-5 sm:p-5"
                >
                  {/* Thumbnail Image Box */}
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#bdcaba]/30 bg-[#eff6ea] p-2 sm:h-28 sm:w-28">
                    <img
                      alt={item.name}
                      className="h-full w-full object-contain mix-blend-multiply"
                      src={item.imageUrl}
                      onError={(e) => {
    const fallback = 'https://placehold.co/400x400/e2ebdE/006c4a.png?text=FreshMart';
    if (!e.currentTarget.src.includes('product-placeholder.png')) {
      e.currentTarget.src = fallback;
    }
  }}
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-extrabold text-[#171d16]">
                            {item.name}
                          </h3>
                          <p className="mt-0.5 text-xs font-bold text-[#8b9888]">
                            {item.brand}
                          </p>
                        </div>
                        <span className="shrink-0 text-base font-black text-[#006c4a]">
                          {formatINR(item.price)}
                        </span>
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
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#171d16] shadow-xs transition-all hover:bg-[#d8f4ce] active:scale-95"
                          onClick={() =>
                            void handleUpdateQuantity(
                              item.productId,
                              item.quantityInCart,
                              -1
                            )
                          }
                          type="button"
                        >
                          <Minus className="h-3 w-3 stroke-[3]" />
                        </button>
                        <span className="w-5 text-center text-xs font-black text-[#171d16]">
                          {item.quantityInCart}
                        </span>
                        <button
                          aria-label="Increase quantity"
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#171d16] shadow-xs transition-all hover:bg-[#d8f4ce] active:scale-95"
                          onClick={() =>
                            void handleUpdateQuantity(
                              item.productId,
                              item.quantityInCart,
                              1
                            )
                          }
                          type="button"
                        >
                          <Plus className="h-3 w-3 stroke-[3]" />
                        </button>
                      </div>

                      {/* Save for later & Remove triggers */}
                      <div className="flex items-center gap-3 text-xs font-extrabold sm:gap-4">
                        <button
                          className={`inline-flex items-center gap-1 transition-colors ${
                            savedForLater[item.productId]
                              ? 'text-[#006c4a]'
                              : 'text-[#8b9888] hover:text-[#171d16]'
                          }`}
                          onClick={() => toggleSaveForLater(item.productId)}
                          type="button"
                        >
                          <Bookmark
                            className={`h-3.5 w-3.5 ${savedForLater[item.productId] ? 'fill-[#006c4a] text-[#006c4a]' : ''}`}
                          />
                          <span>
                            {savedForLater[item.productId]
                              ? 'Saved'
                              : 'Save for later'}
                          </span>
                        </button>

                        <button
                          className="inline-flex items-center gap-1 text-rose-600 transition-colors hover:text-rose-700"
                          onClick={() =>
                            void removeCartItem({ productId: item.productId })
                              .unwrap()
                              .catch(() => undefined)
                          }
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
            <div className="sticky top-24 w-full min-w-0 space-y-4">
              <div className="space-y-6 rounded-[28px] border border-[#e2ebdE] bg-white p-5 shadow-xs sm:p-6">
                <h2 className="text-lg font-black tracking-tight text-[#171d16]">
                  Price Details
                </h2>

                <div className="space-y-3 text-xs font-extrabold text-[#3e4a3d]">
                  <div className="flex items-center justify-between">
                    <span>Item Subtotal ({totalQuantity} items)</span>
                    <span className="font-black text-[#171d16]">
                      {formatINR(subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Delivery Fee</span>
                    <span className="font-black text-[#006c4a]">
                      <span className="mr-1.5 text-[#8b9888] line-through">
                        {formatINR(2.5)}
                      </span>
                      Free
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Platform Fee</span>
                    <span className="font-black text-[#171d16]">
                      {formatINR(platformFee)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Taxes</span>
                    <span className="font-black text-[#171d16]">
                      {formatINR(taxes)}
                    </span>
                  </div>
                </div>

                {/* Grand Total & Savings Badge */}
                <div className="space-y-3 border-t border-[#e2ebdE] pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black text-[#171d16]">
                      Grand Total
                    </span>
                    <span className="text-xl font-black text-[#006c4a]">
                      {formatINR(grandTotal)}
                    </span>
                  </div>

                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d8f4ce] px-3.5 py-1.5 text-xs font-black text-[#2b4c1d]">
                      <Tag className="h-3.5 w-3.5" />
                      <span>
                        Estimated Savings: {formatINR(2.5 + discount)}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Apply Coupon Row */}
                <div className="flex gap-2">
                  <Input
                    className="h-11 flex-1 rounded-xl border border-[#bdcaba]/60 bg-[#f8fbf5] px-4 text-xs font-bold placeholder:text-[#8b9888] focus:bg-white focus:ring-2 focus:ring-[#006b2c]"
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Apply Coupon"
                    value={couponCode}
                  />
                  <Button
                    className="h-11 rounded-xl bg-[#006b2c] px-5 text-xs font-extrabold text-white shadow-xs transition-all hover:bg-[#005422]"
                    onClick={() =>
                      setAppliedCoupon(couponCode.trim().toUpperCase())
                    }
                    type="button"
                  >
                    Apply
                  </Button>
                </div>

                {/* Proceed to Checkout CTA Button */}
                <div className="space-y-3 pt-1">
                  <Link
                    className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#006b2c] text-sm font-extrabold text-white shadow-md transition-all hover:bg-[#005422] active:scale-98"
                    to="/addresses"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    className="block text-center text-xs font-extrabold text-[#006b2c] hover:underline"
                    to="/"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Secure Transactions Banner */}
              <div className="flex items-center gap-3.5 rounded-[24px] border border-[#bdcaba]/30 bg-[#eff6ea] p-4 shadow-xs">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#006c4a] shadow-xs">
                  <ShieldCheck className="h-5 w-5 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#171d16]">
                    Secure Transactions
                  </h4>
                  <p className="text-[11px] font-semibold text-[#8b9888]">
                    Your payment is 100% safe and encrypted.
                  </p>
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

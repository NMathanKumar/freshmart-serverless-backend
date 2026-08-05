import { useState } from 'react';
import { ArrowRight, Check, Clock, MapPin, Minus, Plus, ShieldCheck, ShoppingBag, Truck, Tag, Lock } from 'lucide-react';
import { Button, Input } from '@freshmart/design-system';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency } from '@freshmart/shared';
import { useGetCheckoutQuery } from '../api/commerce-api.js';
import { HomeHeader } from '../../home/components/home-header.js';
import { HomeFooter } from '../../home/components/home-footer.js';

interface CheckoutItem {
  id: string;
  name: string;
  weight: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

const INITIAL_ITEMS: CheckoutItem[] = [
  {
    id: 'checkout-1',
    name: 'Organic Vine Tomatoes',
    weight: '400g',
    price: 4.50,
    quantity: 1,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGoSHs0NoGGfIYxwIsyWj4vdh5kPA6QRji00Ii_lH3pVavw-d6dflAFH2xfLRc7nhy0VsPUgLJmXhz4hfJXWIpI_MrOcbL68xaRTzInZH56nC-pmYNylqYdiG9kooerikkbZQ5rbh_DOv-vJCnYk-9TR5MQQfqAkILwK0p-L7GVVLYSuCq6ijxgSQHWu63I14zGiQuXh-S5kHsDqini0IBQEDyW4mtGSN9jKU5d7tUrOiZHiOyIcmBW5bcB-FUo3Cl37zDruhJm2xR'
  },
  {
    id: 'checkout-2',
    name: 'Fresh Curly Kale',
    weight: '250g',
    price: 3.20,
    quantity: 3,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSHaELNOhgX7mXWpkTZoBd8EkjiC2gtiPjn00f0mfjjc35_Do4_8Cy5vfaZ00jCjl_LWa_yqs1YWNNxfKG-47zOk6_uc4o68CzFG_6qcXMcdsDVDl_SyzMzXoPgwzJXcSlEVxzUTctK3lNfyPPIhPNxdF9p3-VLXrfZOpRAlbQ8V_eSjtPAmHqEI4QEygGblDnpdLD1BIr84P3DEYq4457nmGfVawMGFAmdA0Sx86DswR32pk7VCPiD5p8M9i4wnqts7_21AyM6I6S'
  },
  {
    id: 'checkout-3',
    name: 'Artisan Olive Oil',
    weight: '500ml',
    price: 18.00,
    quantity: 1,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-8ZKxMuvb9QVdjRnKXyn-bmUF69PYQ5gWY2M8ofX8H15-hmkg8-Gy-qHR61k7JtnnVXh0JF7KRg0XbNdLeLtRYR0G-xZpY9RiUPqL8qFvdL9Sp-Axe1JpioUqZnCOyw_xkiBbtnq4PKTIO-9B6bZ_Muj4HirdjRXta4ycEsR1xOPMARFTJ4AC5WVY5yZbXglG-7V9upqCvyqtUT3kFfCrcwaLkmpmB1REpl05m6AtigOrnjL4cpAY8P4SDTpYFsOlnJyXkgQpo17u'
  }
];

const TIME_SLOTS = [
  { id: 'slot-1', day: 'TODAY', time: '08:00', label: 'Morning' },
  { id: 'slot-2', day: 'TODAY', time: '14:00', label: 'Afternoon' },
  { id: 'slot-3', day: 'TODAY', time: '19:00', label: 'Evening' },
  { id: 'slot-4', day: 'TOMORROW', time: '09:00', label: 'Morning' }
];

export function CheckoutPaymentContent() {
  const navigate = useNavigate();
  const { data } = useGetCheckoutQuery();
  const [items, setItems] = useState<CheckoutItem[]>(INITIAL_ITEMS);
  const [selectedSlot, setSelectedSlot] = useState('slot-2');
  const [promoCode, setPromoCode] = useState('FRESH20');
  const [appliedCode, setAppliedCode] = useState('FRESH20');

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = Math.max(0, item.quantity + delta);
            return newQty === 0 ? null : { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item): item is CheckoutItem => item !== null)
    );
  };

  const itemSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gst = itemSubtotal * 0.05;
  const discount = appliedCode === 'FRESH20' ? 4.00 : 0;
  const grandTotal = Math.max(0, itemSubtotal + gst - discount);

  const cartCount = data?.cart?.length ?? items.length;

  return (
    <div className="min-h-screen bg-[#f4fcf0] text-[#171d16] font-sans">
      <HomeHeader cartCount={cartCount} />

      <main className="mx-auto max-w-7xl px-6 md:px-8 pb-16 pt-24">
        {/* Page Title & Subtitle */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#171d16]">Review Your Order</h1>
          <p className="mt-1 text-sm font-semibold text-[#6e7b6c]">Fresh delivery from our urban farms to your doorstep.</p>
        </div>

        {/* 2-Column Layout matching Figma */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 items-start">
          
          {/* Left Column: Address, Delivery Slot, Items */}
          <div className="space-y-6">

            {/* 1. Delivery Address Card */}
            <div className="rounded-[24px] border border-[#e2ebdE] bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#006b2c]" />
                  <h2 className="text-base font-extrabold text-[#171d16]">Delivery Address</h2>
                </div>
                <button className="text-xs font-extrabold text-[#006b2c] hover:underline" type="button">Change</button>
              </div>

              <div className="rounded-2xl border border-[#006b2c]/40 bg-[#f4fcf0]/60 p-4.5 relative">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm font-black text-[#171d16]">Home</span>
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#006b2c] text-white">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-[#3e4a3d] font-medium max-w-md">
                      42nd Silver Oak Avenue, Apartment 8B, Skyline Heights, Metropolitan District, NY 10001
                    </p>
                    <p className="mt-2 text-xs font-bold text-[#6e7b6c]">+1 (555) 019-2834</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Preferred Delivery Slot Card */}
            <div className="rounded-[24px] border border-[#e2ebdE] bg-white p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-[#006b2c]" />
                <h2 className="text-base font-extrabold text-[#171d16]">Preferred Delivery Slot</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {TIME_SLOTS.map((slot) => {
                  const isSelected = selectedSlot === slot.id;
                  return (
                    <button
                      key={slot.id}
                      className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all text-center ${
                        isSelected
                          ? 'border-2 border-[#006b2c] bg-[#eff6ea] text-[#006b2c] shadow-xs'
                          : 'border-[#e2ebdE] bg-[#f8fbf5] text-[#3e4a3d] hover:border-[#bdcaba]'
                      }`}
                      onClick={() => setSelectedSlot(slot.id)}
                      type="button"
                    >
                      <span className="text-[10px] font-black tracking-wider uppercase opacity-80">{slot.day}</span>
                      <strong className="text-sm font-black mt-0.5">{slot.time}</strong>
                      <span className="text-[11px] font-semibold opacity-90">{slot.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Order Summary (3 Items) */}
            <div className="rounded-[24px] border border-[#e2ebdE] bg-white p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-5">
                <ShoppingBag className="h-5 w-5 text-[#006b2c]" />
                <h2 className="text-base font-extrabold text-[#171d16]">Order Summary ({items.length} Items)</h2>
              </div>

              <div className="space-y-4 divide-y divide-[#e2ebdE]/60">
                {items.map((item, idx) => (
                  <div key={item.id} className={`flex items-center justify-between gap-4 ${idx > 0 ? 'pt-4' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 shrink-0 rounded-xl bg-[#f4fcf0] p-1 border border-[#e2ebdE] overflow-hidden">
                        <img alt={item.name} className="h-full w-full object-contain mix-blend-multiply" src={item.imageUrl} onError={(e) => { e.currentTarget.src = 'https://lh3.googleusercontent.com/aida-public/b01cfbf2eb5d4e1fa429ed3ee7964b91/product-placeholder.png'; }} />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-[#171d16]">{item.name}</h3>
                        <p className="text-xs font-semibold text-[#8b9888]">{item.weight}</p>
                        <p className="text-sm font-black text-[#006c4a] mt-0.5">{formatCurrency(item.price)}</p>
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2.5 rounded-full border border-[#bdcaba]/60 bg-[#f8fbf5] px-3 py-1.5 shadow-xs">
                      <button aria-label="Decrease quantity" className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#171d16] shadow-xs hover:bg-[#eff6ea] active:scale-95 transition-all" onClick={() => updateQuantity(item.id, -1)} type="button">
                        <Minus className="h-3 w-3 stroke-[3]" />
                      </button>
                      <span className="w-5 text-center text-xs font-black text-[#171d16]">{item.quantity}</span>
                      <button aria-label="Increase quantity" className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#171d16] shadow-xs hover:bg-[#eff6ea] active:scale-95 transition-all" onClick={() => updateQuantity(item.id, 1)} type="button">
                        <Plus className="h-3 w-3 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Coupons, Payment Details, Express Banner */}
          <div className="space-y-6">

            {/* 1. Coupons & Offers Card */}
            <div className="rounded-[24px] border border-[#e2ebdE] bg-white p-6 shadow-xs">
              <h2 className="text-base font-extrabold text-[#171d16] mb-4">Coupons & Offers</h2>
              
              <div className="flex gap-2">
                <Input
                  className="h-11 rounded-xl border border-[#bdcaba]/60 bg-[#f8fbf5] px-4 text-xs font-bold placeholder:text-[#8b9888] focus:bg-white focus:ring-2 focus:ring-[#006b2c] flex-1"
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="enter promo code"
                  value={promoCode}
                />
                <Button
                  className="h-11 rounded-xl bg-[#006b2c] px-5 text-xs font-extrabold text-white hover:bg-[#005422] transition-all shadow-xs"
                  onClick={() => setAppliedCode(promoCode.trim().toUpperCase())}
                  type="button"
                >
                  Apply
                </Button>
              </div>

              {appliedCode === 'FRESH20' && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#e3f5ea] px-3.5 py-2 text-xs font-extrabold text-[#006c4a]">
                  <Tag className="h-4 w-4" />
                  <span>Code <strong>FRESH20</strong> applied. You saved $4.00!</span>
                </div>
              )}
            </div>

            {/* 2. Payment Details Card */}
            <div className="rounded-[24px] border border-[#e2ebdE] bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-base font-extrabold text-[#171d16]">Payment Details</h2>

              <div className="space-y-2.5 text-xs font-bold text-[#3e4a3d]">
                <div className="flex items-center justify-between">
                  <span>Item Total</span>
                  <span className="text-[#171d16] font-extrabold">{formatCurrency(itemSubtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>GST (5%)</span>
                  <span className="text-[#171d16] font-extrabold">{formatCurrency(gst)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delivery Fee</span>
                  <span className="text-[#006c4a] font-extrabold"><span className="line-through text-[#8b9888] mr-1">{formatCurrency(2.50)}</span>Free</span>
                </div>
                {appliedCode === 'FRESH20' && (
                  <div className="flex items-center justify-between text-[#a72d51]">
                    <span>Coupon Discount</span>
                    <span className="font-black">-{formatCurrency(discount)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-[#e2ebdE] pt-4 flex items-center justify-between">
                <span className="text-base font-black text-[#171d16]">Grand Total</span>
                <span className="text-xl font-black text-[#006c4a]">{formatCurrency(grandTotal)}</span>
              </div>

              <Button
                className="w-full h-13 rounded-2xl bg-[#006b2c] text-sm font-extrabold text-white shadow-md hover:bg-[#005422] transition-all flex items-center justify-center gap-2 active:scale-98"
                onClick={() => navigate('/orders/FM-99283')}
                type="button"
              >
                <span>Proceed to Payment</span>
                <ArrowRight className="h-4 w-4" />
              </Button>

              <div className="flex items-center justify-center gap-4 pt-2 text-[11px] font-bold text-[#8b9888]">
                <span className="flex items-center gap-1"><Lock className="h-3 w-3 text-[#006b2c]" /> Secure Payment</span>
                <span>•</span>
                <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-[#006b2c]" /> Quality Guarantee</span>
              </div>
            </div>

            {/* 3. Express Delivery Info Banner */}
            <div className="rounded-[24px] border border-[#b8e5cd]/60 bg-gradient-to-r from-[#e3f5ea] to-[#f4fcf0] p-4.5 flex items-center gap-4 shadow-xs">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#006b2c] text-white shadow-sm">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#005320] uppercase tracking-wider">Express Delivery</h4>
                <p className="text-xs font-semibold text-[#005320]/80">Estimated delivery by 2:45 PM today.</p>
              </div>
            </div>

          </div>

        </div>
      </main>

      <HomeFooter />
    </div>
  );
}

export default function CheckoutPaymentPage() {
  return <CheckoutPaymentContent />;
}

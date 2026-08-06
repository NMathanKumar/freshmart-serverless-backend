import { useState } from 'react';
import {
  Check,
  MessageSquare,
  Navigation,
  Package,
  PhoneCall,
  ShoppingBag,
  Store,
  Truck,
  MapPin,
} from 'lucide-react';
import { Button } from '@freshmart/design-system';
import { formatCurrency } from '@freshmart/shared';
import { HomeHeader } from '../../home/components/home-header.js';
import { HomeFooter } from '../../home/components/home-footer.js';

interface TrackItem {
  id: string;
  name: string;
  weight: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

const ORDER_ITEMS: TrackItem[] = [
  {
    id: 'track-1',
    name: 'Organic Red Apples',
    weight: '1kg',
    quantity: 1,
    price: 4.5,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCGoSHs0NoGGfIYxwIsyWj4vdh5kPA6QRji00Ii_lH3pVavw-d6dflAFH2xfLRc7nhy0VsPUgLJmXhz4hfJXWIpI_MrOcbL68xaRTzInZH56nC-pmYNylqYdiG9kooerikkbZQ5rbh_DOv-vJCnYk-9TR5MQQfqAkILwK0p-L7GVVLYSuCq6ijxgSQHWu63I14zGiQuXh-S5kHsDqini0IBQEDyW4mtGSN9jKU5d7tUrOiZHiOyIcmBW5bcB-FUo3Cl37zDruhJm2xR',
  },
  {
    id: 'track-2',
    name: 'Farm Fresh Milk',
    weight: '1L',
    quantity: 2,
    price: 5.2,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCSHaELNOhgX7mXWpkTZoBd8EkjiC2gtiPjn00f0mfjjc35_Do4_8Cy5vfaZ00jCjl_LWa_yqs1YWNNxfKG-47zOk6_uc4o68CzFG_6qcXMcdsDVDl_SyzMzXoPgwzJXcSlEVxzUTctK3lNfyPPIhPNxdF9p3-VLXrfZOpRAlbQ8V_eSjtPAmHqEI4QEygGblDnpdLD1BIr84P3DEYq4457nmGfVawMGFAmdA0Sx86DswR32pk7VCPiD5p8M9i4wnqts7_21AyM6I6S',
  },
  {
    id: 'track-3',
    name: 'Artisan Sourdough',
    weight: '500g',
    quantity: 1,
    price: 8.9,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAocIVc-EoYCbFmS10USZQHrW2cBY3jC44RL3aegAleg9zH39V0IHSWwM6MIKPQO6ifSz4gqZNGdwbezCWTwpjY26PgUPmNirsv572TsUAyQLu6A8XrYc_0UG8v0nwTw-VYaT0SMJPhU_zb_d9e0nSrxGxXQbl6Lx_YXZsdI0Y_-NYBK5I62D_ProCKkx-hG1xm3k6nMB89NGrtr-8Z1cQoVuXM7LxVdoQLwhsZlw2KSjnxaqws6Q_tmOCTfNEAnRlce3LxYTMFdXYO',
  },
];

const TRACKER_STEPS = [
  {
    id: 'step-1',
    label: 'Confirmed',
    icon: Check,
    completed: true,
    active: false,
  },
  {
    id: 'step-2',
    label: 'Preparing',
    icon: Store,
    completed: false,
    active: true,
  },
  {
    id: 'step-3',
    label: 'Packed',
    icon: Package,
    completed: false,
    active: false,
  },
  {
    id: 'step-4',
    label: 'On the Way',
    icon: Truck,
    completed: false,
    active: false,
  },
  {
    id: 'step-5',
    label: 'Completed',
    icon: Check,
    completed: false,
    active: false,
  },
];

export function OrderDetailsContent() {
  const [deliveryNote, setDeliveryNote] = useState(false);

  const subtotal = ORDER_ITEMS.reduce((sum, item) => sum + item.price, 0);
  const deliveryFee = 1.99;
  const totalPaid = subtotal + deliveryFee;

  return (
    <div className="min-h-screen bg-[#f4fcf0] font-sans text-[#171d16]">
      <HomeHeader cartCount={3} />

      <main className="mx-auto max-w-7xl space-y-8 px-6 pt-24 pb-16 md:px-8">
        {/* 1. Top Card: Arrival Time & 5-Step Order Progress Stepper */}
        <div className="space-y-8 rounded-[28px] border border-[#e2ebdE] bg-white p-6 shadow-xs md:p-8">
          {/* Header Row: Arriving in 12 mins + Badge */}
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-[#171d16] md:text-4xl">
                Arriving in 12 mins
              </h1>
              <p className="mt-1 text-sm font-semibold text-[#8b9888]">
                Order #FM-99283 • Estimated at 2:45 PM
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#e3f5ea] px-4 py-1.5 text-xs font-black text-[#006c4a] shadow-xs">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#006c4a]"></span>
              Preparing your order
            </span>
          </div>

          {/* Horizontal 5-Step Progress Bar */}
          <div className="relative pt-2 pb-2">
            <div className="relative z-10 flex items-center justify-between">
              {TRACKER_STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.id}
                    className="relative flex flex-1 flex-col items-center gap-2 text-center"
                  >
                    {/* Connecting Line Segment */}
                    {index < TRACKER_STEPS.length - 1 && (
                      <div
                        className={`absolute top-5 right-[-50%] left-[50%] -z-10 h-[3px] transition-colors ${
                          step.completed ? 'bg-[#006b2c]' : 'bg-[#e2ebdE]'
                        }`}
                      />
                    )}

                    {/* Step Icon Circle */}
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-full shadow-xs transition-all ${
                        step.completed
                          ? 'bg-[#006b2c] text-white'
                          : step.active
                            ? 'scale-110 bg-[#006b2c] text-white ring-4 ring-[#d8f3e5]'
                            : 'border border-[#e2ebdE] bg-[#f8fbf5] text-[#8b9888]'
                      }`}
                    >
                      <Icon className="h-5 w-5 stroke-[2.5]" />
                    </div>

                    {/* Step Label */}
                    <span
                      className={`text-xs font-extrabold tracking-tight ${
                        step.completed || step.active
                          ? 'text-[#006c4a]'
                          : 'text-[#8b9888]'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2-Column Layout: Left Order Details, Right Address & Need Help */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* Left Column: Order Details & Pricing */}
          <div className="space-y-6 rounded-[28px] border border-[#e2ebdE] bg-white p-6 shadow-xs md:p-8">
            <h2 className="text-xl font-black tracking-tight text-[#171d16]">
              Order Details
            </h2>

            {/* Items List */}
            <div className="space-y-4 divide-y divide-[#e2ebdE]/60">
              {ORDER_ITEMS.map((item, idx) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between gap-4 ${idx > 0 ? 'pt-4' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-[#e2ebdE] bg-[#f4fcf0] p-1.5">
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
                    <div>
                      <h3 className="text-sm font-extrabold text-[#171d16]">
                        {item.name}
                      </h3>
                      <p className="text-xs font-semibold text-[#8b9888]">
                        {item.weight} • Qty {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-[#171d16]">
                    {formatCurrency(item.price)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2.5 border-t border-[#e2ebdE] pt-6 text-xs font-extrabold text-[#3e4a3d]">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-black text-[#171d16]">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery Fee</span>
                <span className="font-black text-[#171d16]">
                  {formatCurrency(deliveryFee)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-[#e2ebdE]/60 pt-3 text-base font-black text-[#171d16]">
                <span>Total Paid</span>
                <span className="text-[#006c4a]">
                  {formatCurrency(totalPaid)}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Delivery Address & Need Help Support */}
          <div className="space-y-6">
            {/* 1. DELIVERY ADDRESS Card */}
            <div className="space-y-3 rounded-[28px] border border-[#e2ebdE] bg-white p-6 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-black tracking-wider text-[#8b9888] uppercase">
                <MapPin className="h-4 w-4 text-[#006b2c]" />
                <span>DELIVERY ADDRESS</span>
              </div>

              <p className="text-sm leading-relaxed font-extrabold text-[#171d16]">
                24th Street, Urban Oasis
                <br />
                <span className="text-xs font-semibold text-[#6e7b6c]">
                  Apartment 5B, Level 2
                </span>
              </p>

              <div className="pt-2">
                <button
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#006b2c] hover:underline"
                  onClick={() => setDeliveryNote(!deliveryNote)}
                  type="button"
                >
                  <span>+ Add delivery notes</span>
                </button>

                {deliveryNote && (
                  <p className="mt-2 rounded-xl border border-[#e2ebdE] bg-[#f8fbf5] p-3 text-xs text-[#6e7b6c]">
                    Delivery notes: Leave package at front door, don't ring
                    doorbell.
                  </p>
                )}
              </div>
            </div>

            {/* 2. Need Help? Green Support Card */}
            <div className="space-y-4 rounded-[28px] border border-[#006b2c]/30 bg-gradient-to-br from-[#006b2c] to-[#004e20] p-6 text-white shadow-md">
              <div>
                <h3 className="text-lg font-black tracking-tight">
                  Need help?
                </h3>
                <p className="mt-1 text-xs leading-relaxed font-medium text-white/90">
                  Our support team is active 24/7 for any order issues.
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                <Button
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-white text-xs font-black text-[#006b2c] shadow-xs transition-all hover:bg-[#eff6ea] active:scale-98"
                  type="button"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Chat with Support</span>
                </Button>
                <Button
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-[#005422] text-xs font-black text-white transition-all hover:bg-[#003d18] active:scale-98"
                  type="button"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>Call FreshMart</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}

export default function OrderDetailsPage() {
  return <OrderDetailsContent />;
}

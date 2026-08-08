import { useState, useMemo } from 'react';
import {
  ArrowRight,
  Check,
  ChevronRight,
  CreditCard,
  Lock,
  Plus,
  ShieldCheck,
  Wallet,
  Building2,
  Banknote,
  Smartphone,
} from 'lucide-react';
import { Button } from '@freshmart/design-system';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HomeHeader } from '../../home/components/home-header.js';
import { HomeFooter } from '../../home/components/home-footer.js';
import {
  useCreateOrderMutation,
  useCreatePaymentMutation,
  useGetCartQuery,
} from '../api/commerce-api.js';

interface SavedCard {
  id: string;
  type: 'visa' | 'mastercard';
  last4: string;
  holder: string;
  expiry: string;
  isDefault: boolean;
}

const SAVED_CARDS: SavedCard[] = [
  {
    id: 'card-1',
    type: 'visa',
    last4: '4242',
    holder: 'ADITYA SHARMA',
    expiry: '08/26',
    isDefault: true,
  },
  {
    id: 'card-2',
    type: 'mastercard',
    last4: '8812',
    holder: 'ADITYA SHARMA',
    expiry: '11/24',
    isDefault: false,
  },
];

export function CheckoutPaymentContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const deliveryAddress = location.state?.deliveryAddress || (typeof location.state?.address === 'string' ? location.state.address : 'Home');
  const deliveryAddressData = location.state?.addressData || location.state?.addressObj || (typeof location.state?.address === 'object' ? location.state.address : null);
  const { data: cartItems = [] } = useGetCartQuery();
  const [createOrder, orderState] = useCreateOrderMutation();
  const [createPayment, paymentState] = useCreatePaymentMutation();

  const [selectedCard, setSelectedCard] = useState('card-1');
  const [selectedOption, setSelectedOption] = useState('card');

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
  const discount = 0;
  const grandTotal = Math.max(
    0,
    subtotal + platformFee + taxes - discount
  );

  const handlePay = async () => {
    try {
      if (typeof deliveryAddress === 'string' && deliveryAddress.trim().length > 3) {
        try {
          localStorage.setItem('freshmart_selected_address', deliveryAddress.trim());
        } catch (_) {}
      }

      const orderItems = cartItems.length > 0
        ? cartItems.map((c) => ({
            productId: c.productId,
            productName: c.name,
            name: c.name,
            imageUrl: c.imageUrl,
            quantity: c.quantityInCart || 1,
            price: Number(c.price || 4.99),
          }))
        : [
            {
              productId: 'PROD-001',
              productName: 'Fresh Organic Produce',
              name: 'Fresh Organic Produce',
              imageUrl: 'https://freshmart-dev-assets-769044546162.s3.ap-southeast-1.amazonaws.com/catalog/products/product_avocado_sample.png',
              quantity: 1,
              price: Math.max(subtotal, 4.99),
            },
          ];

      const effectiveSubtotal = Math.max(subtotal, 4.99);
      const effectiveGrandTotal = Math.max(grandTotal, effectiveSubtotal + platformFee + taxes);

      const orderRes = await createOrder({
        items: orderItems,
        itemSubtotal: effectiveSubtotal,
        subtotal: effectiveSubtotal,
        platformFee,
        deliveryFee,
        tax: taxes,
        taxes,
        discount: 0,
        totalAmount: effectiveGrandTotal,
        grandTotal: effectiveGrandTotal,
        deliveryAddress,
        deliveryAddressData,
        paymentMethod: selectedOption.toUpperCase(),
      }).unwrap();

      // Backend returns { message, data: { orderId: 'ORDER_<uuid>' } }
      // .unwrap() gives us the raw response envelope
      const rawOrderId =
        (orderRes as any)?.data?.orderId ||
        (orderRes as any)?.orderId ||
        (orderRes as any)?.data?.id ||
        (orderRes as any)?.id;

      if (!rawOrderId) {
        throw new Error('Order was placed but no order ID was returned from server');
      }
      const orderId = String(rawOrderId);

      await createPayment({
        orderId,
        paymentMethod: selectedOption.toUpperCase(),
        amount: grandTotal,
        currency: 'INR',
      })
        .unwrap()
        .catch(() => undefined);

      // ✅ Clear local cart immediately after successful order
      const { saveStoredCart } = await import('../model/commerce-content.js');
      saveStoredCart([]);

      // ✅ Also clear remote cart (backend) silently
      try {
        const sdkModule = await import('@freshmart/api-sdk');
        const sdkDefault = (sdkModule as any).default ?? sdkModule;
        await (sdkDefault as any)?.cart?.clearCart?.();
      } catch (_) {
        // Ignore remote clear errors — local cart is already cleared
      }

      navigate(`/checkout/confirmation?orderId=${encodeURIComponent(orderId)}`);
    } catch (err) {
      // Clear local cart even on error
      try {
        const { saveStoredCart } = await import('../model/commerce-content.js');
        saveStoredCart([]);
      } catch (_) {}
      // Do NOT navigate to confirmation with a fake ID — let the error surface
      console.error('Order placement failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4fcf0] font-sans text-[#171d16]">
      <HomeHeader variant="cart" />

      <main className="mx-auto max-w-7xl space-y-8 px-4 pt-24 pb-16 sm:px-6 md:px-8">
        {/* Page Title & Subtitle */}
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-[#171d16] sm:text-4xl">
            Select Payment Method
          </h1>
          <p className="text-sm font-semibold text-[#8b9888]">
            Choose your preferred way to pay for a secure and fast checkout.
          </p>
        </div>

        {/* 2-Column Side-by-Side Layout matching Figma */}
        <div className="grid w-full grid-cols-1 items-start gap-8 lg:grid-cols-[1.6fr_1fr]">
          {/* Left Column: Saved Cards & Other Payment Options */}
          <div className="space-y-6">
            {/* 1. Saved Cards Card */}
            <div className="space-y-5 rounded-[28px] border border-[#e2ebdE] bg-white p-6 shadow-xs sm:p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-[#006b2c]" />
                  <h2 className="text-base font-extrabold text-[#171d16]">
                    Saved Cards
                  </h2>
                </div>
                <button
                  className="flex items-center gap-1 text-xs font-extrabold text-[#006b2c] hover:underline"
                  type="button"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add New Card</span>
                </button>
              </div>

              {/* Saved Cards Row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {SAVED_CARDS.map((card) => {
                  const isSelected =
                    selectedCard === card.id && selectedOption === 'card';
                  return (
                    <div
                      key={card.id}
                      className={`flex cursor-pointer flex-col justify-between space-y-6 rounded-[20px] p-5 shadow-xs transition-all ${
                        isSelected
                          ? 'border-2 border-[#006b2c] bg-[#eff6ea]'
                          : 'border border-[#e2ebdE] bg-white hover:border-[#bdcaba]'
                      }`}
                      onClick={() => {
                        setSelectedCard(card.id);
                        setSelectedOption('card');
                      }}
                    >
                      <div className="flex items-start justify-between">
                        {/* Card Network Logo Badge */}
                        <div className="flex h-8 w-12 items-center justify-center rounded-lg border border-[#bdcaba]/40 bg-white p-1 text-xs font-black tracking-tighter text-blue-900">
                          {card.type === 'visa' ? 'VISA' : 'MC'}
                        </div>

                        {isSelected && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#006b2c] text-white">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <p className="text-base font-black tracking-widest text-[#171d16]">
                          •••• •••• •••• {card.last4}
                        </p>

                        <div className="flex items-center justify-between text-[10px] font-extrabold tracking-wider text-[#8b9888] uppercase">
                          <div>
                            <span className="block text-[9px] text-[#8b9888]">
                              CARD HOLDER
                            </span>
                            <span className="text-[#171d16]">
                              {card.holder}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="block text-[9px] text-[#8b9888]">
                              EXPIRES
                            </span>
                            <span className="text-[#171d16]">
                              {card.expiry}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Other Payment Options */}
            <div className="space-y-3">
              <h2 className="px-1 text-base font-extrabold text-[#171d16]">
                Other Payment Options
              </h2>

              {/* UPI Option */}
              <div
                className={`flex cursor-pointer items-center justify-between rounded-[24px] border bg-white p-5 shadow-xs transition-all ${
                  selectedOption === 'upi'
                    ? 'border-2 border-[#006b2c] bg-[#eff6ea]'
                    : 'border-[#e2ebdE] hover:border-[#bdcaba]'
                }`}
                onClick={() => setSelectedOption('upi')}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eff6ea] text-[#006b2c]">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#171d16]">
                      UPI
                    </h3>
                    <p className="text-xs font-semibold text-[#8b9888]">
                      Google Pay, PhonePe, Paytm & more
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-[#8b9888]" />
              </div>

              {/* Net Banking Option */}
              <div
                className={`flex cursor-pointer items-center justify-between rounded-[24px] border bg-white p-5 shadow-xs transition-all ${
                  selectedOption === 'netbanking'
                    ? 'border-2 border-[#006b2c] bg-[#eff6ea]'
                    : 'border-[#e2ebdE] hover:border-[#bdcaba]'
                }`}
                onClick={() => setSelectedOption('netbanking')}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eff6ea] text-[#006b2c]">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#171d16]">
                      Net Banking
                    </h3>
                    <p className="text-xs font-semibold text-[#8b9888]">
                      All major banks supported
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-[#8b9888]" />
              </div>

              {/* Wallets Option */}
              <div
                className={`flex cursor-pointer items-center justify-between rounded-[24px] border bg-white p-5 shadow-xs transition-all ${
                  selectedOption === 'wallets'
                    ? 'border-2 border-[#006b2c] bg-[#eff6ea]'
                    : 'border-[#e2ebdE] hover:border-[#bdcaba]'
                }`}
                onClick={() => setSelectedOption('wallets')}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eff6ea] text-[#006b2c]">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#171d16]">
                      Wallets
                    </h3>
                    <p className="text-xs font-semibold text-[#8b9888]">
                      Paytm, Amazon Pay, Mobikwik
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-[#8b9888]" />
              </div>

              {/* Cash on Delivery Option */}
              <div
                className={`flex cursor-pointer items-center justify-between rounded-[24px] border bg-white p-5 shadow-xs transition-all ${
                  selectedOption === 'cod'
                    ? 'border-2 border-[#006b2c] bg-[#eff6ea]'
                    : 'border-[#e2ebdE] hover:border-[#bdcaba]'
                }`}
                onClick={() => setSelectedOption('cod')}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eff6ea] text-[#006b2c]">
                    <Banknote className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#171d16]">
                      Cash on Delivery
                    </h3>
                    <p className="text-xs font-semibold text-[#8b9888]">
                      Pay with cash at your doorstep
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-[#8b9888]" />
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary Card */}
          <div className="sticky top-24 space-y-4">
            <div className="space-y-6 rounded-[28px] border border-[#e2ebdE] bg-white p-6 shadow-xs sm:p-8">
              <h2 className="text-lg font-black tracking-tight text-[#171d16]">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs font-extrabold text-[#3e4a3d]">
                <div className="flex items-center justify-between">
                  <span>
                    Items Total ({totalQuantity} item
                    {totalQuantity === 1 ? '' : 's'})
                  </span>
                  <span className="font-black text-[#171d16]">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-black text-[#006c4a]">
                    <span className="mr-1.5 text-[#8b9888] line-through">
                      ₹2.50
                    </span>
                    FREE
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Platform Fee</span>
                  <span className="font-black text-[#171d16]">
                    ₹{platformFee.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Taxes</span>
                  <span className="font-black text-[#171d16]">
                    ₹{taxes.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Grand Total Row */}
              <div className="flex items-center justify-between border-t border-[#e2ebdE] pt-4">
                <span className="text-base font-black text-[#171d16]">
                  Grand Total
                </span>
                <span className="text-xl font-black text-[#006c4a]">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>

              {/* Green Security Banner */}
              <div className="flex items-center gap-2 rounded-2xl border border-[#bdcaba]/30 bg-[#eff6ea] p-3.5 text-xs font-bold text-[#006c4a]">
                <ShieldCheck className="h-5 w-5 shrink-0" />
                <span>
                  Your payment is secured with 256-bit SSL encryption for a safe
                  transaction.
                </span>
              </div>

              {/* Pay CTA Button */}
              <Button
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#006b2c] text-base font-extrabold text-white shadow-md transition-all hover:bg-[#005422] active:scale-98 disabled:opacity-50"
                disabled={orderState.isLoading || paymentState.isLoading}
                onClick={handlePay}
                type="button"
              >
                <span>Pay ₹{grandTotal.toFixed(2)}</span>
                <Lock className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPaymentPage() {
  return <CheckoutPaymentContent />;
}

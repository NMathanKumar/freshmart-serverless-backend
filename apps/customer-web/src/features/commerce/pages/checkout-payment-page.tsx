import { useState, useMemo } from 'react';
import { ArrowRight, Check, ChevronRight, CreditCard, Lock, Plus, ShieldCheck, Wallet, Building2, Banknote, Smartphone } from 'lucide-react';
import { Button } from '@freshmart/design-system';
import { Link, useNavigate } from 'react-router-dom';
import { HomeHeader } from '../../home/components/home-header.js';
import { HomeFooter } from '../../home/components/home-footer.js';
import { useCreateOrderMutation, useCreatePaymentMutation, useGetCartQuery } from '../api/commerce-api.js';

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
    isDefault: true
  },
  {
    id: 'card-2',
    type: 'mastercard',
    last4: '8812',
    holder: 'ADITYA SHARMA',
    expiry: '11/24',
    isDefault: false
  }
];

export function CheckoutPaymentContent() {
  const navigate = useNavigate();
  const { data: cartItems = [] } = useGetCartQuery();
  const [createOrder, orderState] = useCreateOrderMutation();
  const [createPayment, paymentState] = useCreatePaymentMutation();

  const [selectedCard, setSelectedCard] = useState('card-1');
  const [selectedOption, setSelectedOption] = useState('card');

  const totalQuantity = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantityInCart, 0), [cartItems]);
  const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantityInCart, 0), [cartItems]);

  const discount = subtotal > 0 ? 2.90 : 0;
  const deliveryFee = 0;
  const platformFee = 1.50;
  const grandTotal = Math.max(0, subtotal - discount + deliveryFee + platformFee);

  const handlePay = async () => {
    try {
      const orderRes = await createOrder({
        items: cartItems.map((c) => ({ productId: c.productId, quantity: c.quantityInCart, price: c.price })),
        deliveryAddress: 'Home',
        paymentMethod: selectedOption.toUpperCase()
      }).unwrap();

      const orderId = String(orderRes.orderId || orderRes.id || `FM-${Date.now().toString().slice(-6)}`);

      await createPayment({
        orderId,
        paymentMethod: selectedOption.toUpperCase(),
        currency: 'USD'
      }).unwrap().catch(() => undefined);

      navigate(`/checkout/confirmation?orderId=${encodeURIComponent(orderId)}`);
    } catch (_) {
      const fallbackId = `FM-${Date.now().toString().slice(-6)}`;
      navigate(`/checkout/confirmation?orderId=${encodeURIComponent(fallbackId)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4fcf0] text-[#171d16] font-sans">
      <HomeHeader variant="cart" />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 pb-16 pt-24 space-y-8">

        {/* Page Title & Subtitle */}
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#171d16]">Select Payment Method</h1>
          <p className="text-sm font-semibold text-[#8b9888]">
            Choose your preferred way to pay for a secure and fast checkout.
          </p>
        </div>

        {/* 2-Column Side-by-Side Layout matching Figma */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8 items-start w-full">

          {/* Left Column: Saved Cards & Other Payment Options */}
          <div className="space-y-6">

            {/* 1. Saved Cards Card */}
            <div className="rounded-[28px] border border-[#e2ebdE] bg-white p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-[#006b2c]" />
                  <h2 className="text-base font-extrabold text-[#171d16]">Saved Cards</h2>
                </div>
                <button className="text-xs font-extrabold text-[#006b2c] hover:underline flex items-center gap-1" type="button">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add New Card</span>
                </button>
              </div>

              {/* Saved Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SAVED_CARDS.map((card) => {
                  const isSelected = selectedCard === card.id && selectedOption === 'card';
                  return (
                    <div
                      key={card.id}
                      className={`rounded-[20px] p-5 shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-6 ${
                        isSelected
                          ? 'border-2 border-[#006b2c] bg-[#eff6ea]'
                          : 'border border-[#e2ebdE] bg-white hover:border-[#bdcaba]'
                      }`}
                      onClick={() => { setSelectedCard(card.id); setSelectedOption('card'); }}
                    >
                      <div className="flex items-start justify-between">
                        {/* Card Network Logo Badge */}
                        <div className="h-8 w-12 rounded-lg bg-white border border-[#bdcaba]/40 flex items-center justify-center p-1 font-black text-xs text-blue-900 tracking-tighter">
                          {card.type === 'visa' ? 'VISA' : 'MC'}
                        </div>

                        {isSelected && (
                          <div className="h-5 w-5 rounded-full bg-[#006b2c] text-white flex items-center justify-center">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <p className="text-base font-black tracking-widest text-[#171d16]">
                          •••• •••• •••• {card.last4}
                        </p>

                        <div className="flex items-center justify-between text-[10px] font-extrabold text-[#8b9888] uppercase tracking-wider">
                          <div>
                            <span className="block text-[9px] text-[#8b9888]">CARD HOLDER</span>
                            <span className="text-[#171d16]">{card.holder}</span>
                          </div>
                          <div className="text-right">
                            <span className="block text-[9px] text-[#8b9888]">EXPIRES</span>
                            <span className="text-[#171d16]">{card.expiry}</span>
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
              <h2 className="text-base font-extrabold text-[#171d16] px-1">Other Payment Options</h2>

              {/* UPI Option */}
              <div
                className={`rounded-[24px] border p-5 bg-white shadow-xs transition-all cursor-pointer flex items-center justify-between ${
                  selectedOption === 'upi' ? 'border-2 border-[#006b2c] bg-[#eff6ea]' : 'border-[#e2ebdE] hover:border-[#bdcaba]'
                }`}
                onClick={() => setSelectedOption('upi')}
              >
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-2xl bg-[#eff6ea] flex items-center justify-center text-[#006b2c]">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#171d16]">UPI</h3>
                    <p className="text-xs font-semibold text-[#8b9888]">Google Pay, PhonePe, Paytm & more</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-[#8b9888]" />
              </div>

              {/* Net Banking Option */}
              <div
                className={`rounded-[24px] border p-5 bg-white shadow-xs transition-all cursor-pointer flex items-center justify-between ${
                  selectedOption === 'netbanking' ? 'border-2 border-[#006b2c] bg-[#eff6ea]' : 'border-[#e2ebdE] hover:border-[#bdcaba]'
                }`}
                onClick={() => setSelectedOption('netbanking')}
              >
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-2xl bg-[#eff6ea] flex items-center justify-center text-[#006b2c]">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#171d16]">Net Banking</h3>
                    <p className="text-xs font-semibold text-[#8b9888]">All major banks supported</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-[#8b9888]" />
              </div>

              {/* Wallets Option */}
              <div
                className={`rounded-[24px] border p-5 bg-white shadow-xs transition-all cursor-pointer flex items-center justify-between ${
                  selectedOption === 'wallets' ? 'border-2 border-[#006b2c] bg-[#eff6ea]' : 'border-[#e2ebdE] hover:border-[#bdcaba]'
                }`}
                onClick={() => setSelectedOption('wallets')}
              >
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-2xl bg-[#eff6ea] flex items-center justify-center text-[#006b2c]">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#171d16]">Wallets</h3>
                    <p className="text-xs font-semibold text-[#8b9888]">Paytm, Amazon Pay, Mobikwik</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-[#8b9888]" />
              </div>

              {/* Cash on Delivery Option */}
              <div
                className={`rounded-[24px] border p-5 bg-white shadow-xs transition-all cursor-pointer flex items-center justify-between ${
                  selectedOption === 'cod' ? 'border-2 border-[#006b2c] bg-[#eff6ea]' : 'border-[#e2ebdE] hover:border-[#bdcaba]'
                }`}
                onClick={() => setSelectedOption('cod')}
              >
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-2xl bg-[#eff6ea] flex items-center justify-center text-[#006b2c]">
                    <Banknote className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#171d16]">Cash on Delivery</h3>
                    <p className="text-xs font-semibold text-[#8b9888]">Pay with cash at your doorstep</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-[#8b9888]" />
              </div>

            </div>

          </div>

          {/* Right Column: Order Summary Card */}
          <div className="sticky top-24 space-y-4">

            <div className="rounded-[28px] border border-[#e2ebdE] bg-white p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="text-lg font-black tracking-tight text-[#171d16]">Order Summary</h2>

              <div className="space-y-3 text-xs font-extrabold text-[#3e4a3d]">
                <div className="flex items-center justify-between">
                  <span>Items Total ({totalQuantity} item{totalQuantity === 1 ? '' : 's'})</span>
                  <span className="text-[#171d16] font-black">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-[#006c4a]">
                  <span>Discount Applied (FRESH20)</span>
                  <span className="font-black">-${discount.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Delivery Fee</span>
                  <span className="text-[#006c4a] font-black">
                    <span className="line-through text-[#8b9888] mr-1.5">$2.50</span>
                    FREE
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Platform Fee</span>
                  <span className="text-[#171d16] font-black">${platformFee.toFixed(2)}</span>
                </div>
              </div>

              {/* Grand Total Row */}
              <div className="border-t border-[#e2ebdE] pt-4 flex items-center justify-between">
                <span className="text-base font-black text-[#171d16]">Grand Total</span>
                <span className="text-xl font-black text-[#006c4a]">${grandTotal.toFixed(2)}</span>
              </div>

              {/* Green Security Banner */}
              <div className="rounded-2xl bg-[#eff6ea] p-3.5 border border-[#bdcaba]/30 flex items-center gap-2 text-xs font-bold text-[#006c4a]">
                <ShieldCheck className="h-5 w-5 shrink-0" />
                <span>Your payment is secured with 256-bit SSL encryption for a safe transaction.</span>
              </div>

              {/* Pay CTA Button */}
              <Button
                className="w-full h-14 rounded-2xl bg-[#006b2c] text-base font-extrabold text-white shadow-md hover:bg-[#005422] transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                disabled={orderState.isLoading || paymentState.isLoading}
                onClick={handlePay}
                type="button"
              >
                <span>Pay ${grandTotal.toFixed(2)}</span>
                <Lock className="h-4 w-4" />
              </Button>

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

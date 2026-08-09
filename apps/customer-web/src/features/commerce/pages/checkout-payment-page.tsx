import { Suspense, useMemo, useState } from 'react';
import { Building2, ChevronRight, CreditCard, HandCoins, LoaderCircle, Lock, Plus, ShieldCheck, Smartphone, WalletCards } from 'lucide-react';
import { Button } from '@freshmart/design-system';
import { useNavigate } from 'react-router-dom';
import { useCreatePaymentMutation, useGetCheckoutQuery } from '../api/commerce-api.js';
import { CommerceShell } from '../components/commerce-layout.js';
import { CommerceState, ListSkeleton } from '../components/commerce-state.js';

const methods = [
  { key: 'UPI', title: 'UPI', detail: 'Google Pay, PhonePe, Paytm & more', icon: Smartphone, tone: 'bg-[#d8f4ce] text-[#2b4c1d]' },
  { key: 'NET_BANKING', title: 'Net Banking', detail: 'All major banks supported', icon: Building2, tone: 'bg-[#eff6ea] text-[#006b2c]' },
  { key: 'WALLET', title: 'Wallets', detail: 'Paytm, Amazon Pay, Mobikwik', icon: WalletCards, tone: 'bg-[#ffd9de] text-[#a72d51]' },
  { key: 'COD', title: 'Cash on Delivery', detail: 'Pay with cash at your doorstep', icon: HandCoins, tone: 'bg-[#e9f0e5] text-[#3e4a3d]' }
];

const CheckoutPaymentContent = () => {
  const navigate = useNavigate();
  const { data, isError, isLoading, refetch } = useGetCheckoutQuery();
  const [selectedMethod, setSelectedMethod] = useState('CARD');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createPayment, paymentState] = useCreatePaymentMutation();
  const totals = useMemo(() => {
    const subtotal = data?.cart.reduce((sum, item) => sum + item.price * item.quantityInCart, 0) ?? 0;
    const discount = subtotal * 0.2;
    return { subtotal, discount, total: subtotal - discount + 2 };
  }, [data]);

  const pay = async () => {
    setErrorMessage(null);
    try {
      const orderId = `FM-${Date.now()}`;
      await createPayment({ orderId, paymentMethod: selectedMethod }).unwrap();
      navigate('/checkout/confirmation');
    } catch (err: any) {
      console.error('Payment processing error:', err);
      setErrorMessage(err?.data?.detail || err?.message || 'Payment processing failed. Please try again.');
    }
  };

  return (
    <CommerceShell active="account" showBack title="Payment">
      <main className="mx-auto max-w-[1440px] px-4 pb-12 pt-28 md:px-10">
        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
            {errorMessage}
          </div>
        )}
        {isLoading && <ListSkeleton count={2} />}
        {isError && <CommerceState description="We could not load checkout details. Please retry." onAction={() => void refetch()} title="Checkout unavailable" />}
        {!isLoading && !isError && data && (
          <div className="flex flex-col items-start gap-8 md:flex-row">
            <section className="flex w-full flex-col gap-8 md:w-2/3">
              <div><h1 className="mb-2 text-3xl font-bold md:text-4xl">Select Payment Method</h1><p className="text-[#3e4a3d]">Choose your preferred way to pay for a secure and fast checkout.</p></div>
              <section className="commerce-card p-6">
                <div className="mb-5 flex items-center justify-between"><h2 className="flex items-center gap-2 text-xl font-semibold"><CreditCard className="h-5 w-5 text-[#006b2c]" />Saved Cards</h2><button className="commerce-focus flex items-center gap-1 font-semibold text-[#006b2c] hover:underline" type="button"><Plus className="h-4 w-4" />Add New Card</button></div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <SavedCard active brand="Visa" holder="ADITYA SHARMA" number="4242" expires="08/26" onClick={() => setSelectedMethod('CARD')} />
                  <SavedCard brand="Mastercard" holder="ADITYA SHARMA" number="8812" expires="11/24" onClick={() => setSelectedMethod('CARD')} />
                </div>
              </section>
              <section className="space-y-3"><h2 className="px-1 text-xl font-semibold">Other Payment Options</h2>{methods.map((method) => <PaymentMethod active={selectedMethod === method.key} key={method.key} method={method} onSelect={() => setSelectedMethod(method.key)} />)}</section>
            </section>
            <aside className="w-full md:sticky md:top-28 md:w-1/3">
              <div className="commerce-card flex flex-col gap-6 p-6">
                <h2 className="border-b border-[#bdcaba]/30 pb-4 text-xl font-semibold">Order Summary</h2>
                <div className="space-y-4 text-[#3e4a3d]">
                  <Row label={`Items Total (${data.cart.reduce((count, item) => count + item.quantityInCart, 0)} items)`} value={`$${totals.subtotal.toFixed(2)}`} />
                  <Row label="Discount Applied (FRESH20)" value={`- $${totals.discount.toFixed(2)}`} success />
                  <Row label="Delivery Fee" value="FREE" muted="$2.50" />
                  <Row label="Platform Fee" value="$2.00" />
                  <div className="flex items-center justify-between border-t border-[#bdcaba]/40 pt-4"><span className="text-xl font-semibold text-[#171d16]">Grand Total</span><span className="text-xl font-semibold text-[#006b2c]">${totals.total.toFixed(2)}</span></div>
                </div>
                <div className="flex items-center gap-4 rounded-lg bg-[#d8f4ce]/50 p-4"><ShieldCheck className="h-5 w-5 text-[#006b2c]" /><p className="text-xs leading-5 text-[#2b4c1d]">Your payment is secured with 256-bit SSL encryption for a safe transaction.</p></div>
                <Button className="w-full gap-3 rounded-xl py-5 text-lg" disabled={paymentState.isLoading} onClick={() => void pay()} type="button">{paymentState.isLoading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : null}Pay ${totals.total.toFixed(2)}<Lock className="h-5 w-5" /></Button>
              </div>
            </aside>
          </div>
        )}
      </main>
    </CommerceShell>
  );
};

const SavedCard = ({ active = false, brand, expires, holder, number, onClick }: { active?: boolean; brand: string; expires: string; holder: string; number: string; onClick: () => void }) => (
  <button className={`commerce-focus rounded-xl border p-4 text-left transition-all active:scale-[0.98] ${active ? 'border-2 border-[#006b2c] bg-[#d8f4ce]/30' : 'border-[#bdcaba] bg-white hover:border-[#006b2c]/50'}`} onClick={onClick} type="button">
    <div className="mb-6 flex items-start justify-between"><span className="rounded-lg bg-white px-3 py-2 text-sm font-bold shadow-sm">{brand}</span>{active && <span className="text-[#006b2c]">●</span>}</div>
    <div className="mb-6 text-lg font-bold tracking-widest">•••• •••• •••• {number}</div>
    <div className="flex justify-between text-xs uppercase tracking-wide text-[#3e4a3d]"><span>Card Holder<br /><strong className="text-[#171d16]">{holder}</strong></span><span className="text-right">Expires<br /><strong className="text-[#171d16]">{expires}</strong></span></div>
  </button>
);

const PaymentMethod = ({ active, method, onSelect }: { active: boolean; method: (typeof methods)[number]; onSelect: () => void }) => {
  const Icon = method.icon;
  return <button className={`commerce-focus flex w-full items-center justify-between rounded-xl border bg-white p-5 text-left transition-all hover:shadow-sm ${active ? 'border-[#006b2c]' : 'border-[#bdcaba]/40'}`} onClick={onSelect} type="button"><div className="flex items-center gap-4"><div className={`flex h-12 w-12 items-center justify-center rounded-full ${method.tone}`}><Icon className="h-5 w-5" /></div><div><h3 className="text-lg font-semibold">{method.title}</h3><p className="text-xs text-[#3e4a3d]">{method.detail}</p></div></div><ChevronRight className="h-5 w-5 text-[#3e4a3d]" /></button>;
};

const Row = ({ label, muted, success, value }: { label: string; muted?: string; success?: boolean; value: string }) => <div className={`flex items-center justify-between ${success ? 'text-[#3f6d2a]' : ''}`}><span>{label}</span><span className="font-medium">{muted && <span className="mr-1 text-xs text-[#6e7b6c] line-through">{muted}</span>}{value}</span></div>;

export default function CheckoutPaymentPage() {
  return <Suspense fallback={<ListSkeleton count={2} />}><CheckoutPaymentContent /></Suspense>;
}

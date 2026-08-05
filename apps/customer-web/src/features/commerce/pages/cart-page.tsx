import { Suspense, useMemo, useState } from 'react';
import { ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { Button, Input } from '@freshmart/design-system';
import { Link } from 'react-router-dom';
import * as shared from '@freshmart/shared';

const { customerRoutePaths } = shared;
import { useGetCartQuery } from '../api/commerce-api.js';
import { CommerceShell } from '../components/commerce-layout.js';
import { CartItemCard } from '../components/commerce-product-card.js';
import { CommerceState, ListSkeleton } from '../components/commerce-state.js';

const CartContent = () => {
  const { data = [], isError, isLoading, refetch } = useGetCartQuery();
  const [promoCode, setPromoCode] = useState('');
  const subtotal = useMemo(() => data.reduce((sum, item) => sum + item.price * item.quantityInCart, 0), [data]);
  const discount = promoCode.trim().toUpperCase() === 'FRESH20' ? subtotal * 0.2 : 0;
  const taxes = subtotal * 0.079;
  const total = subtotal + taxes + 1 - discount;

  return (
    <CommerceShell active="cart" title="Cart">
      <main className="mx-auto max-w-[1440px] px-4 pb-12 pt-28 md:px-10">
        <div className="mb-6"><h1 className="text-3xl font-bold text-[#171d16] md:text-4xl">Your Cart</h1><p className="mt-1 text-[#3e4a3d]">You have {data.length} items ready for checkout</p></div>
        {isLoading && <ListSkeleton />}
        {isError && <CommerceState description="We could not load your cart. Please retry." icon="cart" onAction={() => void refetch()} title="Cart unavailable" />}
        {!isLoading && !isError && data.length === 0 && <CommerceState actionLabel="Continue Shopping" description="Your cart is empty. Add premium groceries to check out quickly." icon="cart" title="Your cart is empty" />}
        {!isLoading && !isError && data.length > 0 && (
          <div className="flex flex-col gap-6 lg:flex-row">
            <section className="flex-1 space-y-4">{data.map((item) => <CartItemCard item={item} key={item.productId} />)}</section>
            <aside className="w-full lg:w-[400px]">
              <div className="commerce-card sticky top-28 p-6">
                <h2 className="mb-6 text-xl font-semibold">Price Details</h2>
                <div className="mb-6 space-y-3 text-[#3e4a3d]">
                  <Row label={`Item Subtotal (${data.reduce((count, item) => count + item.quantityInCart, 0)} items)`} value={`$${subtotal.toFixed(2)}`} />
                  <Row label="Delivery Fee" value="Free" muted="$2.50" />
                  <Row label="Platform Fee" value="$1.00" />
                  <Row label="Taxes" value={`$${taxes.toFixed(2)}`} />
                  {discount > 0 && <Row label="Promo Discount (FRESH20)" value={`-$${discount.toFixed(2)}`} success />}
                </div>
                <div className="mb-6 border-t border-[#bdcaba]/40 pt-4">
                  <div className="mb-1 flex items-center justify-between"><span className="text-xl font-semibold">Grand Total</span><span className="text-xl font-semibold text-[#006b2c]">${total.toFixed(2)}</span></div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#d8f4ce] px-3 py-1 text-sm font-semibold text-[#3f6d2a]"><Tag className="h-4 w-4" />Estimated Savings: ${(2.5 + discount).toFixed(2)}</span>
                </div>
                <div className="space-y-4">
                  <div className="relative"><Input className="h-12 rounded-xl pr-24" onChange={(event) => setPromoCode(event.target.value)} placeholder="Apply Promo" value={promoCode} /><Button className="absolute bottom-1.5 right-2 top-1.5 rounded-lg px-4" onClick={() => setPromoCode('FRESH20')}>Apply</Button></div>
                  <Link className="commerce-focus inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#006b2c] px-5 py-4 text-base font-semibold text-white shadow-lg shadow-[rgba(26,127,55,0.22)] transition-all hover:bg-[#00873a]" to={`${customerRoutePaths.checkout}?step=payment`}>Proceed to Checkout<ArrowRight className="h-4 w-4" /></Link>
                  <Link className="block text-center font-semibold text-[#006b2c] hover:underline" to={customerRoutePaths.home}>Continue Shopping</Link>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 rounded-xl bg-[#eff6ea] p-4"><ShieldCheck className="h-8 w-8 text-[#006b2c]" /><div><p className="font-semibold">Secure Transactions</p><p className="text-xs text-[#3e4a3d]">Your payment is 100% safe and encrypted.</p></div></div>
            </aside>
          </div>
        )}
      </main>
    </CommerceShell>
  );
};

const Row = ({ label, muted, success, value }: { label: string; muted?: string; success?: boolean; value: string }) => <div className={`flex items-center justify-between ${success ? 'text-[#3f6d2a]' : ''}`}><span>{label}</span><span className="text-[#171d16]">{muted && <span className="mr-1 text-xs text-[#6e7b6c] line-through">{muted}</span>}{value}</span></div>;

export default function CartPage() {
  return <Suspense fallback={<ListSkeleton />}><CartContent /></Suspense>;
}

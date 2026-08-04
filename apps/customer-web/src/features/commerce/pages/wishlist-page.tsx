import { Suspense } from 'react';
import { Clock3, Heart } from 'lucide-react';
import { Button } from '@freshmart/design-system';
import { CommerceShell } from '../components/commerce-layout.js';
import { CommerceProductCard } from '../components/commerce-product-card.js';
import { ProductGridSkeleton } from '../components/commerce-state.js';
import { orderConfirmationProducts, searchProducts } from '../model/commerce-content.js';

const WishlistContent = () => {
  return (
    <CommerceShell active="wishlist" title="Wishlist">
      <main className="mx-auto max-w-screen-2xl px-4 pb-12 pt-28 md:px-10">
        <div className="mb-8">
          <nav className="mb-4 flex items-center gap-2 text-xs font-semibold text-[#3e4a3d]"><span>Home</span><span>/</span><span>Account</span><span>/</span><span className="text-[#171d16]">Wishlist</span></nav>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div><h1 className="text-4xl font-bold text-[#171d16]">Wishlist</h1><p className="mt-1 text-base text-[#3e4a3d]">Saved items are not available in the live FreshMart backend yet.</p></div>
            <Button className="gap-2 rounded-full border border-[#bdcaba] bg-white text-[#6e7b6c] shadow-none" disabled variant="secondary"><Clock3 className="h-4 w-4" />Coming Soon</Button>
          </div>
        </div>
        <section className="commerce-card mb-16 rounded-3xl p-8 md:p-10">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#ffd9de] text-[#a72d51]">
              <Heart aria-hidden="true" className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold text-[#171d16]">Wishlist is coming soon</h2>
            <p className="mt-3 text-base leading-7 text-[#3e4a3d]">
              The current live backend does not expose wishlist APIs. We have disabled saved items here so every visible action in customer web matches production behavior.
            </p>
          </div>
        </section>
        <section className="mt-12">
          <h2 className="mb-6 text-3xl font-bold text-[#171d16]">Recently Viewed</h2>
          <div className="commerce-no-scrollbar flex gap-6 overflow-x-auto pb-4">{orderConfirmationProducts.map((product) => <CommerceProductCard key={product.productId} product={product} variant="compact" />)}</div>
        </section>
        <section className="mt-12">
          <h2 className="mb-6 text-3xl font-bold text-[#171d16]">Recommended for You</h2>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">{searchProducts.map((product) => <CommerceProductCard key={product.productId} product={product} />)}</div>
        </section>
      </main>
    </CommerceShell>
  );
};

export default function WishlistPage() {
  return <Suspense fallback={<ProductGridSkeleton />}><WishlistContent /></Suspense>;
}

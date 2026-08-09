import { Suspense, useState } from 'react';
import { ChevronRight, Heart, Minus, Plus, ShoppingCart, Star, Truck, Undo2, ZoomIn } from 'lucide-react';
import { Button } from '@freshmart/design-system';
import { useNavigate, useParams } from 'react-router-dom';
import * as shared from '@freshmart/shared';

const { customerRoutePaths } = shared;
import { useGetProductDetailsQuery, useUpdateCartItemMutation } from '../api/commerce-api.js';
import { CommerceShell } from '../components/commerce-layout.js';
import { CommerceProductCard } from '../components/commerce-product-card.js';
import { CommerceState, ProductGridSkeleton } from '../components/commerce-state.js';

const ProductDetailsContent = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { data, isError, isLoading, refetch } = useGetProductDetailsQuery(productId);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [addToCart, addState] = useUpdateCartItemMutation();

  if (isLoading) {
    return <CommerceShell active="shop" showBack title="Product"><main className="mx-auto max-w-screen-2xl px-4 pb-12 pt-28 md:px-10"><ProductGridSkeleton count={2} /></main></CommerceShell>;
  }

  if (isError || !data) {
    return <CommerceShell active="shop" showBack title="Product"><main className="mx-auto max-w-screen-2xl px-4 pb-12 pt-28 md:px-10"><CommerceState description="We could not load this product. Please retry." onAction={() => void refetch()} title="Product unavailable" /></main></CommerceShell>;
  }

  const { gallery, product, similar } = data;
  const mainImage = activeImage === 0 ? product.imageUrl : gallery[activeImage] ?? product.imageUrl;

  const handleBuyNow = async () => {
    await addToCart({ productId: product.productId, quantity }).unwrap();
    navigate(customerRoutePaths.checkout);
  };

  const handleAddBundle = async () => {
    await addToCart({ productId: product.productId, quantity: 1 }).unwrap();
    if (similar[0]) await addToCart({ productId: similar[0].productId, quantity: 1 }).unwrap();
    if (similar[1]) await addToCart({ productId: similar[1].productId, quantity: 1 }).unwrap();
  };

  return (
    <CommerceShell active="shop" showBack title={product.name}>
      <main className="mx-auto max-w-screen-2xl px-4 pb-12 pt-28 md:px-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <section className="lg:col-span-7">
            <div className="flex flex-col-reverse gap-4 md:flex-row">
              <div className="commerce-no-scrollbar flex gap-4 overflow-x-auto md:flex-col">{[product.imageUrl, ...gallery].map((url, index) => <button className={`commerce-focus flex h-24 w-24 flex-none overflow-hidden rounded-2xl border ${activeImage === index ? 'border-[#006b2c] ring-2 ring-[#006b2c]/20' : 'border-[#bdcaba]/60'}`} key={url} onClick={() => setActiveImage(index)} type="button"><img alt={`${product.name} thumbnail ${index}`} className="h-full w-full object-cover" src={url} /></button>)}</div>
              <div className="commerce-card relative aspect-square w-full overflow-hidden rounded-3xl p-8 md:p-12">
                <img alt={product.name} className="h-full w-full object-cover" src={mainImage} />
                <button aria-label="Zoom product image" className="commerce-focus absolute bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-[#006b2c] shadow-lg backdrop-blur" type="button"><ZoomIn className="h-5 w-5" /></button>
              </div>
            </div>
          </section>
          <aside className="lg:col-span-5">
            <div className="commerce-card rounded-3xl p-6 md:p-8">
              <h1 className="mb-1 text-3xl font-bold text-[#171d16] md:text-4xl">{product.name}</h1>
              <p className="mb-6 text-base text-[#3e4a3d]">By <span className="font-bold text-[#006b2c]">{product.brand}</span></p>
              <div className="mb-8 flex flex-wrap items-center gap-4"><span className="flex items-center gap-1 rounded-lg bg-[#eff6ea] px-2 py-1 font-semibold"><Star className="h-5 w-5 fill-[#facc15] text-[#facc15]" />{product.rating}</span><span className="text-sm font-semibold text-[#3e4a3d]">{product.reviewCount} Reviews</span><span className="h-4 w-px bg-[#bdcaba]" /><span className="font-semibold text-[#006b2c]">{product.stockLabel}</span></div>
              <div className="mb-8"><div className="flex items-baseline gap-4"><span className="text-5xl font-bold text-[#171d16]">${product.price.toFixed(2)}</span>{product.originalPrice && <span className="text-xl text-[#6e7b6c] line-through">${product.originalPrice.toFixed(2)}</span>}</div><p className="mt-1 text-xs text-[#3e4a3d]">Price per {product.quantity} ($2.12/100g)</p></div>
              <div className="mb-8 space-y-4">
                <div className="flex gap-4">
                  <div className="flex items-center rounded-2xl border border-[#bdcaba] bg-[#eff6ea] p-1"><button aria-label="Decrease quantity" className="commerce-focus flex h-10 w-10 items-center justify-center rounded-xl hover:bg-white" onClick={() => setQuantity(Math.max(1, quantity - 1))} type="button"><Minus /></button><span className="w-12 text-center text-xl font-bold">{quantity}</span><button aria-label="Increase quantity" className="commerce-focus flex h-10 w-10 items-center justify-center rounded-xl hover:bg-white" onClick={() => setQuantity(quantity + 1)} type="button"><Plus /></button></div>
                  <Button className="flex-1 gap-2 rounded-2xl py-4 text-lg" disabled={addState.isLoading} onClick={() => void addToCart({ productId: product.productId, quantity })}><ShoppingCart className="h-5 w-5" />Add to Cart</Button>
                  <button aria-disabled="true" aria-label="Wishlist coming soon" className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[#bdcaba] text-[#9aa59a]" disabled title="Wishlist is coming soon" type="button"><Heart className="h-5 w-5" /></button>
                </div>
                <Button className="w-full rounded-2xl bg-[#171d16] py-4 text-lg hover:bg-[#171d16]/90" disabled={addState.isLoading} onClick={() => void handleBuyNow()}>Buy Now</Button>
              </div>
              <div className="space-y-4 border-t border-[#bdcaba] pt-6"><Info icon={<Truck />} title="Express Delivery" text={product.deliveryTime ?? 'Arriving today by 6:00 PM'} /><Info icon={<Undo2 />} title="Freshness Guaranteed" text="Free return if not satisfied at delivery" /></div>
            </div>
          </aside>
        </div>
        <section className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="mb-8 flex gap-8 overflow-x-auto border-b border-[#bdcaba]"><button className="border-b-2 border-[#006b2c] pb-4 font-bold text-[#006b2c]" type="button">Description</button><button className="pb-4 text-[#3e4a3d]" type="button">Specifications</button><button className="pb-4 text-[#3e4a3d]" type="button">Nutritional Info</button><button className="pb-4 text-[#3e4a3d]" type="button">Reviews ({product.reviewCount})</button></div>
            <h2 className="mb-4 text-xl font-semibold">Sun-Ripened Heritage Berries</h2>
            <p className="mb-6 text-lg leading-8 text-[#3e4a3d]">Grown in the nutrient-rich volcanic soil of our partner organic farms, these Heritage Strawberries are allowed to ripen fully on the vine, ensuring an unmatched sweetness and deep aromatic profile.</p>
            <div className="commerce-card flex flex-col items-center gap-6 rounded-3xl p-6 md:flex-row"><div className="flex items-center gap-2"><img alt="Organic cream" className="h-24 w-24 rounded-2xl border border-[#bdcaba] object-cover" src={gallery[1]} /><Plus className="text-[#3e4a3d]" /><img alt="Dark chocolate" className="h-24 w-24 rounded-2xl border border-[#bdcaba] object-cover" src={gallery[2]} /></div><div className="text-center md:ml-auto md:text-right"><p className="text-sm text-[#3e4a3d]">Total bundle price</p><div className="text-3xl font-bold">$16.20 <span className="text-base text-[#6e7b6c] line-through">$19.50</span></div><Button className="mt-4 rounded-2xl" disabled={addState.isLoading} onClick={() => void handleAddBundle()}>Add 3 items to Cart</Button></div></div>
          </div>
          <aside className="lg:col-span-4"><div className="sticky top-28 rounded-3xl bg-[#e9f0e5] p-6"><h2 className="mb-6 text-sm font-bold uppercase text-[#3e4a3d]">Nutritional Summary (per 100g)</h2>{[['Calories', '33 kcal'], ['Vitamin C', '97% DV'], ['Total Sugars', '4.9g'], ['Fiber', '2.0g']].map(([label, value]) => <div className="flex justify-between border-b border-[#bdcaba]/40 py-3 last:border-0" key={label}><span>{label}</span><strong className={label === 'Vitamin C' ? 'text-[#006b2c]' : ''}>{value}</strong></div>)}</div></aside>
        </section>
        <section className="mt-16"><div className="mb-6"><h2 className="text-3xl font-bold">Similar premium fruits</h2><p className="text-[#3e4a3d]">Picked fresh from our organic network</p></div><div className="commerce-no-scrollbar flex gap-6 overflow-x-auto pb-4">{similar.map((item) => <div className="w-[280px] flex-none" key={item.productId}><CommerceProductCard product={item} /></div>)}</div></section>
      </main>
    </CommerceShell>
  );
};

const Info = ({ icon, text, title }: { icon: React.ReactNode; text: string; title: string }) => <div className="flex items-center gap-4"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d8f4ce] text-[#2b4c1d]">{icon}</div><div><p className="font-semibold">{title}</p><p className="text-xs text-[#3e4a3d]">{text}</p></div></div>;

export default function ProductDetailsPage() {
  return <Suspense fallback={<ProductGridSkeleton count={2} />}><ProductDetailsContent /></Suspense>;
}

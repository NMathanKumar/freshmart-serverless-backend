import { Suspense } from 'react';
import { ChevronRight, Grid2X2, List, SlidersHorizontal, Star } from 'lucide-react';
import { Button } from '@freshmart/design-system';
import { useGetCategoryListingQuery } from '../api/commerce-api.js';
import { CommerceShell } from '../components/commerce-layout.js';
import { CommerceProductCard } from '../components/commerce-product-card.js';
import { CommerceState, ProductGridSkeleton } from '../components/commerce-state.js';

const brands = ['Organic Valley', "Earth's Best", 'Green Farm'];

const CategoryListingContent = () => {
  const { data = [], isError, isLoading, refetch } = useGetCategoryListingQuery();

  return (
    <CommerceShell active="shop" title="Fruits & Vegetables">
      <main className="mx-auto max-w-screen-2xl px-4 pb-12 pt-28 md:px-10">
        <section className="group relative mb-8 h-[300px] overflow-hidden rounded-xl">
          <div className="absolute inset-0 z-10 bg-black/30 transition-colors duration-700 group-hover:bg-black/20" />
          <img alt="Fresh organic fruits and vegetables" className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbgVSd1ERMwsV1j2yax36VO1YrMtRGTvG2Nu2N9a0KcHgavDAKz9Xiq2AgA3nxWKVDaCqvcV88QMvZr6zbxlcgI0FDTDMZ8ioic5mdTB2q0lKT-bkeirxsbh2MQqfx9h2anjaOsiOHLchPV1RPU7z8FsQCaFdkY8DRx3dwyaQFNrsYHUWmEaZ3KaSHHOuWAhhaLiyemxWLEEuXgX6MQ6etwrRTNFL4Ma0eP5152I0H09XL7y7os8BtSLBzFL598cK6CxsDGSldTydd" />
          <div className="absolute bottom-0 left-0 z-20 p-6 md:p-10">
            <nav className="mb-2 flex items-center gap-2 text-xs font-medium text-white/80">
              <span>Home</span><ChevronRight className="h-4 w-4" /><span>Categories</span><ChevronRight className="h-4 w-4" /><span className="font-bold text-white">Fruits & Vegetables</span>
            </nav>
            <h1 className="mb-2 text-4xl font-bold leading-[1.1] text-white md:text-5xl">Fruits & Vegetables</h1>
            <p className="text-base text-white/90">142 Products available - Fresh from the farm today</p>
          </div>
        </section>
        <div className="flex gap-6">
          <aside className="hidden w-72 flex-shrink-0 md:block">
            <div className="commerce-card sticky top-28 space-y-8 p-5">
              <h2 className="text-xl font-semibold">Filters</h2>
              <div><span className="mb-4 block text-sm font-semibold uppercase tracking-wide text-[#3e4a3d]">Brands</span><div className="space-y-3">{brands.map((brand, index) => <label className="flex cursor-pointer items-center gap-3 text-base hover:text-[#006b2c]" key={brand}><input className="h-5 w-5 accent-[#006b2c]" defaultChecked={index === 1} type="checkbox" />{brand}</label>)}</div></div>
              <div><span className="mb-4 block text-sm font-semibold uppercase tracking-wide text-[#3e4a3d]">Price Range</span><input aria-label="Price range" className="w-full accent-[#006b2c]" type="range" /><div className="mt-2 flex justify-between text-xs text-[#3e4a3d]"><span>$0</span><span>$50</span></div></div>
              <div><span className="mb-4 block text-sm font-semibold uppercase tracking-wide text-[#3e4a3d]">Minimum Rating</span><div className="flex gap-2">{[1, 2, 3, 4].map((rating) => <button className={`commerce-focus h-10 w-10 rounded-lg border ${rating === 3 ? 'border-[#006b2c] bg-[#d8f4ce] text-[#006b2c]' : 'border-[#bdcaba] hover:border-[#006b2c]'}`} key={rating} type="button">{rating}+</button>)}</div></div>
              <div className="space-y-4"><Toggle label="Instock Only" checked /><Toggle label="On Sale" /></div>
              <Button className="w-full rounded-xl py-3">Apply Filters</Button>
            </div>
          </aside>
          <section className="min-w-0 flex-1">
            <div className="commerce-card mb-8 flex flex-col justify-between gap-4 p-4 md:flex-row md:items-center">
              <span className="text-base text-[#3e4a3d]">Showing 1-12 of 142 results</span>
              <div className="flex flex-wrap items-center gap-4">
                <button className="commerce-focus flex items-center gap-2 rounded-full border border-[#bdcaba] px-4 py-2 text-sm font-semibold md:hidden" type="button"><SlidersHorizontal className="h-4 w-4" />Filters</button>
                <label className="flex items-center gap-2 text-sm text-[#3e4a3d]">Sort by:<select className="rounded-lg border-0 bg-transparent font-bold text-[#171d16]"><option>Most Popular</option><option>Price: Low to High</option><option>Newest Arrivals</option></select></label>
                <div className="flex gap-2"><button aria-label="Grid view" className="rounded-lg bg-[#d8f4ce] p-2 text-[#006b2c]" type="button"><Grid2X2 className="h-5 w-5" /></button><button aria-label="List view" className="rounded-lg p-2 text-[#3e4a3d] hover:bg-[#eff6ea]" type="button"><List className="h-5 w-5" /></button></div>
              </div>
            </div>
            {isLoading && <ProductGridSkeleton count={6} />}
            {isError && <CommerceState description="We could not load this category. Please retry." onAction={() => void refetch()} title="Category unavailable" />}
            {!isLoading && !isError && data.length === 0 && <CommerceState description="There are no products in this category yet." icon="empty" title="No products found" />}
            {!isLoading && !isError && data.length > 0 && <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{data.map((product) => <CommerceProductCard key={product.productId} product={product} variant="category" />)}<div className="commerce-card hidden flex-col gap-4 p-4 opacity-60 md:flex"><div className="aspect-square rounded-lg commerce-skeleton" /><div className="h-4 w-3/4 rounded commerce-skeleton" /><div className="h-6 w-1/2 rounded commerce-skeleton" /><div className="mt-auto flex justify-between"><div className="h-8 w-20 rounded commerce-skeleton" /><div className="h-10 w-24 rounded-xl commerce-skeleton" /></div></div></div>}
            <div className="flex flex-col items-center justify-center py-10"><div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#006b2c]/20 border-t-[#006b2c]" /><span className="text-sm font-semibold text-[#3e4a3d]">Loading more fresh picks...</span></div>
          </section>
        </div>
      </main>
    </CommerceShell>
  );
};

const Toggle = ({ checked = false, label }: { checked?: boolean; label: string }) => (
  <div className="flex items-center justify-between">
    <span>{label}</span>
    <button aria-pressed={checked} className={`relative h-6 w-10 rounded-full ${checked ? 'bg-[#006b2c]' : 'bg-[#bdcaba]'}`} type="button"><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${checked ? 'right-1' : 'left-1'}`} /></button>
  </div>
);

export default function CategoryListingPage() {
  return <Suspense fallback={<ProductGridSkeleton count={6} />}><CategoryListingContent /></Suspense>;
}

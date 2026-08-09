import { Sparkles } from 'lucide-react';
import { formatCurrency } from '@freshmart/shared';
import type { ProductViewModel } from '../model/home-content.js';
import { SectionEmpty, SectionError, SectionSkeleton } from './section-state.js';

const RecommendationCard = ({ product }: { product: ProductViewModel }) => (
  <button className="group flex min-w-0 items-center gap-4 rounded-[22px] bg-white p-4 text-left border border-[#b8e5cd]/40 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006b2c]" type="button">
    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#f4fcf0] p-1 border border-[#e2ebdE]">
      <img alt={product.name} className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-108" decoding="async" loading="lazy" src={product.imageUrl} onError={(e) => { e.currentTarget.src = 'https://lh3.googleusercontent.com/aida-public/b01cfbf2eb5d4e1fa429ed3ee7964b91/product-placeholder.png'; }} />
    </div>
    <span className="space-y-1 overflow-hidden"><span className="block text-[9px] font-black uppercase tracking-widest text-[#a72d51]">{product.badge}</span><strong className="block text-sm font-extrabold text-[#171d16] leading-tight truncate group-hover:text-[#006b2c] transition-colors">{product.name}</strong><span className="block text-base font-black text-[#006c4a]">{formatCurrency(product.price)} <small className="font-bold text-[#8b9888] ml-1 text-xs">{product.note}</small></span></span>
  </button>
);

export const Recommendations = ({ products, loading, error, retry }: { products?: ProductViewModel[]; loading: boolean; error: boolean; retry: () => void }) => (
  <section className="space-y-6 rounded-[30px] bg-gradient-to-br from-[#e3f5ea] to-[#d4efe0] p-8 border border-[#b8e5cd]/50 shadow-xs" aria-labelledby="recommendations-heading">
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#006b2c] text-white shadow-sm"><Sparkles aria-hidden="true" className="h-5 w-5" /></span><span><h2 className="text-xl font-black text-[#005320] leading-tight mb-0.5 tracking-tight" id="recommendations-heading">Picked for You</h2><p className="text-xs font-bold text-[#005320]/80">Based on your recent organic purchases</p></span></div>
      <button className="text-xs font-extrabold text-[#006b2c] hover:underline" type="button">Shop personalized deals</button>
    </div>
    {loading ? <SectionSkeleton cards={3} className="grid grid-cols-3 gap-4" /> : error ? <SectionError retry={retry} /> : !products?.length ? <SectionEmpty message="Personalized picks will appear after you start shopping." /> : <div className="grid grid-cols-3 gap-4">{products.map((product) => <RecommendationCard key={product.productId} product={product} />)}</div>}
  </section>
);

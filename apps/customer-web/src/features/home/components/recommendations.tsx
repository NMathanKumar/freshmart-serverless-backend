import { Sparkles } from 'lucide-react';
import type { ProductViewModel } from '../model/home-content.js';
import { SectionEmpty, SectionError, SectionSkeleton } from './section-state.js';

const RecommendationCard = ({ product }: { product: ProductViewModel }) => (
  <button className="group flex items-center gap-6 rounded-2xl bg-white p-6 text-left shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006b2c]" type="button">
    <img alt={product.name} className="h-24 w-24 shrink-0 rounded-xl object-cover transition-transform group-hover:scale-105" decoding="async" loading="lazy" src={product.imageUrl} />
    <span className="space-y-1"><span className="block text-xs font-bold text-[#a72d51]">{product.badge}</span><strong className="block text-sm">{product.name}</strong><span className="block font-bold text-[#006b2c]">${(product.price ?? 0).toFixed(2)} <small className="font-normal text-[#6e7b6c]">{product.note}</small></span></span>
  </button>
);

export const Recommendations = ({ products, loading, error, retry }: { products?: ProductViewModel[]; loading: boolean; error: boolean; retry: () => void }) => (
  <section className="space-y-6 rounded-[24px] border border-[#00873a]/20 bg-[#00873a]/10 p-6 md:p-8" aria-labelledby="recommendations-heading">
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div className="flex items-center gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#006b2c] text-white"><Sparkles aria-hidden="true" className="h-5 w-5" /></span><span><h2 className="text-xl font-semibold text-[#005320]" id="recommendations-heading">Picked for You</h2><p className="text-base text-[#005320]/70">Based on your recent organic purchases</p></span></div>
      <button className="self-start border-b-2 border-[#006b2c]/20 pb-1 text-sm font-semibold text-[#006b2c] hover:border-[#006b2c] md:self-auto" type="button">Shop personalized deals</button>
    </div>
    {loading ? <SectionSkeleton cards={3} className="grid grid-cols-1 gap-6 md:grid-cols-3" /> : error ? <SectionError retry={retry} /> : !products?.length ? <SectionEmpty message="Personalized picks will appear after you start shopping." /> : <div className="grid grid-cols-1 gap-6 md:grid-cols-3">{products.map((product) => <RecommendationCard key={product.productId} product={product} />)}</div>}
  </section>
);

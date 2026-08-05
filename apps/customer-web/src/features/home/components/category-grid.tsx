import type { LucideIcon } from 'lucide-react';
import { Beef, CakeSlice, Cookie, CupSoda, IceCreamBowl, PawPrint, Salad, ShoppingBasket, Sparkles } from 'lucide-react';
import type { CategoryViewModel } from '../model/home-content.js';
import { SectionEmpty, SectionError, SectionSkeleton } from './section-state.js';

const icons: LucideIcon[] = [CupSoda, IceCreamBowl, Cookie, CakeSlice, Sparkles, PawPrint, Beef, Salad];

const CategoryCard = ({ category, index }: { category: CategoryViewModel; index: number }) => {
  if (index === 0) {
    return (
      <button className="group relative col-span-2 flex min-h-36 flex-col justify-between overflow-hidden rounded-[26px] bg-gradient-to-br from-[#d8f3e5] to-[#c5edd8] p-5 text-left border border-[#b8e5cd]/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006b2c] row-span-2" type="button">
        <span className="relative z-10"><strong className="block text-xl font-extrabold text-[#006c4a] mb-0.5 tracking-tight">{category.name}</strong><span className="text-xs font-bold text-[#00714e]">{category.subtitle || 'Daily Fresh Arrivals'}</span></span>
        {category.imageUrl ? <img alt="Basket filled with fresh fruit" className="absolute -bottom-1 -right-2 h-36 w-36 object-contain transition-transform duration-500 group-hover:scale-108" decoding="async" loading="lazy" src={category.imageUrl} /> : <ShoppingBasket aria-hidden="true" className="absolute bottom-6 right-6 h-20 w-20 text-[#006b2c]/30" />}
      </button>
    );
  }
  const Icon = icons[(index - 1) % icons.length] ?? Salad;
  return (
    <button className="group flex h-26 flex-col items-center justify-center gap-2.5 rounded-2xl bg-[#f8fbf5] p-3 text-center border border-[#e2ebdE]/60 transition-all duration-300 hover:-translate-y-1 hover:bg-[#eff5eb] hover:shadow-md hover:border-[#bdcaba]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006b2c]" type="button">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-xs border border-[#bdcaba]/30 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-sm">
        <Icon aria-hidden="true" className="h-5 w-5 text-[#006b2c]" />
      </span>
      <span className="text-xs font-extrabold text-[#171d16] leading-tight px-1 group-hover:text-[#006b2c] transition-colors">{category.name}</span>
    </button>
  );
};

export const CategoryGrid = ({ categories, loading, error, retry }: { categories?: CategoryViewModel[]; loading: boolean; error: boolean; retry: () => void }) => {
  if (loading) return <SectionSkeleton cards={9} className="grid grid-cols-6 gap-4" />;
  if (error) return <SectionError retry={retry} />;
  if (!categories?.length) return <SectionEmpty message="Categories will appear here when available." />;
  return <div className="grid grid-cols-6 gap-4">{categories.map((category, index) => <CategoryCard category={category} index={index} key={category.categoryId} />)}</div>;
};

import type { LucideIcon } from 'lucide-react';
import { Beef, CakeSlice, Cookie, CupSoda, IceCreamBowl, PawPrint, Salad, ShoppingBasket, Sparkles } from 'lucide-react';
import type { CategoryViewModel } from '../model/home-content.js';
import { SectionEmpty, SectionError, SectionSkeleton } from './section-state.js';

const icons: LucideIcon[] = [CupSoda, IceCreamBowl, Cookie, CakeSlice, Sparkles, PawPrint, Beef, Salad];

const CategoryCard = ({ category, index }: { category: CategoryViewModel; index: number }) => {
  if (index === 0) {
    return (
      <button className="group relative col-span-2 flex min-h-48 flex-col justify-between overflow-hidden rounded-xl bg-[#82f5c1]/20 p-6 text-left transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006b2c] md:row-span-2" type="button">
        <span className="relative z-10"><strong className="block text-xl text-[#006c4a]">{category.name}</strong><span className="text-xs font-medium text-[#00714e]">{category.subtitle}</span></span>
        {category.imageUrl ? <img alt="Basket filled with fresh fruit" className="absolute -bottom-4 -right-4 h-40 w-40 object-contain transition-transform group-hover:scale-110" decoding="async" loading="lazy" src={category.imageUrl} /> : <ShoppingBasket aria-hidden="true" className="absolute bottom-6 right-6 h-20 w-20 text-[#006b2c]/30" />}
      </button>
    );
  }
  const Icon = icons[(index - 1) % icons.length] ?? Salad;
  return <button className="group flex min-h-24 flex-col items-center justify-center gap-3 rounded-xl bg-[#eff6ea] p-4 text-center transition-colors hover:bg-[#e3eadf] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006b2c]" type="button"><span className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm transition-transform group-hover:scale-110"><Icon aria-hidden="true" className="h-7 w-7 text-[#006b2c]" /></span><span className="text-sm font-semibold text-[#3e4a3d]">{category.name}</span></button>;
};

export const CategoryGrid = ({ categories, loading, error, retry }: { categories?: CategoryViewModel[]; loading: boolean; error: boolean; retry: () => void }) => {
  if (loading) return <SectionSkeleton cards={9} className="grid grid-cols-2 gap-4 md:grid-cols-6" />;
  if (error) return <SectionError retry={retry} />;
  if (!categories?.length) return <SectionEmpty message="Categories will appear here when available." />;
  return <div className="grid grid-cols-2 gap-4 md:grid-cols-6">{categories.map((category, index) => <CategoryCard category={category} index={index} key={category.categoryId} />)}</div>;
};

import type { LucideIcon } from 'lucide-react';
import {
  Beef,
  CakeSlice,
  Cookie,
  CupSoda,
  IceCreamBowl,
  PawPrint,
  Salad,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CategoryViewModel } from '../model/home-content.js';
import {
  SectionEmpty,
  SectionError,
  SectionSkeleton,
} from './section-state.js';

const icons: LucideIcon[] = [
  Salad,
  CupSoda,
  IceCreamBowl,
  Cookie,
  CakeSlice,
  Sparkles,
  PawPrint,
  Beef,
];

const CategoryCard = ({
  category,
  index,
  isSelected,
  onSelect,
}: {
  category: CategoryViewModel;
  index: number;
  isSelected?: boolean;
  onSelect?: (categoryId: string) => void;
}) => {
  const Icon = icons[index % icons.length] ?? Salad;
  const categorySlug =
    (category as any).slug ||
    category.name.toLowerCase().replaceAll(' ', '-').replaceAll('&', 'and');

  return (
    <div className="relative group">
      <button
        className={`group flex w-full h-24 flex-col items-center justify-center gap-1.5 rounded-2xl border p-2.5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#006b2c] focus-visible:outline-none ${
          isSelected
            ? 'border-[#006b2c] bg-[#d8f4ce] shadow-md ring-2 ring-[#006b2c]/30'
            : 'border-[#e2ebdE]/80 bg-white hover:border-[#006b2c]/40 hover:bg-[#f4fcf0]'
        }`}
        onClick={() => onSelect?.(category.categoryId)}
        type="button"
      >
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-full border shadow-xs transition-transform duration-300 group-hover:scale-110 ${
            isSelected
              ? 'border-[#006b2c] bg-[#006b2c] text-white'
              : 'border-[#bdcaba]/30 bg-[#eff6ea] text-[#006b2c]'
          }`}
        >
          <Icon
            aria-hidden="true"
            className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-[#006b2c]'}`}
          />
        </span>
        <span
          className={`px-1 text-xs leading-tight font-extrabold transition-colors ${
            isSelected ? 'text-[#005422]' : 'text-[#171d16] group-hover:text-[#006b2c]'
          }`}
        >
          {category.name}
        </span>
      </button>
      <Link
        aria-label={`View ${category.name} page`}
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[10px] font-extrabold text-[#006b2c] bg-white rounded-full border border-[#bdcaba]/40 shadow-xs hover:bg-[#d8f4ce]"
        title={`Explore ${category.name}`}
        to={`/categories?category=${encodeURIComponent(categorySlug)}`}
      >
        ➔
      </Link>
    </div>
  );
};

export const CategoryGrid = ({
  categories,
  loading,
  error,
  retry,
  selectedCategoryId,
  onSelectCategory,
}: {
  categories?: CategoryViewModel[];
  loading: boolean;
  error: boolean;
  retry: () => void;
  selectedCategoryId?: string | null;
  onSelectCategory?: (categoryId: string | null) => void;
}) => {
  if (loading)
    return <SectionSkeleton cards={6} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4" />;
  if (error) return <SectionError retry={retry} />;
  if (!categories?.length)
    return (
      <SectionEmpty message="Categories will appear here when available." />
    );

  const handleSelect = (id: string) => {
    if (selectedCategoryId === id) {
      onSelectCategory?.(null);
    } else {
      onSelectCategory?.(id);
    }
  };

  return (
    <div className="flex items-center gap-3.5 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x">
      {categories.map((category, index) => (
        <div className="shrink-0 snap-start min-w-[130px] sm:min-w-[145px] flex-1" key={category.categoryId}>
          <CategoryCard
            category={category}
            index={index}
            isSelected={selectedCategoryId === category.categoryId}
            onSelect={handleSelect}
          />
        </div>
      ))}
    </div>
  );
};

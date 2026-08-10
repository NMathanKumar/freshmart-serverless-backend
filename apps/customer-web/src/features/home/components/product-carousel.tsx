import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProductViewModel } from '../model/home-content.js';
import { ProductCard } from './product-card.js';
import {
  SectionEmpty,
  SectionError,
  SectionSkeleton,
} from './section-state.js';

export const ProductCarousel = ({
  products,
  loading,
  error,
  retry,
}: {
  products?: ProductViewModel[];
  loading: boolean;
  error: boolean;
  retry: () => void;
}) => {
  const scroller = useRef<HTMLDivElement>(null);
  const scroll = (direction: -1 | 1) =>
    scroller.current?.scrollBy({ left: direction * 280, behavior: 'smooth' });

  if (loading) return <SectionSkeleton />;
  if (error) return <SectionError retry={retry} />;
  if (!products?.length)
    return <SectionEmpty message="Trending products will appear here soon." />;

  return (
    <>
      <div className="absolute top-0 right-0 flex gap-3">
        <button
          aria-label="Previous products"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#bdcaba] hover:bg-white focus-visible:ring-2 focus-visible:ring-[#006b2c] focus-visible:outline-none"
          onClick={() => scroll(-1)}
          type="button"
        >
          <ChevronLeft aria-hidden="true" className="h-5 w-5" />
        </button>
        <button
          aria-label="Next products"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#bdcaba] hover:bg-white focus-visible:ring-2 focus-visible:ring-[#006b2c] focus-visible:outline-none"
          onClick={() => scroll(1)}
          type="button"
        >
          <ChevronRight aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>
      <div
        aria-label="Trending products"
        className="home-no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto pt-1 pb-2"
        ref={scroller}
        tabIndex={0}
      >
        {products.map((product) => (
          <div className="snap-start" key={product.productId}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </>
  );
};

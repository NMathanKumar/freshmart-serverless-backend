import { Suspense } from 'react';
import { SlidersHorizontal, SortAsc, LayoutGrid, List } from 'lucide-react';
import { Button } from '@freshmart/design-system';
import { useSearchParams } from 'react-router-dom';
import { useSearchProductsQuery } from '../api/commerce-api.js';
import { CommerceProductCard } from '../components/commerce-product-card.js';
import { CommerceSearchBar, CommerceShell } from '../components/commerce-layout.js';
import { CommerceState, ProductGridSkeleton } from '../components/commerce-state.js';

const chips = ['All Results', 'Hass Avocados', 'Avocado Oil', 'Organic Dips', 'Ready to Eat', 'Bulk Packs'];

const SearchResultsContent = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || 'Organic Avocados';
  const { data = [], isError, isLoading, refetch } = useSearchProductsQuery({ query });

  return (
    <CommerceShell active="search" title="Search">
      <main className="mx-auto max-w-screen-2xl px-4 pb-12 pt-28 md:px-10">
        <div className="mb-8 md:hidden"><CommerceSearchBar defaultValue={query} /></div>
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <h1 className="mb-1 text-2xl font-bold leading-8 text-[#171d16] md:text-4xl md:leading-10">Results for "{query}"</h1>
            <p className="text-base text-[#3e4a3d]">Showing {data.length} {data.length === 1 ? 'item' : 'items'}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button className="gap-2 rounded-full border border-[#bdcaba] bg-white text-[#171d16] shadow-none hover:bg-[#eff6ea]" variant="secondary"><SlidersHorizontal className="h-4 w-4" />Filters</Button>
            <Button className="gap-2 rounded-full border border-[#bdcaba] bg-white text-[#171d16] shadow-none hover:bg-[#eff6ea]" variant="secondary"><SortAsc className="h-4 w-4" />Relevance</Button>
            <div className="hidden h-8 w-px bg-[#bdcaba] md:block" />
            <div className="flex rounded-lg border border-[#bdcaba] bg-[#eff6ea] p-1">
              <button aria-label="Grid view" className="commerce-focus rounded bg-white p-1 text-[#006b2c] shadow-sm" type="button"><LayoutGrid className="h-5 w-5" /></button>
              <button aria-label="List view" className="commerce-focus rounded p-1 text-[#3e4a3d] hover:text-[#006b2c]" type="button"><List className="h-5 w-5" /></button>
            </div>
          </div>
        </div>
        <div className="commerce-no-scrollbar mb-8 flex gap-2 overflow-x-auto pb-3">
          {chips.map((chip, index) => <button className={`commerce-focus whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold ${index === 0 ? 'bg-[#006b2c] text-white shadow-sm' : 'border border-[#bdcaba] bg-white text-[#171d16] hover:border-[#006b2c]'}`} key={chip} type="button">{chip}</button>)}
        </div>
        {isLoading && <ProductGridSkeleton />}
        {isError && <CommerceState description="We could not load search results. Check your connection and try again." onAction={() => void refetch()} title="Search is unavailable" />}
        {!isLoading && !isError && data.length === 0 && <CommerceState actionLabel="Clear All Filters" description="We could not find anything matching your search. Try adjusting filters or searching for something else." icon="empty" title="No results found" />}
        {!isLoading && !isError && data.length > 0 && <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">{data.map((product) => <CommerceProductCard key={product.productId} product={product} />)}</div>}
      </main>
    </CommerceShell>
  );
};

export default function SearchResultsPage() {
  return <Suspense fallback={<ProductGridSkeleton />}><SearchResultsContent /></Suspense>;
}

import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ChevronRight,
  Grid2X2,
  List,
  SlidersHorizontal,
  LoaderCircle,
} from 'lucide-react';
import { Button } from '@freshmart/design-system';
import { useGetCategoryListingQuery } from '../api/commerce-api.js';
import { CommerceProductCard } from '../components/commerce-product-card.js';
import { HomeHeader } from '../../home/components/home-header.js';
import { HomeFooter } from '../../home/components/home-footer.js';

const BRANDS = ['Organic Valley', "Earth's Best", 'Green Farm'];

interface CategoryConfig {
  title: string;
  count: string;
  bannerUrl: string;
}

const CATEGORY_MAP: Record<string, CategoryConfig> = {
  'fruits-vegetables': {
    title: 'Fruits & Vegetables',
    count: '142 Products available - Fresh from the farm today',
    bannerUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDbgVSd1ERMwsV1j2yax36VO1YrMtRGTvG2Nu2N9a0KcHgavDAKz9Xiq2AgA3nxWKVDaCqvcV88QMvZr6zbxlcgI0FDTDMZ8ioic5mdTB2q0lKT-bkeirxsbh2MQqfx9h2anjaOsiOHLchPV1RPU7z8FsQCaFdkY8DRx3dwyaQFNrsYHUWmEaZ3KaSHHOuWAhhaLiyemxWLEEuXgX6MQ6etwrRTNFL4Ma0eP5152I0H09XL7y7os8BtSLBzFL598cK6CxsDGSldTydd',
  },
  'dairy-bakery': {
    title: 'Dairy & Bakery',
    count: '98 Products available - Fresh morning deliveries',
    bannerUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCS7LVpLJngaGd7gTrSTWDZ7mAjIhrISgGvIP1hisPESqJ-ZvAKYkmKu4OpKN46OCU3R0r766MYsZ-e5Fr6ArR9mKlUoSuDTYCuJNf3kX2Yaq9G9YVC0zh3PM0nJSkIIi1Fqgpvc8usxZSsPAa58xRrX3TnAvrCTQrl1BmMOKTwUOIgZxuhiucnglxOl3YgHZFrwJkGIBq16p4BLyHNkt0MorViaknGI4gSzxLJlDtwxlexc4oCN-IH2WlPHxd6tytEJW_m7VkpvTXm',
  },
  'organic-produce': {
    title: 'Organic Produce',
    count: '110 Products available - 100% Certified Organic',
    bannerUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAWsw8JAA3GnMTnwbl9czzfzrPkpAcnemPmyCZESxlbqP0WdJvK0URWh5kEYhaHbFzbFTYHpgo9OtyCvfPPeUimMIzw7mFeTb-TH3UKFxHB738M5MXiQ8f1H58fJF-_K8bwW2s91sC-Qkr6BmXVvBOEKCo9s3VhE-AIyAUxnrNShtKvtmguCzYIbw3DvNtKrn_PyIpuY3vB4VExuNkw7YYanmGMwDulU1Fuc6zhaoedT3AUBCXryZfRdegDZ4C_lsKRLEMx3fhmdVyn',
  },
};

export function CategoryListingContent() {
  const [searchParams] = useSearchParams();
  const categoryKey = searchParams.get('category') || 'fruits-vegetables';

  const categoryConfig = CATEGORY_MAP[categoryKey] || {
    title: categoryKey
      .replaceAll('-', ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    count: '142 Products available - Fresh from the farm today',
    bannerUrl: CATEGORY_MAP['fruits-vegetables'].bannerUrl,
  };

  const { data = [] } = useGetCategoryListingQuery();
  const [minRating, setMinRating] = useState(3);
  const [inStockOnly, setInStockOnly] = useState(true);
  const [onSale, setOnSale] = useState(false);
  const [priceRange, setPriceRange] = useState(50);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="min-h-screen bg-[#f4fcf0] font-sans text-[#171d16]">
      <HomeHeader />

      <main className="mx-auto max-w-7xl space-y-8 px-6 pt-24 pb-16 md:px-8">
        {/* Top Hero Banner matching Figma */}
        <section className="group relative h-[260px] overflow-hidden rounded-[28px] shadow-sm md:h-[300px]">
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <img
            alt={categoryConfig.title}
            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
            src={categoryConfig.bannerUrl}
          />
          <div className="absolute bottom-0 left-0 z-20 space-y-2 p-6 md:p-10">
            <nav className="flex items-center gap-2 text-xs font-bold text-white/80">
              <span>Home</span>
              <ChevronRight className="h-3.5 w-3.5" />
              <span>Categories</span>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-extrabold text-white">
                {categoryConfig.title}
              </span>
            </nav>
            <h1 className="text-4xl leading-none font-black tracking-tight text-white md:text-5xl">
              {categoryConfig.title}
            </h1>
            <p className="text-sm font-semibold text-white/90">
              {categoryConfig.count}
            </p>
          </div>
        </section>

        {/* Layout: Left Sidebar Filters + Main Grid */}
        <div className="flex items-start gap-8">
          {/* Left Sidebar Filters */}
          <aside className="hidden w-72 shrink-0 md:block">
            <div className="sticky top-24 space-y-6 rounded-[28px] border border-[#e2ebdE] bg-white p-6 shadow-xs">
              <h2 className="text-lg font-black tracking-tight text-[#171d16]">
                Filters
              </h2>

              {/* Brands */}
              <div>
                <span className="mb-3 block text-xs font-black tracking-wider text-[#8b9888] uppercase">
                  BRANDS
                </span>
                <div className="space-y-2.5">
                  {BRANDS.map((brand, idx) => (
                    <label
                      key={brand}
                      className="flex cursor-pointer items-center gap-3 text-xs font-extrabold text-[#3e4a3d] hover:text-[#006b2c]"
                    >
                      <input
                        className="h-4 w-4 rounded border-[#bdcaba] accent-[#006b2c]"
                        defaultChecked={idx === 1}
                        type="checkbox"
                      />
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <div className="mb-2 flex justify-between text-xs font-black tracking-wider text-[#8b9888] uppercase">
                  <span>PRICE RANGE</span>
                  <span className="text-[#006c4a]">${priceRange}</span>
                </div>
                <input
                  aria-label="Price range"
                  className="w-full cursor-pointer accent-[#006b2c]"
                  max={50}
                  min={0}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  type="range"
                  value={priceRange}
                />
                <div className="mt-1 flex justify-between text-[11px] font-bold text-[#8b9888]">
                  <span>$0</span>
                  <span>$50</span>
                </div>
              </div>

              {/* Minimum Rating */}
              <div>
                <span className="mb-2.5 block text-xs font-black tracking-wider text-[#8b9888] uppercase">
                  MINIMUM RATING
                </span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((rating) => (
                    <button
                      key={rating}
                      className={`h-9 w-9 rounded-xl border text-xs font-black transition-all ${
                        minRating === rating
                          ? 'border-2 border-[#006b2c] bg-[#e3f5ea] text-[#006c4a] shadow-xs'
                          : 'border-[#e2ebdE] text-[#3e4a3d] hover:border-[#bdcaba]'
                      }`}
                      onClick={() => setMinRating(rating)}
                      type="button"
                    >
                      {rating}+
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2">
                <Toggle
                  checked={inStockOnly}
                  label="Instock Only"
                  onChange={() => setInStockOnly(!inStockOnly)}
                />
                <Toggle
                  checked={onSale}
                  label="On Sale"
                  onChange={() => setOnSale(!onSale)}
                />
              </div>

              <Button
                className="h-11 w-full rounded-2xl bg-[#006b2c] text-xs font-extrabold text-white shadow-xs transition-all hover:bg-[#005422]"
                type="button"
              >
                Apply Filters
              </Button>
            </div>
          </aside>

          {/* Main Products Grid */}
          <section className="min-w-0 flex-1 space-y-6">
            {/* Toolbar Row */}
            <div className="flex flex-col justify-between gap-4 rounded-[24px] border border-[#e2ebdE] bg-white p-4 shadow-xs md:flex-row md:items-center">
              <span className="text-xs font-extrabold text-[#3e4a3d]">
                Showing 1-12 of 142 results
              </span>

              <div className="flex items-center gap-4">
                <button
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#bdcaba]/60 bg-white px-4 py-2 text-xs font-black text-[#171d16] md:hidden"
                  type="button"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Filters</span>
                </button>

                <div className="flex items-center gap-2 text-xs font-bold text-[#8b9888]">
                  <span>Sort by:</span>
                  <select className="rounded-xl border-0 bg-[#f8fbf5] px-3 py-1.5 font-black text-[#171d16] focus:ring-2 focus:ring-[#006b2c]">
                    <option>Most Popular</option>
                    <option>Price: Low to High</option>
                    <option>Newest Arrivals</option>
                  </select>
                </div>

                <div className="flex items-center rounded-full border border-[#bdcaba]/60 bg-white p-1 shadow-xs">
                  <button
                    className={`rounded-full p-1.5 transition-all ${
                      viewMode === 'grid'
                        ? 'bg-[#006b2c] text-white'
                        : 'text-[#8b9888] hover:text-[#171d16]'
                    }`}
                    onClick={() => setViewMode('grid')}
                    type="button"
                  >
                    <Grid2X2 className="h-4 w-4" />
                  </button>
                  <button
                    className={`rounded-full p-1.5 transition-all ${
                      viewMode === 'list'
                        ? 'bg-[#006b2c] text-white'
                        : 'text-[#8b9888] hover:text-[#171d16]'
                    }`}
                    onClick={() => setViewMode('list')}
                    type="button"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div
              className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
            >
              {data.map((product) => (
                <CommerceProductCard
                  key={product.productId}
                  product={product}
                  variant="category"
                />
              ))}
            </div>

            {/* Bottom Spinner matching Figma */}
            <div className="flex flex-col items-center justify-center space-y-3 py-10">
              <LoaderCircle className="h-7 w-7 animate-spin text-[#006b2c]" />
              <span className="text-xs font-extrabold text-[#8b9888]">
                Gathering more fresh produce...
              </span>
            </div>
          </section>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}

const Toggle = ({
  checked = false,
  label,
  onChange,
}: {
  checked?: boolean;
  label: string;
  onChange: () => void;
}) => (
  <div className="flex items-center justify-between">
    <span className="text-xs font-extrabold text-[#3e4a3d]">{label}</span>
    <button
      aria-pressed={checked}
      className={`relative h-5.5 w-10 rounded-full transition-colors ${checked ? 'bg-[#006b2c]' : 'bg-[#bdcaba]'}`}
      onClick={onChange}
      type="button"
    >
      <span
        className={`absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white transition-transform ${checked ? 'right-0.5' : 'left-0.5'}`}
      />
    </button>
  </div>
);

export default function CategoryListingPage() {
  return <CategoryListingContent />;
}

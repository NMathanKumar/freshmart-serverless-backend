import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ChevronRight,
  Grid2X2,
  List,
  SlidersHorizontal,
  LoaderCircle,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  ArrowLeft,
  Search,
  Salad,
  Milk,
  CupSoda,
  Cookie,
  Beef,
  Leaf,
  ShieldCheck,
  Truck,
  Award,
} from 'lucide-react';
import { Button } from '@freshmart/design-system';
import { useGetCategoryListingQuery, useGetCategoriesQuery } from '../api/commerce-api.js';
import { CommerceProductCard } from '../components/commerce-product-card.js';
import { HomeHeader } from '../../home/components/home-header.js';
import { HomeFooter } from '../../home/components/home-footer.js';

const BRANDS = ['Organic Valley', "Earth's Best", 'Green Farm'];

interface CategoryConfig {
  slug: string;
  title: string;
  count: string;
  itemCount: number;
  description: string;
  popularItems: string[];
  bannerUrl: string;
  badge: string;
  icon: typeof Salad;
}

const CATEGORY_LIST: CategoryConfig[] = [
  {
    slug: 'fruits-vegetables',
    title: 'Fruits & Vegetables',
    count: '142 Products available - Fresh from the farm today',
    itemCount: 142,
    description: 'Farm-fresh organic fruits, crisp leafy greens, root vegetables, and seasonal picks.',
    popularItems: ['Organic Avocados', 'Fuji Apples', 'Heirloom Carrots', 'Baby Spinach'],
    bannerUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDbgVSd1ERMwsV1j2yax36VO1YrMtRGTvG2Nu2N9a0KcHgavDAKz9Xiq2AgA3nxWKVDaCqvcV88QMvZr6zbxlcgI0FDTDMZ8ioic5mdTB2q0lKT-bkeirxsbh2MQqfx9h2anjaOsiOHLchPV1RPU7z8FsQCaFdkY8DRx3dwyaQFNrsYHUWmEaZ3KaSHHOuWAhhaLiyemxWLEEuXgX6MQ6etwrRTNFL4Ma0eP5152I0H09XL7y7os8BtSLBzFL598cK6CxsDGSldTydd',
    badge: 'FARM FRESH',
    icon: Salad,
  },
  {
    slug: 'dairy-bakery',
    title: 'Dairy & Bakery',
    count: '98 Products available - Fresh morning deliveries',
    itemCount: 98,
    description: 'Whole organic milk, artisan sourdough bread, free-range eggs, cheeses, and farm butter.',
    popularItems: ['Whole Organic Milk', 'Artisan Sourdough', 'Free-Range Eggs', 'Grass-fed Butter'],
    bannerUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCS7LVpLJngaGd7gTrSTWDZ7mAjIhrISgGvIP1hisPESqJ-ZvAKYkmKu4OpKN46OCU3R0r766MYsZ-e5Fr6ArR9mKlUoSuDTYCuJNf3kX2Yaq9G9YVC0zh3PM0nJSkIIi1Fqgpvc8usxZSsPAa58xRrX3TnAvrCTQrl1BmMOKTwUOIgZxuhiucnglxOl3YgHZFrwJkGIBq16p4BLyHNkt0MorViaknGI4gSzxLJlDtwxlexc4oCN-IH2WlPHxd6tytEJW_m7VkpvTXm',
    badge: 'DAILY DELIVERED',
    icon: Milk,
  },
  {
    slug: 'organic-produce',
    title: 'Organic Produce',
    count: '110 Products available - 100% Certified Organic',
    itemCount: 110,
    description: 'Pesticide-free organic berries, heirloom carrots, ripe avocados, and cold-pressed juices.',
    popularItems: ['Organic Strawberries', 'Wild Blueberries', 'Raw Honey', 'Cold-Pressed Juices'],
    bannerUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAWsw8JAA3GnMTnwbl9czzfzrPkpAcnemPmyCZESxlbqP0WdJvK0URWh5kEYhaHbFzbFTYHpgo9OtyCvfPPeUimMIzw7mFeTb-TH3UKFxHB738M5MXiQ8f1H58fJF-_K8bwW2s91sC-Qkr6BmXVvBOEKCo9s3VhE-AIyAUxnrNShtKvtmguCzYIbw3DvNtKrn_PyIpuY3vB4VExuNkw7YYanmGMwDulU1Fuc6zhaoedT3AUBCXryZfRdegDZ4C_lsKRLEMx3fhmdVyn',
    badge: '100% ORGANIC',
    icon: Leaf,
  },
  {
    slug: 'beverages',
    title: 'Beverages & Juices',
    count: '76 Products available - Refreshing & organic',
    itemCount: 76,
    description: 'Cold-pressed green juices, kombucha, organic teas, specialty coffee, and sparkling waters.',
    popularItems: ['Organic Kombucha', 'Cold-Pressed Orange Juice', 'Matcha Green Tea', 'Sparkling Water'],
    bannerUrl:
      'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&auto=format&fit=crop&q=80',
    badge: 'COLD PRESSED',
    icon: CupSoda,
  },
  {
    slug: 'snacks-bakery',
    title: 'Snacks & Sweets',
    count: '84 Products available - Gourmet & healthy bites',
    itemCount: 84,
    description: 'Artisan chips, roasted nuts, dried fruits, organic dark chocolate, and whole-wheat crackers.',
    popularItems: ['Gourmet Trail Mix', 'Dark Chocolate 70%', 'Sea Salt Artisan Chips', 'Dried Mango'],
    bannerUrl:
      'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=800&auto=format&fit=crop&q=80',
    badge: 'GOURMET PICKS',
    icon: Cookie,
  },
  {
    slug: 'meat-seafood',
    title: 'Meat & Seafood',
    count: '52 Products available - Ethically sourced & fresh',
    itemCount: 52,
    description: 'Grass-fed beef, organic chicken cuts, wild-caught salmon fillets, and fresh seafood.',
    popularItems: ['Wild Alaskan Salmon', 'Grass-Fed Ribeye', 'Organic Chicken Breast', 'Fresh Shrimp'],
    bannerUrl:
      'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&auto=format&fit=crop&q=80',
    badge: 'ETHICALLY SOURCED',
    icon: Beef,
  },
];

const CATEGORY_MAP: Record<string, CategoryConfig> = Object.fromEntries(
  CATEGORY_LIST.map((item) => [item.slug, item])
);

export function CategoryListingContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryKey = searchParams.get('category');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  const { data = [] } = useGetCategoryListingQuery();
  const [minRating, setMinRating] = useState(3);
  const [inStockOnly, setInStockOnly] = useState(true);
  const [onSale, setOnSale] = useState(false);
  const [priceRange, setPriceRange] = useState(50);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: remoteCategories = [] } = useGetCategoriesQuery();

  // Filtered categories for All Categories view
  const filteredCategories = useMemo(() => {
    // Merge remote categories with fallback rich UI data
    const mergedList = remoteCategories.map((remoteCat, idx) => {
      const match = CATEGORY_LIST.find(c => c.slug === remoteCat.slug || c.title === remoteCat.name) || CATEGORY_LIST[idx % CATEGORY_LIST.length];
      return {
        ...match,
        slug: remoteCat.slug || match.slug,
        title: remoteCat.name || match.title,
        bannerUrl: remoteCat.imageUrl || match.bannerUrl,
      };
    });

    // If no remote categories loaded yet, fallback to local list
    const activeList = mergedList.length > 0 ? mergedList : CATEGORY_LIST;

    if (!categorySearchQuery.trim()) return activeList;
    const q = categorySearchQuery.toLowerCase();
    return activeList.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.popularItems.some((item) => item.toLowerCase().includes(q))
    );
  }, [categorySearchQuery, remoteCategories]);

  // If no category is selected, render ultra-professional "All Categories" Overview Page
  if (!categoryKey) {
    return (
      <div className="min-h-screen bg-[#f4fcf0] font-sans text-[#171d16]">
        <HomeHeader />

        <main className="mx-auto max-w-[1600px] space-y-10 px-4 pt-24 pb-16 sm:px-6 md:px-10">
          {/* Top Hero Banner */}
          <div className="group relative overflow-hidden rounded-[32px] border border-[#bdcaba]/30 bg-gradient-to-r from-[#005422] via-[#006b2c] to-[#004e20] p-8 text-white shadow-xl md:p-12">
            <div className="absolute right-0 top-0 h-full w-1/2 opacity-20 mix-blend-overlay hidden md:block">
              <img
                alt=""
                className="h-full w-full object-cover"
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80"
              />
            </div>
            
            <div className="relative z-10 max-w-3xl space-y-4">
              <nav className="flex items-center gap-2 text-xs font-extrabold tracking-wider text-white/80 uppercase">
                <Link className="hover:underline" to="/">Home</Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-white">Categories</span>
              </nav>

              <h1 className="text-3xl leading-tight font-black tracking-tight text-white md:text-5xl lg:text-6xl">
                Explore All Categories
              </h1>

              <p className="text-sm leading-relaxed font-medium text-white/90 md:text-base">
                Discover our complete collection of 100% certified organic produce, morning-fresh dairy, artisan bakery, cold-pressed beverages, and weekly kitchen staples.
              </p>

              {/* Category Quick Search inside Hero */}
              <div className="pt-2">
                <div className="relative max-w-md">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b9888]" />
                  <input
                    aria-label="Search categories"
                    className="w-full rounded-full border border-white/30 bg-white/95 py-3.5 pl-11 pr-4 text-xs font-bold text-[#171d16] placeholder-[#8b9888] shadow-md backdrop-blur-md transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-white"
                    onChange={(e) => setCategorySearchQuery(e.target.value)}
                    placeholder="Search fruits, dairy, bakery, snacks..."
                    type="text"
                    value={categorySearchQuery}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Trust Highlights Bar */}
          <div className="grid grid-cols-2 gap-4 rounded-[24px] border border-[#e2ebdE] bg-white p-4 shadow-xs md:grid-cols-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#eff6ea] text-[#006b2c]">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#171d16]">100% Organic</h4>
                <p className="text-[11px] font-bold text-[#8b9888]">Certified Local Farms</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#eff6ea] text-[#006b2c]">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#171d16]">15-Min Express</h4>
                <p className="text-[11px] font-bold text-[#8b9888]">Ultra-fast doorstep delivery</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#eff6ea] text-[#006b2c]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#171d16]">Quality Guaranteed</h4>
                <p className="text-[11px] font-bold text-[#8b9888]">100% Freshness Promise</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#eff6ea] text-[#006b2c]">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#171d16]">Best Prices</h4>
                <p className="text-[11px] font-bold text-[#8b9888]">Weekly pantry bundles</p>
              </div>
            </div>
          </div>

          {/* Grid of All Categories */}
          <section className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-[#171d16] md:text-3xl">
                  Grocery & Produce Categories
                </h2>
                <p className="text-xs font-bold text-[#8b9888]">
                  Showing {filteredCategories.length} main department categories
                </p>
              </div>
            </div>

            {filteredCategories.length === 0 ? (
              <div className="rounded-[28px] border border-[#e2ebdE] bg-white p-12 text-center text-sm font-extrabold text-[#8b9888]">
                No categories matched "{categorySearchQuery}". Try another search!
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <div
                      key={cat.slug}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-[#e2ebdE] bg-white shadow-xs transition-all duration-500 hover:-translate-y-1 hover:border-[#006b2c]/40 hover:shadow-2xl"
                    >
                      {/* Image Box */}
                      <div className="relative h-48 w-full overflow-hidden bg-[#eff6ea]">
                        <img
                          alt={cat.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
                          src={cat.bannerUrl}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        
                        {/* Top Badge & Icon */}
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/90 text-[#006b2c] shadow-xs backdrop-blur-md">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-black tracking-wider text-[#006c4a] uppercase shadow-xs backdrop-blur-md">
                            {cat.badge}
                          </span>
                        </div>

                        {/* Bottom Product Count */}
                        <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-black text-white shadow-xs backdrop-blur-md">
                          {cat.itemCount} Products
                        </span>
                      </div>

                      {/* Info & Popular Tags */}
                      <div className="flex flex-1 flex-col justify-between p-6 space-y-4">
                        <div>
                          <h3 className="text-xl font-black tracking-tight text-[#171d16] transition-colors group-hover:text-[#006b2c]">
                            {cat.title}
                          </h3>
                          <p className="mt-1.5 text-xs leading-relaxed font-semibold text-[#8b9888] line-clamp-2">
                            {cat.description}
                          </p>

                          {/* Popular Items Pills */}
                          <div className="mt-3 flex flex-wrap gap-1.5 pt-1">
                            {cat.popularItems.map((item) => (
                              <span
                                key={item}
                                className="rounded-lg bg-[#f4fcf0] border border-[#e2ebdE] px-2.5 py-1 text-[10px] font-bold text-[#006c4a]"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>

                        <button
                          className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#006b2c] text-xs font-extrabold text-white shadow-xs transition-all duration-300 hover:bg-[#005422] active:scale-95"
                          onClick={() => setSearchParams({ category: cat.slug })}
                          type="button"
                        >
                          <span>Browse {cat.title}</span>
                          <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>

        <HomeFooter />
      </div>
    );
  }

  // Selected Category Product Listing View
  const categoryConfig = CATEGORY_MAP[categoryKey] || {
    slug: categoryKey,
    title: categoryKey
      .replaceAll('-', ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    count: '142 Products available - Fresh from the farm today',
    itemCount: 142,
    description: 'Fresh organic produce delivered daily.',
    bannerUrl: CATEGORY_MAP['fruits-vegetables'].bannerUrl,
    badge: 'FRESH SELECTION',
    icon: Salad,
    popularItems: [],
  };

  return (
    <div className="min-h-screen bg-[#f4fcf0] font-sans text-[#171d16]">
      <HomeHeader />

      <main className="mx-auto max-w-[1600px] space-y-8 px-4 pt-24 pb-16 sm:px-6 md:px-10">
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
              <Link className="hover:underline" to="/">Home</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <button
                className="hover:underline text-white/90 font-semibold"
                onClick={() => setSearchParams({})}
                type="button"
              >
                Categories
              </button>
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

        {/* Navigation back to all categories bar */}
        <div className="flex items-center justify-between border-b border-[#bdcaba]/30 pb-2">
          <button
            className="flex items-center gap-1.5 text-xs font-black text-[#006b2c] hover:underline"
            onClick={() => setSearchParams({})}
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>← View All Categories</span>
          </button>
        </div>

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
                Showing 1-{data.length || 12} of {categoryConfig.itemCount} results
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

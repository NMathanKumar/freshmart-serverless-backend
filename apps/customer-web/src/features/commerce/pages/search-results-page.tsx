import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ChevronDown,
  Heart,
  LayoutGrid,
  List,
  Minus,
  Plus,
  SlidersHorizontal,
  Star,
} from 'lucide-react';
import { Button } from '@freshmart/design-system';
import { formatCurrency } from '@freshmart/shared';
import {
  useSearchProductsQuery,
  useUpdateCartItemMutation,
} from '../api/commerce-api.js';
import {
  categoryProducts,
  searchProducts as defaultSearchProducts,
  wishlistProducts,
  cartLines,
} from '../model/commerce-content.js';
import { HomeHeader } from '../../home/components/home-header.js';
import { HomeFooter } from '../../home/components/home-footer.js';

interface SearchProductItem {
  id: string;
  badge?: string;
  badgeTone?: 'discount' | 'new';
  tag: string;
  name: string;
  rating: number;
  reviews: string;
  deliveryTime: string;
  price: number;
  originalPrice?: number;
  quantityInCart?: number;
  imageUrl: string;
}

// Full master pool of products across the system for real-time dynamic searching
const MASTER_PRODUCT_POOL: SearchProductItem[] = [
  {
    id: 'srch-1',
    badge: '-15% OFF',
    badgeTone: 'discount',
    tag: 'ORGANIC FARMS',
    name: 'Premium Hass Avocado',
    rating: 4.9,
    reviews: '3.2k reviews',
    deliveryTime: '15 min',
    price: 2.49,
    originalPrice: 2.99,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCSHaELNOhgX7mXWpkTZoBd8EkjiC2gtiPjn00f0mfjjc35_Do4_8Cy5vfaZ00jCjl_LWa_yqs1YWNNxfKG-47zOk6_uc4o68CzFG_6qcXMcdsDVDl_SyzMzXoPgwzJXcSlEVxzUTctK3lNfyPPIhPNxdF9p3-VLXrfZOpRAlbQ8V_eSjtPAmHqEI4QEygGblDnpdLD1BIr84P3DEYq4457nmGfVawMGFAmdA0Sx86DswR32pk7VCPiD5p8M9i4wnqts7_21AyM6I6S',
  },
  {
    id: 'srch-2',
    tag: 'PURE COLD PRESSED',
    name: 'Organic Avocado Oil',
    rating: 4.8,
    reviews: '850 reviews',
    deliveryTime: '20 min',
    price: 12.99,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA-8ZKxMuvb9QVdjRnKXyn-bmUF69PYQ5gWY2M8ofX8H15-hmkg8-Gy-qHR61k7JtnnVXh0JF7KRg0XbNdLeLtRYR0G-xZpY9RiUPqL8qFvdL9Sp-Axe1JpioUqZnCOyw_xkiBbtnq4PKTIO-9B6bZ_Muj4HirdjRXta4ycEsR1xOPMARFTJ4AC5WVY5yZbXglG-7V9upqCvyqtUT3kFfCrcwaLkmpmB1REpl05m6AtigOrnjL4cpAY8P4SDTpYFsOlnJyXkgQpo17u',
  },
  {
    id: 'srch-3',
    tag: 'KITCHEN FRESH',
    name: 'Classic Guacamole Mix',
    rating: 4.7,
    reviews: '420 reviews',
    deliveryTime: '12 min',
    price: 5.49,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCGoSHs0NoGGfIYxwIsyWj4vdh5kPA6QRji00Ii_lH3pVavw-d6dflAFH2xfLRc7nhy0VsPUgLJmXhz4hfJXWIpI_MrOcbL68xaRTzInZH56nC-pmYNylqYdiG9kooerikkbZQ5rbh_DOv-vJCnYk-9TR5MQQfqAkILwK0p-L7GVVLYSuCq6ijxgSQHWu63I14zGiQuXh-S5kHsDqini0IBQEDyW4mtGSN9jKU5d7tUrOiZHiOyIcmBW5bcB-FUo3Cl37zDruhJm2xR',
  },
  {
    id: 'srch-4',
    tag: 'DAILY HARVEST',
    name: 'Organic Baby Avocados (4pk)',
    rating: 4.9,
    reviews: '210 reviews',
    deliveryTime: '15 min',
    price: 6.99,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAocIVc-EoYCbFmS10USZQHrW2cBY3jC44RL3aegAleg9zH39V0IHSWwM6MIKPQO6ifSz4gqZNGdwbezCWTwpjY26PgUPmNirsv572TsUAyQLu6A8XrYc_0UG8v0nwTw-VYaT0SMJPhU_zb_d9e0nSrxGxXQbl6Lx_YXZsdI0Y_-NYBK5I62D_ProCKkx-hG1xm3k6nMB89NGrtr-8Z1cQoVuXM7LxVdoQLwhsZlw2KSjnxaqws6Q_tmOCTfNEAnRlce3LxYTMFdXYO',
  },
  {
    id: 'srch-5',
    badge: 'FRESH',
    tag: 'DAIRY FARM',
    name: 'Whole Grass-Fed Milk',
    rating: 4.9,
    reviews: '1.8k reviews',
    deliveryTime: '10 min',
    price: 3.49,
    imageUrl: cartLines[1].imageUrl,
  },
  {
    id: 'srch-6',
    badge: 'ORGANIC',
    tag: 'LOCAL FARMS',
    name: 'Organic Vine Tomatoes',
    rating: 4.8,
    reviews: '920 reviews',
    deliveryTime: '15 min',
    price: 4.5,
    imageUrl: categoryProducts[1].imageUrl,
  },
  {
    id: 'srch-7',
    badge: 'BAKERY',
    tag: 'FRESH BAKED',
    name: 'Artisan Sourdough Loaf',
    rating: 4.7,
    reviews: '640 reviews',
    deliveryTime: '20 min',
    price: 5.5,
    imageUrl: wishlistProducts[1].imageUrl,
  },
  {
    id: 'srch-8',
    badge: 'BESTSELLER',
    tag: 'BERRIES',
    name: 'Organic Blueberries',
    rating: 4.9,
    reviews: '2.1k reviews',
    deliveryTime: '12 min',
    price: 4.95,
    imageUrl: categoryProducts[2].imageUrl,
  },
];

export function SearchResultsContent() {
  const [searchParams] = useSearchParams();
  const rawQuery = searchParams.get('q') || 'Organic Avocados';
  const query = rawQuery.trim();

  // Connect to live SDK search query & cart mutations
  const { data: apiSearchResults } = useSearchProductsQuery({ query });
  const [updateCart] = useUpdateCartItemMutation();

  const [selectedChip, setSelectedChip] = useState('All Results');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [cartQuantities, setCartQuantities] = useState<Record<string, number>>(
    {}
  );

  // Filter items dynamically based on search query
  const searchResultsList = useMemo(() => {
    const searchTerm = query.toLowerCase();

    if (apiSearchResults && apiSearchResults.length > 0) {
      return apiSearchResults.map((p, idx) => ({
        id: p.productId || `api-prod-${idx}`,
        badge: p.badge,
        tag: p.brand || 'FRESHMART',
        name: p.name,
        rating: p.rating || 4.8,
        reviews: p.reviewCount ? `${p.reviewCount} reviews` : '150 reviews',
        deliveryTime: p.deliveryTime || '15 min',
        price: p.price,
        originalPrice: p.originalPrice,
        imageUrl: p.imageUrl,
      }));
    }

    const matched = MASTER_PRODUCT_POOL.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.tag.toLowerCase().includes(searchTerm) ||
        searchTerm.includes('avocado') ||
        searchTerm === ''
    );

    return matched.length > 0 ? matched : MASTER_PRODUCT_POOL;
  }, [query, apiSearchResults]);

  const chips = useMemo(() => {
    const baseChips = ['All Results'];
    searchResultsList.forEach((item) => {
      const words = item.name.split(' ');
      if (words.length > 1 && !baseChips.includes(words[0])) {
        baseChips.push(words[0]);
      }
    });
    return baseChips.slice(0, 6);
  }, [searchResultsList]);

  const filteredProducts = useMemo(() => {
    if (selectedChip === 'All Results') return searchResultsList;
    return searchResultsList.filter((item) =>
      item.name.toLowerCase().includes(selectedChip.toLowerCase())
    );
  }, [searchResultsList, selectedChip]);

  const toggleWishlist = (id: string) => {
    setLikedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const updateQuantity = async (
    id: string,
    delta: number,
    item?: SearchProductItem
  ) => {
    const current = cartQuantities[id] || 0;
    const next = Math.max(0, current + delta);
    setCartQuantities((prev) => ({ ...prev, [id]: next }));

    if (item && delta > 0) {
      const { addOrUpdateStoredCartItem } =
        await import('../model/commerce-content.js');
      addOrUpdateStoredCartItem({
        productId: id,
        name: item.name,
        price: item.price,
        brand: item.tag,
        imageUrl: item.imageUrl,
      });
    }

    await updateCart({
      productId: id,
      quantity: next,
    })
      .unwrap()
      .catch(() => undefined);
  };

  return (
    <div className="min-h-screen bg-[#f4fcf0] font-sans text-[#171d16]">
      <HomeHeader />

      <main className="mx-auto max-w-[1600px] space-y-8 px-4 pt-24 pb-16 sm:px-6 md:px-10">
        {/* Title Header & Toolbar */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#171d16] md:text-4xl">
              Results for "{query}"
            </h1>
            <p className="mt-1 text-sm font-semibold text-[#8b9888]">
              Showing {filteredProducts.length} premium organic items
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              className="flex h-10 items-center gap-1.5 rounded-full border border-[#bdcaba]/60 bg-white px-4 text-xs font-black text-[#171d16] shadow-xs transition-all hover:bg-[#eff6ea]"
              type="button"
            >
              <SlidersHorizontal className="h-4 w-4 text-[#006b2c]" />
              <span>Filters</span>
            </Button>

            <Button
              className="flex h-10 items-center gap-1.5 rounded-full border border-[#bdcaba]/60 bg-white px-4 text-xs font-black text-[#171d16] shadow-xs transition-all hover:bg-[#eff6ea]"
              type="button"
            >
              <span>Relevance</span>
              <ChevronDown className="h-4 w-4 text-[#8b9888]" />
            </Button>

            <div className="hidden h-6 w-px bg-[#e2ebdE] md:block" />

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
                <LayoutGrid className="h-4 w-4" />
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

        {/* Filter Pills */}
        <div className="flex scrollbar-none items-center gap-2 overflow-x-auto pb-2">
          {chips.map((chip) => {
            const isSelected = selectedChip === chip;
            return (
              <button
                key={chip}
                className={`rounded-full px-5 py-2 text-xs font-black whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#006b2c] text-white shadow-xs'
                    : 'border border-[#e2ebdE] bg-white text-[#3e4a3d] hover:border-[#bdcaba]'
                }`}
                onClick={() => setSelectedChip(chip)}
                type="button"
              >
                {chip}
              </button>
            );
          })}
        </div>

        {/* Dynamic Product Grid */}
        <div
          className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'}`}
        >
          {filteredProducts.map((item) => {
            const quantityInCart = cartQuantities[item.id] || 0;

            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-[#e2ebdE] bg-white p-4 shadow-xs transition-all duration-300 hover:border-[#bdcaba] hover:shadow-xl"
              >
                {/* Wishlist Heart Button */}
                <button
                  aria-label="Wishlist"
                  className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#8b9888] shadow-xs backdrop-blur-md transition-all hover:scale-110"
                  onClick={() => toggleWishlist(item.id)}
                  type="button"
                >
                  <Heart
                    className={`h-4 w-4 ${likedIds[item.id] ? 'fill-rose-500 text-rose-500' : 'text-[#8b9888]'}`}
                  />
                </button>

                {/* Discount Badge */}
                {item.badge && (
                  <span className="absolute top-3 left-3 z-10 rounded-full bg-[#ffd9de] px-2.5 py-1 text-[9px] font-black tracking-wider text-[#a72d51] uppercase">
                    {item.badge}
                  </span>
                )}

                {/* Product Image */}
                <div className="mb-3 h-44 w-full overflow-hidden rounded-2xl bg-[#f4fcf0]/80 p-3">
                  <img
                    alt={item.name}
                    className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-108"
                    src={item.imageUrl}
                    onError={(e) => {
    const fallback = 'https://placehold.co/400x400/e2ebdE/006c4a.png?text=FreshMart';
    if (!e.currentTarget.src.includes('product-placeholder.png')) {
      e.currentTarget.src = fallback;
    }
  }}
                  />
                </div>

                {/* Product Info */}
                <div className="space-y-3">
                  <div>
                    <span className="text-[9px] font-black tracking-wider text-[#006c4a] uppercase">
                      {item.tag}
                    </span>
                    <h3 className="truncate text-sm font-extrabold text-[#171d16] transition-colors group-hover:text-[#006b2c]">
                      {item.name}
                    </h3>

                    <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-[#8b9888]">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-[#171d16]">{item.rating}</span>
                      <span>({item.reviews})</span>
                      <span>•</span>
                      <span>{item.deliveryTime}</span>
                    </div>

                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-lg font-black text-[#171d16]">
                        {formatCurrency(item.price)}
                      </span>
                      {item.originalPrice && (
                        <span className="text-xs font-bold text-[#8b9888] line-through">
                          {formatCurrency(item.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add or Quantity Counter Button */}
                  {quantityInCart > 0 ? (
                    <div className="flex h-10 w-full items-center justify-between rounded-xl bg-[#e3f5ea] px-3 font-extrabold text-[#006c4a] shadow-xs">
                      <button
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#006c4a] hover:bg-[#c5edd8]"
                        onClick={() => updateQuantity(item.id, -1, item)}
                        type="button"
                      >
                        <Minus className="h-3.5 w-3.5 stroke-[3]" />
                      </button>
                      <span className="text-xs font-black">
                        {quantityInCart}
                      </span>
                      <button
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#006c4a] hover:bg-[#c5edd8]"
                        onClick={() => updateQuantity(item.id, 1, item)}
                        type="button"
                      >
                        <Plus className="h-3.5 w-3.5 stroke-[3]" />
                      </button>
                    </div>
                  ) : (
                    <Button
                      className="flex h-10 w-full items-center justify-center gap-1 rounded-xl bg-[#006b2c] text-xs font-extrabold text-white shadow-xs transition-all hover:bg-[#005422] active:scale-95"
                      onClick={() => updateQuantity(item.id, 1, item)}
                      type="button"
                    >
                      <Plus className="h-4 w-4 stroke-[3]" />
                      <span>Add</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}

export default function SearchResultsPage() {
  return <SearchResultsContent />;
}

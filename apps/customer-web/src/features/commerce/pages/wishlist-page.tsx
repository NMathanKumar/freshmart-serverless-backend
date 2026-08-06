import { useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Share2,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from '@freshmart/design-system';
import { formatCurrency } from '@freshmart/shared';
import { useUpdateCartItemMutation } from '../api/commerce-api.js';
import { HomeHeader } from '../../home/components/home-header.js';
import { HomeFooter } from '../../home/components/home-footer.js';

interface WishlistItem {
  id: string;
  badge?: string;
  badgeTone?: 'discount' | 'new';
  tag: string;
  name: string;
  price: number;
  originalPrice?: number;
  stockStatus: string;
  isLowStock?: boolean;
  imageUrl: string;
}

const INITIAL_WISHLIST: WishlistItem[] = [
  {
    id: 'wish-1',
    badge: '15% OFF',
    badgeTone: 'discount',
    tag: 'PREMIUM ORGANIC',
    name: 'Organic Honeyberries',
    price: 12.5,
    originalPrice: 14.75,
    stockStatus: 'In Stock',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCGoSHs0NoGGfIYxwIsyWj4vdh5kPA6QRji00Ii_lH3pVavw-d6dflAFH2xfLRc7nhy0VsPUgLJmXhz4hfJXWIpI_MrOcbL68xaRTzInZH56nC-pmYNylqYdiG9kooerikkbZQ5rbh_DOv-vJCnYk-9TR5MQQfqAkILwK0p-L7GVVLYSuCq6ijxgSQHWu63I14zGiQuXh-S5kHsDqini0IBQEDyW4mtGSN9jKU5d7tUrOiZHiOyIcmBW5bcB-FUo3Cl37zDruhJm2xR',
  },
  {
    id: 'wish-2',
    tag: 'FRESHLY BAKED',
    name: 'Artisan Sourdough',
    price: 8.0,
    stockStatus: 'Only 4 left',
    isLowStock: true,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAocIVc-EoYCbFmS10USZQHrW2cBY3jC44RL3aegAleg9zH39V0IHSWwM6MIKPQO6ifSz4gqZNGdwbezCWTwpjY26PgUPmNirsv572TsUAyQLu6A8XrYc_0UG8v0nwTw-VYaT0SMJPhU_zb_d9e0nSrxGxXQbl6Lx_YXZsdI0Y_-NYBK5I62D_ProCKkx-hG1xm3k6nMB89NGrtr-8Z1cQoVuXM7LxVdoQLwhsZlw2KSjnxaqws6Q_tmOCTfNEAnRlce3LxYTMFdXYO',
  },
  {
    id: 'wish-3',
    tag: 'ETHICALLY SOURCED',
    name: 'Single Origin Arabica',
    price: 22.0,
    stockStatus: 'In Stock',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA-8ZKxMuvb9QVdjRnKXyn-bmUF69PYQ5gWY2M8ofX8H15-hmkg8-Gy-qHR61k7JtnnVXh0JF7KRg0XbNdLeLtRYR0G-xZpY9RiUPqL8qFvdL9Sp-Axe1JpioUqZnCOyw_xkiBbtnq4PKTIO-9B6bZ_Muj4HirdjRXta4ycEsR1xOPMARFTJ4AC5WVY5yZbXglG-7V9upqCvyqtUT3kFfCrcwaLkmpmB1REpl05m6AtigOrnjL4cpAY8P4SDTpYFsOlnJyXkgQpo17u',
  },
  {
    id: 'wish-4',
    badge: 'NEW',
    badgeTone: 'new',
    tag: 'NUTRITION RICH',
    name: 'Cold-Pressed Green Juice',
    price: 6.5,
    originalPrice: 8.0,
    stockStatus: 'In Stock',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCSHaELNOhgX7mXWpkTZoBd8EkjiC2gtiPjn00f0mfjjc35_Do4_8Cy5vfaZ00jCjl_LWa_yqs1YWNNxfKG-47zOk6_uc4o68CzFG_6qcXMcdsDVDl_SyzMzXoPgwzJXcSlEVxzUTctK3lNfyPPIhPNxdF9p3-VLXrfZOpRAlbQ8V_eSjtPAmHqEI4QEygGblDnpdLD1BIr84P3DEYq4457nmGfVawMGFAmdA0Sx86DswR32pk7VCPiD5p8M9i4wnqts7_21AyM6I6S',
  },
];

const RECENTLY_VIEWED = [
  {
    id: 'rec-1',
    name: 'Organic Heirloom Carrots',
    price: 4.5,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCGoSHs0NoGGfIYxwIsyWj4vdh5kPA6QRji00Ii_lH3pVavw-d6dflAFH2xfLRc7nhy0VsPUgLJmXhz4hfJXWIpI_MrOcbL68xaRTzInZH56nC-pmYNylqYdiG9kooerikkbZQ5rbh_DOv-vJCnYk-9TR5MQQfqAkILwK0p-L7GVVLYSuCq6ijxgSQHWu63I14zGiQuXh-S5kHsDqini0IBQEDyW4mtGSN9jKU5d7tUrOiZHiOyIcmBW5bcB-FUo3Cl37zDruhJm2xR',
  },
  {
    id: 'rec-2',
    name: 'Cold-Pressed Olive Oil',
    price: 26.0,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA-8ZKxMuvb9QVdjRnKXyn-bmUF69PYQ5gWY2M8ofX8H15-hmkg8-Gy-qHR61k7JtnnVXh0JF7KRg0XbNdLeLtRYR0G-xZpY9RiUPqL8qFvdL9Sp-Axe1JpioUqZnCOyw_xkiBbtnq4PKTIO-9B6bZ_Muj4HirdjRXta4ycEsR1xOPMARFTJ4AC5WVY5yZbXglG-7V9upqCvyqtUT3kFfCrcwaLkmpmB1REpl05m6AtigOrnjL4cpAY8P4SDTpYFsOlnJyXkgQpo17u',
  },
  {
    id: 'rec-3',
    name: 'Artisan Cheese Board',
    price: 35.0,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAocIVc-EoYCbFmS10USZQHrW2cBY3jC44RL3aegAleg9zH39V0IHSWwM6MIKPQO6ifSz4gqZNGdwbezCWTwpjY26PgUPmNirsv572TsUAyQLu6A8XrYc_0UG8v0nwTw-VYaT0SMJPhU_zb_d9e0nSrxGxXQbl6Lx_YXZsdI0Y_-NYBK5I62D_ProCKkx-hG1xm3k6nMB89NGrtr-8Z1cQoVuXM7LxVdoQLwhsZlw2KSjnxaqws6Q_tmOCTfNEAnRlce3LxYTMFdXYO',
  },
];

const RECOMMENDED = [
  {
    id: 'rem-1',
    name: 'Hass Avocados (2pk)',
    price: 5.95,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCSHaELNOhgX7mXWpkTZoBd8EkjiC2gtiPjn00f0mfjjc35_Do4_8Cy5vfaZ00jCjl_LWa_yqs1YWNNxfKG-47zOk6_uc4o68CzFG_6qcXMcdsDVDl_SyzMzXoPgwzJXcSlEVxzUTctK3lNfyPPIhPNxdF9p3-VLXrfZOpRAlbQ8V_eSjtPAmHqEI4QEygGblDnpdLD1BIr84P3DEYq4457nmGfVawMGFAmdA0Sx86DswR32pk7VCPiD5p8M9i4wnqts7_21AyM6I6S',
  },
  {
    id: 'rem-2',
    name: 'Sweet Gariguette Strawberries',
    price: 7.2,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCGoSHs0NoGGfIYxwIsyWj4vdh5kPA6QRji00Ii_lH3pVavw-d6dflAFH2xfLRc7nhy0VsPUgLJmXhz4hfJXWIpI_MrOcbL68xaRTzInZH56nC-pmYNylqYdiG9kooerikkbZQ5rbh_DOv-vJCnYk-9TR5MQQfqAkILwK0p-L7GVVLYSuCq6ijxgSQHWu63I14zGiQuXh-S5kHsDqini0IBQEDyW4mtGSN9jKU5d7tUrOiZHiOyIcmBW5bcB-FUo3Cl37zDruhJm2xR',
  },
  {
    id: 'rem-3',
    name: 'Stone-Ground Almond Butter',
    price: 11.5,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA-8ZKxMuvb9QVdjRnKXyn-bmUF69PYQ5gWY2M8ofX8H15-hmkg8-Gy-qHR61k7JtnnVXh0JF7KRg0XbNdLeLtRYR0G-xZpY9RiUPqL8qFvdL9Sp-Axe1JpioUqZnCOyw_xkiBbtnq4PKTIO-9B6bZ_Muj4HirdjRXta4ycEsR1xOPMARFTJ4AC5WVY5yZbXglG-7V9upqCvyqtUT3kFfCrcwaLkmpmB1REpl05m6AtigOrnjL4cpAY8P4SDTpYFsOlnJyXkgQpo17u',
  },
  {
    id: 'rem-4',
    name: 'Premium Valencia Orange Juice',
    price: 9.0,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAocIVc-EoYCbFmS10USZQHrW2cBY3jC44RL3aegAleg9zH39V0IHSWwM6MIKPQO6ifSz4gqZNGdwbezCWTwpjY26PgUPmNirsv572TsUAyQLu6A8XrYc_0UG8v0nwTw-VYaT0SMJPhU_zb_d9e0nSrxGxXQbl6Lx_YXZsdI0Y_-NYBK5I62D_ProCKkx-hG1xm3k6nMB89NGrtr-8Z1cQoVuXM7LxVdoQLwhsZlw2KSjnxaqws6Q_tmOCTfNEAnRlce3LxYTMFdXYO',
  },
];

export function WishlistContent() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>(INITIAL_WISHLIST);
  const [updateCart] = useUpdateCartItemMutation();

  const handleAddToCart = async (item: WishlistItem) => {
    const { addOrUpdateStoredCartItem } =
      await import('../model/commerce-content.js');
    addOrUpdateStoredCartItem({
      productId: item.id,
      name: item.name,
      price: item.price,
      brand: item.tag,
      imageUrl: item.imageUrl,
    });

    await updateCart({
      productId: item.id,
      quantity: 1,
    })
      .unwrap()
      .catch(() => undefined);

    setWishlist((prev) => prev.filter((i) => i.id !== item.id));
  };

  const handleRemove = (id: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
  };

  const removeItem = handleRemove;

  return (
    <div className="min-h-screen bg-[#f4fcf0] font-sans text-[#171d16]">
      <HomeHeader />

      <main className="mx-auto max-w-7xl space-y-12 px-6 pt-24 pb-16 md:px-8">
        {/* Breadcrumbs & Header */}
        <div>
          <nav className="mb-3 flex items-center gap-1.5 text-xs font-bold text-[#8b9888]">
            <span>Home</span>
            <span>/</span>
            <span>Account</span>
            <span>/</span>
            <span className="text-[#171d16]">Wishlist</span>
          </nav>

          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-[#171d16] md:text-4xl">
                Your Wishlist
              </h1>
              <p className="mt-1 text-sm font-semibold text-[#8b9888]">
                Keep track of items you love and want to buy later.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                className="flex h-10 items-center gap-1.5 rounded-full border border-[#bdcaba]/60 bg-white px-4 text-xs font-black text-[#171d16] shadow-xs transition-all hover:bg-[#eff6ea]"
                type="button"
              >
                <Share2 className="h-4 w-4 text-[#006b2c]" />
                <span>Share List</span>
              </Button>

              <Button
                className="flex h-10 items-center gap-1.5 rounded-full bg-[#006b2c] px-5 text-xs font-black text-white shadow-xs transition-all hover:bg-[#005422] active:scale-95"
                type="button"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Add All to Cart</span>
              </Button>
            </div>
          </div>
        </div>

        {/* 1. Wishlist 4-Card Grid */}
        {wishlist.length === 0 ? (
          <div className="rounded-[24px] border border-[#e2ebdE] bg-white p-12 text-center text-sm font-bold text-[#8b9888]">
            Your wishlist is empty. Explore items and save them for later!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-[#e2ebdE] bg-white p-4 shadow-xs transition-all duration-300 hover:border-[#bdcaba] hover:shadow-xl"
              >
                {/* Delete Button top right */}
                <button
                  aria-label="Remove item"
                  className="absolute top-3 right-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#8b9888] shadow-xs backdrop-blur-md transition-all hover:bg-rose-50 hover:text-rose-600"
                  onClick={() => removeItem(item.id)}
                  type="button"
                >
                  <X className="h-4 w-4 stroke-[2.5]" />
                </button>

                {/* Top Badge */}
                {item.badge && (
                  <span
                    className={`absolute top-3 left-3 z-10 rounded-full px-2.5 py-1 text-[9px] font-black tracking-wider uppercase ${
                      item.badgeTone === 'discount'
                        ? 'bg-[#ffd9de] text-[#a72d51]'
                        : 'bg-[#e3f5ea] text-[#006c4a]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Product Image Box */}
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

                {/* Card Info & Move to Cart Button */}
                <div className="space-y-3">
                  <div>
                    <span className="text-[9px] font-black tracking-wider text-[#006c4a] uppercase">
                      {item.tag}
                    </span>
                    <h3 className="truncate text-sm font-extrabold text-[#171d16] transition-colors group-hover:text-[#006b2c]">
                      {item.name}
                    </h3>

                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-base font-black text-[#006c4a]">
                        {formatCurrency(item.price)}
                      </span>
                      {item.originalPrice && (
                        <span className="text-xs font-bold text-[#8b9888] line-through">
                          {formatCurrency(item.originalPrice)}
                        </span>
                      )}
                    </div>

                    <p
                      className={`mt-1 text-[11px] font-bold ${item.isLowStock ? 'text-rose-600' : 'text-[#8b9888]'}`}
                    >
                      ● {item.stockStatus}
                    </p>
                  </div>

                  <Button
                    className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-[#006b2c] text-xs font-extrabold text-white shadow-xs transition-all hover:bg-[#005422] active:scale-95"
                    type="button"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Move to Cart</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. Recently Viewed Section */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight text-[#171d16]">
              Recently Viewed
            </h2>
            <div className="flex items-center gap-2">
              <button
                aria-label="Previous"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e2ebdE] bg-white text-[#171d16] hover:bg-[#eff6ea]"
                type="button"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                aria-label="Next"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e2ebdE] bg-white text-[#171d16] hover:bg-[#eff6ea]"
                type="button"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {RECENTLY_VIEWED.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-2xl border border-[#e2ebdE] bg-white p-3.5 shadow-xs transition-all hover:shadow-md"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#e2ebdE] bg-[#f4fcf0] p-1">
                  <img
                    alt={item.name}
                    className="h-full w-full object-contain mix-blend-multiply"
                    src={item.imageUrl}
                    onError={(e) => {
    const fallback = 'https://placehold.co/400x400/e2ebdE/006c4a.png?text=FreshMart';
    if (!e.currentTarget.src.includes('product-placeholder.png')) {
      e.currentTarget.src = fallback;
    }
  }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-xs font-extrabold text-[#171d16]">
                    {item.name}
                  </h4>
                  <p className="mt-0.5 text-xs font-black text-[#006c4a]">
                    {formatCurrency(item.price)}
                  </p>
                  <button
                    className="mt-1 block text-[11px] font-extrabold text-[#006b2c] hover:underline"
                    type="button"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Recommended for You Section */}
        <section className="space-y-4 pt-4">
          <h2 className="text-2xl font-black tracking-tight text-[#171d16]">
            Recommended for You
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {RECOMMENDED.map((item) => (
              <div
                key={item.id}
                className="space-y-3 rounded-[24px] border border-[#e2ebdE] bg-white p-4 shadow-xs transition-all hover:shadow-lg"
              >
                <div className="h-40 w-full overflow-hidden rounded-2xl bg-[#f4fcf0] p-2">
                  <img
                    alt={item.name}
                    className="h-full w-full object-contain mix-blend-multiply"
                    src={item.imageUrl}
                    onError={(e) => {
    const fallback = 'https://placehold.co/400x400/e2ebdE/006c4a.png?text=FreshMart';
    if (!e.currentTarget.src.includes('product-placeholder.png')) {
      e.currentTarget.src = fallback;
    }
  }}
                  />
                </div>
                <div>
                  <h4 className="truncate text-xs font-extrabold text-[#171d16]">
                    {item.name}
                  </h4>
                  <p className="mt-0.5 text-sm font-black text-[#006c4a]">
                    {formatCurrency(item.price)}
                  </p>
                </div>
                <Button
                  className="h-9 w-full rounded-xl border border-[#006b2c] bg-white text-xs font-black text-[#006b2c] transition-all hover:bg-[#eff6ea]"
                  type="button"
                >
                  Quick Add
                </Button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <HomeFooter />
    </div>
  );
}

export default function WishlistPage() {
  return <WishlistContent />;
}

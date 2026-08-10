import {
  Share2,
  ShoppingCart,
  X,
} from 'lucide-react';
import { Button } from '@freshmart/design-system';
import { formatCurrency } from '@freshmart/shared';
import {
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
  useUpdateCartItemMutation,
} from '../api/commerce-api.js';
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

export function WishlistContent() {
  const { data: rawWishlist = [] } = useGetWishlistQuery();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const [updateCart] = useUpdateCartItemMutation();

  const wishlist: WishlistItem[] = rawWishlist.map((item) => ({
    id: item.productId,
    badge: item.badge,
    badgeTone: item.badgeTone === 'sale' ? 'discount' : 'new',
    tag: item.brand || 'PREMIUM ORGANIC',
    name: item.name,
    price: item.price,
    originalPrice: item.originalPrice,
    stockStatus: item.stockLabel || 'In Stock',
    imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300',
  }));

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

    await removeFromWishlist({ productId: item.id })
      .unwrap()
      .catch(() => undefined);
  };

  const handleRemove = async (id: string) => {
    await removeFromWishlist({ productId: id })
      .unwrap()
      .catch(() => undefined);
  };

  const handleAddAllToCart = async () => {
    for (const item of wishlist) {
      await handleAddToCart(item);
    }
  };

  const removeItem = handleRemove;

  return (
    <div className="min-h-screen bg-[#f4fcf0] font-sans text-[#171d16]">
      <HomeHeader />

      <main className="mx-auto max-w-[1600px] space-y-8 px-4 pt-24 pb-16 sm:px-6 md:px-10">
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
                onClick={handleAddAllToCart}
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
                    onClick={() => handleAddToCart(item)}
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
      </main>

      <HomeFooter />
    </div>
  );
}

export default function WishlistPage() {
  return <WishlistContent />;
}

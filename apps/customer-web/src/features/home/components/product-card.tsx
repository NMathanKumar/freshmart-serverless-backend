import { useState, useEffect } from 'react';
import { Card } from '@freshmart/design-system';
import { Check, Heart, LoaderCircle, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@freshmart/shared';
import { useAddHomeProductToCartMutation } from '../api/home-api.js';
import {
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useGetWishlistQuery,
} from '../../commerce/api/commerce-api.js';
import type { ProductViewModel } from '../model/home-content.js';

export const ProductCard = ({ product }: { product: ProductViewModel }) => {
  const [added, setAdded] = useState(false);
  const { data: wishlist = [] } = useGetWishlistQuery();
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const isLiked = wishlist.some((item) => item.productId === product.productId);

  const toggleWishlist = async () => {
    try {
      if (isLiked) {
        await removeFromWishlist({ productId: product.productId }).unwrap();
      } else {
        await addToWishlist({
          productId: product.productId,
          name: product.name,
          price: product.price,
          brand: product.brand || 'Organic',
          imageUrl: product.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300',
          quantity: product.quantity || '1 Unit',
        }).unwrap();
      }
    } catch (_) {
      // Ignore
    }
  };

  const [addToCart, request] = useAddHomeProductToCartMutation();
  const add = async () => {
    try {
      const payload = {
        productId: product.productId,
        name: product.name,
        price: product.price,
        brand: product.brand || undefined,
        imageUrl: product.imageUrl || undefined,
      };
      await addToCart(payload as never).unwrap();
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1500);
    } catch {
      // The mutation error is announced below and remains available for retry.
    }
  };

  return (
    <Card className="home-product-card group relative w-[220px] flex-none overflow-hidden rounded-[22px] border border-[#e2ebdE] bg-white p-0 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-300 hover:border-[#bdcaba]/70 hover:shadow-xl sm:w-[230px] md:w-[240px]">
      <div className="relative h-44 overflow-hidden bg-[#f4fcf0]/80">
        {product.badge && (
          <span
            className={`absolute top-3 left-3 z-10 rounded-full px-2.5 py-1 text-[9px] font-black tracking-wider uppercase shadow-xs ${product.badgeTone === 'bestseller' ? 'bg-[#006c4a] text-white' : 'bg-[#ffd9de] text-[#a72d51]'}`}
          >
            {product.badge}
          </span>
        )}

        {/* Heart Wishlist Button Top Right */}
        <button
          aria-label={
            isLiked
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          className="absolute top-3 right-3 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow-xs backdrop-blur-md transition-all hover:scale-110 active:scale-95"
          onClick={toggleWishlist}
          type="button"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-[#8b9888] hover:text-rose-500'}`}
          />
        </button>

        <Link
          className="block h-full w-full cursor-pointer"
          to={`/products/${product.productId}`}
        >
          <img
            alt={product.name}
            className="h-full w-full object-contain p-3 mix-blend-multiply transition-transform duration-500 group-hover:scale-108"
            decoding="async"
            loading="lazy"
            src={product.imageUrl}
            onError={(e) => {
    const fallback = 'https://placehold.co/400x400/e2ebdE/006c4a.png?text=FreshMart';
    if (!e.currentTarget.src.includes('product-placeholder.png')) {
      e.currentTarget.src = fallback;
    }
  }}
          />
        </Link>
      </div>
      <div className="space-y-2 p-3.5 md:p-4">
        <div>
          <Link
            className="cursor-pointer"
            to={`/products/${product.productId}`}
          >
            <h3 className="truncate text-sm leading-tight font-extrabold text-[#171d16] transition-colors group-hover:text-[#006b2c]">
              {product.name}
            </h3>
          </Link>
          <p className="mt-1 text-xs leading-tight font-semibold text-[#6e7b6c]">
            {product.quantity}
          </p>
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-row items-baseline gap-1.5">
            <span className="text-lg font-black tracking-tight text-[#006c4a]">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs font-bold text-[#8b9888] line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>
          <button
            aria-label={
              added
                ? `${product.name} added to cart`
                : `Add ${product.name} to cart`
            }
            className="home-add-button flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#006b2c] text-white shadow-sm transition-all hover:scale-110 hover:bg-[#00873a] focus-visible:ring-2 focus-visible:ring-[#006b2c] focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95 disabled:opacity-60"
            disabled={request.isLoading}
            onClick={() => void add()}
            type="button"
          >
            {request.isLoading ? (
              <LoaderCircle
                aria-hidden="true"
                className="h-4 w-4 animate-spin"
              />
            ) : added ? (
              <Check aria-hidden="true" className="h-4 w-4" />
            ) : (
              <Plus aria-hidden="true" className="h-4 w-4" />
            )}
          </button>
        </div>
        {request.isError && (
          <button
            className="text-[10px] font-bold text-[#93000a] hover:underline"
            onClick={() => void add()}
            type="button"
          >
            Couldn't add. Retry
          </button>
        )}
        <span aria-live="polite" className="sr-only">
          {added ? `${product.name} was added to your cart.` : ''}
        </span>
      </div>
    </Card>
  );
};

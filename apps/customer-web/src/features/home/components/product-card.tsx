import { useState } from 'react';
import { Card } from '@freshmart/design-system';
import { Check, LoaderCircle, Plus } from 'lucide-react';
import { useAddHomeProductToCartMutation } from '../api/home-api.js';
import type { ProductViewModel } from '../model/home-content.js';

export const ProductCard = ({ product }: { product: ProductViewModel }) => {
  const [added, setAdded] = useState(false);
  const [addToCart, request] = useAddHomeProductToCartMutation();
  const add = async () => {
    try {
      await addToCart({ productId: product.productId }).unwrap();
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1500);
    } catch {
      // The mutation error is announced below and remains available for retry.
    }
  };

  return (
    <Card className="home-product-card group w-64 flex-none overflow-hidden rounded-xl border-0 bg-white p-0 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-md">
      <div className="relative h-48 overflow-hidden bg-[#eff6ea]">
        {product.badge && <span className={`absolute left-4 top-4 z-10 rounded-full px-3 py-1 text-[10px] font-bold ${product.badgeTone === 'bestseller' ? 'bg-[#006c4a] text-white' : 'bg-[#ffd9de] text-[#3f0016]'}`}>{product.badge}</span>}
        <img alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" decoding="async" loading="lazy" src={product.imageUrl} />
      </div>
      <div className="space-y-2 p-4">
        <div><h3 className="truncate text-sm font-bold leading-5">{product.name}</h3><p className="text-xs font-medium leading-4 text-[#3e4a3d]">{product.quantity}</p></div>
        <div className="flex items-end justify-between pt-2">
          <div className="flex flex-col"><span className="text-xl font-bold leading-7 text-[#006b2c]">${(product.price ?? 0).toFixed(2)}</span>{product.originalPrice && <span className="text-xs text-[#6e7b6c] line-through">${product.originalPrice.toFixed(2)}</span>}</div>
          <button aria-label={added ? `${product.name} added to cart` : `Add ${product.name} to cart`} className="home-add-button flex h-10 w-10 items-center justify-center rounded-full bg-[#006b2c] text-white transition-all hover:bg-[#00873a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006b2c] focus-visible:ring-offset-2 disabled:opacity-60" disabled={request.isLoading} onClick={() => void add()} type="button">{request.isLoading ? <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin" /> : added ? <Check aria-hidden="true" className="h-5 w-5" /> : <Plus aria-hidden="true" className="h-5 w-5" />}</button>
        </div>
        {request.isError && <button className="text-xs font-semibold text-[#93000a] hover:underline" onClick={() => void add()} type="button">Couldn't add. Retry</button>}
        <span aria-live="polite" className="sr-only">{added ? `${product.name} was added to your cart.` : ''}</span>
      </div>
    </Card>
  );
};

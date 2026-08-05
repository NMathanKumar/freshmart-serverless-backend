import { useState } from 'react';
import { Card } from '@freshmart/design-system';
import { Check, LoaderCircle, Plus } from 'lucide-react';
import { formatCurrency } from '@freshmart/shared';
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
    <Card className="home-product-card group w-[220px] sm:w-[230px] md:w-[240px] flex-none overflow-hidden rounded-[22px] border border-[#e2ebdE] bg-white p-0 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-xl hover:border-[#bdcaba]/70">
      <div className="relative h-44 overflow-hidden bg-[#f4fcf0]/80">
        {product.badge && <span className={`absolute left-3 top-3 z-10 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider shadow-xs ${product.badgeTone === 'bestseller' ? 'bg-[#006c4a] text-white' : 'bg-[#ffd9de] text-[#a72d51]'}`}>{product.badge}</span>}
        <img alt={product.name} className="h-full w-full object-contain mix-blend-multiply p-3 transition-transform duration-500 group-hover:scale-108" decoding="async" loading="lazy" src={product.imageUrl} onError={(e) => { e.currentTarget.src = 'https://lh3.googleusercontent.com/aida-public/b01cfbf2eb5d4e1fa429ed3ee7964b91/product-placeholder.png'; }} />
      </div>
      <div className="space-y-2 p-3.5 md:p-4">
        <div><h3 className="truncate text-sm font-extrabold leading-tight text-[#171d16] group-hover:text-[#006b2c] transition-colors">{product.name}</h3><p className="text-xs font-semibold leading-tight text-[#6e7b6c] mt-1">{product.quantity}</p></div>
        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-row items-baseline gap-1.5"><span className="text-lg font-black tracking-tight text-[#006c4a]">{formatCurrency(product.price)}</span>{product.originalPrice && <span className="text-xs font-bold text-[#8b9888] line-through">{formatCurrency(product.originalPrice)}</span>}</div>
          <button aria-label={added ? `${product.name} added to cart` : `Add ${product.name} to cart`} className="home-add-button flex h-9 w-9 items-center justify-center rounded-full bg-[#006b2c] text-white shadow-sm transition-all hover:bg-[#00873a] hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006b2c] focus-visible:ring-offset-2 disabled:opacity-60" disabled={request.isLoading} onClick={() => void add()} type="button">{request.isLoading ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : added ? <Check aria-hidden="true" className="h-4 w-4" /> : <Plus aria-hidden="true" className="h-4 w-4" />}</button>
        </div>
        {request.isError && <button className="text-[10px] font-bold text-[#93000a] hover:underline" onClick={() => void add()} type="button">Couldn't add. Retry</button>}
        <span aria-live="polite" className="sr-only">{added ? `${product.name} was added to your cart.` : ''}</span>
      </div>
    </Card>
  );
};

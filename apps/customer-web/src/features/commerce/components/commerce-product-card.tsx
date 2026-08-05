import { useState } from 'react';
import { Button } from '@freshmart/design-system';
import { CheckCircle2, Heart, LoaderCircle, Minus, Plus, ShoppingCart, Star, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as shared from '@freshmart/shared';

const { customerRoutePaths, formatCurrency } = shared;
import { useRemoveCartItemMutation, useUpdateCartItemMutation } from '../api/commerce-api.js';
import type { CartLine, CommerceProduct } from '../model/commerce-content.js';

const productUrl = (productId: string) => customerRoutePaths.productDetails.replace(':productId', productId);

export const CommerceProductCard = ({ product, variant = 'grid' }: { product: CommerceProduct; variant?: 'grid' | 'category' | 'compact' }) => {
  const [added, setAdded] = useState(false);
  const [updateCart, updateState] = useUpdateCartItemMutation();
  const add = async () => {
    try {
      await updateCart({ productId: product.productId, quantity: 1 }).unwrap();
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1400);
    } catch {
      // Error state is exposed inline for retry.
    }
  };

  if (variant === 'compact') {
    return (
      <article className="min-w-[160px] rounded-xl border border-[#bdcaba]/20 bg-white p-3 shadow-sm">
        <Link to={productUrl(product.productId)}>
          <div className="mb-2 h-32 overflow-hidden rounded-lg bg-[#eff6ea]"><img alt={product.name} className="h-full w-full object-cover" loading="lazy" src={product.imageUrl} /></div>
          <h3 className="truncate text-sm font-semibold text-[#171d16]">{product.name}</h3>
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-bold text-[#171d16]">{formatCurrency(product.price)}</span>
          <button aria-label={`Add ${product.name} to cart`} className="commerce-focus flex h-8 w-8 items-center justify-center rounded-lg bg-[#d8f4ce] text-[#2b4c1d] hover:bg-[#006b2c] hover:text-white" onClick={() => void add()} type="button">
            {updateState.isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className={`commerce-card commerce-lift group relative flex h-full flex-col overflow-hidden p-4 ${variant === 'category' ? 'rounded-xl' : 'rounded-xl'}`}>
      {product.badge && <span className={`absolute left-4 top-4 z-10 rounded-full px-3 py-1 text-[10px] font-bold uppercase ${product.badgeTone === 'fresh' ? 'bg-[#d8f4ce] text-[#2b4c1d]' : 'bg-[#ffd9de] text-[#3f0016]'}`}>{product.badge}</span>}
      <button aria-disabled="true" aria-label={`Save ${product.name} coming soon`} className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-[#9aa59a] shadow-sm backdrop-blur-md" disabled title="Wishlist is coming soon" type="button">
        <Heart aria-hidden="true" className="h-5 w-5" />
      </button>
      <Link className="commerce-focus" to={productUrl(product.productId)}>
        <div className="mb-4 aspect-square overflow-hidden rounded-lg bg-[#eff6ea]">
          <img alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" decoding="async" loading="lazy" src={product.imageUrl} />
        </div>
      </Link>
      <div className="flex flex-1 flex-col">
        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#3f6d2a]">{product.brand}</p>
        <Link className="commerce-focus" to={productUrl(product.productId)}><h3 className="mb-1 text-xl font-semibold leading-7 text-[#171d16]">{product.name}</h3></Link>
        <p className="mb-4 flex items-center gap-1 text-xs font-medium text-[#3e4a3d]">
          <Star aria-hidden="true" className="h-4 w-4 fill-[#facc15] text-[#facc15]" />
          {product.rating?.toFixed(1) ?? '4.8'} ({product.reviewCount ?? '128'} reviews) {product.deliveryTime ? `- ${product.deliveryTime}` : ''}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-[#006b2c]">{formatCurrency(product.price)}</span>
            {product.originalPrice && <span className="text-xs text-[#6e7b6c] line-through">{formatCurrency(product.originalPrice)}</span>}
          </div>
          <Button aria-label={added ? `${product.name} added` : `Add ${product.name}`} className="gap-1 rounded-xl px-4" disabled={updateState.isLoading} onClick={() => void add()} type="button">
            {updateState.isLoading ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : added ? <CheckCircle2 aria-hidden="true" className="h-4 w-4" /> : <Plus aria-hidden="true" className="h-4 w-4" />}
            Add
          </Button>
        </div>
        {updateState.isError && <button className="mt-2 text-left text-xs font-semibold text-[#93000a] hover:underline" onClick={() => void add()} type="button">Could not add. Retry</button>}
      </div>
    </article>
  );
};

export const CartItemCard = ({ item }: { item: CartLine }) => {
  const [quantity, setQuantity] = useState(item.quantityInCart);
  const [updateCart, updateState] = useUpdateCartItemMutation();
  const [removeCartItem, removeState] = useRemoveCartItemMutation();
  const update = async (next: number) => {
    const safeQuantity = Math.max(1, next);
    setQuantity(safeQuantity);
    try {
      await updateCart({ productId: item.productId, quantity: safeQuantity }).unwrap();
    } catch {
      setQuantity(item.quantityInCart);
    }
  };

  return (
    <article className="commerce-card flex flex-col gap-4 p-4 sm:flex-row">
      <img alt={item.name} className="h-32 w-full flex-shrink-0 rounded-xl object-cover sm:w-32" loading="lazy" src={item.imageUrl} />
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex justify-between gap-4">
          <div><h3 className="text-xl font-semibold text-[#171d16]">{item.name}</h3><p className="text-sm font-semibold text-[#3e4a3d]">{item.brand}</p></div>
          <span className="text-xl font-semibold text-[#006b2c]">{formatCurrency(item.price)}</span>
        </div>
        <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#3f6d2a]"><CheckCircle2 className="h-4 w-4" />{item.stockLabel}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center rounded-full bg-[#eff6ea] p-1">
            <button aria-label={`Decrease ${item.name} quantity`} className="commerce-focus flex h-8 w-8 items-center justify-center rounded-full hover:bg-white" disabled={updateState.isLoading} onClick={() => void update(quantity - 1)} type="button"><Minus className="h-4 w-4" /></button>
            <span className="w-10 text-center font-bold">{quantity}</span>
            <button aria-label={`Increase ${item.name} quantity`} className="commerce-focus flex h-8 w-8 items-center justify-center rounded-full hover:bg-white" disabled={updateState.isLoading} onClick={() => void update(quantity + 1)} type="button"><Plus className="h-4 w-4" /></button>
          </div>
          <div className="flex gap-4">
            <button aria-disabled="true" className="flex items-center gap-1 text-sm font-semibold text-[#9aa59a]" disabled title="Save for later is coming soon" type="button"><Heart className="h-4 w-4" />Save for later</button>
            <button className="commerce-focus flex items-center gap-1 text-sm font-semibold text-[#93000a] hover:opacity-80" disabled={removeState.isLoading} onClick={() => void removeCartItem({ productId: item.productId })} type="button">{removeState.isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}Remove</button>
          </div>
        </div>
      </div>
    </article>
  );
};

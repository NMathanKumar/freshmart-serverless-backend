import { Suspense, useState } from 'react';
import {
  ChevronRight,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Truck,
  ShieldCheck,
  ZoomIn,
  Leaf,
  Sparkles,
  Sun,
  Package,
} from 'lucide-react';
import { Button } from '@freshmart/design-system';
import { useParams, Link } from 'react-router-dom';
import {
  useGetProductDetailsQuery,
  useGetCategoryListingQuery,
  useUpdateCartItemMutation,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useGetWishlistQuery,
} from '../api/commerce-api.js';
import { HomeHeader } from '../../home/components/home-header.js';
import { HomeFooter } from '../../home/components/home-footer.js';
import { formatCurrency } from '@freshmart/shared';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80';

const ProductDetailsContent = () => {
  const { productId } = useParams();
  const { data: detailsData } = useGetProductDetailsQuery(productId);
  const { data: catalogProducts = [] } = useGetCategoryListingQuery();
  const { data: wishlist = [] } = useGetWishlistQuery();
  const [addToCart, addState] = useUpdateCartItemMutation();
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<
    'description' | 'specifications' | 'nutrition' | 'reviews'
  >('description');

  // Resolve target product dynamically from API or catalog list
  const catalogItem = catalogProducts.find(
    (p) => p.productId === productId || (p as any).id === productId
  );

  const rawProduct = detailsData?.product ?? catalogItem;

  const product = {
    productId: productId ?? rawProduct?.productId ?? 'organic-fresh-product',
    name: rawProduct?.name || (rawProduct as any)?.productName || 'Organic Fresh Produce',
    brand: rawProduct?.brand || (rawProduct as any)?.tag || 'Nature\'s Harvest Farms',
    rating: rawProduct?.rating ?? 4.9,
    reviewCount: Number(rawProduct?.reviewCount ?? 128),
    stockLabel: rawProduct?.stockLabel || ((rawProduct as any)?.available !== false ? 'In Stock' : 'Out of Stock'),
    price: Number(rawProduct?.price ?? 4.99),
    originalPrice: rawProduct?.originalPrice ? Number(rawProduct.originalPrice) : undefined,
    unitWeight: (rawProduct as any)?.unit || (rawProduct as any)?.unitWeight || '1 Pack (Fresh Harvest)',
    badge: rawProduct?.badge || (Number(rawProduct?.price ?? 0) > 10 ? 'BESTSELLER' : '15% OFF'),
    imageUrl: rawProduct?.imageUrl || (rawProduct as any)?.images?.[0] || FALLBACK_IMAGE,
    description: (rawProduct as any)?.description || 'Sourced directly from verified local organic farms. 100% natural, crisp, pesticide-free, and packaged under strict hygienic quality controls for peak freshness.',
  };

  const isWishlisted = wishlist.some((item) => item.productId === product.productId);

  // Gallery calculation using real product images
  const rawImages = Array.isArray((rawProduct as any)?.images) ? (rawProduct as any).images : [];
  const validGallery = rawImages.filter((img: any) => typeof img === 'string' && img.length > 0);
  
  const gallery = validGallery.length > 0
    ? validGallery
    : [product.imageUrl];

  const mainImage = gallery[activeImageIdx] ?? product.imageUrl;

  const handleWishlistToggle = async () => {
    if (isWishlisted) {
      await removeFromWishlist({ productId: product.productId }).unwrap().catch(() => undefined);
    } else {
      await addToWishlist({
        productId: product.productId,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        brand: product.brand,
        quantity: 1,
      } as any).unwrap().catch(() => undefined);
    }
  };

  const handleAddToCart = async () => {
    const { addOrUpdateStoredCartItem } = await import('../model/commerce-content.js');
    addOrUpdateStoredCartItem({
      productId: product.productId,
      name: product.name,
      price: product.price,
      brand: product.brand,
      imageUrl: product.imageUrl,
      quantity,
    });

    await addToCart({
      productId: product.productId,
      quantity,
      name: product.name,
      price: product.price,
      brand: product.brand,
      imageUrl: product.imageUrl,
    }).unwrap().catch(() => undefined);
  };

  return (
    <div className="min-h-screen bg-[#f4fcf0] font-sans text-[#171d16]">
      <HomeHeader variant="cart" />

      <main className="mx-auto max-w-7xl space-y-8 px-4 pt-24 pb-16 sm:px-6 md:px-8">
        {/* Category Breadcrumb Nav */}
        <nav className="flex items-center gap-2 text-xs font-bold text-[#8b9888]">
          <Link className="hover:text-[#006b2c]" to="/">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link className="hover:text-[#006b2c]" to="/categories">
            Categories
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-black text-[#006b2c]">{product.name}</span>
        </nav>

        {/* Main Product Showcase Section */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.2fr_1fr]">
          {/* Left Column: Thumbnails + Main Real Product Image */}
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Thumbnails Column if multiple real images exist */}
            {gallery.length > 1 && (
              <div className="order-2 flex gap-3 overflow-x-auto sm:order-1 sm:flex-col sm:overflow-visible">
                {gallery.slice(0, 4).map((imgUrl: string, idx: number) => (
                  <button
                    key={idx}
                    className={`h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-2xl border-2 bg-white p-1.5 transition-all ${
                      activeImageIdx === idx
                        ? 'border-[#006b2c] shadow-xs ring-2 ring-[#006b2c]/20'
                        : 'border-[#e2ebdE] hover:border-[#bdcaba]'
                    }`}
                    onClick={() => setActiveImageIdx(idx)}
                    type="button"
                  >
                    <img
                      alt={`${product.name} view ${idx + 1}`}
                      className="h-full w-full object-contain mix-blend-multiply"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                      src={imgUrl}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Showcase Image */}
            <div className="relative order-1 flex min-h-[380px] flex-1 items-center justify-center rounded-[28px] border border-[#e2ebdE] bg-white p-8 shadow-xs sm:order-2 sm:min-h-[460px]">
              {/* Badges */}
              <div className="absolute top-5 left-5 z-10 flex items-center gap-2">
                {product.badge && (
                  <span className="rounded-full bg-[#fce4e8] px-3.5 py-1 text-xs font-black text-rose-700 uppercase tracking-wider">
                    {product.badge}
                  </span>
                )}
                <span className="flex items-center gap-1 rounded-full bg-[#006b2c] px-3 py-1 text-xs font-black text-white">
                  <Leaf className="h-3 w-3" />
                  <span>100% Organic</span>
                </span>
              </div>

              {/* Real Product Image */}
              <img
                alt={product.name}
                className="max-h-[380px] w-full object-contain mix-blend-multiply transition-all duration-300 hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
                src={mainImage}
              />
            </div>
          </div>

          {/* Right Column: Product Purchase Card */}
          <div className="space-y-6 rounded-[28px] border border-[#e2ebdE] bg-white p-6 shadow-xs sm:p-8">
            <div>
              <span className="text-[10px] font-black tracking-wider text-[#006c4a] uppercase">
                {product.brand}
              </span>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-[#171d16] sm:text-3xl">
                {product.name}
              </h1>
            </div>

            {/* Rating & Stock Row */}
            <div className="flex items-center gap-3 text-xs font-extrabold">
              <span className="flex items-center gap-1 rounded-lg bg-[#eff6ea] px-2.5 py-1 text-[#006c4a]">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
              </span>
              <span className="text-[#8b9888]">
                {product.reviewCount} Verified Reviews
              </span>
              <span className="text-[#e2ebdE]">•</span>
              <span className="font-black text-[#006c4a]">
                ● {product.stockLabel}
              </span>
            </div>

            {/* Pricing Section */}
            <div className="space-y-1 border-t border-b border-[#e2ebdE] py-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-[#006c4a] sm:text-4xl">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-lg font-bold text-[#8b9888] line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-[#8b9888]">
                Unit Weight / Package: {product.unitWeight}
              </p>
            </div>

            {/* Quantity & Add to Cart Controls */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-3">
                {/* Quantity Selector */}
                <div className="flex items-center gap-2 rounded-2xl border border-[#bdcaba]/60 bg-[#f8fbf5] px-3 py-2 shadow-xs">
                  <button
                    aria-label="Decrease quantity"
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl bg-white text-[#171d16] shadow-xs transition-all hover:bg-[#eff6ea]"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    type="button"
                  >
                    <Minus className="h-3.5 w-3.5 stroke-[3]" />
                  </button>
                  <span className="w-8 text-center text-sm font-black text-[#171d16]">
                    {quantity}
                  </span>
                  <button
                    aria-label="Increase quantity"
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl bg-white text-[#171d16] shadow-xs transition-all hover:bg-[#eff6ea]"
                    onClick={() => setQuantity(quantity + 1)}
                    type="button"
                  >
                    <Plus className="h-3.5 w-3.5 stroke-[3]" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <Button
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#006b2c] text-xs font-extrabold text-white shadow-md transition-all hover:bg-[#005422] active:scale-98"
                  disabled={addState.isLoading}
                  onClick={handleAddToCart}
                  type="button"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Add to Cart</span>
                </Button>

                {/* Wishlist Heart Button */}
                <button
                  aria-label="Toggle Wishlist"
                  className={`flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border shadow-xs transition-all ${
                    isWishlisted
                      ? 'border-rose-300 bg-rose-50 text-rose-600'
                      : 'border-[#bdcaba]/60 bg-white text-[#8b9888] hover:border-rose-300 hover:text-rose-600'
                  }`}
                  onClick={handleWishlistToggle}
                  type="button"
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-rose-600' : ''}`} />
                </button>
              </div>
            </div>

            {/* Trust Guarantees */}
            <div className="space-y-3 border-t border-[#e2ebdE] pt-5">
              <div className="flex items-center gap-3 text-xs font-extrabold text-[#3e4a3d]">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eff6ea] text-[#006b2c]">
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-[#171d16]">15-Min Express Delivery</span>
                  <span className="text-[11px] font-semibold text-[#8b9888]">
                    Fresh morning & doorstep evening delivery
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-extrabold text-[#3e4a3d]">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eff6ea] text-[#006b2c]">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-[#171d16]">Freshness Guaranteed</span>
                  <span className="text-[11px] font-semibold text-[#8b9888]">
                    100% refund or replacement if not satisfied
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Details & Specification Tabs Only */}
        <div className="rounded-[28px] border border-[#e2ebdE] bg-white p-6 shadow-xs sm:p-8">
          {/* Tabs Navigation */}
          <div className="flex items-center gap-6 border-b border-[#e2ebdE] text-sm font-extrabold">
            <button
              className={`cursor-pointer pb-3 transition-all ${
                activeTab === 'description'
                  ? 'border-b-2 border-[#006b2c] text-[#006b2c]'
                  : 'text-[#8b9888] hover:text-[#171d16]'
              }`}
              onClick={() => setActiveTab('description')}
              type="button"
            >
              Description
            </button>
            <button
              className={`cursor-pointer pb-3 transition-all ${
                activeTab === 'specifications'
                  ? 'border-b-2 border-[#006b2c] text-[#006b2c]'
                  : 'text-[#8b9888] hover:text-[#171d16]'
              }`}
              onClick={() => setActiveTab('specifications')}
              type="button"
            >
              Specifications
            </button>
            <button
              className={`cursor-pointer pb-3 transition-all ${
                activeTab === 'nutrition'
                  ? 'border-b-2 border-[#006b2c] text-[#006b2c]'
                  : 'text-[#8b9888] hover:text-[#171d16]'
              }`}
              onClick={() => setActiveTab('nutrition')}
              type="button"
            >
              Nutritional Info
            </button>
            <button
              className={`cursor-pointer pb-3 transition-all ${
                activeTab === 'reviews'
                  ? 'border-b-2 border-[#006b2c] text-[#006b2c]'
                  : 'text-[#8b9888] hover:text-[#171d16]'
              }`}
              onClick={() => setActiveTab('reviews')}
              type="button"
            >
              Reviews ({product.reviewCount})
            </button>
          </div>

          {/* Tab Body */}
          <div className="pt-6">
            {activeTab === 'description' && (
              <div className="space-y-4">
                <h2 className="text-lg font-black text-[#171d16]">
                  Product Overview & Quality Promise
                </h2>
                <p className="text-xs leading-relaxed font-semibold text-[#8b9888] sm:text-sm">
                  {product.description}
                </p>

                <div className="grid grid-cols-1 gap-3 pt-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-2 rounded-xl bg-[#f4fcf0] border border-[#e2ebdE] p-3 text-xs font-extrabold text-[#171d16]">
                    <Leaf className="h-4 w-4 text-[#006b2c]" />
                    <span>Pesticide-free certified</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-[#f4fcf0] border border-[#e2ebdE] p-3 text-xs font-extrabold text-[#171d16]">
                    <Sparkles className="h-4 w-4 text-[#006b2c]" />
                    <span>Hydro-cooled freshness</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-[#f4fcf0] border border-[#e2ebdE] p-3 text-xs font-extrabold text-[#171d16]">
                    <Sun className="h-4 w-4 text-[#006b2c]" />
                    <span>Solar-farm harvested</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-[#f4fcf0] border border-[#e2ebdE] p-3 text-xs font-extrabold text-[#171d16]">
                    <Package className="h-4 w-4 text-[#006b2c]" />
                    <span>100% Compostable pack</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="space-y-3 text-xs font-extrabold text-[#3e4a3d]">
                <div className="flex items-center justify-between border-b border-[#e2ebdE] pb-2">
                  <span className="text-[#8b9888]">Brand / Producer</span>
                  <span className="font-black text-[#171d16]">{product.brand}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#e2ebdE] pb-2">
                  <span className="text-[#8b9888]">Package Weight / Unit</span>
                  <span className="font-black text-[#171d16]">{product.unitWeight}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#e2ebdE] pb-2">
                  <span className="text-[#8b9888]">Storage Instructions</span>
                  <span className="font-black text-[#171d16]">Refrigerate at 2°C - 4°C</span>
                </div>
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[#8b9888]">Country of Origin</span>
                  <span className="font-black text-[#171d16]">Local Organic Network</span>
                </div>
              </div>
            )}

            {activeTab === 'nutrition' && (
              <div className="max-w-md space-y-3 rounded-2xl bg-[#eff6ea] p-5 text-xs font-extrabold text-[#3e4a3d]">
                <h3 className="text-xs font-black text-[#005320] uppercase tracking-wider">
                  NUTRITIONAL VALUES (PER 100G)
                </h3>
                <div className="flex justify-between border-b border-[#bdcaba]/30 pb-2">
                  <span>Energy</span>
                  <span className="font-black text-[#171d16]">32 kcal / 134 kJ</span>
                </div>
                <div className="flex justify-between border-b border-[#bdcaba]/30 pb-2 text-[#006c4a]">
                  <span>Vitamin C</span>
                  <span className="font-black">98% DV</span>
                </div>
                <div className="flex justify-between border-b border-[#bdcaba]/30 pb-2">
                  <span>Natural Sugars</span>
                  <span className="font-black text-[#171d16]">4.9 g</span>
                </div>
                <div className="flex justify-between">
                  <span>Dietary Fiber</span>
                  <span className="font-black text-[#171d16]">2.0 g</span>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-[#171d16]">{product.rating}</span>
                  <div>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-[#8b9888]">Based on {product.reviewCount} customer reviews</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
};

export default function ProductDetailsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4fcf0]" />}>
      <ProductDetailsContent />
    </Suspense>
  );
}

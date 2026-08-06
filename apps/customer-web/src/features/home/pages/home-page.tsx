import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, X } from 'lucide-react';
import {
  toCategories,
  toRecommendedProducts,
  toTrendingProducts,
} from '../model/home-content.js';
import { useGetCustomerHomeQuery } from '../api/home-api.js';
import { CategoryGrid } from '../components/category-grid.js';
import { HeroCarousel, type SlideData } from '../components/hero-carousel.js';
import { HomeFooter } from '../components/home-footer.js';
import { HomeHeader } from '../components/home-header.js';
import {
  CartSummaryButton,
} from '../components/home-navigation.js';
import { ProductCarousel } from '../components/product-carousel.js';
import { Recommendations } from '../components/recommendations.js';

const HomePage = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [activeBanner, setActiveBanner] = useState<SlideData | null>(null);

  const query = useGetCustomerHomeQuery();
  const hasError = query.isError && !query.data;
  const retry = () => void query.refetch();
  const categories = query.data
    ? toCategories(query.data.categories)
    : undefined;
  const rawTrending = query.data
    ? toTrendingProducts(query.data.trendingProducts)
    : undefined;
  const rawRecommended = query.data
    ? toRecommendedProducts(query.data.recommendedProducts)
    : undefined;

  const selectedCategoryObj = categories?.find((c) => c.categoryId === selectedCategoryId);

  const handleBannerClick = (slide: SlideData) => {
    setActiveBanner(slide);
    const catKey = slide.categoryKey;
    if (catKey && catKey !== 'all') {
      const matchedCat = categories?.find((c) => 
        c.categoryId === catKey || 
        c.name.toLowerCase().includes(catKey.replace('-', ' ')) ||
        catKey.includes(c.categoryId)
      );
      if (matchedCat) {
        setSelectedCategoryId(matchedCat.categoryId);
      }
    } else {
      setSelectedCategoryId(null);
    }

    setTimeout(() => {
      document.getElementById('trending-heading')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const trending = selectedCategoryId
    ? rawTrending?.filter((p) => p.category === selectedCategoryObj?.name || (p as any).categoryId === selectedCategoryId)
    : rawTrending;

  const recommended = selectedCategoryId
    ? rawRecommended?.filter((p) => p.category === selectedCategoryObj?.name || (p as any).categoryId === selectedCategoryId)
    : rawRecommended;

  const cartCount = query.data?.cartSummary.itemCount ?? 0;
  const cartTotal = query.data?.cartSummary.grandTotal ?? 0;

  return (
    <div className="home-page min-h-screen w-full bg-[#f4fcf0] text-[#171d16]">
      <HomeHeader />
      <main className="mx-auto max-w-7xl space-y-10 px-4 pt-20 pb-12 md:px-8">
        <HeroCarousel
          banners={query.data?.heroBanners}
          error={hasError}
          loading={query.isLoading}
          onBannerClick={handleBannerClick}
          retry={retry}
        />
        <section className="space-y-6" aria-labelledby="categories-heading">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2
                className="text-2xl leading-10 font-bold tracking-[-0.01em] md:text-[32px]"
                id="categories-heading"
              >
                Shop by Category
              </h2>
              {selectedCategoryObj && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#006b2c] px-3 py-1 text-xs font-black text-white shadow-xs">
                  <span>Filtered: {selectedCategoryObj.name}</span>
                  <button
                    className="cursor-pointer rounded-full hover:bg-white/20 p-0.5"
                    onClick={() => setSelectedCategoryId(null)}
                    title="Clear category filter"
                    type="button"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              )}
            </div>
            <Link
              className="text-right text-sm font-extrabold text-[#006b2c] hover:underline"
              to="/categories"
            >
              View All Categories ➔
            </Link>
          </div>
          <CategoryGrid
            categories={categories}
            error={hasError}
            loading={query.isLoading}
            onSelectCategory={setSelectedCategoryId}
            retry={retry}
            selectedCategoryId={selectedCategoryId}
          />
        </section>
        <section
          className="relative space-y-6"
          aria-labelledby="trending-heading"
        >
          <div className="pr-28">
            <h2
              className="text-2xl leading-10 font-bold tracking-[-0.01em] md:text-[32px]"
              id="trending-heading"
            >
              {selectedCategoryObj ? `${selectedCategoryObj.name} Products` : 'Trending Now'}
            </h2>
            <p className="text-base text-[#3e4a3d]">
              {selectedCategoryObj ? `Showing top picks in ${selectedCategoryObj.name}` : 'Most popular picks this week'}
            </p>
          </div>
          <ProductCarousel
            error={hasError}
            loading={query.isLoading}
            products={trending}
            retry={retry}
          />
        </section>
        <Recommendations
          error={hasError}
          loading={query.isLoading}
          products={recommended}
          retry={retry}
        />
      </main>
      <HomeFooter />
      <CartSummaryButton total={cartTotal} />
    </div>
  );
};

export default HomePage;

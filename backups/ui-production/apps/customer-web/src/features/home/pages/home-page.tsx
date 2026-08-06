import { toCategories, toRecommendedProducts, toTrendingProducts } from '../model/home-content.js';
import { useGetCustomerHomeQuery } from '../api/home-api.js';
import { CategoryGrid } from '../components/category-grid.js';
import { HeroCarousel } from '../components/hero-carousel.js';
import { HomeFooter } from '../components/home-footer.js';
import { HomeHeader } from '../components/home-header.js';
import { CartSummaryButton, MobileNavigation } from '../components/home-navigation.js';
import { ProductCarousel } from '../components/product-carousel.js';
import { Recommendations } from '../components/recommendations.js';

const HomePage = () => {
  const query = useGetCustomerHomeQuery();
  const hasError = query.isError && !query.data;
  const retry = () => void query.refetch();
  const categories = query.data ? toCategories(query.data.categories) : undefined;
  const trending = query.data ? toTrendingProducts(query.data.trendingProducts) : undefined;
  const recommended = query.data ? toRecommendedProducts(query.data.recommendedProducts) : undefined;
  const cartCount = query.data?.cartSummary.itemCount ?? 0;
  const cartTotal = query.data?.cartSummary.grandTotal ?? 0;

  return (
    <div className="home-page min-h-screen bg-[#f4fcf0] text-[#171d16]">
      <HomeHeader cartCount={cartCount} />
      <main className="mx-auto max-w-7xl space-y-12 px-4 pb-20 pt-24 md:px-10 md:pb-12">
        <HeroCarousel banners={query.data?.heroBanners} error={hasError} loading={query.isLoading} retry={retry} />
        <section className="space-y-6" aria-labelledby="categories-heading"><div className="flex items-center justify-between gap-4"><h2 className="text-2xl font-bold leading-8 tracking-[-0.01em] md:text-[32px] md:leading-10" id="categories-heading">Shop by Category</h2><button className="text-right text-sm font-semibold text-[#006b2c] hover:underline" type="button">View All Categories</button></div><CategoryGrid categories={categories} error={hasError} loading={query.isLoading} retry={retry} /></section>
        <section className="relative space-y-6" aria-labelledby="trending-heading"><div className="pr-28"><h2 className="text-2xl font-bold leading-8 tracking-[-0.01em] md:text-[32px] md:leading-10" id="trending-heading">Trending Now</h2><p className="text-base text-[#3e4a3d]">Most popular picks this week</p></div><ProductCarousel error={hasError} loading={query.isLoading} products={trending} retry={retry} /></section>
        <Recommendations error={hasError} loading={query.isLoading} products={recommended} retry={retry} />
      </main>
      <HomeFooter />
      <MobileNavigation cartCount={cartCount} />
      <CartSummaryButton total={cartTotal} />
    </div>
  );
};

export default HomePage;

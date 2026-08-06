import { Button } from '@freshmart/design-system';
import { ArrowRight } from 'lucide-react';
import type { CustomerHomeResponse } from '@freshmart/api-sdk';
import { heroFallback } from '../model/home-content.js';
import { SectionEmpty, SectionError, SectionSkeleton } from './section-state.js';

type Banner = CustomerHomeResponse['heroBanners'][number];

export const HeroBanner = ({ banner }: { banner: Banner }) => (
  <article className="relative h-[320px] overflow-hidden rounded-xl md:h-[480px]">
    <div className="absolute inset-0 z-10 flex items-center px-6 md:px-8">
      <div className="max-w-lg space-y-6">
        <span className="inline-flex rounded-full bg-[#006c4a] px-4 py-1 text-sm font-semibold uppercase tracking-wider text-white">Flash Sale</span>
        <h1 className="text-3xl font-bold leading-10 tracking-[-0.02em] text-white drop-shadow-md md:text-5xl md:leading-[56px]">{banner.title || heroFallback.title}</h1>
        <p className="max-w-md text-base leading-6 text-white/90 md:text-lg md:leading-7">Get up to 40% off on exotic fruits and fresh daily vegetables. Locally sourced, hand-picked for quality.</p>
        <Button className="h-12 bg-[#006b2c] px-8 text-white shadow-none hover:bg-[#00873a] active:scale-95">Shop Collection <ArrowRight aria-hidden="true" className="ml-2 h-5 w-5" /></Button>
      </div>
    </div>
    <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
    <img alt="Fresh organic produce arranged in a bright kitchen" className="h-full w-full object-cover" decoding="async" fetchPriority="high" src={banner.imageUrl || heroFallback.imageUrl} />
  </article>
);

export const HeroCarousel = ({ banners, loading, error, retry }: { banners?: Banner[]; loading: boolean; error: boolean; retry: () => void }) => {
  if (loading) return <SectionSkeleton cards={1} className="grid [&>*]:h-[320px] md:[&>*]:h-[480px]" />;
  if (error) return <SectionError retry={retry} />;
  if (!banners?.length) return <SectionEmpty message="No promotions are available right now." />;
  return <div aria-roledescription="carousel" aria-label="Featured promotions"><HeroBanner banner={banners[0]} /></div>;
};

import { useEffect, useState } from 'react';
import { Button } from '@freshmart/design-system';
import { ArrowRight, Clock, ShieldCheck, Zap } from 'lucide-react';
import type { CustomerHomeResponse } from '@freshmart/api-sdk';
import { SectionEmpty, SectionError, SectionSkeleton } from './section-state.js';

type Banner = CustomerHomeResponse['heroBanners'][number];

interface SlideData {
  id: string;
  badge: string;
  badgeIcon: typeof Zap;
  title: string;
  description: string;
  ctaText: string;
  imageUrl: string;
  accentBg: string;
}

const DEFAULT_SLIDES: SlideData[] = [
  {
    id: 'slide-15min',
    badge: '⚡ 15 MINS FAST DELIVERY',
    badgeIcon: Zap,
    title: 'Express Grocery Delivery Right to Your Door',
    description: 'Daily essentials, fresh milk, artisanal bread & farm vegetables delivered in under 15 minutes.',
    ctaText: 'Order Express Now',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-adUk9ZXoP0nwAjwNtfGOr5P5qjDPIVpu8m4Vdaa6rmvZfYCO8DrhUiWkCkEnkpBPf1hfACU0i6X4MHnjn7tn-qBqG7UElO4IZ5vYD0IWUdFEAe2ip_JZ7Yp1O9uS8XCIqy2c7zeTw-OaD5NBWTNh6gpnJ6MRMmOsn5Xp4t19iMDNLrTPk3eGmAMwiXK6Cn7VNBFe7yb3RUV4_NhlxvGXwNZ1vgb3V8NLRbAsu8FSsIwEUkSt1lvC2fVszOZFfpGkbLz5-M5Xbopo',
    accentBg: 'bg-[#006c4a]'
  },
  {
    id: 'slide-organic',
    badge: '🥬 UP TO 40% OFF ORGANIC',
    badgeIcon: Clock,
    title: 'Hand-Picked Organic Produce & Fresh Daily Fruits',
    description: 'Directly sourced from verified local organic farms. Guaranteed 100% crisp, pure & pesticide-free.',
    ctaText: 'Shop Fresh Produce',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSHaELNOhgX7mXWpkTZoBd8EkjiC2gtiPjn00f0mfjjc35_Do4_8Cy5vfaZ00jCjl_LWa_yqs1YWNNxfKG-47zOk6_uc4o68CzFG_6qcXMcdsDVDl_SyzMzXoPgwzJXcSlEVxzUTctK3lNfyPPIhPNxdF9p3-VLXrfZOpRAlbQ8V_eSjtPAmHqEI4QEygGblDnpdLD1BIr84P3DEYq4457nmGfVawMGFAmdA0Sx86DswR32pk7VCPiD5p8M9i4wnqts7_21AyM6I6S',
    accentBg: 'bg-[#005422]'
  },
  {
    id: 'slide-bakery',
    badge: '🥛 MORNING FRESH DAIRY & BAKERY',
    badgeIcon: ShieldCheck,
    title: 'Pure Farm Milk, Whole Breads & Artisanal Dairy',
    description: 'Start your morning right with freshly baked whole wheat breads, organic milk & farm butter.',
    ctaText: 'Explore Dairy & Bakery',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAocIVc-EoYCbFmS10USZQHrW2cBY3jC44RL3aegAleg9zH39V0IHSWwM6MIKPQO6ifSz4gqZNGdwbezCWTwpjY26PgUPmNirsv572TsUAyQLu6A8XrYc_0UG8v0nwTw-VYaT0SMJPhU_zb_d9e0nSrxGxXQbl6Lx_YXZsdI0Y_-NYBK5I62D_ProCKkx-hG1xm3k6nMB89NGrtr-8Z1cQoVuXM7LxVdoQLwhsZlw2KSjnxaqws6Q_tmOCTfNEAnRlce3LxYTMFdXYO',
    accentBg: 'bg-[#00714e]'
  },
  {
    id: 'slide-bundle',
    badge: '🏷️ SMART BUNDLE SAVINGS',
    badgeIcon: Zap,
    title: 'Super Savings On Weekly Pantry & Kitchen Staples',
    description: 'Save big with weekly bulk discount bundles on organic rice, pulses, cold-pressed oils & spices.',
    ctaText: 'Claim Savings Deals',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-8ZKxMuvb9QVdjRnKXyn-bmUF69PYQ5gWY2M8ofX8H15-hmkg8-Gy-qHR61k7JtnnVXh0JF7KRg0XbNdLeLtRYR0G-xZpY9RiUPqL8qFvdL9Sp-Axe1JpioUqZnCOyw_xkiBbtnq4PKTIO-9B6bZ_Muj4HirdjRXta4ycEsR1xOPMARFTJ4AC5WVY5yZbXglG-7V9upqCvyqtUT3kFfCrcwaLkmpmB1REpl05m6AtigOrnjL4cpAY8P4SDTpYFsOlnJyXkgQpo17u',
    accentBg: 'bg-[#a72d51]'
  }
];

export const HeroCarousel = ({ banners, loading, error, retry }: { banners?: Banner[]; loading: boolean; error: boolean; retry: () => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides: SlideData[] = DEFAULT_SLIDES.map((slide, i) => {
    const apiBanner = banners?.[i];
    return apiBanner
      ? { ...slide, title: apiBanner.title || slide.title, imageUrl: apiBanner.imageUrl || slide.imageUrl }
      : slide;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (loading) return <SectionSkeleton cards={1} className="grid [&>*]:h-[360px]" />;
  if (error) return <SectionError retry={retry} />;
  if (!slides.length) return <SectionEmpty message="No promotions are available right now." />;

  return (
    <div aria-roledescription="carousel" aria-label="Featured promotions" className="relative group overflow-hidden rounded-[28px] shadow-md border border-[#e2ebdE] bg-[#f4fcf0]">
      <div className="relative h-[360px] overflow-hidden">
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <article
              key={slide.id}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                isActive ? 'opacity-100 translate-x-0 z-10 pointer-events-auto' : 'opacity-0 translate-x-8 z-0 pointer-events-none'
              }`}
            >
              <div className="absolute inset-0 z-10 flex flex-col justify-center px-10 md:px-14 pb-8">
                <div className="max-w-xl space-y-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-white ${slide.accentBg} shadow-sm`}>
                    {slide.badge}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.02em] text-white drop-shadow-md">
                    {slide.title}
                  </h1>
                  <p className="max-w-md text-sm md:text-base leading-relaxed text-white/95 drop-shadow">
                    {slide.description}
                  </p>
                  <div className="pt-1">
                    <Button className="h-12 rounded-full bg-[#006b2c] px-7 text-sm font-bold text-white shadow-[0_6px_16px_rgba(0,107,44,0.35)] transition-all hover:bg-[#00873a] hover:scale-105 active:scale-95 flex items-center w-fit">
                      {slide.ctaText} <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Gradient Overlay for Readable Contrast */}
              <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
              
              {/* Slide Background Image */}
              <img
                alt={slide.title}
                className="h-full w-full object-cover object-center"
                decoding="async"
                fetchPriority={index === 0 ? 'high' : 'low'}
                src={slide.imageUrl}
              />
            </article>
          );
        })}
      </div>

      {/* Slide Navigation Dots */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2 bg-black/35 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-2.5 rounded-full transition-all duration-500 ${index === currentIndex ? 'w-7 bg-white shadow-sm' : 'w-2.5 bg-white/40 hover:bg-white/70'}`}
            onClick={() => setCurrentIndex(index)}
            type="button"
          />
        ))}
      </div>
    </div>
  );
};

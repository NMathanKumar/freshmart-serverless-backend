import {
  Clock,
  Heart,
  Leaf,
  MapPin,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
  Zap,
} from 'lucide-react';
import { HomeHeader } from '../../home/components/home-header.js';
import { HomeFooter } from '../../home/components/home-footer.js';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f4fcf0] font-sans text-[#171d16]">
      <HomeHeader variant="cart" />

      <main className="mx-auto max-w-5xl space-y-10 px-4 pt-24 pb-16 sm:px-6 md:px-8">
        {/* Hero Section */}
        <div className="space-y-4 rounded-[32px] border border-[#e2ebdE] bg-white p-8 text-center shadow-xs md:p-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#d8f4ce] px-4 py-1.5 text-xs font-black text-[#006c4a]">
            <Zap className="h-4 w-4 fill-[#006c4a]" />
            <span>India's Premier 10-Minute Grocery Delivery</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#171d16] sm:text-4xl md:text-5xl">
            Fresh Groceries Delivered in 10 Minutes.
          </h1>
          <p className="mx-auto max-w-2xl text-sm font-semibold leading-relaxed text-[#8b9888] sm:text-base">
            FreshMart is a technology-first quick commerce platform redefining how households access daily essentials. We bring farm-fresh produce, dairy, bakery, snacks, and home care items to your door in minutes — no planning ahead required.
          </p>
        </div>

        {/* 4 Feature Cards (Blinkit Quick Commerce Model) */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3 rounded-[28px] border border-[#e2ebdE] bg-white p-6 shadow-xs transition-all hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d8f4ce] text-[#006b2c]">
              <Clock className="h-6 w-6 stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-black text-[#171d16]">10-Min Delivery</h3>
            <p className="text-xs font-semibold leading-relaxed text-[#8b9888]">
              Powered by hyper-local micro fulfillment dark stores located within 2 km of your doorstep.
            </p>
          </div>

          <div className="space-y-3 rounded-[28px] border border-[#e2ebdE] bg-white p-6 shadow-xs transition-all hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e3f5ea] text-[#006c4a]">
              <Leaf className="h-6 w-6 stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-black text-[#171d16]">Direct From Farm</h3>
            <p className="text-xs font-semibold leading-relaxed text-[#8b9888]">
              Sourced directly from local partner farms every morning with 100% freshness checks.
            </p>
          </div>

          <div className="space-y-3 rounded-[28px] border border-[#e2ebdE] bg-white p-6 shadow-xs transition-all hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eff6ea] text-[#006b2c]">
              <Store className="h-6 w-6 stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-black text-[#171d16]">Dark Store Network</h3>
            <p className="text-xs font-semibold leading-relaxed text-[#8b9888]">
              AI-driven inventory allocation ensuring zero out-of-stock essentials and instant packing.
            </p>
          </div>

          <div className="space-y-3 rounded-[28px] border border-[#e2ebdE] bg-white p-6 shadow-xs transition-all hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ffd9de] text-[#a72d51]">
              <ShieldCheck className="h-6 w-6 stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-black text-[#171d16]">Quality Guarantee</h3>
            <p className="text-xs font-semibold leading-relaxed text-[#8b9888]">
              Instant refunds and replacements if any product fails to meet your high standards.
            </p>
          </div>
        </div>

        {/* Detailed Story & Tech Model */}
        <div className="grid grid-cols-1 gap-8 rounded-[32px] border border-[#e2ebdE] bg-white p-8 shadow-xs md:grid-cols-2 md:p-10">
          <div className="space-y-4">
            <span className="text-xs font-black tracking-wider text-[#006c4a] uppercase">
              Our Technology & Vision
            </span>
            <h2 className="text-2xl font-black text-[#171d16] sm:text-3xl">
              Building the Future of Instant Commerce
            </h2>
            <p className="text-xs font-medium leading-relaxed text-[#3e4a3d] sm:text-sm">
              FreshMart combines real-time inventory tracking, serverless cloud architecture, and hyper-accurate delivery routing to eliminate waiting times. Our proprietary warehouse management systems allow pickers to assemble orders in under 120 seconds.
            </p>
            <div className="pt-2">
              <div className="inline-flex items-center gap-3 rounded-2xl bg-[#eff6ea] px-5 py-3 text-xs font-black text-[#006b2c]">
                <Truck className="h-4 w-4" />
                <span>Over 1,00,000+ Orders Delivered Instantaneously</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-[#bdcaba]/60 bg-[#f8fbf5] p-6">
            <h3 className="text-base font-black text-[#171d16]">
              Contact & Leadership
            </h3>
            <p className="text-xs font-medium text-[#8b9888]">
              FreshMart Quick Commerce Operations Team
            </p>

            <div className="space-y-3 pt-2 text-xs font-extrabold text-[#171d16]">
              <div className="flex items-center gap-3">
                <span className="w-24 text-[#8b9888]">Head Desk:</span>
                <span>Mathankumar N</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-24 text-[#8b9888]">Direct Email:</span>
                <a className="text-[#006b2c] underline" href="mailto:nmadhankumar597@gmail.com">
                  nmadhankumar597@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-24 text-[#8b9888]">Direct Helpline:</span>
                <a className="text-[#006b2c] underline" href="tel:+918825901415">
                  +91 8825901415
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-24 text-[#8b9888]">Headquarters:</span>
                <span>Bengaluru & Chennai Tech Hub, India</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}

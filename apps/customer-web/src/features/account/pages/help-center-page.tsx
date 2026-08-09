import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Headphones,
  Mail,
  MessageSquare,
  Package,
  Phone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';
import { HomeHeader } from '../../home/components/home-header.js';
import { HomeFooter } from '../../home/components/home-footer.js';

interface FAQItem {
  question: string;
  answer: string;
  category: 'delivery' | 'refunds' | 'quality' | 'payments';
}

const FAQS: FAQItem[] = [
  {
    category: 'delivery',
    question: 'How does FreshMart deliver in under 10-15 minutes?',
    answer:
      'We operate a network of hyper-local neighborhood dark stores located within 2 kilometers of your location. Orders are picked and packed by dedicated store teams within 2 minutes and dispatched immediately via local delivery partners.',
  },
  {
    category: 'refunds',
    question: 'What if an item in my order is damaged or missing?',
    answer:
      'We offer a 100% No-Questions-Asked refund & replacement policy. If an item is damaged or missing, simply raise a support request or contact our customer desk within 2 hours of delivery for an instant wallet/bank refund.',
  },
  {
    category: 'quality',
    question: 'How do you ensure fruits and vegetables are fresh?',
    answer:
      'Our produce is sourced daily from partner farms every morning. Items undergo a strict 3-point quality audit before reaching dark stores, ensuring only crisp, farm-fresh produce reaches your doorstep.',
  },
  {
    category: 'payments',
    question: 'Which payment methods are supported on FreshMart?',
    answer:
      'We support all major payment options including UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and Cash on Delivery (COD).',
  },
  {
    category: 'delivery',
    question: 'Is there a minimum order amount for free delivery?',
    answer:
      'No minimum order limit! Enjoy instant delivery on orders of any size. Orders above ₹199 qualify for completely free delivery.',
  },
];

export default function HelpCenterPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredFaqs =
    activeCategory === 'all'
      ? FAQS
      : FAQS.filter((f) => f.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#f4fcf0] font-sans text-[#171d16]">
      <HomeHeader variant="cart" />

      <main className="mx-auto max-w-5xl space-y-8 px-4 pt-24 pb-16 sm:px-6 md:px-8">
        {/* Header Hero Section */}
        <div className="space-y-3 rounded-[32px] border border-[#e2ebdE] bg-white p-8 text-center shadow-xs md:p-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#d8f4ce] px-4 py-1.5 text-xs font-black text-[#006c4a]">
            <Headphones className="h-4 w-4" />
            <span>24/7 Dedicated Customer Desk</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#171d16] sm:text-4xl md:text-5xl">
            How can we help you today?
          </h1>
          <p className="mx-auto max-w-xl text-sm font-semibold text-[#8b9888]">
            Instant support for active orders, refunds, quality guarantees, and
            quick commerce inquiries.
          </p>

          {/* Direct Manager Contact Card */}
          <div className="mt-6 rounded-2xl border border-[#bdcaba]/60 bg-[#eff6ea] p-5 text-left sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-black tracking-wider text-[#006c4a] uppercase">
                  Direct Customer Escalation Desk
                </span>
                <h3 className="text-lg font-black text-[#171d16]">
                  Mathankumar N
                </h3>
                <p className="text-xs font-bold text-[#3e4a3d]">
                  Head of Customer Experience & Operations
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  className="inline-flex items-center gap-2 rounded-xl bg-[#006b2c] px-4 py-2.5 text-xs font-black text-white shadow-xs transition-all hover:bg-[#005422]"
                  href="mailto:nmadhankumar597@gmail.com"
                >
                  <Mail className="h-4 w-4" />
                  <span>nmadhankumar597@gmail.com</span>
                </a>
                <a
                  className="inline-flex items-center gap-2 rounded-xl border border-[#006b2c] bg-white px-4 py-2.5 text-xs font-black text-[#006b2c] shadow-xs transition-all hover:bg-[#f4fcf0]"
                  href="tel:+918825901415"
                >
                  <Phone className="h-4 w-4" />
                  <span>+91 8825901415</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Quick Category Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2 rounded-[24px] border border-[#e2ebdE] bg-white p-5 shadow-xs transition-all hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#d8f4ce] text-[#006b2c]">
              <Truck className="h-5 w-5 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-extrabold text-[#171d16]">
              Order Delivery
            </h3>
            <p className="text-xs font-semibold leading-relaxed text-[#8b9888]">
              Track live driver location, delivery time & neighborhood dark store updates.
            </p>
          </div>

          <div className="space-y-2 rounded-[24px] border border-[#e2ebdE] bg-white p-5 shadow-xs transition-all hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ffd9de] text-[#a72d51]">
              <RefreshCw className="h-5 w-5 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-extrabold text-[#171d16]">
              Instant Refunds
            </h3>
            <p className="text-xs font-semibold leading-relaxed text-[#8b9888]">
              100% replacement or immediate refund for missing/damaged items.
            </p>
          </div>

          <div className="space-y-2 rounded-[24px] border border-[#e2ebdE] bg-white p-5 shadow-xs transition-all hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e3f5ea] text-[#006c4a]">
              <ShieldCheck className="h-5 w-5 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-extrabold text-[#171d16]">
              Quality Guarantee
            </h3>
            <p className="text-xs font-semibold leading-relaxed text-[#8b9888]">
              Farm-fresh produce with strict daily quality inspection guidelines.
            </p>
          </div>

          <div className="space-y-2 rounded-[24px] border border-[#e2ebdE] bg-white p-5 shadow-xs transition-all hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eff6ea] text-[#006b2c]">
              <Clock className="h-5 w-5 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-extrabold text-[#171d16]">
              10-Min Promise
            </h3>
            <p className="text-xs font-semibold leading-relaxed text-[#8b9888]">
              Sub-15 minute fulfillment across all operational delivery hubs.
            </p>
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div className="space-y-6 rounded-[28px] border border-[#e2ebdE] bg-white p-6 shadow-xs sm:p-8">
          <div className="flex flex-col items-start justify-between gap-4 border-b border-[#e2ebdE] pb-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-black text-[#171d16]">
                Frequently Asked Questions
              </h2>
              <p className="text-xs font-semibold text-[#8b9888]">
                Find quick answers regarding 10-minute grocery delivery & service.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 text-xs font-extrabold">
              {['all', 'delivery', 'refunds', 'quality', 'payments'].map(
                (cat) => (
                  <button
                    key={cat}
                    className={`rounded-full px-3.5 py-1.5 transition-all ${
                      activeCategory === cat
                        ? 'bg-[#006b2c] text-white shadow-xs'
                        : 'bg-[#eff6ea] text-[#3e4a3d] hover:bg-[#d8f4ce]'
                    }`}
                    onClick={() => setActiveCategory(cat)}
                    type="button"
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Accordions */}
          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={faq.question}
                  className="rounded-2xl border border-[#e2ebdE] bg-[#f8fbf5] overflow-hidden transition-all"
                >
                  <button
                    className="flex w-full items-center justify-between p-4 text-left text-xs font-extrabold text-[#171d16] sm:text-sm"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    type="button"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-[#006b2c]" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-[#8b9888]" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="border-t border-[#e2ebdE]/60 bg-white p-4 text-xs font-medium leading-relaxed text-[#3e4a3d]">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
